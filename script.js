(() => {
  'use strict';

  document.documentElement.classList.replace('no-js', 'js');
  document.documentElement.classList.remove('js-pending');

  const artists = Array.isArray(window.TEN_OF_TEN_ARTISTS) ? window.TEN_OF_TEN_ARTISTS : [];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const igUrl = (username) => `https://www.instagram.com/${username}/`;
  const cityOrder = ['Jakarta', 'Tangerang', 'Serang', 'Bandung', 'Medan'];

  const loader = $('#loader');
  const loaderPercent = $('#loaderPercent');
  const loaderLine = $('#loaderLine');
  const loaderStatus = $('#loaderStatus');
  const skipLink = $('.skip-link');
  const header = $('#header');
  const progressBar = $('.scroll-progress span');
  const menuButton = $('#menuButton');
  const mobileMenu = $('#mobileMenu');
  const hero = $('.hero');
  const heroStack = $('#heroStack');
  const collectiveRail = $('#collectiveRail');
  const artistGrid = $('#artistGrid');
  const artistResults = $('#artistResults');
  const cityList = $('#cityList');
  const cityStage = $('#cityStage');
  const activeCityTitle = $('#activeCityTitle');
  const activeCityCount = $('#activeCityCount');
  const activeCityArtists = $('#activeCityArtists');
  const activeCityGenres = $('#activeCityGenres');
  const cityStatus = $('#cityStatus');
  const bookingForm = $('#bookingForm');
  const bookingArtist = $('#bookingArtist');
  const eventType = $('#eventType');
  const eventCity = $('#eventCity');
  const eventDate = $('#eventDate');
  const eventNotes = $('#eventNotes');
  const copyBooking = $('#copyBooking');
  const formStatus = $('#formStatus');
  const toast = $('#toast');
  const pageMain = $('main');
  const pageFooter = $('.site-footer');

  const modal = $('#artistModal');
  const modalImage = $('#modalImage');
  const modalBg = $('#modalBg');
  const modalName = $('#modalName');
  const modalCity = $('#modalCity');
  const modalSince = $('#modalSince');
  const modalGenres = $('#modalGenres');
  const modalBio = $('#modalBio');
  const modalCount = $('#modalCount');
  const modalInstagram = $('#modalInstagram');
  const modalShare = $('#modalShare');
  const modalShareLabel = $('span', modalShare);
  const modalStatus = $('#modalStatus');

  const state = {
    city: cityOrder[0],
    filter: 'All',
    view: 'grid',
    modalIndex: 0,
  };

  let toastTimer = 0;
  let modalCloseTimer = 0;
  let modalFillToken = 0;
  let modalShareTimer = 0;
  let bookingCopyPending = false;
  let lastFocusedElement = null;

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // The view remains functional when storage is unavailable.
    }
  }

  function sessionHasLoaded() {
    try {
      return window.sessionStorage.getItem('tenoften-loaded') === '1';
    } catch {
      return false;
    }
  }

  function markSessionLoaded() {
    try {
      window.sessionStorage.setItem('tenoften-loaded', '1');
    } catch {
      // Session storage is an enhancement, not a requirement.
    }
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2800);
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // Permission policies can reject the modern API; try the local fallback below.
      }
    }

    const fallback = document.createElement('textarea');
    const previousFocus = document.activeElement;
    fallback.value = text;
    fallback.setAttribute('readonly', '');
    fallback.style.position = 'fixed';
    fallback.style.opacity = '0';
    (modal.open ? modal : document.body).appendChild(fallback);
    let copied = false;
    try {
      fallback.select();
      copied = document.execCommand('copy');
    } finally {
      fallback.remove();
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    }
    if (!copied) throw new Error('Copy was not available');
  }

  function renderHero() {
    const featured = [4, 2, 7, 6]
      .map((index) => artists[index])
      .filter(Boolean);

    featured.forEach((artist, index) => {
      const button = document.createElement('button');
      button.className = 'hero-card';
      button.type = 'button';
      button.dataset.artist = artist.id;
      button.setAttribute('aria-label', `Open ${artist.name} profile`);
      button.innerHTML = `
        <span class="hero-card-inner">
          <img src="${artist.image}" alt="" width="1600" height="2000" decoding="async" ${index === 0 ? 'fetchpriority="high"' : ''} />
          <span>${artist.display}</span>
        </span>`;
      button.addEventListener('click', () => openArtist(artists.indexOf(artist)));
      heroStack.appendChild(button);
    });
  }

  function renderCollectiveRail() {
    artists.forEach((artist) => {
      const item = document.createElement('div');
      item.className = 'collective-portrait';
      item.innerHTML = `<img src="${artist.image}" alt="" width="1600" height="2000" loading="lazy" decoding="async" />`;
      collectiveRail.appendChild(item);
    });
  }

  function createArtistCard(artist) {
    const card = document.createElement('article');
    const isLongName = artist.display.length > 9;
    card.className = 'artist-card reveal';
    card.dataset.city = artist.city;
    card.dataset.artist = artist.id;
    card.innerHTML = `
      <span class="artist-card-media">
        <img src="${artist.image}" alt="" width="1600" height="2000" loading="lazy" decoding="async" />
      </span>
      <span class="artist-card-info">
        <span class="artist-card-top"><span>${artist.order} / 10</span><span>OPEN PROFILE</span></span>
        <h3 class="artist-card-name${isLongName ? ' long-name' : ''}">${artist.display}</h3>
        <span class="artist-card-genres">${artist.genres.join(' · ')}</span>
        <span class="artist-card-bottom">
          <span>${artist.city}</span>
          <svg class="artist-card-arrow" viewBox="0 0 32 20" aria-hidden="true"><path d="M1 10h29M22 2l8 8-8 8" /></svg>
        </span>
      </span>
      <button class="artist-card-hit" type="button" aria-label="Open ${artist.name} profile, ${artist.city}"></button>`;
    $('.artist-card-hit', card).addEventListener('click', () => openArtist(artists.indexOf(artist)));
    return card;
  }

  function renderArtists() {
    artists.forEach((artist) => artistGrid.appendChild(createArtistCard(artist)));
  }

  function applyArtistFilter() {
    let visibleCount = 0;
    $$('.artist-card', artistGrid).forEach((card, index) => {
      const visible = state.filter === 'All' || card.dataset.city === state.filter;
      card.hidden = !visible;
      if (visible) {
        visibleCount += 1;
        if (!reducedMotion.matches && typeof card.animate === 'function') {
          card.animate(
            [
              { opacity: 0, transform: 'translateY(16px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 420, delay: Math.min(index, 5) * 45, easing: 'cubic-bezier(.2,.76,.2,1)' },
          );
        }
      }
    });

    $$('.filter-btn').forEach((button) => {
      const active = button.dataset.city === state.filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    artistResults.textContent = `${String(visibleCount).padStart(2, '0')} / ${String(artists.length).padStart(2, '0')} RESULTS`;
  }

  function applyArtistView(view, persist = true) {
    state.view = view === 'list' ? 'list' : 'grid';
    artistGrid.classList.toggle('list-mode', state.view === 'list');
    $$('.view-btn').forEach((button) => {
      const active = button.dataset.view === state.view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (persist) safeStorageSet('tenoften-roster-view', state.view);
  }

  function dominantGenres(cityArtists) {
    const frequency = new Map();
    cityArtists.forEach((artist) => {
      artist.genres.forEach((genre) => frequency.set(genre, (frequency.get(genre) || 0) + 1));
    });
    return [...frequency.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5)
      .map(([genre]) => genre.toUpperCase())
      .join(' · ');
  }

  function renderCity(city) {
    const cityArtists = artists.filter((artist) => artist.city === city);
    state.city = city;
    activeCityTitle.textContent = city.toUpperCase();
    activeCityCount.textContent = `${String(cityArtists.length).padStart(2, '0')} / ${String(artists.length).padStart(2, '0')}`;
    activeCityArtists.textContent = `${String(cityArtists.length).padStart(2, '0')} ARTIST${cityArtists.length === 1 ? '' : 'S'}`;
    activeCityGenres.textContent = dominantGenres(cityArtists);
    cityStatus.textContent = `${city}, ${cityArtists.length} artist${cityArtists.length === 1 ? '' : 's'}`;

    $$('.city-button', cityList).forEach((button) => {
      const active = button.dataset.city === city;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    cityStage.dataset.count = String(cityArtists.length);
    cityStage.innerHTML = cityArtists.map((artist, index) => `
      <button class="city-artist" type="button" data-open="${artist.id}" aria-label="Open ${artist.name} profile">
        <span class="city-artist-media"><img src="${artist.image}" alt="" width="1600" height="2000" loading="lazy" decoding="async" /></span>
        <span class="city-artist-copy"><small>${String(index + 1).padStart(2, '0')}</small><strong>${artist.display}</strong></span>
      </button>`).join('');

    $$('[data-open]', cityStage).forEach((button) => {
      button.addEventListener('click', () => {
        const index = artists.findIndex((artist) => artist.id === button.dataset.open);
        if (index >= 0) openArtist(index);
      });
    });
  }

  function renderCityNavigation() {
    cityOrder.forEach((city) => {
      const count = artists.filter((artist) => artist.city === city).length;
      const button = document.createElement('button');
      button.className = 'city-button';
      button.type = 'button';
      button.dataset.city = city;
      button.setAttribute('aria-pressed', 'false');
      button.innerHTML = `<strong>${city}</strong><span>${String(count).padStart(2, '0')} ARTIST${count === 1 ? '' : 'S'}</span>`;
      button.addEventListener('click', () => renderCity(city));
      cityList.appendChild(button);
    });
    renderCity(state.city);
  }

  function populateBookingArtists() {
    artists.forEach((artist) => {
      const option = document.createElement('option');
      option.value = artist.name;
      option.textContent = artist.name;
      bookingArtist.appendChild(option);
    });
  }

  function initLoader() {
    const setBackgroundInert = (value) => {
      [skipLink, header, pageMain, pageFooter].forEach((element) => {
        if (element) element.inert = value;
      });
    };

    if (!loader) {
      setBackgroundInert(false);
      return;
    }

    setBackgroundInert(true);
    if (reducedMotion.matches || sessionHasLoaded()) {
      loader.classList.add('skip');
      loader.remove();
      setBackgroundInert(false);
      return;
    }

    const heroImages = $$('img', heroStack);
    const total = Math.max(heroImages.length + 1, 1);
    let complete = 0;
    let finished = false;

    const report = () => {
      if (finished) return;
      const progress = Math.min(94, Math.round((complete / total) * 100));
      loaderPercent.textContent = String(progress).padStart(2, '0');
      loaderLine.style.width = `${progress}%`;
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      loaderStatus.textContent = 'COLLECTIVE READY';
      loaderPercent.textContent = '100';
      loaderLine.style.width = '100%';
      markSessionLoaded();
      window.setTimeout(() => {
        loader.classList.add('done');
        window.setTimeout(() => {
          loader.remove();
          setBackgroundInert(false);
        }, 950);
      }, 180);
    };

    const imagePromises = heroImages.map((image) => new Promise((resolve) => {
      if (image.complete) {
        complete += 1;
        report();
        resolve();
        return;
      }
      const settled = () => {
        complete += 1;
        report();
        resolve();
      };
      image.addEventListener('load', settled, { once: true });
      image.addEventListener('error', settled, { once: true });
    }));

    const pageReady = new Promise((resolve) => {
      if (document.readyState === 'complete') {
        complete += 1;
        report();
        resolve();
        return;
      }
      window.addEventListener('load', () => {
        complete += 1;
        report();
        resolve();
      }, { once: true });
    });

    Promise.allSettled([...imagePromises, pageReady]).then(finish);
    window.setTimeout(finish, 2600);
  }

  function initReveals() {
    const targets = $$('.reveal');
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

    targets.forEach((target) => observer.observe(target));
  }

  function initScrollEffects() {
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      header.classList.toggle('scrolled', window.scrollY > 24);
      progressBar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();

    if (!('IntersectionObserver' in window)) return;
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        $$('.desktop-nav a, .mobile-menu nav a').forEach((link) => {
          const current = link.getAttribute('href') === `#${entry.target.id}`;
          if (current) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    ['collective', 'artists', 'cities', 'booking'].forEach((id) => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  function setMenuOpen(open, restoreFocus = true) {
    $$('.brand, .desktop-nav, .header-cta', header).forEach((element) => {
      element.inert = open;
    });
    menuButton.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenu.inert = !open;
    pageMain.inert = open;
    pageFooter.inert = open;
    document.body.classList.toggle('menu-open', open);

    if (open) {
      window.requestAnimationFrame(() => $('a', mobileMenu)?.focus());
    } else if (restoreFocus) {
      menuButton.focus();
    }
  }

  function focusHashTarget(hash) {
    if (!hash?.startsWith('#')) return;
    const section = $(hash);
    if (!section) return;
    const target = $('h1, h2', section) || section;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }

  function initMenu() {
    menuButton.addEventListener('click', () => setMenuOpen(!mobileMenu.classList.contains('open')));
    $$('a', mobileMenu).forEach((link) => link.addEventListener('click', () => {
      const hash = link.hash;
      setMenuOpen(false, !hash);
      if (hash) window.setTimeout(() => focusHashTarget(hash), reducedMotion.matches ? 0 : 760);
    }));

    document.addEventListener('keydown', (event) => {
      if (!mobileMenu.classList.contains('open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [menuButton, ...$$('a', mobileMenu)].filter((item) => !item.hidden);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.matchMedia('(min-width: 1121px)').addEventListener('change', (event) => {
      if (event.matches && mobileMenu.classList.contains('open')) {
        setMenuOpen(false, false);
        window.requestAnimationFrame(() => $('.brand', header).focus());
      }
    });
  }

  function initPointerEffects() {
    if (!finePointer.matches || reducedMotion.matches) return;
    const dot = $('.cursor-dot');
    const ring = $('.cursor-ring');
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let cursorFrame = 0;

    document.body.classList.add('has-custom-cursor');

    const animateCursor = () => {
      ringX += (mouseX - ringX) * 0.17;
      ringY += (mouseY - ringY) * 0.17;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      if (!document.hidden) cursorFrame = window.requestAnimationFrame(animateCursor);
      else cursorFrame = 0;
    };

    document.addEventListener('pointermove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

      const magnetic = event.target.closest('.magnetic');
      if (magnetic) {
        const rect = magnetic.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.14;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.14;
        magnetic.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    }, { passive: true });

    document.addEventListener('pointerover', (event) => {
      const interactive = event.target.closest('a, button, input, select, textarea');
      ring.classList.toggle('active', Boolean(interactive));
      ring.classList.toggle('profile', Boolean(event.target.closest('.artist-card, .city-artist, .hero-card')));
    });

    document.addEventListener('pointerout', (event) => {
      const magnetic = event.target.closest('.magnetic');
      if (magnetic && !magnetic.contains(event.relatedTarget)) magnetic.style.transform = '';
      if (!event.relatedTarget) {
        ring.classList.remove('active', 'profile');
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !cursorFrame) cursorFrame = window.requestAnimationFrame(animateCursor);
    });

    cursorFrame = window.requestAnimationFrame(animateCursor);
  }

  function initHeroParallax() {
    if (!finePointer.matches || reducedMotion.matches) return;
    let parallaxFrame = 0;
    let pendingEvent = null;

    const update = () => {
      const rect = hero.getBoundingClientRect();
      const x = ((pendingEvent.clientX - rect.left) / rect.width - 0.5) * 18;
      const y = ((pendingEvent.clientY - rect.top) / rect.height - 0.5) * 16;
      $$('.hero-card', heroStack).forEach((card, index) => {
        const depth = 0.22 + index * 0.11;
        card.style.setProperty('--mx', `${x * depth}px`);
        card.style.setProperty('--my', `${y * depth}px`);
      });
      parallaxFrame = 0;
    };

    hero.addEventListener('pointermove', (event) => {
      pendingEvent = event;
      if (!parallaxFrame) parallaxFrame = window.requestAnimationFrame(update);
    }, { passive: true });

    hero.addEventListener('pointerleave', () => {
      $$('.hero-card', heroStack).forEach((card) => {
        card.style.setProperty('--mx', '0px');
        card.style.setProperty('--my', '0px');
      });
    });
  }

  function applyModalArtist(index, animate = true) {
    if (!artists.length) return;
    state.modalIndex = (index + artists.length) % artists.length;
    const artist = artists[state.modalIndex];
    const token = ++modalFillToken;
    window.clearTimeout(modalShareTimer);
    modalShareLabel.textContent = 'COPY PROFILE LINK';
    const animateImage = animate && !reducedMotion.matches && modal.open;
    if (animateImage) {
      modalImage.classList.add('changing');
    }

    modalImage.src = artist.image;
    modalImage.alt = `${artist.name}, Ten of Ten DJ from ${artist.city}`;
    modalBg.style.backgroundImage = `url('${artist.blur}')`;
    modalName.textContent = artist.display;
    modalCity.textContent = artist.city;
    modalSince.textContent = artist.since && artist.since !== '—' ? `ACTIVE SINCE ${artist.since}` : `@${artist.username}`;
    modalGenres.innerHTML = artist.genres.map((genre) => `<span>${genre}</span>`).join('');
    modalBio.innerHTML = artist.bio.map((paragraph) => `<p>${paragraph}</p>`).join('');
    modalCount.textContent = `${artist.order} / ${String(artists.length).padStart(2, '0')}`;
    modalInstagram.href = igUrl(artist.username);
    modalStatus.textContent = `Showing ${artist.name}, artist ${Number(artist.order)} of ${artists.length}`;

    if (animateImage) {
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        if (token === modalFillToken) modalImage.classList.remove('changing');
      }));
    } else {
      modalImage.classList.remove('changing');
    }
  }

  function artistHash(index = state.modalIndex) {
    return `#artist-${artists[index].id}`;
  }

  function setArtistHistory(mode) {
    const hash = artistHash();
    const ownsEntry = mode === 'push' || history.state?.tenOfTenModal === true;
    const nextState = { ...(history.state || {}), tenOfTenModal: ownsEntry };
    if (mode === 'push' && location.hash !== hash) history.pushState(nextState, '', hash);
    if (mode === 'replace') history.replaceState(nextState, '', hash);
  }

  function openArtist(index, options = {}) {
    if (index < 0 || index >= artists.length) return;
    const historyMode = options.historyMode ?? (modal.open ? 'replace' : 'push');
    window.clearTimeout(modalCloseTimer);
    if (mobileMenu.classList.contains('open')) setMenuOpen(false, false);
    if (!modal.open) lastFocusedElement = document.activeElement;
    applyModalArtist(index, modal.open);
    if (historyMode !== 'none') setArtistHistory(historyMode);

    if (!modal.open) {
      modal.showModal();
      document.body.classList.add('modal-open');
      window.requestAnimationFrame(() => {
        modal.classList.add('show');
        $('#modalClose').focus();
      });
    } else if (!modal.classList.contains('show')) {
      document.body.classList.add('modal-open');
      window.requestAnimationFrame(() => modal.classList.add('show'));
    }
  }

  function closeArtistVisual(restoreFocus = true) {
    if (!modal.open) return;
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    window.clearTimeout(modalCloseTimer);
    modalCloseTimer = window.setTimeout(() => {
      if (modal.open && !modal.classList.contains('show')) modal.close();
      if (restoreFocus) {
        const canRestore = lastFocusedElement?.isConnected
          && lastFocusedElement !== document.body
          && lastFocusedElement !== document.documentElement;
        if (canRestore) lastFocusedElement.focus();
        else focusHashTarget('#artists');
      }
    }, reducedMotion.matches ? 0 : 430);
  }

  function requestCloseArtist() {
    if (history.state?.tenOfTenModal) {
      history.back();
    } else {
      history.replaceState(null, '', '#artists');
      closeArtistVisual();
    }
  }

  function syncModalFromLocation() {
    const match = location.hash.match(/^#artist-(.+)$/);
    if (!match) {
      closeArtistVisual();
      return;
    }
    const index = artists.findIndex((artist) => artist.id === match[1]);
    if (index >= 0) {
      openArtist(index, { historyMode: 'none' });
    } else {
      history.replaceState(null, '', '#artists');
      closeArtistVisual();
    }
  }

  function initModal() {
    $('#modalClose').addEventListener('click', requestCloseArtist);
    $('#modalPrev').addEventListener('click', () => {
      applyModalArtist(state.modalIndex - 1);
      setArtistHistory('replace');
    });
    $('#modalNext').addEventListener('click', () => {
      applyModalArtist(state.modalIndex + 1);
      setArtistHistory('replace');
    });

    modal.addEventListener('cancel', (event) => {
      event.preventDefault();
      requestCloseArtist();
    });
    modal.addEventListener('click', (event) => {
      if (event.target === modal) requestCloseArtist();
    });

    document.addEventListener('keydown', (event) => {
      if (!modal.open) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        applyModalArtist(state.modalIndex - 1);
        setArtistHistory('replace');
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        applyModalArtist(state.modalIndex + 1);
        setArtistHistory('replace');
      }
    });

    $('#modalBook').addEventListener('click', () => {
      const artist = artists[state.modalIndex];
      bookingArtist.value = artist.name;
      updateBookingPreview();
      history.replaceState(null, '', '#booking');
      closeArtistVisual(false);
      window.setTimeout(() => {
        const previousScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        bookingArtist.scrollIntoView({ behavior: 'auto', block: 'center' });
        bookingArtist.focus({ preventScroll: true });
        window.requestAnimationFrame(() => {
          document.documentElement.style.scrollBehavior = previousScrollBehavior;
        });
      }, reducedMotion.matches ? 0 : 460);
    });

    modalShare.addEventListener('click', async () => {
      const profileUrl = `${location.origin}${location.pathname}${artistHash()}`;
      try {
        await copyText(profileUrl);
        modalShareLabel.textContent = 'PROFILE LINK COPIED';
        modalStatus.textContent = `${artists[state.modalIndex].name} profile link copied.`;
      } catch {
        modalShareLabel.textContent = 'COPY UNAVAILABLE';
        modalStatus.textContent = 'Copy is unavailable. Use the address in your browser.';
      }
      window.clearTimeout(modalShareTimer);
      modalShareTimer = window.setTimeout(() => {
        modalShareLabel.textContent = 'COPY PROFILE LINK';
      }, 1800);
    });

    window.addEventListener('popstate', syncModalFromLocation);
    window.addEventListener('hashchange', syncModalFromLocation);
  }

  function formatDate(value) {
    if (!value) return 'Select a date';
    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  function bookingValues() {
    return {
      artist: bookingArtist.value,
      type: eventType.value,
      city: eventCity.value.trim(),
      date: eventDate.value,
      notes: eventNotes.value.trim(),
    };
  }

  function buildBookingBrief() {
    const values = bookingValues();
    return `Hello Ten of Ten, I would like to ask about booking.\n\nArtist / package: ${values.artist}\nEvent type: ${values.type}\nCity / venue: ${values.city || 'To be confirmed'}\nDate: ${values.date ? formatDate(values.date) : 'To be confirmed'}\nNotes: ${values.notes || 'No additional notes yet.'}`;
  }

  function updateBookingPreview() {
    const values = bookingValues();
    $('#previewArtist').textContent = values.artist;
    $('#previewType').textContent = values.type;
    $('#previewCity').textContent = values.city || eventCity.placeholder;
    $('#previewDate').textContent = formatDate(values.date);
    $('#previewNotes').textContent = values.notes || eventNotes.placeholder;
    const packageLabel = values.artist === 'Full Ten of Ten roster' ? 'the complete Ten of Ten roster' : values.artist;
    $('#previewMessage').textContent = `A ${values.type.toLowerCase()} booking brief for ${packageLabel}, prepared locally and ready to share.`;
  }

  function initBooking() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    eventDate.min = now.toISOString().slice(0, 10);

    ['input', 'change'].forEach((eventName) => bookingForm.addEventListener(eventName, updateBookingPreview));
    updateBookingPreview();

    bookingForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (bookingCopyPending) return;
      bookingCopyPending = true;
      const originalLabel = $('span', copyBooking).textContent;
      copyBooking.setAttribute('aria-disabled', 'true');
      copyBooking.setAttribute('aria-busy', 'true');
      try {
        await copyText(buildBookingBrief());
        $('span', copyBooking).textContent = 'BRIEF COPIED';
        formStatus.textContent = 'Booking brief copied. Open Instagram when you are ready to paste it into a DM.';
        showToast('Booking brief copied to clipboard.');
      } catch {
        $('span', copyBooking).textContent = 'COPY UNAVAILABLE';
        formStatus.textContent = 'Copy is unavailable in this browser. Keep this page open and use the preview as your DM reference.';
        showToast('Copy is unavailable. Use the preview as your booking reference.');
      }
      window.setTimeout(() => {
        bookingCopyPending = false;
        copyBooking.removeAttribute('aria-disabled');
        copyBooking.removeAttribute('aria-busy');
        $('span', copyBooking).textContent = originalLabel;
      }, 1800);
    });
  }

  function initControls() {
    $$('.filter-btn').forEach((button) => {
      button.addEventListener('click', () => {
        state.filter = button.dataset.city;
        applyArtistFilter();
      });
    });

    $$('.view-btn').forEach((button) => {
      button.addEventListener('click', () => applyArtistView(button.dataset.view));
    });

    $('#cityPrev').addEventListener('click', () => {
      const index = cityOrder.indexOf(state.city);
      renderCity(cityOrder[(index - 1 + cityOrder.length) % cityOrder.length]);
    });
    $('#cityNext').addEventListener('click', () => {
      const index = cityOrder.indexOf(state.city);
      renderCity(cityOrder[(index + 1) % cityOrder.length]);
    });
  }

  renderHero();
  renderCollectiveRail();
  renderArtists();
  renderCityNavigation();
  populateBookingArtists();

  const storedView = safeStorageGet('tenoften-roster-view');
  applyArtistView(storedView === 'list' ? 'list' : 'grid', false);
  applyArtistFilter();

  initControls();
  initLoader();
  initReveals();
  initScrollEffects();
  initMenu();
  initPointerEffects();
  initHeroParallax();
  initModal();
  initBooking();

  window.setTimeout(syncModalFromLocation, 60);
})();
