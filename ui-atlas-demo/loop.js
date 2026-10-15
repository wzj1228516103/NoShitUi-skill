'use strict';
(() => {
  const $ = id => document.getElementById(id), KEY = 'noshitui.loop.progress.v1';
  const units = [
    { title: 'Color with purpose', subtitle: 'Give every shade a job to do.', theme: 'color', duration: 4, lead: 'Color is a language. Start with what you want to say.', body: ['A useful palette gives colors consistent jobs. One color marks the primary action; other colors communicate information, caution, or a completed task. Consistency helps people build a reliable mental model.', 'Meaning should also appear in words or symbols. A red field without an error message asks people to guess what went wrong. A clear label works even when the hue is difficult to distinguish.'], takeaway: 'Choose color for meaning first. Support every important signal with a label, icon, or shape.', questions: [
      { question: 'Two buttons do different things. Which one should use your primary action color?', answers: ['Both, so the page feels colorful.', 'The action that moves the main task forward.', 'Whichever button has the shorter label.'], correct: 1, explanation: 'A consistent primary color establishes priority. Supporting actions can use quieter treatments so the main next step is easy to find.' },
      { question: 'A payment field has an error. What makes the feedback useful?', answers: ['A red border and a message explaining how to fix it.', 'Changing the border to red by itself.', 'A subtle color change that keeps the page clean.'], correct: 0, explanation: 'Color attracts attention; the message explains the problem and the repair. This also supports people who cannot distinguish the chosen colors.' },
      { question: 'Your app uses green for a successful save. What should happen elsewhere?', answers: ['Use green for a destructive delete button.', 'Choose a new success color on every screen.', 'Keep green associated with the same successful state.'], correct: 2, explanation: 'Stable color roles reduce relearning. Reusing green for conflicting meanings weakens a signal people have already learned.' }
    ] },
    { title: 'The space between', subtitle: 'Let your layout do a little talking.', theme: 'space', duration: 4, lead: 'What you leave out can be as useful as what you put in.', body: ['People read distance as a relationship. A label should sit close to its field, while separate groups need more room between them. This is the principle of proximity at work.', 'A small spacing scale makes those relationships repeatable. For example, 8 px inside a small group, 16 px between related elements, and 32 px between sections can create a clear rhythm. The scale is a tool, not an absolute rule.'], takeaway: 'Use less space within a group and more space between groups. Repeat the relationship before decorating it.', questions: [
      { question: 'A label sits halfway between two fields. What is the most useful first fix?', answers: ['Add a decorative line around the entire form.', 'Move the label closer to the field it belongs to.', 'Make every gap exactly the same size.'], correct: 1, explanation: 'Proximity tells people which items belong together. Moving the label toward its own field resolves the relationship directly.' },
      { question: 'What is the purpose of a spacing scale?', answers: ['To make relationships consistent across the interface.', 'To prevent every use of custom spacing.', 'To fit as many controls as possible on screen.'], correct: 0, explanation: 'A spacing scale creates repeatable relationships. Designers can still make deliberate exceptions when the content or task requires them.' },
      { question: 'Three settings belong to one group. A fourth starts a new topic. Which layout helps?', answers: ['Use a bigger gap between every label and its field.', 'Put all four at equal distances with no headings.', 'Keep the first three close, then add more space before the fourth.'], correct: 2, explanation: 'A larger gap between groups creates structure. A useful heading can reinforce it without requiring a border around everything.' }
    ] },
    { title: 'Make room for everyone', subtitle: 'Good design opens the door wider.', theme: 'access', duration: 5, lead: 'An interface works better when more people can use it.', body: ['Keyboard users need to reach interactive controls in a sensible order and see where focus is. Native buttons and form elements provide reliable behavior without asking you to reinvent it.', 'Write labels that explain the action or destination. “Download report” gives more context than “Click here.” If a dialog closes, return focus to the control that opened it so the person can continue from a familiar place.'], takeaway: 'Start with semantic controls, visible focus, descriptive labels, and a predictable path through the task.', questions: [
      { question: 'Someone uses Tab to move through your page. What should they be able to see?', answers: ['A clear indicator on the currently focused control.', 'Only the mouse pointer.', 'Every control highlighted at the same time.'], correct: 0, explanation: 'Visible focus is the keyboard equivalent of knowing where the pointer is. It gives the current position one clear visual signal.' },
      { question: 'Which label gives a link the clearest purpose?', answers: ['Click here', 'More', 'Read the shipping policy'], correct: 2, explanation: 'A descriptive label tells people what to expect, including when links are encountered outside the surrounding paragraph.' },
      { question: 'A confirmation dialog closes. Where should focus usually return?', answers: ['To the first link at the top of the page.', 'To the control that opened the dialog.', 'Nowhere; keyboard users can start over.'], correct: 1, explanation: 'Returning focus to the opener preserves context and lets the person continue the task from the same place.' }
    ] }
  ];
  const notes = [
    ['COLOR / 01', 'Give color a job.', 'A small palette with clear roles is more useful than a big palette with no plan.', 'Try it: choose a single primary action color. List every use of that color on a screen and check that the meanings agree.'],
    ['COLOR / 02', 'Say it another way.', 'Important information deserves more than a change of hue.', 'Try it: view your interface in grayscale. Can you still identify an error and understand how to fix it from a label, icon, or explanation?'],
    ['SPACE / 03', 'Close means connected.', 'Distance tells a story about which pieces belong together.', 'Try it: compare the gap between a label and its field with the gap before the next field. The first gap should make their relationship clear.'],
    ['SPACE / 04', 'Build a little rhythm.', 'Repeat a few useful spacing relationships, then make deliberate exceptions.', 'Try it: start with 8, 16, 24, and 32 px. Use smaller steps within groups and larger steps between topics. Adjust after checking real content.'],
    ['ACCESS / 05', 'Follow the focus.', 'A visible keyboard path is a basic part of the composition.', 'Try it: put the mouse aside. Use Tab, Shift+Tab, Enter, and Escape to finish the main task. Check both where focus goes and whether you can see it.'],
    ['ACCESS / 06', 'Label the destination.', 'A useful action label reduces the amount of guessing a person has to do.', 'Try it: replace a vague “More” or “Click here” with a short description such as “Read the delivery policy.” Make the destination clear before the click.']
  ];
  const fresh = () => ({ version: 1, completed: 0, scores: [null, null, null], bookmarks: [] });
  let state = fresh(), route = 'learn', filter = 'all', lesson = null, opener = null, toastTimer, restoreError = false;
  function node(tag, className, content) { const el = document.createElement(tag); if (className) el.className = className; if (content !== undefined) el.textContent = content; return el; }
  function toast(message) { clearTimeout(toastTimer); $('toast').textContent = message; $('toast').classList.add('visible'); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4700); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { toast('Your browser could not save progress. You can keep learning in this session.'); } }
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) {
      if (stored.length > 3000) throw new Error('Oversized progress');
      const value = JSON.parse(stored);
      if (value?.version !== 1 || !Number.isInteger(value.completed) || value.completed < 0 || value.completed > 3 || !Array.isArray(value.scores) || value.scores.length !== 3 || !value.scores.every((score, i) => i < value.completed ? Number.isInteger(score) && score >= 0 && score <= 3 : score === null) || !Array.isArray(value.bookmarks) || value.bookmarks.length > 6 || !value.bookmarks.every(id => Number.isInteger(id) && id >= 0 && id < 6)) throw new Error('Invalid progress');
      state = { version: 1, completed: value.completed, scores: [...value.scores], bookmarks: [...new Set(value.bookmarks)] };
    }
  } catch (_) { restoreError = true; }
  function navigate(next, moveFocus = false) {
    if (!['learn', 'progress', 'notes'].includes(next)) return;
    route = next;
    for (const name of ['learn', 'progress', 'notes']) $(`${name}View`).hidden = name !== route;
    document.querySelectorAll('[data-route]').forEach(button => { if (button.dataset.route === route) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current'); });
    $('pageCrumb').textContent = { learn: 'MY LEARNING', progress: 'MY PROGRESS', notes: 'FIELD NOTES' }[route];
    if (moveFocus) { $('main').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }
  }
  document.querySelectorAll('[data-route]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.route, true)));
  $('profileButton').addEventListener('click', () => navigate('progress', true));
  function renderUnits() {
    $('unitList').replaceChildren();
    units.forEach((unit, index) => {
      const complete = index < state.completed, available = index === state.completed, locked = index > state.completed;
      const card = node('article', `unit-card ${complete ? 'completed' : available ? 'available' : 'locked'}`);
      card.append(node('span', 'unit-number', complete ? '✓' : String(index + 1).padStart(2, '0')));
      const copy = node('div', 'unit-copy'); copy.append(node('span', 'unit-kicker', complete ? 'A GOOD IDEA, PRACTICED' : available ? 'YOUR NEXT SMALL STEP' : 'A LITTLE FURTHER ALONG'), node('h3', '', unit.title));
      const meta = node('p', '', `${unit.duration} MIN`); meta.append(node('span', '', '·'), document.createTextNode('3 QUESTIONS'), node('span', '', '·'), document.createTextNode(complete ? 'COMPLETED' : locked ? 'LOCKED' : 'READY WHEN YOU ARE')); copy.append(meta);
      const button = node('button', 'unit-action', complete ? '↻' : locked ? '⌑' : '→'); button.type = 'button'; button.disabled = locked; button.setAttribute('aria-label', `${complete ? 'Review' : locked ? 'Locked' : 'Start'} unit ${index + 1}: ${unit.title}${locked ? '. Complete the previous unit to unlock.' : ''}`); button.dataset.unit = index;
      button.addEventListener('click', () => openLesson(index, button)); card.append(copy, button); $('unitList').append(card);
    });
  }
  function renderProgress() {
    const percent = Math.round(state.completed / 3 * 100), correct = state.scores.reduce((sum, score) => sum + (score ?? 0), 0);
    $('coursePercent').replaceChildren(document.createTextNode(String(percent)), node('span', '', '%'));
    $('courseRing').style.strokeDashoffset = String(408.407 * (1 - state.completed / 3));
    $('completedStat').textContent = state.completed; $('xpStat').textContent = state.completed * 90; $('pathCount').textContent = `${state.completed} / 3 complete`;
    $('continueButton').replaceChildren(document.createTextNode(state.completed === 3 ? 'A little look back' : state.completed ? 'Keep the good going' : "Let's get into it"), node('span', '', '↗'));
    $('momentumTitle').textContent = state.completed === 3 ? 'Look at you grow.' : state.completed ? 'A good thing, growing.' : "You've got this.";
    $('momentumText').textContent = state.completed === 3 ? 'Three units. Nine ideas practiced. Carry them into what you make next.' : state.completed ? 'One small step has become a little momentum. Keep it yours.' : "Your first small step is waiting. Let's make it a good one.";
    $('progressMetrics').replaceChildren();
    [['UNITS COMPLETED', `${state.completed}/3`, 'One small step at a time.'], ['QUESTIONS MASTERED', `${state.completed * 3}/9`, 'Practice makes it stick.'], ['FIRST-TRY ACCURACY', state.completed ? `${Math.round(correct / (state.completed * 3) * 100)}%` : '—', state.completed ? 'Your first completed attempts.' : 'Take a unit to see your result.']].forEach(([label, value, caption]) => { const card = node('article', 'metric'); card.append(node('span', '', label), node('strong', '', value), node('p', '', caption)); $('progressMetrics').append(card); });
    $('progressRows').replaceChildren();
    units.forEach((unit, index) => { const row = node('div', 'progress-row'), copy = node('div'); copy.append(node('strong', '', unit.title), node('small', '', index < state.completed ? `${state.scores[index]} of 3 correct on the first try` : index === state.completed ? 'Ready for your next small step' : 'Unlocks after the previous unit')); const bar = node('div', 'bar'), fill = node('i'); fill.style.width = index < state.completed ? '100%' : '0'; bar.append(fill); row.append(copy, bar, node('span', '', index < state.completed ? 'COMPLETE' : index === state.completed ? 'READY' : 'LOCKED')); $('progressRows').append(row); });
  }
  function renderNotes() {
    const focusId = document.activeElement?.dataset.bookmark;
    $('bookmarkCount').textContent = state.bookmarks.length; $('savedNoteCount').textContent = state.bookmarks.length;
    $('notesGrid').replaceChildren(); let shown = 0;
    notes.forEach((note, index) => {
      const saved = state.bookmarks.includes(index); if (filter === 'saved' && !saved) return; shown++;
      const card = node('article', 'note-card'); const button = node('button', 'bookmark-button', saved ? '▣' : '▢'); button.type = 'button'; button.dataset.bookmark = index; button.setAttribute('aria-pressed', String(saved)); button.setAttribute('aria-label', `${saved ? 'Remove bookmark' : 'Bookmark'}: ${note[1]}`);
      button.addEventListener('click', () => { state.bookmarks = saved ? state.bookmarks.filter(id => id !== index) : [...state.bookmarks, index]; save(); renderNotes(); if (filter === 'saved' && saved) document.querySelector('[data-notes-filter="saved"]').focus({ preventScroll: true }); });
      const details = node('details'); details.append(node('summary', '', 'A little practice'), node('p', '', note[3])); card.append(button, node('small', '', note[0]), node('h2', '', note[1]), node('p', '', note[2]), details); $('notesGrid').append(card);
    });
    $('emptyNotes').hidden = shown > 0;
    if (focusId !== undefined) [...document.querySelectorAll('[data-bookmark]')].find(button => button.dataset.bookmark === focusId)?.focus({ preventScroll: true });
  }
  document.querySelectorAll('[data-notes-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.notesFilter; document.querySelectorAll('[data-notes-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button))); renderNotes(); }));
  $('showAllNotes').addEventListener('click', () => { document.querySelector('[data-notes-filter="all"]').click(); document.querySelector('[data-notes-filter="all"]').focus(); });
  $('continueButton').addEventListener('click', () => openLesson(Math.min(state.completed, 2), $('continueButton')));
  function openLesson(index, control) {
    if (index > state.completed) return;
    opener = control; lesson = { unit: index, phase: 'reading', question: 0, choice: null, checked: false, correct: false, attempts: 0, firstCorrect: 0, review: index < state.completed };
    renderLesson(); $('lessonDialog').showModal();
  }
  function focusLessonTitle() { const title = $('lessonTitle'); if (title) { title.tabIndex = -1; title.focus({ preventScroll: true }); } }
  function renderLesson() {
    const unit = units[lesson.unit], container = $('lessonContent'); container.replaceChildren();
    $('lessonEyebrow').textContent = `UNIT ${String(lesson.unit + 1).padStart(2, '0')} / ${lesson.phase === 'reading' ? 'A LITTLE THEORY' : lesson.phase === 'complete' ? 'A GOOD STEP FORWARD' : 'PUT IT INTO PRACTICE'}`;
    $('lessonProgress').style.width = `${lesson.phase === 'reading' ? 0 : lesson.phase === 'complete' ? 100 : (lesson.question + (lesson.correct ? 1 : 0)) / 3 * 100}%`;
    $('lessonAction').disabled = false;
    $('lessonFooterText').textContent = lesson.phase === 'complete' ? 'CARRY A GOOD IDEA INTO YOUR DAY.' : "TAKE YOUR TIME. THAT'S THE POINT.";
    if (lesson.phase === 'reading') {
      const title = node('h2', '', unit.title); title.id = 'lessonTitle';
      const visual = node('div', `lesson-visual ${unit.theme}`); visual.setAttribute('aria-hidden', 'true');
      if (unit.theme === 'access') { const sample = node('button', '', 'A clear next step'); sample.type = 'button'; sample.tabIndex = -1; visual.append(sample); } else for (let i = 0; i < 3; i++) visual.append(node('span'));
      const body = node('div', 'lesson-body'); unit.body.forEach(paragraph => body.append(node('p', '', paragraph)));
      const takeaway = node('div', 'lesson-takeaway'); takeaway.append(node('strong', '', 'THE IDEA TO KEEP'), document.createTextNode(unit.takeaway));
      container.append(title, node('p', 'lesson-intro', unit.lead), visual, body, takeaway); $('lessonAction').textContent = "Let's practice →";
    } else if (lesson.phase === 'quiz') {
      const question = unit.questions[lesson.question]; container.append(node('span', 'question-count', `A LITTLE PRACTICE / ${lesson.question + 1} OF 3`));
      const title = node('h2', 'question-text', question.question); title.id = 'lessonTitle'; container.append(title);
      const answers = node('fieldset', 'answers'); answers.append(node('legend', '', 'Choose one answer'));
      question.answers.forEach((answer, index) => {
        const label = node('label', `answer${lesson.checked && index === lesson.choice ? lesson.correct ? ' correct' : ' incorrect' : ''}`);
        const input = node('input'); input.type = 'radio'; input.name = 'answer'; input.value = index; input.checked = lesson.choice === index; input.disabled = lesson.checked;
        input.addEventListener('change', () => { lesson.choice = index; $('lessonAction').disabled = false; }); label.append(input, node('span', '', answer)); answers.append(label);
      }); container.append(answers);
      if (lesson.checked) { const feedback = node('div', `feedback${lesson.correct ? '' : ' error'}`); feedback.setAttribute('role', 'status'); feedback.append(node('strong', '', lesson.correct ? 'A good instinct.' : "Not quite — and that's how we learn."), document.createTextNode(question.explanation)); container.append(feedback); }
      $('lessonAction').textContent = !lesson.checked ? 'Check my answer →' : !lesson.correct ? 'Try again ↻' : lesson.question === 2 ? 'Finish this unit →' : 'Next question →';
      $('lessonAction').disabled = !lesson.checked && lesson.choice === null;
    } else {
      const complete = node('div', 'completion'); complete.append(node('div', 'completion-icon', '✳')); const title = node('h2', '', lesson.review ? 'A good idea, revisited.' : lesson.unit === 2 ? 'Look at you grow.' : 'One good step forward.'); title.id = 'lessonTitle';
      complete.append(title, node('p', '', lesson.review ? `You practiced ${unit.title.toLowerCase()} again. Your original course result stays in your progress.` : `${unit.title}, practiced. ${lesson.unit < 2 ? 'Your next unit is now open. Take it at your own pace.' : 'Three units and nine ideas mastered. Bring a little of that perspective into what you make next.'}`), node('span', 'earned', `${lesson.review ? 'REVIEW COMPLETE' : '+90 POINTS'} · ${lesson.firstCorrect}/3 RIGHT FIRST TIME`)); container.append(complete); $('lessonAction').textContent = 'Back to my path →';
    }
  }
  $('lessonAction').addEventListener('click', () => {
    if (!lesson) return;
    if (lesson.phase === 'reading') lesson.phase = 'quiz';
    else if (lesson.phase === 'complete') { $('lessonDialog').close(); return; }
    else if (!lesson.checked) {
      if (lesson.choice === null) return;
      lesson.correct = lesson.choice === units[lesson.unit].questions[lesson.question].correct; lesson.checked = true;
      if (lesson.correct && lesson.attempts === 0) lesson.firstCorrect++;
      lesson.attempts++;
    } else if (!lesson.correct) { lesson.choice = null; lesson.checked = false; }
    else if (lesson.question < 2) { lesson.question++; lesson.choice = null; lesson.checked = false; lesson.correct = false; lesson.attempts = 0; }
    else {
      lesson.phase = 'complete';
      if (!lesson.review && lesson.unit === state.completed) { state.scores[lesson.unit] = lesson.firstCorrect; state.completed++; save(); renderUnits(); renderProgress(); }
    }
    renderLesson(); focusLessonTitle();
  });
  $('closeLesson').addEventListener('click', () => $('lessonDialog').close());
  $('lessonDialog').addEventListener('close', () => {
    lesson = null;
    // Completed unit buttons are rebuilt; restore to its replacement when needed.
    if (opener?.isConnected) opener.focus({ preventScroll: true }); else if (opener?.dataset.unit !== undefined) document.querySelector(`[data-unit="${opener.dataset.unit}"]`)?.focus({ preventScroll: true });
    opener = null;
  });
  $('resetButton').addEventListener('click', () => $('resetDialog').showModal());
  $('cancelReset').addEventListener('click', () => $('resetDialog').close());
  $('confirmReset').addEventListener('click', () => { state = fresh(); save(); renderAll(); $('resetDialog').close(); toast('A fresh beginning. Your first small step is waiting.'); });
  $('resetDialog').addEventListener('close', () => $('resetButton').focus({ preventScroll: true }));
  function renderAll() { renderUnits(); renderProgress(); renderNotes(); }
  renderAll(); navigate(route);
  if (restoreError) toast('Saved progress could not be read. A fresh path is ready; your new progress will save from here.');
})();
