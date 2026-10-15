/**
 * HENITEN CONSTRUCTION PLC - MAIN APPLICATION JAVASCRIPT
 * Live Three.js 3D Construction Digital Twin, Project Filter,
 * Interactive Quotation Calculator, Modal Systems, and Responsive Navigation.
 */

(function() {
  'use strict';

  // State Management
  const state = {
    threeRenderer: null,
    threeScene: null,
    threeCamera: null,
    is3DRunning: true,
    viewMode: 'blueprint', // 'blueprint' or 'daylight'
    currency: 'ETB',
    calc: {
      type: 'fuel-station',
      area: 2400,
      turnkey: true,
      structural: true,
      mep: true,
      canopy: true,
      engineering: true
    }
  };

  // Projects Data Repository
  const projectsData = {
    'aviation-depot': {
      title: 'Jet A-1 Aviation Fuel Depot & Terminal',
      category: 'aviation',
      categoryName: 'Aviation & Specialized Facilities',
      location: 'Bole International Airport Logistics Corridor, Addis Ababa',
      client: 'National Aviation Fuel Authority & Logistics',
      year: '2022 - 2024',
      image: 'assets/images/jet-aviation-depot.webp',
      scope: 'Bulk fuel storage, pump skids, aviation fuel hydrant infrastructure, tarmac concrete paving, high-security blast-proof control station.',
      specs: [
        { label: 'Bulk Capacity', value: '4.8 Million Liters' },
        { label: 'Pavement Area', value: '18,500 m² Heavy Apron' },
        { label: 'Safety Record', value: 'Zero LTI (320,000 Hours)' },
        { label: 'Compliance', value: 'ASTM / JIG Aviation Standard' }
      ],
      description: 'Engineered and delivered to rigorous international aviation safety protocols. The facility features twin white cylindrical Jet A-1 reservoirs, pressurized hydrant pipelines, stainless steel filtration skids, elevated inspection catwalks, and a dedicated computerized fueling dispatch station.'
    },
    'soten-factory': {
      title: 'SOTEN Industries Modern Manufacturing Complex',
      category: 'industrial',
      categoryName: 'Industrial & Large Span Facilities',
      location: 'Gelan Special Economic Industrial Corridor, Oromia / Addis Ababa',
      client: 'SOTEN Industries PLC',
      year: '2021 - 2023',
      image: 'assets/images/soten-factory.webp',
      scope: 'Large-span structural steel truss erection, heavy industrial reinforced concrete slab, loading bays with hydraulic dock levelers, corporate wing.',
      specs: [
        { label: 'Floor Space', value: '26,000 m² Covered' },
        { label: 'Steel Truss Span', value: '42 Meter Clear-Span' },
        { label: 'Loading Docks', value: '14 Heavy Trailer Bays' },
        { label: 'Foundation Type', value: 'Deep Bored Pile & Raft' }
      ],
      description: 'A turnkey industrial manufacturing and logistics campus built to facilitate high-capacity assembly and storage. The facility incorporates insulated sandwich panels, natural daylight skylights, 20-ton overhead gantry crane tracks, and heavy-duty 40MPa laser-screeded concrete flooring.'
    },
    'taf-headquarters': {
      title: 'TAF Energies Corporate Head Office (G+6)',
      category: 'commercial',
      categoryName: 'Commercial Multi-Storey',
      location: 'China Street, Wello Sefer, Bole, Addis Ababa',
      client: 'TAF Energies Holdings',
      year: '2019 - 2022',
      image: 'assets/images/taf-headquarters.webp',
      scope: '7-Storey reinforced concrete frame, high-performance double-glazed curtain wall, executive reception atrium, underground multi-level parking.',
      specs: [
        { label: 'Building Height', value: 'G+6 Floors (28 Meters)' },
        { label: 'Gross Built Area', value: '8,400 m²' },
        { label: 'Curtain Wall', value: 'Thermal Acoustic Glazing' },
        { label: 'Parking Space', value: '2 Basements (75 Vehicles)' }
      ],
      description: 'A signature architectural headquarters situated along China Street in Wello Sefer. Featuring imported limestone facade cladding, warm integrated architectural LED vertical accent illumination, premium smart elevator systems, and energy-efficient building automation.'
    },
    'dealers-network': {
      title: 'Turnkey Retail Fuel Station Network',
      category: 'fuel',
      categoryName: 'Fuel Station Facilities',
      location: 'Nationwide Network (Addis Ababa & Regional Corridors)',
      client: 'TAF Energies & Independent Petroleum Retailers',
      year: 'Continuous (Over 50 Stations)',
      image: 'assets/images/dealers-fuel-station.webp',
      scope: 'High-clearance architectural steel canopies, underground double-wall fuel tanks, containment sumps, concrete forecourts, convenience store.',
      specs: [
        { label: 'Canopies Completed', value: '50+ Nationwide' },
        { label: 'Dispenser Islands', value: '4 to 8 Pump Lanes' },
        { label: 'Underground Tanks', value: '3 x 50,000L Multi-product' },
        { label: 'Auxiliary Facilities', value: 'Car Wash & Quick Lube' }
      ],
      description: 'Heniten is recognized across Ethiopia as the premier contractor for retail petroleum infrastructure. Projects incorporate fuel-resistant joint sealants, vapor recovery lines, cathodic corrosion protection, LED canopy illumination, and quick-turnaround civil installations.'
    },
    'residential-complex': {
      title: 'Bole Luxury Multi-Family Residential Estate',
      category: 'residential',
      categoryName: 'Residential Developments',
      location: 'Bole Sub-City, Addis Ababa',
      client: 'Private Real Estate Syndicate',
      year: '2023 - 2025',
      image: 'assets/images/residential-complex.webp',
      scope: 'Contemporary townhomes and multi-family residential towers, cantilevered balconies, natural stone and timber facade, private gardens.',
      specs: [
        { label: 'Units Delivered', value: '48 Luxury Residences' },
        { label: 'Site Footprint', value: '12,500 m² Gated Enclave' },
        { label: 'Amenities', value: 'Reflecting Pools & Clubhouse' },
        { label: 'Structure', value: 'Seismic EBCS-8 Compliant' }
      ],
      description: 'An exclusive residential sanctuary pairing warm Ethiopian natural stone masonry with European floor-to-ceiling double-glazed sliding apertures, landscaped garden courtyards, backup diesel generators, and independent water treatment reservoirs.'
    }
  };

  // Cost Estimation Factors (ETB Base Rates)
  const costRates = {
    'fuel-station': { basePerSqM: 42000, label: 'Fuel Station Facility', avgTimeline: '4 - 7 Months' },
    'commercial': { basePerSqM: 58000, label: 'Commercial Building (G+N)', avgTimeline: '14 - 24 Months' },
    'industrial': { basePerSqM: 36000, label: 'Industrial Factory & Warehouse', avgTimeline: '8 - 14 Months' },
    'residential': { basePerSqM: 48000, label: 'Luxury Residential Estate', avgTimeline: '12 - 18 Months' },
    'aviation': { basePerSqM: 68000, label: 'Aviation & Specialized Logistics', avgTimeline: '12 - 20 Months' }
  };

  const USD_EXCHANGE_RATE = 135.0; // Current indicative rate

  document.addEventListener('DOMContentLoaded', () => {
    initHeroSlideshow();
    initSparkAtmosphereCanvas();
    initScrollAnimations();
    initCounters();
    initStickyHeader();
    initNavigationDrawer();
    initProjectsFilter();
    initProjectModals();
    initQuoteCalculator();
    initRFPModal();
    initServiceModals();
  });

  /* ==========================================================================
     1. REAL-LIFE CINEMATIC CONSTRUCTION REEL & MULTI-CAMERA TELEMETRY
     ========================================================================== */
  /* ==========================================================================
     1. REAL-LIFE CINEMATIC HERO SLIDESHOW
     ========================================================================== */
  const slideIds = ['slideCam1', 'slideCam2', 'slideCam3'];
  let currentSlideIndex = 0;
  let slideTimer = null;
  const SLIDE_DURATION = 6000; // 6 seconds per slide

  function initHeroSlideshow() {
    const indicators = document.querySelectorAll('.slide-indicator');
    const prevBtn = document.getElementById('prevSlideBtn');
    const nextBtn = document.getElementById('nextSlideBtn');
    const slides = slideIds.map(id => document.getElementById(id)).filter(Boolean);

    if (!slides.length) return;

    function goToSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentSlideIndex = index;

      // Update active slide class
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentSlideIndex);
      });

      // Update indicator active class and restart progress bar
      indicators.forEach((ind, i) => {
        ind.classList.remove('active');
        if (i === currentSlideIndex) {
          // Re-trigger CSS animation
          void ind.offsetWidth;
          ind.classList.add('active');
        }
      });

      // Reset auto-slide timer
      restartSlideTimer();
    }

    function nextSlide() {
      goToSlide(currentSlideIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentSlideIndex - 1);
    }

    function restartSlideTimer() {
      if (slideTimer) clearInterval(slideTimer);
      slideTimer = setInterval(nextSlide, SLIDE_DURATION);
    }

    // Indicator Click Handlers
    indicators.forEach(ind => {
      ind.addEventListener('click', () => {
        const idx = parseInt(ind.getAttribute('data-slide-index'), 10);
        goToSlide(idx);
      });
    });

    // Arrow Button Handlers
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // Initial Timer
    restartSlideTimer();

    // Subtle 3D Depth Parallax on Active Slide
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    window.addEventListener('pointermove', e => {
      const normX = (e.clientX / window.innerWidth) - 0.5;
      const normY = (e.clientY / window.innerHeight) - 0.5;
      targetX = normX * -24;
      targetY = normY * -16;
    }, { passive: true });

    function animateParallax() {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      const activeSlide = document.querySelector('.cinematic-slide.active');
      if (activeSlide) {
        activeSlide.style.setProperty('--parallax-x', `${currentX.toFixed(2)}px`);
        activeSlide.style.setProperty('--parallax-y', `${currentY.toFixed(2)}px`);
      }
      requestAnimationFrame(animateParallax);
    }
    requestAnimationFrame(animateParallax);
  }

  /* ==========================================================================
     REAL-TIME ATMOSPHERIC WELDING SPARK & PARTICULATE SIMULATOR
     ========================================================================== */
  function initSparkAtmosphereCanvas() {
    const canvas = document.getElementById('sparkCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0, height = 0;

    function resize() {
      const rect = canvas.parentNode.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
    }
    resize();
    window.addEventListener('resize', resize);

    // Spark Particles Array
    const sparks = [];
    const MAX_SPARKS = 85;

    // Ambient Dust Particles
    const dustMotes = [];
    const MAX_DUST = 60;

    class DustMote {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 1.8 + 0.4;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -(Math.random() * 0.4 + 0.1);
        this.alpha = Math.random() * 0.5 + 0.2;
        this.color = Math.random() > 0.4 ? 'rgba(253, 185, 19, ' : 'rgba(255, 255, 255, ';
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset();
          this.y = height + 5;
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.fill();
      }
    }

    class WeldingSpark {
      constructor(originX, originY) {
        this.init(originX, originY);
      }
      init(ox, oy) {
        this.x = ox + (Math.random() - 0.5) * 40;
        this.y = oy + (Math.random() - 0.5) * 20;
        const angle = Math.PI * 0.5 + (Math.random() - 0.5) * 1.1; // generally downwards
        const speed = Math.random() * 4.5 + 2.0;
        this.vx = Math.cos(angle) * speed + (Math.random() - 0.3) * 1.5;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.12;
        this.life = 1.0;
        this.decay = Math.random() * 0.025 + 0.015;
        this.length = Math.random() * 8 + 4;
        this.size = Math.random() * 2 + 1;
      }
      update() {
        this.x += this.vx;
        this.vy += this.gravity;
        this.y += this.vy;
        this.life -= this.decay;
      }
      draw() {
        if (this.life <= 0) return;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 1.5, this.y - this.vy * 1.5);
        ctx.strokeStyle = `rgba(255, ${Math.floor(180 * this.life + 75)}, 50, ${this.life})`;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FDB913';
        ctx.stroke();
        ctx.restore();
      }
    }

    for (let i = 0; i < MAX_DUST; i++) {
      dustMotes.push(new DustMote());
    }

    let isVisible = true;
    new IntersectionObserver(entries => {
      isVisible = entries[0].isIntersecting;
    }).observe(canvas.parentNode);

    function loop() {
      requestAnimationFrame(loop);
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);

      // Draw Atmospheric Dust
      dustMotes.forEach(mote => {
        mote.update();
        mote.draw();
      });

      // Spawn Sparks on High-Rise Tower Slide (Slide 0)
      if (currentSlideIndex === 0) {
        const originX = width * 0.66;
        const originY = height * 0.74;

        if (sparks.length < MAX_SPARKS && Math.random() > 0.3) {
          sparks.push(new WeldingSpark(originX, originY));
        }
      }

      // Update & Draw Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.update();
        spark.draw();
        if (spark.life <= 0 || spark.y > height) {
          sparks.splice(i, 1);
        }
      }
    }

    loop();
  }

  /* ==========================================================================
     2. MODERN UI SCROLL ANIMATION SUITE & PERFORMANCE-OPTIMIZED ENGINE
     ========================================================================== */
  function initScrollAnimations() {
    // 2.1 Reading Depth Scroll Progress Bar & Floating Circular Back-to-Top Ring
    const progressBar = document.getElementById('scrollProgressBar');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const progressRing = document.getElementById('progressRingCircle');
    const RING_CIRCUMFERENCE = 119.38; // 2 * PI * 19

    // 2.2 Hero Elements for Cinematic Scroll Parallax
    const hero = document.getElementById('about');
    const heroBg = document.getElementById('heroCinematicReel');
    const heroContent = hero ? hero.querySelector('.hero-content') : null;

    // 2.3 Process Section Elements for Laser Timeline Rail
    const processSection = document.getElementById('process');
    const processTrack = document.getElementById('processLaserTrack');
    const processCards = document.querySelectorAll('.process-step-card');

    // 2.4 Navigation Spy Configuration
    const sectionMeta = [
      { id: 'about', label: '01 · ABOUT' },
      { id: 'services', label: '02 · SERVICES' },
      { id: 'projects', label: '03 · PROJECTS' },
      { id: 'calculator', label: '04 · ESTIMATOR' },
      { id: 'process', label: '05 · PROCESS' },
      { id: 'contact', label: '06 · CONTACT' }
    ];
    const navLinks = document.querySelectorAll('.primary-nav .nav-link');

    // Unified Scroll Calculation on requestAnimationFrame
    let isTicking = false;

    function onScrollUpdate() {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? Math.min(Math.max(scrollY / totalHeight, 0), 1) : 0;

      // Update Top Global Scroll Reading Bar
      if (progressBar) {
        progressBar.style.transform = `scaleX(${progress})`;
      }

      // Update Floating Circular Back-to-Top Progress Ring
      if (progressRing) {
        const strokeOffset = RING_CIRCUMFERENCE - (progress * RING_CIRCUMFERENCE);
        progressRing.style.strokeDashoffset = strokeOffset.toFixed(2);
      }

      // Toggle Visibility of Floating Widgets (scrolled past hero fold)
      const hasPassedHero = scrollY > 380;
      if (backToTopBtn) {
        backToTopBtn.classList.toggle('visible', hasPassedHero);
      }

      // Hero Parallax & Vignette Fade-out
      if (hero) {
        const heroHeight = hero.offsetHeight;
        if (scrollY <= heroHeight) {
          const ratio = scrollY / heroHeight;
          if (heroBg) {
            heroBg.style.transform = `translate3d(0, ${(scrollY * 0.35).toFixed(1)}px, 0)`;
          }
          if (heroContent) {
            heroContent.style.transform = `translate3d(0, ${(scrollY * -0.15).toFixed(1)}px, 0)`;
            heroContent.style.opacity = Math.max(0, 1 - ratio * 1.35).toFixed(3);
          }
        }
      }

      // Process Section Laser Timeline Fill
      if (processSection && processTrack) {
        const rect = processSection.getBoundingClientRect();
        const winHeight = window.innerHeight;
        if (rect.top <= winHeight && rect.bottom >= 0) {
          const totalDistance = rect.height + winHeight * 0.35;
          const currentPassed = winHeight - rect.top;
          const laserProgress = Math.min(Math.max(currentPassed / totalDistance, 0), 1);
          processTrack.style.width = `${(laserProgress * 100).toFixed(1)}%`;

          processCards.forEach((card, index) => {
            const threshold = (index + 0.35) / processCards.length;
            if (laserProgress >= threshold) {
              card.classList.add('step-active');
            } else {
              card.classList.remove('step-active');
            }
          });
        }
      }

      // Active Section Spy for Navigation Links
      const spyThreshold = scrollY + 160;
      for (let i = sectionMeta.length - 1; i >= 0; i--) {
        const sec = document.getElementById(sectionMeta[i].id);
        if (sec && spyThreshold >= sec.offsetTop) {
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${sectionMeta[i].id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
          break;
        }
      }

      isTicking = false;
    }


    window.addEventListener('scroll', () => {
      if (!isTicking) {
        window.requestAnimationFrame(onScrollUpdate);
        isTicking = true;
      }
    }, { passive: true });
    onScrollUpdate();

    // Back to top click handler
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // 2.5 Modern Multi-directional Scroll Reveal Observer with Blur-to-Focus
    const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-up, .reveal-scale, .reveal-left, .reveal-right');
    if (revealElements.length) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      revealElements.forEach(el => observer.observe(el));
    }

    // 2.6 Interactive 3D Perspective Card Tilt & Mouse Spotlight Sheen
    const tiltCards = document.querySelectorAll('.tilt-card, .project-card, .why-card, .process-step-card, .calc-panel');
    tiltCards.forEach(card => {
      card.addEventListener('pointermove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
        card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px)`;
      });

      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ==========================================================================
     3. DYNAMIC STATS NUMBER COUNTERS
     ========================================================================== */
  function initCounters() {
    const counterElements = document.querySelectorAll('[data-counter-target]');
    if (!counterElements.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-counter-target'), 10);
          const suffix = entry.target.getAttribute('data-counter-suffix') || '';
          obs.unobserve(entry.target);

          animateCount(entry.target, target, suffix, 1600);
        }
      });
    }, { threshold: 0.25 });

    counterElements.forEach(el => observer.observe(el));
  }

  function animateCount(elem, targetVal, suffix, duration) {
    const startVal = 0;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quartic
      const easeVal = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(startVal + (targetVal - startVal) * easeVal);

      elem.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        elem.textContent = targetVal + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  /* ==========================================================================
     4. STICKY HEADER & SCROLL BEHAVIOR
     ========================================================================== */
  function initStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ==========================================================================
     5. MOBILE NAVIGATION DRAWER
     ========================================================================== */
  function initNavigationDrawer() {
    const toggleBtn = document.getElementById('hamburgerBtn');
    const drawer = document.getElementById('mobileNavDrawer');
    const closeBtn = document.getElementById('closeDrawerBtn');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    if (!toggleBtn || !drawer) return;

    function openDrawer() {
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      drawer.classList.remove('active');
      document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    drawerLinks.forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer.classList.contains('active')) {
        closeDrawer();
      }
    });
  }

  /* ==========================================================================
     6. PROJECT SHOWCASE FILTERING
     ========================================================================== */
  function initProjectsFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (!filterButtons.length || !projectCards.length) return;

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          if (filterValue === 'all' || cardCategory === filterValue) {
            card.style.display = 'flex';
            setTimeout(() => { card.style.opacity = '1'; }, 10);
          } else {
            card.style.opacity = '0';
            setTimeout(() => { card.style.display = 'none'; }, 200);
          }
        });
      });
    });
  }

  /* ==========================================================================
     7. PROJECT DETAIL MODALS (CASE STUDIES)
     ========================================================================== */
  function initProjectModals() {
    const modal = document.getElementById('projectModal');
    const closeBtn = document.getElementById('closeProjectModal');
    const triggerCards = document.querySelectorAll('.project-card[data-project-id]');

    if (!modal) return;

    function openProjectModal(projectId) {
      const data = projectsData[projectId];
      if (!data) return;

      document.getElementById('modalProjectImg').src = data.image;
      document.getElementById('modalProjectImg').alt = data.title;
      document.getElementById('modalProjectCategory').textContent = data.categoryName;
      document.getElementById('modalProjectTitle').textContent = data.title;
      document.getElementById('modalProjectLocation').textContent = data.location;
      document.getElementById('modalProjectClient').textContent = data.client;
      document.getElementById('modalProjectYear').textContent = data.year;
      document.getElementById('modalProjectDesc').textContent = data.description;
      document.getElementById('modalProjectScope').textContent = data.scope;

      const specsContainer = document.getElementById('modalProjectSpecs');
      if (specsContainer) {
        specsContainer.innerHTML = data.specs.map(s => `
          <div style="background:var(--slate-50);padding:14px 18px;border-radius:var(--radius-xs);border:1px solid var(--slate-200)">
            <div style="font-size:12px;color:var(--slate-600);font-weight:600;text-transform:uppercase">${s.label}</div>
            <div style="font-family:var(--font-heading);font-weight:800;font-size:16px;color:var(--navy-850);margin-top:4px">${s.value}</div>
          </div>
        `).join('');
      }

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeProjectModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    triggerCards.forEach(card => {
      card.addEventListener('click', e => {
        e.preventDefault();
        const id = card.getAttribute('data-project-id');
        openProjectModal(id);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeProjectModal);
    modal.addEventListener('click', e => {
      if (e.target === modal) closeProjectModal();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeProjectModal();
    });
  }

  /* ==========================================================================
     8. INTERACTIVE QUOTATION & SCOPE CALCULATOR
     ========================================================================== */
  function initQuoteCalculator() {
    const typeCards = document.querySelectorAll('.type-option-card');
    const areaSlider = document.getElementById('calcAreaSlider');
    const areaDisplay = document.getElementById('calcAreaDisplay');
    const currencyToggle = document.getElementById('calcCurrencyToggle');
    const scopeCheckboxes = document.querySelectorAll('.scope-checkbox');

    if (!areaSlider) return;

    // Type Selection
    typeCards.forEach(card => {
      card.addEventListener('click', () => {
        typeCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        state.calc.type = card.getAttribute('data-type');
        recalculateQuote();
      });
    });

    // Area Slider
    areaSlider.addEventListener('input', e => {
      const val = parseInt(e.target.value, 10);
      state.calc.area = val;
      if (areaDisplay) areaDisplay.textContent = val.toLocaleString() + ' m²';
      recalculateQuote();
    });

    // Checkboxes
    scopeCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const field = cb.getAttribute('data-scope');
        state.calc[field] = cb.checked;
        recalculateQuote();
      });
    });

    // Currency Switcher
    if (currencyToggle) {
      currencyToggle.addEventListener('click', () => {
        state.currency = state.currency === 'ETB' ? 'USD' : 'ETB';
        currencyToggle.textContent = state.currency === 'ETB' ? 'Show in USD ($)' : 'Show in ETB (ብር)';
        recalculateQuote();
      });
    }

    // Initial Calculation
    recalculateQuote();
  }

  function recalculateQuote() {
    const config = costRates[state.calc.type] || costRates['fuel-station'];
    const baseRate = config.basePerSqM;
    const area = state.calc.area;

    // Multipliers based on scope selections
    let multiplier = 0;
    if (state.calc.turnkey) multiplier += 0.35;
    if (state.calc.structural) multiplier += 0.30;
    if (state.calc.mep) multiplier += 0.15;
    if (state.calc.canopy) multiplier += 0.12;
    if (state.calc.engineering) multiplier += 0.08;

    multiplier = Math.max(0.3, multiplier);

    const totalEstimateETB = area * baseRate * multiplier;
    const lowEstimateETB = totalEstimateETB * 0.92;
    const highEstimateETB = totalEstimateETB * 1.08;

    const isUSD = state.currency === 'USD';
    const divisor = isUSD ? USD_EXCHANGE_RATE : 1;
    const prefix = isUSD ? '$' : 'ETB ';

    const lowFormatted = formatCompactCurrency(lowEstimateETB / divisor, isUSD);
    const highFormatted = formatCompactCurrency(highEstimateETB / divisor, isUSD);

    const headlineEl = document.getElementById('calcResultFigure');
    if (headlineEl) {
      headlineEl.textContent = `${prefix}${lowFormatted} - ${prefix}${highFormatted}`;
    }

    // Breakdown Elements
    const bTypeEl = document.getElementById('calcBreakdownType');
    const bAreaEl = document.getElementById('calcBreakdownArea');
    const bTimelineEl = document.getElementById('calcBreakdownTimeline');
    const bLicenseEl = document.getElementById('calcBreakdownLicense');

    if (bTypeEl) bTypeEl.textContent = config.label;
    if (bAreaEl) bAreaEl.textContent = area.toLocaleString() + ' m²';
    if (bTimelineEl) bTimelineEl.textContent = config.avgTimeline;
    if (bLicenseEl) bLicenseEl.textContent = 'BC-6 Grade 5 Supervision';
  }

  function formatCompactCurrency(val, isUSD) {
    if (val >= 1000000000) {
      return (val / 1000000000).toFixed(2) + ' Billion';
    } else if (val >= 1000000) {
      return (val / 1000000).toFixed(1) + (isUSD ? 'M' : ' Million');
    } else if (val >= 1000) {
      return Math.round(val / 1000).toLocaleString() + 'K';
    }
    return Math.round(val).toLocaleString();
  }

  /* ==========================================================================
     9. REQUEST FOR QUOTATION (RFP) MODAL
     ========================================================================== */
  function initRFPModal() {
    const modal = document.getElementById('rfpModal');
    const openButtons = document.querySelectorAll('[data-open-rfp]');
    const closeBtn = document.getElementById('closeRfpModal');
    const form = document.getElementById('rfpForm');

    if (!modal) return;

    function openRFP(presetScope) {
      if (presetScope && form) {
        const typeSelect = form.querySelector('[name="projectType"]');
        if (typeSelect) typeSelect.value = state.calc.type;
        const notesArea = form.querySelector('[name="projectNotes"]');
        if (notesArea && !notesArea.value) {
          notesArea.value = `Estimated Area: ${state.calc.area} m²\nEstimated Budget: ${document.getElementById('calcResultFigure')?.textContent || 'To be finalized'}`;
        }
      }
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeRFP() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    openButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const isPreset = btn.getAttribute('data-open-rfp') === 'from-calc';
        openRFP(isPreset);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeRFP);
    modal.addEventListener('click', e => {
      if (e.target === modal) closeRFP();
    });

    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const origText = submitBtn.textContent;
        submitBtn.textContent = 'Transmitting RFP to Estimations Team...';
        submitBtn.disabled = true;

        setTimeout(() => {
          form.innerHTML = `
            <div style="text-align:center;padding:40px 20px">
              <div style="width:68px;height:68px;background:rgba(253,185,19,0.2);color:var(--gold-500);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:20px">✓</div>
              <h3 style="font-size:26px;color:var(--navy-850);margin-bottom:12px">Quotation Request Received</h3>
              <p style="color:var(--slate-700);max-width:480px;margin:0 auto 24px;line-height:1.6">
                Thank you. Heniten Construction's Chief Estimator and Engineering Bureau in Addis Ababa will review your requirements and provide a formal tender response within one business day.
              </p>
              <div style="font-weight:700;color:var(--teal-600);font-size:14px;letter-spacing:0.06em">REFERENCE ID: HN-${Math.floor(100000 + Math.random() * 900000)}</div>
              <button type="button" class="btn btn-primary" onclick="document.getElementById('rfpModal').classList.remove('active');document.body.style.overflow='';" style="margin-top:28px">Close Window</button>
            </div>
          `;
        }, 1200);
      });
    }
  }

  /* ==========================================================================
     10. SERVICES SPECIFICATION MODALS
     ========================================================================== */
  function initServiceModals() {
    const serviceRows = document.querySelectorAll('.service-row[data-service]');
    const modal = document.getElementById('serviceDetailModal');
    const closeBtn = document.getElementById('closeServiceModal');

    if (!modal) return;

    const servicesDetailData = {
      '01': {
        title: 'Building Contracting & Civil Engineering',
        subtitle: 'Grade 5 BC-6 Government Licensed Contractor',
        description: 'Complete general contracting services encompassing structural concrete, foundation engineering, earthworks, and high-rise core execution adhering strictly to Ethiopian Building Code Standards (EBCS).',
        deliverables: ['Full BOQ Preparation & Cost Planning', 'On-Site Resident Civil Engineers', 'Batch-plant Concrete Testing & Slump Verification', 'Critical Path Method (CPM) Schedule Tracking']
      },
      '02': {
        title: 'Commercial Multi-Storey Construction',
        subtitle: 'G+6 to G+12 Headquarters, Banks & Mixed-Use Plazas',
        description: 'Turnkey development of commercial architectural landmarks with modern acoustic insulation, double-glazed curtain walls, fire escape suppression, and underground parking.',
        deliverables: ['Substructure Excavation & Shoring', 'Reinforced Concrete Framework', 'Elevator Shafts & MEP Vertical Risers', 'Grand Reception Atrium Finishes']
      },
      '03': {
        title: 'Residential & Multi-Family Developments',
        subtitle: 'Custom Luxury Estates, Townhome Enclaves & Villas',
        description: 'High-end residential builds tailored for developers and private syndicates, blending local stone masonry with European fittings, seismic engineering, and landscaped infrastructure.',
        deliverables: ['Seismic Structural Calculations', 'Natural Stone & Wood Façade Accents', 'Dedicated Power Sub-Stations & Water Storage', 'Landscaping, Paving & Perimeter Security']
      },
      '04': {
        title: 'Fuel Station Facilities & Forecourt Civil Works',
        subtitle: 'Ethiopia’s Recognized Leader in Petroleum Retailing Civil Works',
        description: 'Over 50 retail canopies and turnkey stations delivered for TAF Energies and independent dealers across regional highways and urban intersections.',
        deliverables: ['Structural Steel Canopy Fabrication & Erection', 'Underground Tank Excavation & Anchoring', 'Containment Sump & Spill Interceptors', 'Concrete Forecourt & Car Wash Bays']
      },
      '05': {
        title: 'Pre-Construction & Feasibility Analysis',
        subtitle: 'Engineering Due Diligence & Permitting',
        description: 'Comprehensive upfront site investigation, geotechnical borehole soil testing, value engineering, municipal permit clearance, and cost modeling.',
        deliverables: ['Soil Geotechnical Investigation', 'City Permitting & Zoning Clearances', 'Material Sourcing Optimization', 'Life-Cycle Cost Modeling']
      },
      '06': {
        title: 'Design-Build Single-Source EPC Delivery',
        subtitle: 'Unified Architecture, Engineering & Construction',
        description: 'A single point of commercial responsibility. Our integrated team coordinates architectural drafting, structural MEP modeling, and on-site construction under one accountable contract.',
        deliverables: ['Single Point of Accountability', 'Zero Cost Overrun Guarantee Framework', 'Fast-Track Construction Phasing', 'Complete As-Built Handover Documentation']
      }
    };

    serviceRows.forEach(row => {
      row.addEventListener('click', e => {
        e.preventDefault();
        const code = row.getAttribute('data-service');
        const data = servicesDetailData[code];
        if (!data) return;

        document.getElementById('serviceModalCode').textContent = 'SERVICE SPECIFICATION ' + code;
        document.getElementById('serviceModalTitle').textContent = data.title;
        document.getElementById('serviceModalSubtitle').textContent = data.subtitle;
        document.getElementById('serviceModalDesc').textContent = data.description;

        const listEl = document.getElementById('serviceModalList');
        if (listEl) {
          listEl.innerHTML = data.deliverables.map(item => `
            <li style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <span style="color:var(--gold-500);font-weight:bold">✓</span>
              <span>${item}</span>
            </li>
          `).join('');
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

})();
