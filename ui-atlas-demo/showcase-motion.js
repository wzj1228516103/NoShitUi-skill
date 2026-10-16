(() => {
  const stage = document.querySelector('.hero-stage');
  if (!stage) return;

  const motionAllowed = window.matchMedia(
    '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
  );
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;

  function paint() {
    stage.style.setProperty('--pointer-x', `${pointerX.toFixed(2)}px`);
    stage.style.setProperty('--pointer-y', `${pointerY.toFixed(2)}px`);
    frame = 0;
  }

  function reset() {
    window.cancelAnimationFrame(frame);
    frame = 0;
    pointerX = 0;
    pointerY = 0;
    paint();
  }

  function move(event) {
    if (event.pointerType !== 'mouse') return;
    const bounds = stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const clamp = value => Math.max(-1, Math.min(1, value));
    pointerX = clamp(((event.clientX - bounds.left) / bounds.width - 0.5) * 2) * 8;
    pointerY = clamp(((event.clientY - bounds.top) / bounds.height - 0.5) * 2) * 6;
    if (!frame) frame = window.requestAnimationFrame(paint);
  }

  function syncMotion() {
    stage.removeEventListener('pointermove', move);
    stage.removeEventListener('pointerleave', reset);
    stage.removeEventListener('pointercancel', reset);
    reset();

    if (motionAllowed.matches) {
      stage.addEventListener('pointermove', move, { passive: true });
      stage.addEventListener('pointerleave', reset, { passive: true });
      stage.addEventListener('pointercancel', reset, { passive: true });
    }
  }

  motionAllowed.addEventListener('change', syncMotion);
  syncMotion();
})();
