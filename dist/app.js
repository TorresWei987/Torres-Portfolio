(() => {
  'use strict';
  const root = document.documentElement, body = document.body;
  root.classList.add('js');
  const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
  const read = key => { try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; } };
  const write = (key, value) => { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const remove = key => { try { sessionStorage.removeItem(key); } catch {} };
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const desktop = matchMedia('(min-width: 761px) and (min-height: 580px)');
  const motionButton = document.querySelector('.motion-toggle');
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.reading-progress');
  const copyButton = document.querySelector('.copy-email');
  const status = document.querySelector('.live-message');
  const animations = new Set(), pointers = [];
  let userPaused = false;
  try { userPaused = localStorage.getItem('torres-motion') === 'paused'; } catch {}
  let paused = preference.matches || userPaused;
  let finishEntry = () => {}, departure = null, scrollFrame = 0, feedbackTimer = 0;
  let lastY = scrollY, direction = 0, travel = 0, restoreRevision = 0, feedbackRevision = 0;
  const collection = document.querySelector('.work-collection');
  const stage = collection?.querySelector('.work-stage');
  const scenes = [...document.querySelectorAll('.project-scene')];
  const sceneButtons = [...document.querySelectorAll('[data-scene-select]')];
  let stageEnabled = false, currentScene = -1;
  const sceneColors = scenes.map(scene => {
    const css = getComputedStyle(scene);
    return { bg: css.getPropertyValue('--card-bg').trim(), ink: css.getPropertyValue('--card-ink').trim() };
  });
  const baseColors = { bg: getComputedStyle(root).getPropertyValue('--bg').trim(), ink: getComputedStyle(root).getPropertyValue('--ink').trim() };

  function move(element, keyframes, options = {}) {
    if (!element || paused || document.hidden) return null;
    const animation = element.animate(keyframes, { duration: 650, easing: 'cubic-bezier(.2,.75,.2,1)', fill: 'backwards', ...options });
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    return animation;
  }
  function cancelAnimations() {
    for (const animation of animations) animation.cancel();
    animations.clear();
  }
  function resetFeedback() {
    feedbackRevision++;
    clearTimeout(feedbackTimer);
    if (copyButton) copyButton.innerHTML = 'Copy email <span aria-hidden="true">⧉</span>';
    if (copyButton) copyButton.disabled = false;
    if (status) status.textContent = '';
  }
  function cancelDeparture(commit = false) {
    if (!departure) return;
    const pending = departure; departure = null;
    clearTimeout(pending.timer);
    if (commit) { location.assign(pending.href); return; }
    pending.scene?.classList.remove('case-departing');
    pending.media?.style.removeProperty('view-transition-name');
    pending.title?.style.removeProperty('view-transition-name');
    remove('torres-handoff');
  }
  function applyMotion() {
    paused = userPaused || preference.matches;
    root.classList.toggle('motion-paused', paused);
    root.dataset.motion = paused ? 'off' : 'on';
    motionButton.disabled = preference.matches;
    motionButton.title = preference.matches ? 'Motion follows your system preference' : '';
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Enable animations' : 'Pause animations');
    motionButton.querySelector('.motion-label').textContent = paused ? 'motion off' : 'motion on';
    if (paused) {
      finishEntry(); cancelAnimations(); pointers.forEach(pointer => pointer.reset());
      document.querySelectorAll('.is-waving').forEach(element => element.classList.remove('is-waving'));
      document.querySelectorAll('.project-figure').forEach(element => element.style.removeProperty('--depth-y'));
      cancelDeparture(true);
    }
    queueScroll();
  }
  motionButton.addEventListener('click', () => {
    userPaused = !userPaused;
    try { localStorage.setItem('torres-motion', userPaused ? 'paused' : 'running'); } catch {}
    applyMotion();
  });
  preference.addEventListener('change', applyMotion);

  // Only inner glyphs move; accessible names and outer hit areas stay intact.
  document.querySelectorAll('.nav-link').forEach(link => {
    const firstText = [...link.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (!firstText) return;
    link.setAttribute('aria-label', link.getAttribute('aria-label') || link.textContent.trim());
    const wrapper = document.createElement('span'); wrapper.className = 'wave-text'; wrapper.setAttribute('aria-hidden', 'true');
    [...firstText.textContent].forEach((letter, index) => {
      const span = document.createElement('span'); span.className = 'wave-char';
      span.style.setProperty('--letter', index); span.textContent = letter; wrapper.append(span);
    });
    firstText.replaceWith(wrapper);
    const wave = () => {
      if (paused) return;
      link.classList.remove('is-waving'); void wrapper.offsetWidth; link.classList.add('is-waving');
    };
    link.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') wave(); });
    link.addEventListener('focus', wave);
    wrapper.lastElementChild?.addEventListener('animationend', () => link.classList.remove('is-waving'));
  });
  function bindPointer(element, paint) {
    let frame = 0, point = null;
    const reset = () => { cancelAnimationFrame(frame); frame = 0; point = null; paint(0, 0); };
    element.addEventListener('pointermove', event => {
      if (paused || document.hidden || !finePointer.matches || event.pointerType !== 'mouse') return;
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!point || paused || document.hidden) return;
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return reset();
        paint(clamp((point.x - rect.left) / rect.width * 2 - 1, -1, 1), clamp((point.y - rect.top) / rect.height * 2 - 1, -1, 1));
      });
    }, { passive: true });
    element.addEventListener('pointerleave', reset); element.addEventListener('blur', reset, true);
    pointers.push({ reset });
  }
  const collage = document.querySelector('[data-pointer]');
  if (collage) bindPointer(collage, (x, y) => {
    collage.style.setProperty('--px', (x * .5).toFixed(3)); collage.style.setProperty('--py', (y * .5).toFixed(3));
  });
  scenes.forEach(scene => bindPointer(scene.querySelector('.scene-link'), (x, y) => {
    scene.style.setProperty('--pointer-x', `${(x * 10).toFixed(2)}px`); scene.style.setProperty('--pointer-y', `${(y * 10).toFixed(2)}px`);
  }));
  const wordmark = header.querySelector('.wordmark');
  bindPointer(wordmark, (x, y) => [...wordmark.children].forEach((letter, index) => {
    const strength = clamp(1 - Math.abs(x - (index / 5 * 2 - 1)));
    letter.style.setProperty('--letter-x', `${(-x * strength * 7).toFixed(2)}px`);
    letter.style.setProperty('--letter-y', `${(-y * strength * 10).toFixed(2)}px`);
  }));
  finePointer.addEventListener('change', () => pointers.forEach(pointer => pointer.reset()));

  function selectScene(index, force = false) {
    index = clamp(index, 0, scenes.length - 1);
    if (!force && currentScene === index) return;
    currentScene = index; collection.dataset.currentProject = scenes[index].dataset.project;
    stage.style.setProperty('--stage-bg', sceneColors[index].bg); stage.style.setProperty('--stage-ink', sceneColors[index].ink);
    scenes.forEach((scene, position) => {
      scene.dataset.state = position === index ? 'current' : position < index ? 'previous' : 'next';
      scene.inert = position !== index; scene.setAttribute('aria-hidden', String(position !== index));
      if (position !== index) { scene.style.setProperty('--pointer-x', '0px'); scene.style.setProperty('--pointer-y', '0px'); }
    });
    sceneButtons.forEach((button, position) => button.setAttribute('aria-pressed', String(position === index)));
  }
  function configureStage() {
    if (!collection) return;
    const enabled = desktop.matches;
    if (stageEnabled === enabled && currentScene >= 0) return;
    stageEnabled = enabled; collection.classList.toggle('stage-enabled', enabled);
    if (enabled) { currentScene = -1; updateStage(); }
    else { scenes.forEach(scene => { scene.inert = false; scene.removeAttribute('aria-hidden'); delete scene.dataset.state; }); currentScene = -1; }
  }
  function updateStage() {
    if (!stageEnabled) return;
    const rect = collection.getBoundingClientRect();
    collection.classList.toggle('stage-visible', rect.top < innerHeight * .88 && rect.bottom > 0);
    selectScene(Math.floor(-rect.top / innerHeight + .35));
  }
  sceneButtons.forEach(button => button.addEventListener('click', () => {
    const top = collection.getBoundingClientRect().top + scrollY + Number(button.dataset.sceneSelect) * innerHeight;
    scrollTo({ top, behavior: paused ? 'instant' : 'smooth' });
  }));
  desktop.addEventListener('change', () => { configureStage(); queueScroll(); });

  const activeFigures = new Set();
  const depthObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? activeFigures.add(entry.target) : activeFigures.delete(entry.target)); queueScroll();
  }, { rootMargin: '120px' });
  document.querySelectorAll('.case-story .project-figure').forEach(figure => depthObserver.observe(figure));
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const element = entry.target; revealObserver.unobserve(element);
    if (element.classList.contains('case-cover') || element.closest('.case-cover') || element.closest('.home-hero') || element.matches('.work-intro h1,.about-intro h1')) return;
    if (element.matches('h1,h2,h3')) move(element, [{ clipPath: 'inset(0 0 100% 0)', translate: '0 24px' }, { clipPath: 'inset(0 0 0% 0)', translate: '0 0' }], { duration: 850 });
    else if (element.classList.contains('project-figure')) move(element, [{ opacity: .3, clipPath: 'inset(5% 0 12% 0)', translate: '0 25px' }, { opacity: 1, clipPath: 'inset(0% 0 0% 0)', translate: '0 0' }], { duration: 900 });
    else move(element, [{ opacity: .4, translate: '0 16px' }, { opacity: 1, translate: '0 0' }], { duration: 750 });
  }), { rootMargin: '0px 0px 100px', threshold: .02 });
  document.querySelectorAll('[data-reveal],.section-heading h2,.case-chapter>.eyebrow').forEach(element => revealObserver.observe(element));
  const sealObserver = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('is-offscreen', !entry.isIntersecting)));
  document.querySelectorAll('.seal').forEach(seal => sealObserver.observe(seal));

  function updateScroll() {
    scrollFrame = 0; updateStage();
    const distance = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${distance > 0 ? clamp(scrollY / distance) : 0})`;
    const delta = scrollY - lastY, nextDirection = Math.sign(delta);
    if (nextDirection && direction !== nextDirection) { direction = nextDirection; travel = 0; }
    travel += Math.abs(delta);
    if (scrollY < 150 || header.contains(document.activeElement)) header.classList.remove('is-hidden');
    else if (travel > (direction > 0 ? 30 : 9)) header.classList.toggle('is-hidden', direction > 0);
    lastY = scrollY;
    let colors = baseColors;
    if (stageEnabled) { const rect = collection.getBoundingClientRect(); if (rect.top < 70 && rect.bottom > innerHeight) colors = sceneColors[currentScene]; }
    const blueSection = document.querySelector('.focus-section'), footer = document.querySelector('.site-footer');
    if ((blueSection && blueSection.getBoundingClientRect().top < 70 && blueSection.getBoundingClientRect().bottom > 70) || footer.getBoundingClientRect().top < 70) colors = { bg: '#243d66', ink: '#f7f6f2' };
    header.style.setProperty('--nav-bg', colors.bg); header.style.setProperty('--nav-ink', colors.ink);
    if (!paused && !document.hidden && innerWidth > 760) {
      const readings = [...activeFigures].map(figure => {
        const rect = figure.getBoundingClientRect(), normalized = clamp((innerHeight - rect.top) / (innerHeight + rect.height));
        return [figure, (normalized - .5) * Math.min(32, rect.height * .024)];
      });
      readings.forEach(([figure, y]) => figure.style.setProperty('--depth-y', `${y.toFixed(2)}px`));
    }
  }
  function queueScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }
  addEventListener('scroll', () => { if (scrollY > 40) finishEntry(); queueScroll(); }, { passive: true });
  addEventListener('resize', () => { finishEntry(); cancelDeparture(); pointers.forEach(pointer => pointer.reset()); configureStage(); queueScroll(); });
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  document.fonts.ready.then(queueScroll);

  function startEntry() {
    if (paused || document.hidden) return;
    const backward = performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
    if (body.dataset.page !== 'home') {
      if (!root.classList.contains('incoming-case') && !backward) move(document.querySelector('.case-title,.work-intro h1,.about-intro h1'), [{ clipPath: 'inset(0 0 100% 0)', translate: '0 22px' }, { clipPath: 'inset(0 0 0 0)', translate: '0 0' }], { duration: 850 });
      return;
    }
    const cold = !read('torres-visited') && scrollY < 40 && !location.hash;
    write('torres-visited', true);
    if (backward || scrollY > 40 || location.hash) return;
    const local = []; let entryTimer = 0;
    const curtain = document.querySelector('.identity-curtain');
    finishEntry = () => { clearTimeout(entryTimer); local.forEach(animation => animation?.cancel()); root.classList.remove('entry-active'); finishEntry = () => {}; };
    const enter = (element, frames, options) => local.push(move(element, frames, options));
    if (cold) {
      root.classList.add('entry-active');
      const backdrop = document.createElement('div'); backdrop.className = 'curtain-backdrop'; curtain.prepend(backdrop);
      const ghost = curtain.querySelector('.curtain-word'); ghost.classList.add('wordmark');
      const rect = wordmark.getBoundingClientRect(); ghost.style.width = `${rect.width}px`;
      const scale = innerWidth > 760 ? 4.25 : 2.8, x = (innerWidth - rect.width * scale) / 2, y = (innerHeight - rect.height * scale) / 2;
      enter(ghost, [{ transform: `translate(${x}px,${y}px) scale(${scale})`, offset: 0 }, { transform: `translate(${x}px,${y}px) scale(${scale})`, offset: .55 }, { transform: `translate(${rect.left}px,${rect.top}px) scale(1)`, offset: 1 }], { duration: 1900, fill: 'both' });
      [...ghost.children].forEach((letter, index) => {
        const still = getComputedStyle(letter).transform, scatter = [-110, 75, -65, 105, -95, 55][index];
        enter(letter, [{ opacity: 0, filter: 'blur(3px)', transform: `translate(${(index - 2.5) * 8}px,${scatter}px)` }, { opacity: 1, filter: 'blur(0)', transform: still }], { duration: 1100 - index * 70, delay: 50 + index * 70 });
      });
      enter(backdrop, [{ clipPath: 'inset(0 0 0% 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 1050, delay: 1150, fill: 'both' });
      enter(curtain.querySelector('.curtain-note'), [{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: 1050, fill: 'both' });
      entryTimer = setTimeout(() => root.classList.remove('entry-active'), 2050);
    }
    const delay = cold ? 1500 : 0;
    enter(document.querySelector('.hero-label'), [{ opacity: 0, translate: '0 20px' }, { opacity: 1, translate: '0 0' }], { duration: 400, delay });
    document.querySelectorAll('.hero-line').forEach((line, index) => enter(line, [{ opacity: 0, translate: '0 12px', clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, translate: '0 0', clipPath: 'inset(0 0 0% 0)' }], { duration: 650, delay: delay + 100 + index * 140 }));
    document.querySelectorAll('.hero-window').forEach((image, index) => enter(image, [{ opacity: 0, translate: `0 ${50 + index * 20}px` }, { opacity: 1, translate: '0 0' }], { duration: 800, delay: delay + 400 + index * 100 }));
    enter(document.querySelector('.hero-intro'), [{ opacity: 0, translate: '0 8px' }, { opacity: 1, translate: '0 0' }], { duration: 650, delay: delay + 650 });
    document.querySelectorAll('.hero-side,.hero-bottom,.hero-seal').forEach(element => enter(element, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: delay + 600 }));
  }

  const projectLinks = [...document.querySelectorAll('a[href^="/projects/"]')];
  projectLinks.forEach((link, index) => { link.dataset.originId = `project-link-${index}`; });
  const ordinaryClick = event => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  const footer = document.querySelector('.site-footer');
  const revealContact = behavior => scrollTo({ top: root.scrollHeight - innerHeight, behavior });
  document.querySelectorAll('a[href="#contact"]').forEach(link => link.addEventListener('click', event => {
    if (!ordinaryClick(event)) return;
    event.preventDefault(); finishEntry(); cancelDeparture();
    if (location.hash !== '#contact') history.pushState({ ...history.state }, '', '#contact');
    revealContact(paused ? 'instant' : 'smooth');
  }));
  footer.addEventListener('focusin', () => {
    if (document.querySelector('main').getBoundingClientRect().bottom > footer.getBoundingClientRect().top + 1) revealContact('instant');
  });
  const validOrigin = origin => origin && ['/','/work/','/about/'].includes(origin.path) && Number.isFinite(origin.scroll) && typeof origin.id === 'string';
  projectLinks.forEach(link => link.addEventListener('click', event => {
    if (!ordinaryClick(event) || link.target === '_blank' || link.hasAttribute('download')) return;
    finishEntry(); cancelDeparture();
    const target = new URL(link.href), slug = target.pathname.split('/')[2];
    const origin = { path: location.pathname, scroll: scrollY, id: link.dataset.originId, slug, stage: Boolean(link.closest('.project-scene')), width: innerWidth, height: innerHeight, at: Date.now() };
    if (validOrigin(origin)) { write(`torres-origin-${slug}`, origin); history.replaceState({ ...history.state, torresOrigin: origin }, ''); }
    const media = link.querySelector('[data-shared-media]'), title = link.querySelector('[data-shared-title]');
    const rect = media?.getBoundingClientRect();
    const supported = 'onpageswap' in window && CSS.supports('view-transition-name', 'project-media');
    if (paused || !supported || !rect?.width || rect.bottom <= 0 || rect.top >= innerHeight) return;
    const image = media.matches('img') ? media : media.querySelector('img');
    if (image && (!image.complete || !image.naturalWidth)) return;
    media.style.viewTransitionName = 'project-media';
    if (title) title.style.viewTransitionName = 'project-title';
    write('torres-handoff', { to: target.pathname, at: Date.now() });
    const scene = link.closest('.project-scene');
    if (scene) {
      event.preventDefault(); scene.classList.add('case-departing');
      departure = { href: target.href, media, title, scene, timer: setTimeout(() => cancelDeparture(true), 220) };
    }
  }));
  const back = document.querySelector('[data-case-back]');
  if (back) {
    const origin = read(`torres-origin-${body.dataset.project}`);
    if (validOrigin(origin)) {
      back.href = origin.path + (origin.stage ? `#work-${origin.slug}` : ''); back.textContent = '← Back to selected work';
      back.addEventListener('click', event => { if (ordinaryClick(event)) write('torres-restore', origin); });
    }
  }
  function originScroll(origin) {
    if (origin.width !== innerWidth || origin.height !== innerHeight) {
      if (origin.stage) {
        const index = scenes.findIndex(scene => scene.dataset.project === origin.slug);
        if (index >= 0) return stageEnabled ? collection.getBoundingClientRect().top + scrollY + index * innerHeight : scenes[index].getBoundingClientRect().top + scrollY - 90;
      }
      const link = document.querySelector(`[data-origin-id="${CSS.escape(origin.id)}"]`);
      if (link) return Math.max(0, link.getBoundingClientRect().top + scrollY - Math.min(140, innerHeight * .2));
    }
    return origin.scroll;
  }
  function restoreOrigin() {
    const explicit = read('torres-restore'), historyOrigin = history.state?.torresOrigin;
    const backward = performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
    const origin = explicit || (backward ? historyOrigin : null);
    if (!validOrigin(origin) || origin.path !== location.pathname) return;
    remove('torres-restore'); const revision = ++restoreRevision;
    document.fonts.ready.then(() => requestAnimationFrame(() => {
      if (revision !== restoreRevision) return;
      if (explicit || origin.width !== innerWidth || origin.height !== innerHeight) {
        scrollTo({ top: originScroll(origin), behavior: 'instant' });
      }
      updateStage(); document.querySelector(`[data-origin-id="${CSS.escape(origin.id)}"]`)?.focus({ preventScroll: true }); queueScroll();
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('restoring-work')));
    }));
  }
  addEventListener('pagereveal', event => {
    if (event.viewTransition) root.classList.add('transition-active');
    if (paused) event.viewTransition?.skipTransition();
    event.viewTransition?.finished.finally(() => root.classList.remove('incoming-case','transition-active'));
  });
  if (root.classList.contains('incoming-case')) {
    remove('torres-handoff');
    const title = document.querySelector('.case-title');
    if (title && scrollY < 100 && [body, root].includes(document.activeElement)) { title.tabIndex = -1; title.focus({ preventScroll: true }); }
    setTimeout(() => root.classList.remove('incoming-case'), paused ? 0 : 1500);
  }

  const dialog = document.querySelector('.lightbox'), fullImage = dialog.querySelector('.lightbox-image');
  let opener;
  document.querySelectorAll('[data-lightbox]').forEach(link => link.addEventListener('click', event => {
    if (!ordinaryClick(event) || !dialog.showModal) return;
    event.preventDefault(); opener = link; fullImage.src = link.dataset.lightbox; fullImage.alt = link.dataset.caption || 'Project interface';
    dialog.querySelector('figcaption').textContent = fullImage.alt; dialog.showModal(); root.classList.add('lightbox-open'); dialog.querySelector('button').focus();
    move(dialog, [{ opacity: 0, translate: '0 20px', scale: .985 }, { opacity: 1, translate: '0 0', scale: 1 }], { duration: 450 });
  }));
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { root.classList.remove('lightbox-open'); opener?.focus({ preventScroll: true }); });
  const slider = document.querySelector('#compare-range');
  if (slider) {
    const comparison = document.querySelector('.comparison'); let dragging = false;
    const updateSplit = () => {
      comparison.style.setProperty('--split', `${slider.value}%`); document.querySelector('output[for="compare-range"]').textContent = `${slider.value}% earlier`;
    };
    const moveDivider = event => {
      const rect = comparison.getBoundingClientRect(); slider.value = String(Math.round(clamp((event.clientX - rect.left) / rect.width) * 100)); updateSplit();
    };
    slider.addEventListener('input', updateSplit);
    comparison.addEventListener('pointerdown', event => { if (event.button === 0) { dragging = true; comparison.setPointerCapture(event.pointerId); moveDivider(event); } });
    comparison.addEventListener('pointermove', event => { if (dragging) moveDivider(event); });
    ['pointerup','pointercancel','lostpointercapture'].forEach(name => comparison.addEventListener(name, () => { dragging = false; }));
  }
  copyButton?.addEventListener('click', async () => {
    clearTimeout(feedbackTimer);
    const revision = ++feedbackRevision;
    let permissionTimeout;
    copyButton.disabled = true;
    copyButton.textContent = 'Copying…';
    status.textContent = 'Copying email address…';
    try {
      await Promise.race([
        navigator.clipboard.writeText(copyButton.dataset.email),
        new Promise((_, reject) => { permissionTimeout = setTimeout(() => reject(new Error('Clipboard permission did not resolve')), 2200); }),
      ]);
      if (revision !== feedbackRevision || document.hidden) return;
      copyButton.innerHTML = 'Email copied <span aria-hidden="true">✓</span>'; status.textContent = 'Email address copied to clipboard.';
      move(copyButton, [{ translate: '0 0' }, { translate: '0 -3px' }, { translate: '0 0' }], { duration: 240 });
      clearTimeout(feedbackTimer);
      feedbackTimer = setTimeout(resetFeedback, 2800);
    } catch { if (revision === feedbackRevision && !document.hidden) { copyButton.textContent = 'Use the email link'; status.textContent = 'Copy is unavailable. Select the email address to open your email app.'; } }
    finally { clearTimeout(permissionTimeout); if (revision === feedbackRevision) copyButton.disabled = false; }
  });
  document.addEventListener('pointerdown', () => finishEntry(), { capture: true });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { finishEntry(); cancelDeparture(); }
    if (['Tab','PageDown','ArrowDown',' '].includes(event.key)) finishEntry();
  });
  document.addEventListener('click', event => { if (departure && !event.target.closest('[data-project-link]')) cancelDeparture(); }, true);
  addEventListener('visibilitychange', () => {
    root.classList.toggle('page-hidden', document.hidden);
    if (document.hidden) { finishEntry(); cancelAnimations(); pointers.forEach(pointer => pointer.reset()); resetFeedback(); cancelAnimationFrame(scrollFrame); scrollFrame = 0; cancelDeparture(true); }
    else queueScroll();
  });
  addEventListener('pagehide', () => {
    finishEntry(); cancelAnimations(); cancelDeparture(); pointers.forEach(pointer => pointer.reset()); resetFeedback(); cancelAnimationFrame(scrollFrame); scrollFrame = 0; restoreRevision++;
  });
  addEventListener('pageshow', event => {
    root.classList.remove('page-hidden');
    if (event.persisted) {
      cancelDeparture();
      root.classList.remove('entry-active');
      document.querySelectorAll('.case-departing').forEach(element => element.classList.remove('case-departing'));
      document.querySelectorAll('[style*="view-transition-name"]').forEach(element => element.style.removeProperty('view-transition-name'));
      try { userPaused = localStorage.getItem('torres-motion') === 'paused'; } catch {}
      configureStage();
      applyMotion();
      const origin = history.state?.torresOrigin;
      if (validOrigin(origin) && origin.path === location.pathname) requestAnimationFrame(() => {
        if (origin.width !== innerWidth || origin.height !== innerHeight) {
          root.classList.add('restoring-work'); scrollTo({ top: originScroll(origin), behavior: 'instant' });
        }
        updateStage(); document.querySelector(`[data-origin-id="${CSS.escape(origin.id)}"]`)?.focus({ preventScroll: true });
        requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('restoring-work')));
      });
    }
    queueScroll();
  });
  configureStage(); applyMotion(); restoreOrigin(); startEntry(); updateScroll();
  if (location.hash === '#contact') document.fonts.ready.then(() => requestAnimationFrame(() => revealContact('instant')));
})();
