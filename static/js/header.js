// header.js
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const header = document.querySelector('header');

  // Safe guards
  if (!header) return;

  // Toggle nav links on mobile when hamburger icon is clicked
  if (toggle && navLinks) {
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navLinks.style.display = isOpen ? 'flex' : 'none';
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Shrink and color header on scroll / depending on whether it's over the hero
    // Use rAF to throttle DOM reads and a 200ms debounce to apply only stable state changes.
    let needsUpdate = false;
    let rafScheduled = false;
    let applyTimer = null;
    let lastApplied = { scrolled: null, shrink: null, overHero: null };

    const ENTER_THRESHOLD = 16; // px to enter over-hero
    const LEAVE_THRESHOLD = 6;  // px to leave over-hero
    const DEBOUNCE_MS = 200;

    const computeDesired = () => {
      const hero = document.querySelector('.hero');
      const headerRect = header.getBoundingClientRect();
      let overHero = false;
      if (hero) {
        const heroBottom = hero.getBoundingClientRect().bottom;
        const delta = heroBottom - headerRect.bottom; // positive when hero extends below header
        const currentlyOver = header.classList.contains('over-hero');
        if (currentlyOver) overHero = delta > LEAVE_THRESHOLD; else overHero = delta > ENTER_THRESHOLD;
      }
      return {
        scrolled: (window.scrollY > 60) || !overHero,
        shrink: window.scrollY > 60,
        overHero: !!overHero
      };
    };

    const applyDesired = (desired) => {
      if (!desired) return;
      // apply scrolled
      if (desired.scrolled) header.classList.add('scrolled'); else header.classList.remove('scrolled');
      // apply shrink
      if (desired.shrink) header.classList.add('shrink'); else header.classList.remove('shrink');
      // apply over-hero
      if (desired.overHero) header.classList.add('over-hero'); else header.classList.remove('over-hero');
      lastApplied = desired;
    };

    const scheduleApply = (desired) => {
      if (applyTimer) clearTimeout(applyTimer);
      applyTimer = setTimeout(() => {
        applyDesired(desired);
        applyTimer = null;
      }, DEBOUNCE_MS);
    };

    const frame = () => {
      rafScheduled = false;
      if (!needsUpdate) return;
      needsUpdate = false;
      try {
        const desired = computeDesired();
        // if identical to lastApplied, clear any pending timer and ensure state is applied
        if (lastApplied && lastApplied.scrolled === desired.scrolled && lastApplied.shrink === desired.shrink && lastApplied.overHero === desired.overHero) {
          if (applyTimer) { clearTimeout(applyTimer); applyTimer = null; }
          // no change
        } else {
          // schedule applying the change after debounce to ensure stability
          scheduleApply(desired);
        }
      } catch (err) {
        header.classList.add('scrolled');
      }
    };

    const triggerUpdate = () => {
      needsUpdate = true;
      if (!rafScheduled) { rafScheduled = true; requestAnimationFrame(frame); }
    };

    // listen for scroll and resize events
    window.addEventListener('scroll', triggerUpdate, { passive: true });
    window.addEventListener('resize', triggerUpdate, { passive: true });

    // run once immediately
    triggerUpdate();

  window.addEventListener('scroll', onScroll, { passive: true });
  // run once on load to set correct state for short pages
  onScroll();

});