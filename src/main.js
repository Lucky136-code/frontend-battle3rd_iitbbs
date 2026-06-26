import './style.css';

function init() {
  /* ==========================================================================
     Three.js 3D Mouse-Tracking Robot
     ========================================================================== */
  const container = document.getElementById('robot-scene-container');
  const canvas3d = document.getElementById('robot-canvas');

  // Hoisted so manga dialogue & gesture functions can access these
  let targetRotL = { x: 0, y: 0, z: 0.15 };
  let targetRotR = { x: 0, y: 0, z: -0.15 };
  let activeSectionName = 'hero';

  if (container && canvas3d) {
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.8, 6.5);
    camera.lookAt(0, 1.2, 0);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Groups for rotation hierarchy
    const robotGroup = new THREE.Group();
    const upperBodyGroup = new THREE.Group();
    const headGroup = new THREE.Group();
    
    // Target joint rotations & state variables defined at init() scope above
    
    upperBodyGroup.position.y = 0.8;
    headGroup.position.y = 1.1; // relative to upper body
    
    // Add sub-groups
    upperBodyGroup.add(headGroup);
    robotGroup.add(upperBodyGroup);
    scene.add(robotGroup);

    // Materials (matching the battle color palette tokens)
    const glossyWhite = new THREE.MeshPhysicalMaterial({
      color: 0xf1f6f4, // Arctic Powder
      roughness: 0.15,
      metalness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    const glossyDark = new THREE.MeshStandardMaterial({
      color: 0x172b36, // Oceanic Noir
      roughness: 0.2,
      metalness: 0.8
    });

    const neonAccentMat = new THREE.MeshBasicMaterial({
      color: 0xffc801 // Forsythia
    });

    // 1. Pedestal Base
    const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.25, 32);
    const pedestal = new THREE.Mesh(pedestalGeo, glossyDark);
    pedestal.position.y = -1.25;
    scene.add(pedestal);

    // Glowing rim on pedestal
    const rimGeo = new THREE.TorusGeometry(1.62, 0.03, 8, 48);
    const rim = new THREE.Mesh(rimGeo, neonAccentMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -1.13;
    scene.add(rim);

    // 2. Torso (Body)
    const torsoGeo = new THREE.CylinderGeometry(0.65, 0.5, 1.4, 32);
    const torso = new THREE.Mesh(torsoGeo, glossyWhite);
    torso.position.y = 0;
    upperBodyGroup.add(torso);

    // Decorative chest plate/logo
    const chestPlateGeo = new THREE.BoxGeometry(0.5, 0.3, 0.1);
    const chestPlate = new THREE.Mesh(chestPlateGeo, glossyDark);
    chestPlate.position.set(0, 0.2, 0.6);
    upperBodyGroup.add(chestPlate);

    const chestLedGeo = new THREE.BoxGeometry(0.3, 0.06, 0.05);
    const chestLed = new THREE.Mesh(chestLedGeo, neonAccentMat);
    chestLed.position.set(0, 0.2, 0.66);
    upperBodyGroup.add(chestLed);

    // 3. Neck
    const neckGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);
    const neck = new THREE.Mesh(neckGeo, glossyDark);
    neck.position.y = 0.85;
    upperBodyGroup.add(neck);

    // 4. Head
    const headBoxGeo = new THREE.BoxGeometry(1.1, 0.8, 0.8);
    
    // Custom screen texture for front face
    const canvasScreen = document.createElement('canvas');
    canvasScreen.width = 256;
    canvasScreen.height = 256;
    const ctx = canvasScreen.getContext('2d');
    ctx.fillStyle = '#172b36'; // Oceanic Noir screen background
    ctx.fillRect(0, 0, 256, 256);
    
    // Border
    ctx.strokeStyle = '#ffc801'; // Forsythia screen border
    ctx.lineWidth = 12;
    ctx.strokeRect(10, 10, 236, 236);
    // Deep Saffron detail
    ctx.strokeStyle = '#ff9932'; // Deep Saffron inner detail
    ctx.lineWidth = 4;
    ctx.strokeRect(22, 22, 212, 212);
    // Eyes
    ctx.fillStyle = '#d9e8e2'; // Mystic Mint eyes
    ctx.beginPath();
    ctx.arc(80, 128, 20, 0, Math.PI*2);
    ctx.arc(176, 128, 20, 0, Math.PI*2);
    ctx.fill();
    // Pupils
    ctx.fillStyle = '#f1f6f4'; // Arctic Powder pupils
    ctx.beginPath();
    ctx.arc(80, 128, 8, 0, Math.PI*2);
    ctx.arc(176, 128, 8, 0, Math.PI*2);
    ctx.fill();

    const screenTex = new THREE.CanvasTexture(canvasScreen);
    const screenMaterial = new THREE.MeshStandardMaterial({
      map: screenTex,
      roughness: 0.1,
      metalness: 0.5
    });

    // Array of materials: +X, -X, +Y, -Y, +Z (Front), -Z
    const headMaterials = [
      glossyWhite, // +X right
      glossyWhite, // -X left
      glossyWhite, // +Y top
      glossyWhite, // -Y bottom
      screenMaterial, // +Z front
      glossyWhite  // -Z back
    ];

    const headMesh = new THREE.Mesh(headBoxGeo, headMaterials);
    headMesh.position.y = 0.4;
    headGroup.add(headMesh);

    // Ears / Antenna joints
    const earLGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16);
    const earL = new THREE.Mesh(earLGeo, glossyDark);
    earL.rotation.z = Math.PI / 2;
    earL.position.set(-0.62, 0.4, 0);
    headGroup.add(earL);

    const earR = earL.clone();
    earR.position.x = 0.62;
    headGroup.add(earR);

    // Antenna
    const antStemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8);
    const antStem = new THREE.Mesh(antStemGeo, glossyDark);
    antStem.position.set(0, 0.9, 0);
    headGroup.add(antStem);

    const antTipGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const antTip = new THREE.Mesh(antTipGeo, neonAccentMat);
    antTip.position.set(0, 1.15, 0);
    headGroup.add(antTip);

    // 5. Arms
    // Left arm group pivot
    const armLJoint = new THREE.Group();
    armLJoint.position.set(-0.85, 0.5, 0);
    upperBodyGroup.add(armLJoint);

    // Left shoulder sphere
    const shoulderLGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const shoulderL = new THREE.Mesh(shoulderLGeo, glossyDark);
    armLJoint.add(shoulderL);

    // Left arm cylinder offset down (pivot at shoulder)
    const armLGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.9, 16);
    const armL = new THREE.Mesh(armLGeo, glossyWhite);
    armL.position.set(-0.1, -0.45, 0);
    armLJoint.add(armL);

    // Right arm group pivot
    const armRJoint = new THREE.Group();
    armRJoint.position.set(0.85, 0.5, 0);
    upperBodyGroup.add(armRJoint);

    // Right shoulder sphere
    const shoulderRGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const shoulderR = new THREE.Mesh(shoulderRGeo, glossyDark);
    armRJoint.add(shoulderR);

    // Right arm cylinder offset down (pivot at shoulder)
    const armRGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.9, 16);
    const armR = new THREE.Mesh(armRGeo, glossyWhite);
    armR.position.set(0.1, -0.45, 0);
    armRJoint.add(armR);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xf1f6f4, 0.35); // Arctic Powder light
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf1f6f4, 1.0);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    // Neon highlight lights (Forsythia / Deep Saffron PointLights matching the palette)
    const goldLight = new THREE.PointLight(0xffc801, 3.5, 15); // Forsythia Accent
    goldLight.position.set(-3.5, 1.5, 2.5);
    scene.add(goldLight);

    const orangeLight = new THREE.PointLight(0xff9932, 3.5, 15); // Deep Saffron Accent
    orangeLight.position.set(3.5, 1.5, 2.5);
    scene.add(orangeLight);

    // Handle mouse tracking coords
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (e) => {
      // Normalize values between -1 and 1
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Handle resize
    window.addEventListener('resize', () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    // Dynamic screen canvas blinking eyes & pupils tracking update
    function updateScreenCanvas(isBlinking) {
      ctx.fillStyle = '#172b36'; // Oceanic Noir screen background
      ctx.fillRect(0, 0, 256, 256);
      
      // Border
      ctx.strokeStyle = '#ffc801'; // Forsythia screen border
      ctx.lineWidth = 12;
      ctx.strokeRect(10, 10, 236, 236);
      
      // Deep Saffron detail
      ctx.strokeStyle = '#ff9932'; // Deep Saffron inner detail
      ctx.lineWidth = 4;
      ctx.strokeRect(22, 22, 212, 212);

      if (isBlinking) {
        // Draw eyes as horizontal lines (blinking state)
        ctx.strokeStyle = '#d9e8e2'; // Mystic Mint eyes
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        
        // Left eye line
        ctx.beginPath();
        ctx.moveTo(60, 128);
        ctx.lineTo(100, 128);
        ctx.stroke();

        // Right eye line
        ctx.beginPath();
        ctx.moveTo(156, 128);
        ctx.lineTo(196, 128);
        ctx.stroke();
      } else {
        // Draw eyes (circles)
        ctx.fillStyle = '#d9e8e2'; // Mystic Mint eyes
        ctx.beginPath();
        ctx.arc(80, 128, 20, 0, Math.PI*2);
        ctx.arc(176, 128, 20, 0, Math.PI*2);
        ctx.fill();
        
        // Pupils track mouse coordinates slightly for realism
        const pupilOffsetX = mouseX * 7;
        const pupilOffsetY = -mouseY * 7;
        
        ctx.fillStyle = '#f1f6f4'; // Arctic Powder pupils
        ctx.beginPath();
        ctx.arc(80 + pupilOffsetX, 128 + pupilOffsetY, 8, 0, Math.PI*2);
        ctx.arc(176 + pupilOffsetX, 128 + pupilOffsetY, 8, 0, Math.PI*2);
        ctx.fill();
      }
      screenTex.needsUpdate = true;
    }

    // Animation Loop
    const clock = new THREE.Clock();
    let lastTime = 0;

    let blinkTimer = 0;
    let nextBlinkTime = 3.0; // blink initially in 3 seconds
    let isBlinking = false;
    let blinkDurationTimer = 0;
    
    function animate() {
      requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - lastTime;
      lastTime = elapsedTime;

      // Handle eye blinking timer updates
      blinkTimer += deltaTime;
      if (isBlinking) {
        blinkDurationTimer += deltaTime;
        if (blinkDurationTimer >= 0.14) { // blink lasts 140ms
          isBlinking = false;
          blinkDurationTimer = 0;
          blinkTimer = 0;
          nextBlinkTime = Math.random() * 4 + 2; // next blink in 2 to 6 seconds
        }
      } else {
        if (blinkTimer >= nextBlinkTime) {
          isBlinking = true;
          blinkDurationTimer = 0;
        }
      }

      // Redraw canvas with blinking state & eye tracking coordinates
      updateScreenCanvas(isBlinking);

      // Floating hover movement
      const hoverOffset = Math.sin(elapsedTime * 2.2) * 0.08;
      robotGroup.position.y = hoverOffset + 0.45;

      // Mouse tracking head target rotations
      const targetHeadRotY = mouseX * 0.7; // turns left/right
      const targetHeadRotX = mouseY * 0.4; // tilts up/down
      const targetBodyRotY = mouseX * 0.25;

      // Smooth lerp head rotation interpolation
      headGroup.rotation.y += (targetHeadRotY - headGroup.rotation.y) * 0.08;
      headGroup.rotation.x += (targetHeadRotX - headGroup.rotation.x) * 0.08;
      upperBodyGroup.rotation.y += (targetBodyRotY - upperBodyGroup.rotation.y) * 0.08;

      // Smooth lerp arm gestures to targets with breathing motions
      armLJoint.rotation.x += (targetRotL.x + Math.sin(elapsedTime * 2.2) * 0.04 - armLJoint.rotation.x) * 0.1;
      armLJoint.rotation.y += (targetRotL.y - armLJoint.rotation.y) * 0.1;
      armLJoint.rotation.z += (targetRotL.z - armLJoint.rotation.z) * 0.1;

      if (activeSectionName === 'hero') {
        // Waving animation on right arm
        const waveOffset = Math.sin(elapsedTime * 8) * 0.35;
        armRJoint.rotation.z += (targetRotR.z + waveOffset - armRJoint.rotation.z) * 0.15;
        armRJoint.rotation.x += (targetRotR.x - armRJoint.rotation.x) * 0.1;
        armRJoint.rotation.y += (targetRotR.y - armRJoint.rotation.y) * 0.1;
      } else {
        armRJoint.rotation.x += (targetRotR.x + Math.sin(elapsedTime * 2.2) * -0.04 - armRJoint.rotation.x) * 0.1;
        armRJoint.rotation.y += (targetRotR.y - armRJoint.rotation.y) * 0.1;
        armRJoint.rotation.z += (targetRotR.z - armRJoint.rotation.z) * 0.1;
      }

      renderer.render(scene, camera);
    }
    
    animate();
  }

  /* ==========================================================================
     GSAP Intro Loader and Landing Page Reveal
     ========================================================================== */
  const progressEl = document.querySelector('.loader-progress');
  const statusEl = document.querySelector('.loader-status');
  
  if (progressEl) {
    gsap.to(progressEl, {
      width: '100%',
      duration: 1.0,
      ease: 'power2.inOut',
      onComplete: () => {
        if (statusEl) statusEl.textContent = 'SYSTEM ACTIVE';
        
        // Pause briefly, then fade out splash screen (300ms delay, 400ms fade)
        gsap.to('#intro-loader', {
          opacity: 0,
          duration: 0.4,
          delay: 0.3,
          onComplete: () => {
            const loaderDiv = document.getElementById('intro-loader');
            if (loaderDiv) loaderDiv.style.display = 'none';
            
            // Execute reveal animations for landing page (completes in 500ms)
            revealDashboard();
          }
        });
      }
    });
  }

  function revealDashboard() {
    // 1. Grid Lines drawing effect
    gsap.from('.grid-line-v', {
      height: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: 'power2.out'
    });
    gsap.from('.grid-line-h', {
      width: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: 'power2.out'
    });

    // 2. Left column elements slide-in
    gsap.from('.left-panel > *', {
      x: -40,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: 'power2.out'
    });

    // 3. Right column elements slide-in
    gsap.from('.right-panel > *', {
      x: 40,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: 'power2.out'
    });

    // 4. Center panel robot scaling reveal
    gsap.from('.center-panel', {
      scale: 0.92,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
    
    // 5. Header fade-in
    gsap.from('.nav-header', {
      y: -20,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out'
    });
  }

  /* ==========================================================================
     Active Edge Node Pinging Visual (Bento Card 3)
     ========================================================================== */
  const pingNodesContainer = document.getElementById('ping-nodes-container');
  if (pingNodesContainer) {
    const nodes = pingNodesContainer.querySelectorAll('.ping-node');
    
    function pulseRandomNode() {
      const randIndex = Math.floor(Math.random() * nodes.length);
      const targetNode = nodes[randIndex];
      
      targetNode.classList.add('active-ping');
      setTimeout(() => {
        targetNode.classList.remove('active-ping');
      }, 700);
    }
    
    setInterval(pulseRandomNode, 500);
    setInterval(pulseRandomNode, 800);
  }

  /* ==========================================================================
     FEATURE 1: Performance-Isolated Pricing Matrix & Custom Volume Slider
     ========================================================================== */
  const pricingMatrix = {
    currencies: {
      USD: { symbol: '$', rate: 1.0, regionalTariff: 1.0 },
      EUR: { symbol: '€', rate: 0.92, regionalTariff: 1.05 },
      INR: { symbol: '₹', rate: 83.5, regionalTariff: 0.90 }
    },
    cycles: {
      monthly: { discount: 1.0, durationLabel: '/mo' },
      annual: { discount: 0.8, durationLabel: '/mo' } // 20% discount
    },
    tiers: {
      developer: { baseRate: 19 },
      scale: { baseRate: 49 },
      enterprise: { baseRate: 149 }
    }
  };

  let currentCurrency = 'USD';
  let currentCycle = 'monthly';
  let currentSliderMultiplier = 1.0;

  const ingestSlider = document.getElementById('ingest-slider');
  const sliderValueDisplay = document.getElementById('slider-value-display');

  function updatePrices() {
    const currency = pricingMatrix.currencies[currentCurrency];
    const cycle = pricingMatrix.cycles[currentCycle];
    
    // Developer
    const devRate = Math.round(
      pricingMatrix.tiers.developer.baseRate * 
      currency.rate * 
      currency.regionalTariff * 
      cycle.discount * 
      currentSliderMultiplier
    );
    document.getElementById('price-cur-developer').textContent = currency.symbol;
    document.getElementById('price-val-developer').textContent = devRate;
    document.getElementById('price-dur-developer').textContent = cycle.durationLabel;
    if (currentCycle === 'annual') {
      document.getElementById('price-sub-developer').textContent = `billed annually: ${currency.symbol}${devRate * 12}/yr`;
    } else {
      document.getElementById('price-sub-developer').textContent = 'billed monthly';
    }
    
    // Scale
    const scaleRate = Math.round(
      pricingMatrix.tiers.scale.baseRate * 
      currency.rate * 
      currency.regionalTariff * 
      cycle.discount * 
      currentSliderMultiplier
    );
    document.getElementById('price-cur-scale').textContent = currency.symbol;
    document.getElementById('price-val-scale').textContent = scaleRate;
    document.getElementById('price-dur-scale').textContent = cycle.durationLabel;
    if (currentCycle === 'annual') {
      document.getElementById('price-sub-scale').textContent = `billed annually: ${currency.symbol}${scaleRate * 12}/yr`;
    } else {
      document.getElementById('price-sub-scale').textContent = 'billed monthly';
    }
    
    // Enterprise
    const entRate = Math.round(
      pricingMatrix.tiers.enterprise.baseRate * 
      currency.rate * 
      currency.regionalTariff * 
      cycle.discount * 
      currentSliderMultiplier
    );
    document.getElementById('price-cur-enterprise').textContent = currency.symbol;
    document.getElementById('price-val-enterprise').textContent = entRate;
    document.getElementById('price-dur-enterprise').textContent = cycle.durationLabel;
    if (currentCycle === 'annual') {
      document.getElementById('price-sub-enterprise').textContent = `billed annually: ${currency.symbol}${entRate * 12}/yr`;
    } else {
      document.getElementById('price-sub-enterprise').textContent = 'billed monthly';
    }
  }

  // Bind Slider Input
  if (ingestSlider && sliderValueDisplay) {
    ingestSlider.addEventListener('input', (e) => {
      currentSliderMultiplier = parseFloat(e.target.value);
      sliderValueDisplay.textContent = `${currentSliderMultiplier.toFixed(1)}x Load`;
      updatePrices();
    });
  }

  // Bind Currency Selector
  const currencySelect = document.getElementById('currency-select');
  if (currencySelect) {
    currencySelect.addEventListener('change', (e) => {
      currentCurrency = e.target.value;
      updatePrices();
    });
  }

  // Bind Cycle Selector options
  const billingSwitcher = document.getElementById('billing-switcher');
  if (billingSwitcher) {
    const options = billingSwitcher.querySelectorAll('.cycle-option');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        currentCycle = opt.getAttribute('data-cycle');
        updatePrices();
      });
    });
  }

  // Run initial pricing calculations
  updatePrices();

  /* ==========================================================================
     FEATURE 2: Bento-to-Accordion Wrapper with Context Lock (Sync)
     ========================================================================== */
  let activeFeatureIndex = 0;

  function syncActiveFeature() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      const accordionItems = document.querySelectorAll('.accordion-item');
      accordionItems.forEach((item, idx) => {
        const content = item.querySelector('.accordion-content');
        if (idx === activeFeatureIndex) {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
          content.style.opacity = '1';
        } else {
          item.classList.remove('active');
          content.style.maxHeight = '0';
          content.style.opacity = '0';
        }
      });
    } else {
      const bentoCards = document.querySelectorAll('.bento-card');
      bentoCards.forEach((card, idx) => {
        if (idx === activeFeatureIndex) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }
  }

  // Bento cards hover triggers (Desktop)
  const bentoCards = document.querySelectorAll('.bento-card');
  bentoCards.forEach((card, idx) => {
    card.addEventListener('mouseenter', () => {
      if (activeFeatureIndex !== idx) {
        activeFeatureIndex = idx;
        bentoCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      }
    });
  });

  // Accordion click triggers (Mobile)
  const accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach((item, idx) => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
      if (activeFeatureIndex !== idx) {
        activeFeatureIndex = idx;
        syncActiveFeature();
      }
    });
  });

  // Window resize listener
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    const currentWidth = window.innerWidth;
    const crossedBreakpoint = (lastWidth > 768 && currentWidth <= 768) || (lastWidth <= 768 && currentWidth > 768);
    if (crossedBreakpoint) {
      syncActiveFeature();
    }
    lastWidth = currentWidth;
  });

  // Initial Sync
  syncActiveFeature();

  /* ==========================================================================
     Scroll-Triggered Section Themes & Navigation Sync
     ========================================================================== */
  const domSections = document.querySelectorAll('section[id]');
  const scrollDots = document.querySelectorAll('.scroll-dot');

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -30% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        // Remove all previous active states from body
        document.body.className = document.body.className
          .split(' ')
          .filter(c => !c.startsWith('active-section-'))
          .join(' ');
        
        // Add current active section class to body
        document.body.classList.add(`active-section-${id}`);
        
        // Update active class on scroll-nav dots
        scrollDots.forEach(dot => {
          if (dot.getAttribute('data-section') === id) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  domSections.forEach(section => {
    observer.observe(section);
  });

  /* ==========================================================================
     3D Content Reveal on Scroll
     ========================================================================== */
  const revealElements = document.querySelectorAll('.scroll-reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Once revealed, we don't need to observe it anymore
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -8% 0px', // Trigger slightly before entering viewport fully
    threshold: 0.05
  });

  // Set up staggered delays inside grids for a synchronized motion entry
  const revealContainers = document.querySelectorAll('.bento-grid, .pricing-grid, .testimonials-grid, .accordion-wrapper');
  revealContainers.forEach(container => {
    const cards = container.querySelectorAll('.scroll-reveal');
    cards.forEach((card, idx) => {
      card.style.transitionDelay = `${idx * 120}ms`;
    });
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  /* ==========================================================================
     Custom Mouse Cursor Glow Pointer & Parallax Scroll Effects
     ========================================================================== */
  const cursor = document.getElementById('custom-cursor');
  const cursorDot = document.getElementById('custom-cursor-dot');
  
  let mouseCoords = { x: -100, y: -100 };
  let cursorCoords = { x: -100, y: -100 };
  let cursorDotCoords = { x: -100, y: -100 };
  let isHovered = false;

  window.addEventListener('mousemove', (e) => {
    mouseCoords.x = e.clientX;
    mouseCoords.y = e.clientY;
  });

  // Track hover states for links and buttons to expand cursor
  const hoverableSelector = 'a, button, select, input, .ide-tab, .cycle-option, .accordion-header';
  
  function updateHoverListeners() {
    const hoverables = document.querySelectorAll(hoverableSelector);
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        isHovered = true;
        if (cursor) {
          cursor.style.transform = 'translate(-50%, -50%) scale(1.6)';
          cursor.style.backgroundColor = 'rgba(255, 200, 1, 0.05)';
          cursor.style.borderColor = 'var(--deep-saffron)';
        }
      });
      el.addEventListener('mouseleave', () => {
        isHovered = false;
        if (cursor) {
          cursor.style.transform = 'translate(-50%, -50%) scale(1)';
          cursor.style.backgroundColor = 'rgba(255, 200, 1, 0.15)';
          cursor.style.borderColor = 'var(--forsythia)';
        }
      });
    });
  }
  updateHoverListeners();

  // Custom Cursor Tick loop
  function updateCursor() {
    // Ease the cursor movement (0.15 interpolation speed)
    cursorCoords.x += (mouseCoords.x - cursorCoords.x) * 0.15;
    cursorCoords.y += (mouseCoords.y - cursorCoords.y) * 0.15;
    
    // Ease the center dot (0.35 interpolation speed for tight lag)
    cursorDotCoords.x += (mouseCoords.x - cursorDotCoords.x) * 0.35;
    cursorDotCoords.y += (mouseCoords.y - cursorDotCoords.y) * 0.35;

    if (cursor) {
      cursor.style.left = `${cursorCoords.x}px`;
      cursor.style.top = `${cursorCoords.y}px`;
    }
    if (cursorDot) {
      cursorDot.style.left = `${cursorDotCoords.x}px`;
      cursorDot.style.top = `${cursorDotCoords.y}px`;
    }

    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  // Parallax Scroll calculations
  const parallaxNode1 = document.getElementById('parallax-node-1');
  const parallaxNode2 = document.getElementById('parallax-node-2');
  const parallaxNode3 = document.getElementById('parallax-node-3');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    if (parallaxNode1) {
      parallaxNode1.style.transform = `translateY(${scrollY * 0.18}px) rotate(${scrollY * 0.015}deg)`;
    }
    if (parallaxNode2) {
      parallaxNode2.style.transform = `translateY(${scrollY * -0.12}px) rotate(${scrollY * -0.01}deg)`;
    }
    if (parallaxNode3) {
      parallaxNode3.style.transform = `translateY(${scrollY * 0.1}px) rotate(${scrollY * 0.005}deg)`;
    }
  });

  /* ==========================================================================
     Manga-Style Section-Driven Dialogue & Gesture Engine
     ========================================================================== */
  const sections = [
    { name: 'hero', element: document.querySelector('.dashboard-container') },
    { name: 'features', element: document.getElementById('features') },
    { name: 'pricing', element: document.getElementById('pricing') },
    { name: 'testimonials', element: document.getElementById('testimonials') },
    { name: 'demo', element: document.getElementById('demo') }
  ];

  // Manga-style intro sequence (shown one by one on the hero section)
  const heroIntroSequence = [
    { text: "⚡ TA-DAAA!! ⚡", delay: 0 },
    { text: "I am... AETHER-01!!", delay: 1400 },
    { text: "Your LEGENDARY autonomous pipeline assistant!! *WAAAVE*", delay: 3000 },
    { text: "Born in the depths of the edge cluster... forged in sub-millisecond latency!!", delay: 5200 },
    { text: "I can orchestrate ANY payload, replicate across 24 NODES, and synthesize schemas IN THE BLINK OF AN EYE!!", delay: 7800 },
    { text: "I shall guide you through this realm, Architect. Scroll down... and let the journey begin! ↓", delay: 11000 }
  ];

  const dialogues = {
    hero: [
      "⚡ TA-DAAA!! ⚡  I am AETHER-01!! Your legendary pipeline assistant!!",
      "Born in edge clusters, forged in sub-millisecond latency! I can synthesize ANY schema!",
      "Scroll down, Architect... and let me guide you through this realm! ↓"
    ],
    features: [
      "👀 BEHOLD!! This is my CORE ENGINE ROOM!",
      "Pipeline Auto-Synthesis!! I devour raw JSON and spit out optimized schemas INSTANTLY!!",
      "Anomaly Quarantine!! Bad records?? I CONTAIN them before they corrupt your database!!",
      "Global Edge Replication!! 24 nodes... SYNCHRONIZED... in sub-millisecond time!!"
    ],
    pricing: [
      "💰 Ah yes... the PRICING ZONE! Choose your battle tier, Architect!",
      "The ingestion slider adjusts throughput in REAL TIME — zero re-renders, pure performance!!",
      "Switch currencies between USD, EUR, and INR! We handle EVERY region of the realm!!",
      "The SCALE tier is my personal favourite... *wink*"
    ],
    testimonials: [
      "🌟 These are the TESTIMONIALS of fallen architects... who ascended with Aether.AI!!",
      "Jared eliminated 1,200 lines of YAML... with ZERO!! Our auto-synthesis did the rest!",
      "Ananya cut database load by 45%!! Schema checks at the EDGE!!",
      "Marcus synced 24 nodes in sub-millisecond! The GALAXY trembles before our replication engine!!"
    ],
    demo: [
      "🎬 And so... we reach the FINAL CHAPTER!!",
      "Watch the demo... see the speed run in action... witness the POWER of Aether.AI!!",
      "It has been an honour guiding you today, Architect. Now go... DEPLOY YOUR PIPELINE!!",
      "...Oh! One more thing — HOPE I WIN THIS FRONTEND BATTLE!! 🏆✨  *MEGA WAVE BYE BYE!!* 👋👋"
    ]
  };

  const speechBubble = document.getElementById('robot-speech-bubble');
  const speechText = speechBubble ? speechBubble.querySelector('.speech-content-text') : null;
  let dialogueCycleInterval = null;
  let sectionDialogueIndex = 0;
  let introPlayed = false;

  function speakText(text) {
    if (!speechBubble || !speechText) return;
    speechBubble.classList.remove('active');
    setTimeout(() => {
      speechText.textContent = text;
      speechBubble.classList.add('active');
    }, 200);
  }

  function speakActiveDialogue() {
    speakText(dialogues[activeSectionName][sectionDialogueIndex]);
  }

  function playHeroIntro() {
    if (introPlayed) return;
    introPlayed = true;

    // Both arms raised upward for the grand intro
    targetRotL.x = -1.4; targetRotL.y = 0; targetRotL.z = -0.3;
    targetRotR.x = -1.4; targetRotR.y = 0; targetRotR.z = 0.3;

    // Sequence the intro dialogue with delays
    heroIntroSequence.forEach(({ text, delay }) => {
      setTimeout(() => {
        speakText(text);
      }, delay + 1200); // offset by loader fade time
    });

    // After intro, switch to cycling
    const totalIntroTime = heroIntroSequence[heroIntroSequence.length - 1].delay + 1200 + 4000;
    setTimeout(() => {
      sectionDialogueIndex = 0;
      if (activeSectionName === 'hero') {
        startDialogueCycle('hero');
        // Transition to waving right hand after intro
        targetRotL.x = 0; targetRotL.y = 0; targetRotL.z = 0.15;
        targetRotR.x = 0; targetRotR.y = 0; targetRotR.z = 2.2;
      }
    }, totalIntroTime);
  }

  function startDialogueCycle(sectionName) {
    if (dialogueCycleInterval) clearInterval(dialogueCycleInterval);
    speakActiveDialogue();
    dialogueCycleInterval = setInterval(() => {
      sectionDialogueIndex = (sectionDialogueIndex + 1) % dialogues[sectionName].length;
      speakActiveDialogue();
    }, 5000);
  }

  function updateGestures(sectionName) {
    switch (sectionName) {
      case 'hero':
        if (introPlayed) {
          // After intro: classic right arm wave
          targetRotL.x = 0; targetRotL.y = 0; targetRotL.z = 0.15;
          targetRotR.x = 0; targetRotR.y = 0; targetRotR.z = 2.2;
        } else {
          // During intro: BOTH arms raised high
          targetRotL.x = -1.4; targetRotL.y = 0; targetRotL.z = -0.3;
          targetRotR.x = -1.4; targetRotR.y = 0; targetRotR.z = 0.3;
        }
        break;
      case 'features':
        // Left arm sweeps out presenting the bento grid
        targetRotL.x = 0.2; targetRotL.y = 0.3; targetRotL.z = -1.4;
        targetRotR.x = 0; targetRotR.y = 0; targetRotR.z = -0.15;
        break;
      case 'pricing':
        // Right arm points toward pricing slider
        targetRotL.x = 0; targetRotL.y = 0; targetRotL.z = 0.15;
        targetRotR.x = 0.4; targetRotR.y = -0.3; targetRotR.z = 1.0;
        break;
      case 'testimonials':
        // Both arms open wide — welcoming gesture
        targetRotL.x = 0.4; targetRotL.y = 0; targetRotL.z = -0.9;
        targetRotR.x = 0.4; targetRotR.y = 0; targetRotR.z = 0.9;
        break;
      case 'demo':
        // FAREWELL — both arms raised up waving goodbye
        targetRotL.x = -1.2; targetRotL.y = 0.2; targetRotL.z = -0.4;
        targetRotR.x = -1.2; targetRotR.y = -0.2; targetRotR.z = 0.4;
        break;
    }
  }

  function onSectionChanged(sectionName) {
    activeSectionName = sectionName;
    sectionDialogueIndex = 0;
    if (dialogueCycleInterval) clearInterval(dialogueCycleInterval);
    updateGestures(sectionName);
    startDialogueCycle(sectionName);
    // Pulse ring on companion circle to signal section change
    // Pulse the HUD avatar circle (body-level element — never trapped by transforms)
    const hudAvatar = document.getElementById('robot-hud-avatar');
    if (hudAvatar) {
      hudAvatar.classList.remove('section-pulse');
      void hudAvatar.offsetWidth;
      hudAvatar.classList.add('section-pulse');
      setTimeout(() => hudAvatar.classList.remove('section-pulse'), 700);
    }
  }

  const robotHud = document.getElementById('robot-companion-hud');

  function updateActiveSection() {
    const scrollY = window.scrollY;

    // Show the fixed HUD companion once user scrolls past hero
    if (robotHud) {
      if (scrollY > window.innerHeight * 0.6) {
        robotHud.classList.add('hud-visible');
      } else {
        robotHud.classList.remove('hud-visible');
      }
    }

    let current = 'hero';
    for (const section of sections) {
      if (section.element) {
        const rect = section.element.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.55) {
          current = section.name;
        }
      }
    }

    if (current !== activeSectionName) {
      onSectionChanged(current);
    }
  }

  window.addEventListener('scroll', updateActiveSection);

  // Play hero intro after loader fades (~1.7s)
  setTimeout(() => {
    activeSectionName = 'hero';
    playHeroIntro();
  }, 1800);

  // Click the HUD avatar OR center panel to advance dialogue
  const hudAvatar = document.getElementById('robot-hud-avatar');
  if (hudAvatar) {
    hudAvatar.addEventListener('click', () => {
      sectionDialogueIndex = (sectionDialogueIndex + 1) % dialogues[activeSectionName].length;
      speakActiveDialogue();
    });
    hudAvatar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        sectionDialogueIndex = (sectionDialogueIndex + 1) % dialogues[activeSectionName].length;
        speakActiveDialogue();
      }
    });
  }

  const centerPanel = document.querySelector('.center-panel');
  if (centerPanel) {
    centerPanel.style.cursor = 'pointer';
    centerPanel.addEventListener('click', () => {
      sectionDialogueIndex = (sectionDialogueIndex + 1) % dialogues[activeSectionName].length;
      speakActiveDialogue();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
