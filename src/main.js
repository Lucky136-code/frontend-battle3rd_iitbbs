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

    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        mouse.targetX = e.clientX - rect.left;
        mouse.targetY = e.clientY - rect.top;
      });
      heroSection.addEventListener('mouseleave', () => {
        mouse.targetX = width / 2;
        mouse.targetY = height / 2;
      });
    }

    // Initialize 3D Sphere Particles (Fibonacci distribution)
    const particles = [];
    const particleCount = 110;
    
    // Config values based on screen size
    let isMobile = window.innerWidth <= 768;
    let sphereRadius = isMobile ? 120 : 210;
    
    window.addEventListener('resize', () => {
      isMobile = window.innerWidth <= 768;
      sphereRadius = isMobile ? 120 : 210;
    });

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = i * 2.39996; // Golden angle
      
      particles.push({
        x: Math.cos(theta) * radiusAtY * sphereRadius,
        y: y * sphereRadius,
        z: Math.sin(theta) * radiusAtY * sphereRadius,
        baseX: Math.cos(theta) * radiusAtY,
        baseY: y,
        baseZ: Math.sin(theta) * radiusAtY,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // Define 3D wireframe connection indices
    const connections = [];
    for (let i = 0; i < particleCount; i++) {
      if (i < particleCount - 1) connections.push([i, i + 1]);
      if (i < particleCount - 6) connections.push([i, i + 6]);
      if (i < particleCount - 12) connections.push([i, i + 12]);
    }

    // Telemetry labels to draw (Jarvis overlay)
    const telemetryTexts = [
      "AETHER // EDGE_01",
      "STATUS: ACTIVE",
      "LATENCY: 0.18ms",
      "SLA: 99.99%",
      "REPLICAS: 24",
      "INGEST_SYS: OK",
      "SCHEMA: VALID",
      "MUTATION: LOCKED"
    ];
    
    // Assign labels to specific particles on the side
    const labeledParticles = [10, 25, 40, 55, 70, 85, 95, 105];

    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;

    function animateParticles(time) {
      ctx.clearRect(0, 0, width, height);

      // Smoothly ease mouse coordinates
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const centerX = width / 2;
      const centerY = height / 2 - 20;

      // Base rotation + interactive mouse tilting
      const targetRotX = (mouse.y - height / 2) * 0.0006;
      const targetRotY = (mouse.x - width / 2) * 0.0006;
      
      rotX += (targetRotX - rotX) * 0.05 + 0.0015;
      rotY += (targetRotY - rotY) * 0.05 + 0.0025;
      rotZ += 0.0008;

      // Projection parameters
      const d = 400; // Camera distance

      // Project particles in 3D
      const projected = particles.map(p => {
        // Pulse radius slightly for dynamic breathing effect
        p.pulsePhase += p.pulseSpeed;
        const pulse = 1 + Math.sin(p.pulsePhase) * 0.03;
        
        let x = p.baseX * sphereRadius * pulse;
        let y = p.baseY * sphereRadius * pulse;
        let z = p.baseZ * sphereRadius * pulse;

        // Rotate X
        let cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        let y1 = y * cosX - z * sinX;
        let z1 = y * sinX + z * cosX;

        // Rotate Y
        let cosY = Math.cos(rotY), sinY = Math.sin(rotY);
        let x2 = x * cosY - z1 * sinY;
        let z2 = x * sinY + z1 * cosY;

        // Rotate Z
        let cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);
        let x3 = x2 * cosZ - y1 * sinZ;
        let y3 = x2 * sinZ + y1 * cosZ;

        // Perspective Projection
        const scale = d / (d + z2);
        const sx = centerX + x3 * scale;
        const sy = centerY + y3 * scale;

        return { sx, sy, zDepth: z2, scale, visible: sx >= 0 && sx <= width && sy >= 0 && sy <= height };
      });

      // Draw 3D Telemetry HUD Circles (Jarvis Dials)
      const ringRadii = [sphereRadius * 1.15, sphereRadius * 1.3, sphereRadius * 1.45];
      ringRadii.forEach((r, idx) => {
        ctx.beginPath();
        const steps = 60;
        const speedMultiplier = idx % 2 === 0 ? 1 : -1.2;
        const angleOffset = (time * 0.0004) * speedMultiplier;
        
        for (let i = 0; i <= steps; i++) {
          const theta = (i / steps) * Math.PI * 2 + angleOffset;
          let x = Math.cos(theta) * r;
          let z = Math.sin(theta) * r;
          let y = 0;

          // Tilts the ring slightly on X-Y-Z
          const tiltX = 0.4 * (idx - 1);
          const tiltY = 0.3 * (idx - 1);
          
          // Apply tilts/rotations
          let cosTX = Math.cos(rotX + tiltX), sinTX = Math.sin(rotX + tiltX);
          let y1 = y * cosTX - z * sinTX;
          let z1 = y * sinTX + z * cosTX;

          let cosTY = Math.cos(rotY + tiltY), sinTY = Math.sin(rotY + tiltY);
          let x2 = x * cosTY - z1 * sinTY;
          let z2 = x * sinTY + z1 * cosTY;

          const scale = d / (d + z2);
          const sx = centerX + x2 * scale;
          const sy = centerY + y1 * scale;

          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        
        // Custom styling for Jarvis HUD rings
        if (idx === 0) {
          ctx.strokeStyle = 'rgba(217, 232, 226, 0.06)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (idx === 1) {
          // Dash style
          ctx.strokeStyle = 'rgba(255, 200, 1, 0.08)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 12]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          // Subtle outer coordinate boundary
          ctx.strokeStyle = 'rgba(17, 76, 90, 0.1)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      // Draw Connections (Mesh lines)
      connections.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];

        if (p1.visible && p2.visible) {
          // Opacity based on average depth (Z coordinate)
          const avgDepth = (p1.zDepth + p2.zDepth) / 2;
          // Normalize depth from sphereRadius (front) to -sphereRadius (back)
          let alpha = (1 - (avgDepth + sphereRadius) / (sphereRadius * 2)) * 0.15;
          if (alpha < 0.01) return;

          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.strokeStyle = `rgba(217, 232, 226, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      });

      // Draw Particles (Nodes)
      projected.forEach((p, idx) => {
        if (!p.visible) return;

        // Scale opacity based on depth
        let alpha = (1 - (p.zDepth + sphereRadius) / (sphereRadius * 2)) * 0.55;
        if (alpha < 0.05) return;

        ctx.beginPath();
        const size = (p.scale * 2.5) * (1 - (p.zDepth + sphereRadius) / (sphereRadius * 2.5));
        ctx.arc(p.sx, p.sy, Math.max(0.5, size), 0, Math.PI * 2);
        
        // Alternate colors for node accents
        if (idx % 8 === 0) {
          ctx.fillStyle = `rgba(255, 200, 1, ${alpha + 0.25})`; // Forsythia gold node
        } else if (idx % 12 === 0) {
          ctx.fillStyle = `rgba(255, 154, 50, ${alpha + 0.25})`; // Deep Saffron node
        } else {
          ctx.fillStyle = `rgba(217, 232, 226, ${alpha})`; // Mystic mint node
        }
        ctx.fill();

        // Draw HUD scan telemetry labels (Jarvis overlays)
        const labelIdx = labeledParticles.indexOf(idx);
        if (labelIdx !== -1 && !isMobile) {
          const text = telemetryTexts[labelIdx];
          const isRight = p.sx > centerX;
          const lineLength = 40;
          const textOffset = isRight ? 8 : -8;
          
          ctx.beginPath();
          ctx.moveTo(p.sx, p.sy);
          
          const endX = p.sx + (isRight ? lineLength : -lineLength);
          ctx.lineTo(endX, p.sy);
          ctx.strokeStyle = `rgba(255, 200, 1, ${alpha * 0.6})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Draw the telemetry text label
          ctx.font = '7.5px monospace';
          ctx.fillStyle = `rgba(255, 200, 1, ${alpha * 0.85})`;
          ctx.textAlign = isRight ? 'left' : 'right';
          ctx.fillText(text, endX + textOffset, p.sy + 2.5);
        }
      });

      // Draw horizontal sweeping scanner line (Jarvis laser)
      const sweepY = centerY + Math.sin(time * 0.0015) * sphereRadius;
      ctx.beginPath();
      ctx.moveTo(centerX - sphereRadius * 1.1, sweepY);
      ctx.lineTo(centerX + sphereRadius * 1.1, sweepY);
      const sweepGradient = ctx.createLinearGradient(centerX - sphereRadius, 0, centerX + sphereRadius, 0);
      sweepGradient.addColorStop(0, 'rgba(255, 200, 1, 0)');
      sweepGradient.addColorStop(0.5, 'rgba(255, 200, 1, 0.16)');
      sweepGradient.addColorStop(1, 'rgba(255, 200, 1, 0)');
      ctx.strokeStyle = sweepGradient;
      ctx.lineWidth = 1;
      ctx.stroke();

      requestAnimationFrame((t) => animateParticles(t));
    }
    requestAnimationFrame((t) => animateParticles(t));
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

  /* ==========================================================================
     Scroll-Triggered Section Themes & Navigation Sync
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');
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

  sections.forEach(section => {
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
});
