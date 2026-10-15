(() => {
  'use strict';

  const tracks = [
    { id: 'sunroom', title: 'Sunroom', artist: 'The Tempo Ensemble', album: 'Morning Studies, Vol. 1', genre: 'DOWNTEMPO / 100 BPM', duration: 28.8, side: 'TP—001 / SIDE A', art: 'sunroom.svg', audio: 'sunroom.wav', alt: 'Sunroom album cover: an orange sun, concentric rings and geometric shapes on warm ivory', description: 'Windows open. Coffee cooling. A warm little groove for the space between things.' },
    { id: 'afterhours', title: 'After Hours', artist: 'Soft Circuit', album: 'A Room of Our Own', genre: 'ELECTRONIC / 92 BPM', duration: 31.304, side: 'TP—002 / SIDE A', art: 'afterhours.svg', audio: 'afterhours.wav', alt: 'After Hours album cover: a cobalt window and golden moon on midnight blue', description: 'The city turns its lights down. Mellow keys and a slow pulse keep a small corner of the night awake.' },
    { id: 'coastline', title: 'Coastline', artist: 'Sunday Service', album: 'Notes from Elsewhere', genre: 'AMBIENT GROOVE / 84 BPM', duration: 34.286, side: 'TP—003 / SIDE A', art: 'coastline.svg', audio: 'coastline.wav', alt: 'Coastline album cover: blue waves, coral sun and a cream horizon', description: 'No destination necessary. Soft chords, salt air, and a rhythm that takes the scenic route.' }
  ];
  const byId = id => tracks.find(track => track.id === id);
  const $ = id => document.getElementById(id);
  const audio = $('audio');
  const canvas = $('waveformCanvas');
  const ctx = canvas.getContext('2d');
  const storageKey = 'tempo-listening-room-v1';
  const defaultState = { current: 'sunroom', volume: 65, muted: false, saved: [], shuffle: false, repeat: false };
  let restored = {};
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (value && typeof value === 'object' && !Array.isArray(value)) restored = value;
  } catch { /* A fresh listening room also works when storage is unavailable. */ }
  const state = {
    current: byId(restored.current) ? restored.current : defaultState.current,
    volume: typeof restored.volume === 'number' && Number.isFinite(restored.volume) ? Math.max(0, Math.min(100, restored.volume)) : defaultState.volume,
    muted: restored.muted === true,
    saved: Array.isArray(restored.saved) ? [...new Set(restored.saved.filter(id => byId(id)))] : [],
    shuffle: restored.shuffle === true,
    repeat: restored.repeat === true,
    view: 'session'
  };
  let toastTimer;
  let animationId = 0;
  let loadVersion = 0;
  let isSeeking = false;
  let seekStartPlaying = false;
  let hasError = false;
  let waveformPeaks = [];

  function persist() {
    try {
      const { current, volume, muted, saved, shuffle, repeat } = state;
      localStorage.setItem(storageKey, JSON.stringify({ current, volume, muted, saved, shuffle, repeat }));
    } catch { /* Playback is never dependent on local storage. */ }
  }

  function toast(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').classList.add('show');
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2600);
  }

  function formatTime(seconds) {
    const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    return `${Math.floor(safe / 60).toString().padStart(2, '0')}:${(safe % 60).toString().padStart(2, '0')}`;
  }

  function setStatus(message, kind = 'ready') {
    $('playbackStatus').textContent = message;
    $('statusLed').className = `led ${kind}`;
    audio.setAttribute('aria-busy', String(kind === 'loading'));
  }

  function currentDuration() {
    return Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : byId(state.current).duration;
  }

  function drawWaveform(seconds = audio.currentTime || 0) {
    if (!ctx) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const count = Math.max(35, Math.floor(width / 4.5));
    const progress = Math.max(0, Math.min(1, seconds / currentDuration()));
    const barWidth = Math.max(1.5, width / count - 2);
    for (let i = 0; i < count; i++) {
      const index = Math.min(waveformPeaks.length - 1, Math.floor(i / count * waveformPeaks.length));
      const peak = waveformPeaks[index] || 0.12;
      const barHeight = Math.max(3, peak * (height - 9));
      ctx.fillStyle = i / count <= progress ? '#ce6b3e' : '#bdc5b0';
      ctx.fillRect(i / count * width, (height - barHeight) / 2, barWidth, barHeight);
    }
    $('seekHead').style.left = `${progress * 100}%`;
  }

  function updateTime() {
    const time = isSeeking ? Number($('seek').value) : audio.currentTime || 0;
    const duration = currentDuration();
    if (!isSeeking) $('seek').value = String(time);
    $('seek').max = String(duration);
    $('seek').setAttribute('aria-valuetext', `${Math.floor(time)} seconds of ${Math.round(duration)} seconds`);
    $('elapsed').textContent = formatTime(time);
    $('duration').textContent = formatTime(Math.ceil(duration));
    drawWaveform(time);
  }

  function animate() {
    updateTime();
    if (!audio.paused && !audio.ended) animationId = requestAnimationFrame(animate);
    else animationId = 0;
  }

  function updatePlaying() {
    const playing = !audio.paused && !audio.ended;
    document.body.classList.toggle('is-playing', playing);
    $('playButton').querySelector('use').setAttribute('href', playing ? '#i-pause' : '#i-play');
    $('playButton').setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${byId(state.current).title}`);
    $('playButton').setAttribute('aria-pressed', String(playing));
    if (playing && !animationId) animationId = requestAnimationFrame(animate);
    if (!playing && animationId) { cancelAnimationFrame(animationId); animationId = 0; }
    if (!hasError && audio.readyState >= 2) setStatus(playing ? 'NOW PLAYING · LOCAL STEREO' : audio.currentTime > 0 ? 'PAUSED · TAKE YOUR TIME' : 'READY WHEN YOU ARE');
  }

  function updateFavorite() {
    const saved = state.saved.includes(state.current);
    $('favoriteButton').setAttribute('aria-pressed', String(saved));
    $('favoriteButton').setAttribute('aria-label', `${saved ? 'Remove' : 'Save'} ${byId(state.current).title} ${saved ? 'from' : 'to'} favorites`);
    $('savedCount').textContent = String(state.saved.length).padStart(2, '0');
  }

  function renderQueue() {
    const list = $('trackList');
    const focusedTrack = list.contains(document.activeElement) ? document.activeElement.closest('[data-track]')?.dataset.track : null;
    list.replaceChildren();
    const queue = state.view === 'saved' ? tracks.filter(track => state.saved.includes(track.id)) : tracks;
    list.setAttribute('aria-label', state.view === 'saved' ? 'Saved tracks' : 'Session tracks');
    $('queueEmpty').hidden = queue.length !== 0;
    $('sessionTab').setAttribute('aria-pressed', String(state.view === 'session'));
    $('savedTab').setAttribute('aria-pressed', String(state.view === 'saved'));
    queue.forEach(track => {
      const active = track.id === state.current;
      const row = document.createElement('li');
      row.className = `track-row${active ? ' active' : ''}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'track-select';
      button.dataset.track = track.id;
      button.setAttribute('aria-label', `Play ${track.title} by ${track.artist}`);
      if (active) button.setAttribute('aria-current', 'true');
      // Only immutable local track metadata is used in this template.
      button.innerHTML = `<span class="track-index">${String(tracks.indexOf(track) + 1).padStart(2, '0')}</span><img class="track-thumb" src="assets/tempo/${track.art}" alt="" width="36" height="36"><span class="track-meta"><span class="track-name">${track.title}</span><span class="track-credit">${track.artist} / ${track.album}</span></span><span class="track-length">${formatTime(Math.ceil(track.duration))}</span><span class="track-indicator" aria-hidden="true">${active ? '<i></i><i></i><i></i>' : '↗'}</span>`;
      button.addEventListener('click', () => selectTrack(track.id, true));
      row.append(button);
      list.append(row);
    });
    // Keep keyboard users on the same track after the local queue is rebuilt.
    if (focusedTrack) {
      const replacement = Array.from(list.querySelectorAll('[data-track]')).find(button => button.dataset.track === focusedTrack);
      if (replacement) replacement.focus({ preventScroll: true });
      else (state.view === 'saved' ? $('savedTab') : $('sessionTab')).focus({ preventScroll: true });
    }
  }

  function setView(view) {
    state.view = view;
    renderQueue();
  }

  function showError(message) {
    hasError = true;
    $('playbackError').hidden = false;
    $('errorText').textContent = message;
    $('seek').disabled = true;
    setStatus('SIGNAL INTERRUPTED', 'error');
    updatePlaying();
  }

  async function play() {
    const version = loadVersion;
    try {
      await audio.play();
      if (version !== loadVersion) return;
      hasError = false;
      $('playbackError').hidden = true;
      $('seek').disabled = !(audio.readyState >= 1);
      updatePlaying();
    } catch (error) {
      if (version !== loadVersion || error.name === 'AbortError') return;
      if (error.name === 'NotAllowedError') {
        setStatus('PRESS PLAY TO START THE SESSION');
        toast('Your browser is waiting for a press of the play button.');
      } else showError('The audio could not start. Check the local audio files and try again.');
    }
  }

  function togglePlayback() {
    if (hasError) { retry(); return; }
    if (audio.paused || audio.ended) play();
    else audio.pause();
  }

  function selectTrack(id, autoplay = false) {
    const track = byId(id);
    if (!track) return;
    loadVersion += 1;
    audio.pause();
    state.current = id;
    hasError = false;
    isSeeking = false;
    $('playbackError').hidden = true;
    $('seek').disabled = true;
    $('seek').value = '0';
    $('seek').max = String(track.duration);
    $('albumCover').src = `assets/tempo/${track.art}`;
    $('albumCover').alt = track.alt;
    $('catalogNumber').textContent = track.side;
    $('trackTitle').textContent = track.title;
    $('trackArtist').replaceChildren(document.createTextNode(`${track.artist} `), Object.assign(document.createElement('span'), { textContent: '—' }), document.createTextNode(` ${track.album}`));
    $('trackDescription').textContent = track.description;
    $('trackGenre').textContent = track.genre;
    $('trackCounter').textContent = `${String(tracks.indexOf(track) + 1).padStart(2, '0')} / 03`;
    $('elapsed').textContent = '00:00';
    $('duration').textContent = formatTime(Math.ceil(track.duration));
    document.title = `${track.title} — TEMPO`;
    waveformPeaks = window.TEMPO_WAVEFORMS?.[track.id] || Array.from({ length: 160 }, (_, i) => .14 + .5 * Math.abs(Math.sin(i * .71) * Math.cos(i * .19)));
    updateFavorite();
    renderQueue();
    setStatus('LOADING THE GOOD STUFF', 'loading');
    audio.src = `assets/audio/${track.audio}`;
    audio.load();
    updatePlaying();
    drawWaveform(0);
    persist();
    if (autoplay) play();
    if ('mediaSession' in navigator && 'MediaMetadata' in window) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: track.artist, album: track.album, artwork: [{ src: new URL(`assets/tempo/${track.art}`, document.baseURI).href, sizes: '800x800', type: 'image/svg+xml' }] });
    }
  }

  function activeQueue() {
    const saved = tracks.filter(track => state.saved.includes(track.id));
    return state.view === 'saved' && saved.length ? saved : tracks;
  }

  function skip(direction, autoplay = !audio.paused) {
    const queue = activeQueue();
    const index = queue.findIndex(track => track.id === state.current);
    let next;
    if (state.shuffle && queue.length > 1) {
      const choices = queue.filter(track => track.id !== state.current);
      next = choices[Math.floor(Math.random() * choices.length)];
    } else next = queue[index < 0 ? direction > 0 ? 0 : queue.length - 1 : (index + direction + queue.length) % queue.length];
    selectTrack(next.id, autoplay);
  }

  function retry() { selectTrack(state.current, true); }

  function updateVolume() {
    audio.volume = state.volume / 100;
    audio.muted = state.muted;
    $('volume').value = String(state.volume);
    $('volume').style.background = `linear-gradient(to right,#818e70 0 ${state.volume}%,#b9c1ac ${state.volume}% 100%)`;
    $('volumeValue').textContent = String(Math.round(state.volume)).padStart(2, '0');
    const silent = state.muted || state.volume === 0;
    $('muteButton').setAttribute('aria-label', silent ? 'Unmute audio' : 'Mute audio');
    $('muteButton').setAttribute('aria-pressed', String(silent));
    $('muteButton').querySelector('use').setAttribute('href', silent ? '#i-muted' : '#i-volume');
    $('volume').setAttribute('aria-valuetext', `${Math.round(state.volume)} percent${state.muted ? ', muted' : ''}`);
  }

  function updateModes() {
    $('shuffleButton').setAttribute('aria-pressed', String(state.shuffle));
    $('shuffleButton').setAttribute('aria-label', `${state.shuffle ? 'Disable' : 'Enable'} shuffle`);
    $('repeatButton').setAttribute('aria-pressed', String(state.repeat));
    $('repeatButton').setAttribute('aria-label', `${state.repeat ? 'Disable' : 'Enable'} repeat track`);
  }

  function favorite() {
    const index = state.saved.indexOf(state.current);
    if (index >= 0) state.saved.splice(index, 1);
    else state.saved.push(state.current);
    updateFavorite();
    renderQueue();
    persist();
    toast(index >= 0 ? 'A little more room in your collection.' : `${byId(state.current).title} saved for another moment.`);
  }

  function seekBy(delta) {
    if (audio.readyState < 1 || hasError) return;
    audio.currentTime = Math.max(0, Math.min(currentDuration(), audio.currentTime + delta));
    updateTime();
  }

  $('playButton').addEventListener('click', togglePlayback);
  $('previousButton').addEventListener('click', () => skip(-1));
  $('nextButton').addEventListener('click', () => skip(1));
  $('favoriteButton').addEventListener('click', favorite);
  $('retryButton').addEventListener('click', retry);
  $('sessionTab').addEventListener('click', () => setView('session'));
  $('savedTab').addEventListener('click', () => setView('saved'));
  $('showSession').addEventListener('click', () => { setView('session'); $('sessionTab').focus(); });
  $('shuffleButton').addEventListener('click', () => { state.shuffle = !state.shuffle; updateModes(); persist(); toast(state.shuffle ? 'A different kind of order. Shuffle on.' : 'Back to the original running order.'); });
  $('repeatButton').addEventListener('click', () => { state.repeat = !state.repeat; updateModes(); persist(); toast(state.repeat ? 'Stay a little longer. Repeat track on.' : 'Let the session keep moving.'); });
  $('muteButton').addEventListener('click', () => {
    if (state.volume === 0) { state.volume = 50; state.muted = false; }
    else state.muted = !state.muted;
    updateVolume(); persist();
  });
  $('volume').addEventListener('input', event => { state.volume = Number(event.target.value); state.muted = false; updateVolume(); persist(); });
  $('seek').addEventListener('pointerdown', () => { isSeeking = true; seekStartPlaying = !audio.paused; });
  $('seek').addEventListener('input', () => { if (audio.readyState >= 1) { audio.currentTime = Number($('seek').value); updateTime(); } });
  function finishSeek() { if (!isSeeking) return; isSeeking = false; updateTime(); if (seekStartPlaying && audio.paused && !audio.ended) play(); }
  $('seek').addEventListener('change', finishSeek);
  window.addEventListener('pointerup', finishSeek);
  window.addEventListener('pointercancel', finishSeek);

  audio.addEventListener('loadstart', () => { if (!hasError) setStatus('LOADING THE GOOD STUFF', 'loading'); });
  audio.addEventListener('loadedmetadata', () => { $('seek').disabled = false; updateTime(); });
  audio.addEventListener('canplay', () => { hasError = false; $('playbackError').hidden = true; $('seek').disabled = false; updatePlaying(); });
  audio.addEventListener('playing', updatePlaying);
  audio.addEventListener('pause', updatePlaying);
  audio.addEventListener('timeupdate', () => { if (!animationId) updateTime(); });
  audio.addEventListener('waiting', () => { if (!audio.paused && !hasError) setStatus('BUFFERING · ONE LITTLE MOMENT', 'loading'); });
  audio.addEventListener('stalled', () => { if (!audio.paused && audio.readyState < 3 && !hasError) setStatus('WAITING FOR LOCAL AUDIO', 'loading'); });
  audio.addEventListener('error', () => showError('This session could not load. Keep the assets/audio folder beside this page, then retry.'));
  audio.addEventListener('ended', () => {
    if (state.repeat) { audio.currentTime = 0; play(); }
    else skip(1, true);
  });

  const dialog = $('shortcutsDialog');
  function openShortcuts() { if (!dialog.open) dialog.showModal(); }
  $('helpButton').addEventListener('click', openShortcuts);
  $('shortcutButton').addEventListener('click', openShortcuts);
  $('closeShortcuts').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || dialog.open || !(event.target instanceof Element) || event.target.closest('input,textarea,select,button,a,[contenteditable=true]')) return;
    const key = event.key.toLowerCase();
    if (event.repeat && !['j', 'l'].includes(key)) return;
    if (key === ' ' || key === 'k') { event.preventDefault(); togglePlayback(); }
    if (key === 'j') { event.preventDefault(); seekBy(-5); }
    if (key === 'l') { event.preventDefault(); seekBy(5); }
    if (key === 'm') { event.preventDefault(); $('muteButton').click(); }
    if (key === 'f') { event.preventDefault(); favorite(); }
  });

  if ('ResizeObserver' in window) new ResizeObserver(() => drawWaveform()).observe(canvas);
  else window.addEventListener('resize', () => drawWaveform());
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => skip(-1));
      navigator.mediaSession.setActionHandler('nexttrack', () => skip(1));
      navigator.mediaSession.setActionHandler('seekbackward', details => seekBy(-(details.seekOffset || 5)));
      navigator.mediaSession.setActionHandler('seekforward', details => seekBy(details.seekOffset || 5));
    } catch { /* Optional system media buttons do not affect the player. */ }
  }

  window.addEventListener('pagehide', () => { audio.pause(); persist(); if (animationId) cancelAnimationFrame(animationId); });
  updateVolume();
  updateModes();
  selectTrack(state.current); // Restoring a preference never starts audio.
})();
