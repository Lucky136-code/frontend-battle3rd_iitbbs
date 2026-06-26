import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     Countdown Timer (JetBrains Mono)
     ========================================================================== */
  let timeLeft = 2 * 60 * 60 * 1000 + 14 * 60 * 1000 + 55 * 1000; // 2h 14m 55s
  const countdownEl = document.getElementById('countdown-timer');
  const startTime = Date.now();

  function updateCountdown() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, timeLeft - elapsed);
    
    const hours = Math.floor(remaining / (3600 * 1000));
    const mins = Math.floor((remaining % (3600 * 1000)) / (60 * 1000));
    const secs = Math.floor((remaining % (60 * 1000)) / 1000);
    const ms = Math.floor((remaining % 1000) / 10);
    
    if (countdownEl) {
      countdownEl.textContent = 
        `${String(hours).padStart(2, '0')}h : ` +
        `${String(mins).padStart(2, '0')}m : ` +
        `${String(secs).padStart(2, '0')}s : ` +
        `${String(ms).padStart(2, '0')}ms`;
    }
    
    if (remaining > 0) {
      requestAnimationFrame(updateCountdown);
    }
  }
  requestAnimationFrame(updateCountdown);

  /* ==========================================================================
     Interactive Canvas Particle Background (Google / Sony Style)
     ========================================================================== */
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    });

    const particles = [];
    const particleCount = 45;
    const maxDistance = 110;
    
    let mouse = { x: null, y: null, targetX: null, targetY: null };
    
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        mouse.targetX = e.clientX - rect.left;
        mouse.targetY = e.clientY - rect.top;
      });
      
      heroSection.addEventListener('mouseleave', () => {
        mouse.targetX = null;
        mouse.targetY = null;
      });
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        color: i % 2 === 0 ? 'rgba(255, 200, 1, 0.4)' : 'rgba(255, 154, 50, 0.4)'
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      // Ease mouse coordinates
      if (mouse.targetX !== null && mouse.targetY !== null) {
        if (mouse.x === null) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.1;
          mouse.y += (mouse.targetY - mouse.y) * 0.1;
        }
      } else {
        mouse.x = null;
        mouse.y = null;
      }

      // Update & Draw Particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce check
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Magnet attraction to mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            p.x += dx * 0.003;
            p.y += dy * 0.003;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Connect lines
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const alpha = (1 - dist / maxDistance) * 0.12;
            ctx.strokeStyle = `rgba(217, 232, 227, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Draw connections to mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            const alpha = (1 - dist / 150) * 0.18;
            ctx.strokeStyle = `rgba(255, 200, 1, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animateParticles);
    }
    requestAnimationFrame(animateParticles);
  }

  /* ==========================================================================
     Apple 3D Hover Tilt Effect
     ========================================================================== */
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const px = x / rect.width;
      const py = y / rect.height;
      
      // Calculate tilts (-6deg to +6deg)
      const rx = (py - 0.5) * -12;
      const ry = (px - 0.5) * 12;
      
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  /* ==========================================================================
     Rolling Counter Stats Animation (Count Up on Load)
     ========================================================================== */
  function animateCounters() {
    const stats = [
      { id: 'stat-accuracy', start: 90.00, end: 99.99, decimals: 2 },
      { id: 'stat-sla', start: 1.50, end: 0.18, decimals: 2 },
      { id: 'stat-replicas', start: 0, end: 24, decimals: 0 }
    ];

    const duration = 1800; // ms
    const frameRate = 60;
    const totalFrames = Math.round(duration / (1000 / frameRate));

    stats.forEach(stat => {
      const el = document.getElementById(stat.id);
      if (!el) return;
      
      let frame = 0;
      const step = () => {
        frame++;
        const progress = frame / totalFrames;
        // EaseOutExpo curve
        const easeVal = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = stat.start + (stat.end - stat.start) * easeVal;
        
        el.textContent = current.toFixed(stat.decimals);
        
        if (frame < totalFrames) {
          requestAnimationFrame(step);
        } else {
          el.textContent = stat.end.toFixed(stat.decimals);
        }
      };
      requestAnimationFrame(step);
    });
  }
  // Delay slightly to coordinate with fade-in entry animation
  setTimeout(animateCounters, 300);

  /* ==========================================================================
     IDE Workspace Tab Switcher
     ========================================================================== */
  const tabEditor = document.getElementById('tab-editor');
  const tabLogs = document.getElementById('tab-logs');
  const panelEditor = document.getElementById('panel-editor');
  const panelLogs = document.getElementById('panel-logs');

  if (tabEditor && tabLogs && panelEditor && panelLogs) {
    tabEditor.addEventListener('click', () => {
      tabEditor.classList.add('active');
      tabLogs.classList.remove('active');
      panelEditor.style.display = 'block';
      panelLogs.style.display = 'none';
    });

    tabLogs.addEventListener('click', () => {
      tabLogs.classList.add('active');
      tabEditor.classList.remove('active');
      panelLogs.style.display = 'block';
      panelEditor.style.display = 'none';
    });
  }

  /* ==========================================================================
     Live Simulator (Terminal logs inside IDE panel)
     ========================================================================== */
  const logTemplates = [
    { type: 'info', text: 'Received payload from client-node-14 (size: 4.8 KB)' },
    { type: 'success', text: 'Schema auto-synthesized: auto_gen_schema_837.json' },
    { type: 'success', text: 'Pipeline auto-compiled. Execution time: 0.18ms' },
    { type: 'info', text: 'Replicating state partition to 24 edge nodes...' },
    { type: 'success', text: 'Consistency sync complete in 0.82ms' },
    { type: 'warn', text: 'Drift detected on field "user_meta.phone" - isolated to quarantine sandbox' },
    { type: 'success', text: 'System status nominal. Global throughput: 1,245.82 events/sec' },
    { type: 'info', text: 'Ingested raw payload from edge-us-west-2 (size: 12.3 KB)' },
    { type: 'success', text: 'Consensus achieved across 24 edge database replicas' },
    { type: 'warn', text: 'Unregistered schema pattern detected. Executing auto-synthesis...' }
  ];

  function addTerminalLine() {
    if (!panelLogs) return;
    
    const tmpl = logTemplates[Math.floor(Math.random() * logTemplates.length)];
    const lineEl = document.createElement('div');
    lineEl.className = 'term-line';
    
    let contentHtml = `<span class="term-prompt">&gt;</span> `;
    if (tmpl.type === 'success') {
      contentHtml += `<span class="term-success">[SUCCESS] ${tmpl.text}</span>`;
    } else if (tmpl.type === 'warn') {
      contentHtml += `<span class="term-warn">[WARN] ${tmpl.text}</span>`;
    } else {
      contentHtml += `<span class="term-info">[INFO] ${tmpl.text}</span>`;
    }
    
    lineEl.innerHTML = contentHtml;
    panelLogs.appendChild(lineEl);
    
    while (panelLogs.children.length > 30) {
      panelLogs.removeChild(panelLogs.firstChild);
    }
    
    panelLogs.scrollTop = panelLogs.scrollHeight;
  }

  // Pre-seed and loop console logs
  for (let i = 0; i < 6; i++) {
    addTerminalLine();
  }
  setInterval(addTerminalLine, 1800);

  /* ==========================================================================
     IDE Diagnostics Side Panel (Flutters and Rolling SVG Wave Graph)
     ========================================================================== */
  const latencyDisplay = document.getElementById('health-latency');
  const cpuDisplay = document.getElementById('health-cpu');
  const graphWavePath = document.getElementById('graph-wave-path');

  // Flutter Latency & CPU numbers
  setInterval(() => {
    if (latencyDisplay) {
      const currentLatency = (Math.random() * 0.06 + 0.16).toFixed(2);
      latencyDisplay.textContent = `${currentLatency}ms`;
    }
  }, 1400);

  setInterval(() => {
    if (cpuDisplay) {
      const currentCpu = (Math.random() * 2.8 + 3.8).toFixed(1);
      cpuDisplay.textContent = `${currentCpu}%`;
    }
  }, 1000);

  // Rolling Throughput Graph (Path Generation)
  let wavePoints = [20, 20, 20, 20, 20, 20, 20, 20, 20, 20];
  function updateWavePath() {
    if (!graphWavePath) return;

    // Shift left and append new random height
    wavePoints.shift();
    wavePoints.push(Math.round(Math.random() * 26 + 7)); // Range 7 to 33 height

    // Build SVG path string with quadratic bezier curves
    let d = `M 0,${wavePoints[0]} `;
    for (let i = 0; i < wavePoints.length - 1; i++) {
      const currentX = (i / (wavePoints.length - 1)) * 100;
      const nextX = ((i + 1) / (wavePoints.length - 1)) * 100;
      const cpX = (currentX + nextX) / 2;
      const cpY = wavePoints[i];
      d += `Q ${cpX},${cpY} ${nextX},${wavePoints[i+1]} `;
    }
    graphWavePath.setAttribute('d', d);
  }
  setInterval(updateWavePath, 450);

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
});
