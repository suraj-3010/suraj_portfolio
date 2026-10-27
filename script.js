/**
 * SURAJ KUMAR // PORTFOLIO INTERACTIVE CORE ENGINE
 * Stack: Pure Vanilla JavaScript ES6+
 * Features: Web Audio API Synthesizer, 3D Tilt, Particle/Matrix/Stars Canvas,
 *           Interactive Terminal CLI, Radar Canvas, Profile Customizer & Live Sync.
 */

(function () {
  'use strict';

  // ==========================================
  // 1. STATE & USER PROFILE DEFAULTS
  // ==========================================
  const defaultProfile = {
    name: 'Suraj Kumar',
    degree: '1st Year B.Tech CSE (AI & ML)',
    college: 'Engineering Institute of Technology',
    email: 'surajkumar.cse.aiml@gmail.com',
    github: 'github.com/surajkumar-dev',
    linkedin: 'linkedin.com/in/suraj-kumar-aiml',
    location: 'India • Open to Global Remote Opportunities',
    tagline: 'An unstoppable 1st-year AI/ML developer turning impossible ideas into code.'
  };

  let profile = Object.assign({}, defaultProfile);
  try {
    const saved = localStorage.getItem('suraj_portfolio_profile');
    if (saved) {
      profile = Object.assign({}, defaultProfile, JSON.parse(saved));
    }
  } catch (e) {
    console.warn('Storage access limited', e);
  }

  // ==========================================
  // 2. PROCEDURAL WEB AUDIO SYNTHESIZER
  // ==========================================
  let audioCtx = null;
  let isSoundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  const Sound = {
    hover() {
      if (!isSoundEnabled || !audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(640, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } catch (err) {}
    },

    click() {
      if (!isSoundEnabled || !audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } catch (err) {}
    },

    success() {
      if (!isSoundEnabled || !audioCtx) return;
      try {
        const now = audioCtx.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);

          gain.gain.setValueAtTime(0.03, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.2);

          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.2);
        });
      } catch (err) {}
    },

    terminal() {
      if (!isSoundEnabled || !audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100 + Math.random() * 200, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
      } catch (err) {}
    }
  };

  // Sound Toggle Control
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundLabel = document.getElementById('soundLabel');
  const soundBars = soundToggleBtn ? soundToggleBtn.querySelector('.sound-bars') : null;

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      initAudio();
      isSoundEnabled = !isSoundEnabled;
      if (soundLabel) soundLabel.textContent = isSoundEnabled ? 'SFX ON' : 'SFX MUTED';
      if (soundBars) {
        if (isSoundEnabled) soundBars.classList.add('active');
        else soundBars.classList.remove('active');
      }
      if (isSoundEnabled) Sound.success();
      showToast(isSoundEnabled ? '🔊 Cyber Audio Synthesizer: ACTIVE' : '🔇 Audio Synthesizer: MUTED');
    });
  }

  // Auto-init audio on first user interaction
  window.addEventListener('click', initAudio, { once: true });
  window.addEventListener('keydown', initAudio, { once: true });

  // ==========================================
  // 3. CANVAS BACKGROUND VISUAL ENGINE
  // Modes: 1. Neural Constellation | 2. Matrix Rain | 3. Quantum Stars
  // ==========================================
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let canvasMode = 'neural'; // 'neural' | 'matrix' | 'stars'
  let animationFrameId = null;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initCanvasMode();
  });

  const mouse = { x: width / 2, y: height / 2, active: false };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // --- Neural Constellation Mode ---
  const particles = [];
  const PARTICLE_COUNT = Math.min(75, Math.floor((width * height) / 16000));

  function createNeuralParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.4 ? 'rgba(0, 240, 255, ' : 'rgba(157, 78, 221, ',
        alpha: Math.random() * 0.6 + 0.3
      });
    }
  }

  function renderNeural() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Mouse attraction
      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 150) {
          p.x += (dx / dist) * 0.6;
          p.y += (dy / dist) * 0.6;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00f0ff';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Connect with near particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 130) {
          const lineAlpha = (1 - dist / 130) * 0.25;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  // --- Matrix Rain Mode ---
  const matrixChars = '0123456789ABCDEFアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ';
  const fontSize = 14;
  let columns = Math.floor(width / fontSize);
  let drops = [];

  function createMatrixDrops() {
    columns = Math.floor(width / fontSize);
    drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }
  }

  function renderMatrix() {
    ctx.fillStyle = 'rgba(6, 7, 13, 0.08)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#00f0ff';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      if (Math.random() > 0.95) ctx.fillStyle = '#ffffff';
      else if (Math.random() > 0.85) ctx.fillStyle = '#ff007f';
      else ctx.fillStyle = '#00ff9d';

      ctx.fillText(char, x, y);

      if (y > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  // --- Quantum Stars Mode ---
  const stars = [];
  const STAR_COUNT = 180;
  function createStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width,
        y: (Math.random() - 0.5) * height,
        z: Math.random() * width
      });
    }
  }

  function renderStars() {
    ctx.fillStyle = 'rgba(6, 7, 13, 0.2)';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      star.z -= 4;
      if (star.z <= 0) {
        star.z = width;
        star.x = (Math.random() - 0.5) * width;
        star.y = (Math.random() - 0.5) * height;
      }

      const k = 128.0 / star.z;
      const px = star.x * k + cx;
      const py = star.y * k + cy;

      if (px >= 0 && px <= width && py >= 0 && py <= height) {
        const size = (1 - star.z / width) * 3;
        const shade = Math.floor((1 - star.z / width) * 255);
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.6, size), 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${shade}, ${Math.min(255, shade + 50)}, 255)`;
        ctx.fill();
      }
    }
  }

  function initCanvasMode() {
    if (canvasMode === 'neural') createNeuralParticles();
    else if (canvasMode === 'matrix') createMatrixDrops();
    else if (canvasMode === 'stars') createStars();
  }

  function loopCanvas() {
    if (canvasMode === 'neural') renderNeural();
    else if (canvasMode === 'matrix') renderMatrix();
    else if (canvasMode === 'stars') renderStars();
    animationFrameId = requestAnimationFrame(loopCanvas);
  }

  initCanvasMode();
  loopCanvas();

  // Mode Toggle Button
  const canvasModeBtn = document.getElementById('canvasModeBtn');
  const canvasModeLabel = document.getElementById('canvasModeLabel');
  const modesList = ['neural', 'matrix', 'stars'];

  if (canvasModeBtn) {
    canvasModeBtn.addEventListener('click', () => {
      Sound.click();
      const nextIdx = (modesList.indexOf(canvasMode) + 1) % modesList.length;
      canvasMode = modesList[nextIdx];
      if (canvasModeLabel) {
        canvasModeLabel.textContent = canvasMode.charAt(0).toUpperCase() + canvasMode.slice(1);
      }
      initCanvasMode();
      showToast(`Visual Engine switched to: ${canvasMode.toUpperCase()}`);
    });
  }

  // ==========================================
  // 3.5 THREE.JS 3D WEBGL ENGINE & INTERACTIVE WORLD
  // Features: Quantum AI Brain, 4 Orbiting Beacons (SIH, Hacktoberfest, AI, Grit),
  //           3D Particle Stardust, Raycasting, Scroll Camera Choreography, & 3D Orbit Sandbox.
  // ==========================================
  let threeScene = null, threeCamera = null, threeRenderer = null;
  let coreGroup = null, stardustPoints = null;
  const interactiveBeacons = [];
  const raycaster = typeof THREE !== 'undefined' ? new THREE.Raycaster() : null;
  const mouseNdc = typeof THREE !== 'undefined' ? new THREE.Vector2(-999, -999) : null;
  let hoveredBeacon = null;

  // Orbit Mode State
  let isOrbitModeActive = false;
  let isDragging3D = false;
  let prevMouse3D = { x: 0, y: 0 };
  let orbitSpherical = { radius: 9.5, theta: 0, phi: Math.PI / 2 };
  let targetOrbitSpherical = { radius: 9.5, theta: 0, phi: Math.PI / 2 };

  function initThreeDWorld() {
    const webglCanvas = document.getElementById('webglCanvas');
    if (!webglCanvas || typeof THREE === 'undefined') {
      console.warn('Three.js or #webglCanvas unavailable. Falling back to 2D Canvas engine.');
      return;
    }

    try {
      // 1. Scene, Camera, Renderer
      threeScene = new THREE.Scene();
      const aspect = window.innerWidth / window.innerHeight;
      threeCamera = new THREE.PerspectiveCamera(52, aspect, 0.1, 1000);
      threeCamera.position.set(0, 0, 9.5);

      threeRenderer = new THREE.WebGLRenderer({
        canvas: webglCanvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      threeRenderer.setSize(window.innerWidth, window.innerHeight);
      threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // 2. Quantum Neural Core Group
      coreGroup = new THREE.Group();
      threeScene.add(coreGroup);

      // Outer Wireframe Icosahedron
      const icosaGeo = new THREE.IcosahedronGeometry(2.1, 2);
      const icosaMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.65
      });
      const icosaMesh = new THREE.Mesh(icosaGeo, icosaMat);
      coreGroup.add(icosaMesh);

      // Inner Glowing Sphere
      const innerGeo = new THREE.SphereGeometry(1.45, 24, 24);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0x9d4edd,
        wireframe: true,
        transparent: true,
        opacity: 0.4
      });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      coreGroup.add(innerMesh);

      // Vertex Particle Nodes
      const ptsGeo = new THREE.SphereGeometry(1.95, 28, 28);
      const ptsCount = ptsGeo.attributes.position.count;
      const ptsColors = new Float32Array(ptsCount * 3);
      for (let i = 0; i < ptsCount; i++) {
        const isCyan = Math.random() > 0.4;
        ptsColors[i * 3] = isCyan ? 0.0 : 0.62;
        ptsColors[i * 3 + 1] = isCyan ? 0.94 : 0.31;
        ptsColors[i * 3 + 2] = isCyan ? 1.0 : 0.87;
      }
      ptsGeo.setAttribute('color', new THREE.BufferAttribute(ptsColors, 3));
      const ptsMat = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.9
      });
      const ptsMesh = new THREE.Points(ptsGeo, ptsMat);
      coreGroup.add(ptsMesh);

      // Gyroscopic Energy Rings
      const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(3.0, 0.025, 16, 90),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.6 })
      );
      ring1.rotation.x = Math.PI / 3;
      coreGroup.add(ring1);

      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(3.6, 0.02, 16, 90),
        new THREE.MeshBasicMaterial({ color: 0x9d4edd, transparent: true, opacity: 0.55 })
      );
      ring2.rotation.y = Math.PI / 4;
      ring2.rotation.z = Math.PI / 6;
      coreGroup.add(ring2);

      const ring3 = new THREE.Mesh(
        new THREE.TorusGeometry(4.2, 0.025, 16, 90),
        new THREE.MeshBasicMaterial({ color: 0xff007f, transparent: true, opacity: 0.5 })
      );
      ring3.rotation.x = Math.PI / 2;
      ring3.rotation.y = Math.PI / 5;
      coreGroup.add(ring3);

      // 3. Four 3D Interactive Satellites (Milestones & Mindset)
      const beaconConfigs = [
        { id: 'sih', name: 'Smart India Hackathon', color: 0xff7300, target: '#hackathons', radius: 4.8, speed: 0.008, baseAngle: 0 },
        { id: 'hacktober', name: 'Hacktoberfest Open Source', color: 0x00f0ff, target: '#hackathons', radius: 5.4, speed: 0.006, baseAngle: Math.PI * 0.5 },
        { id: 'aiml', name: 'AI & ML Neural Core', color: 0x9d4edd, target: '#arsenal', radius: 4.5, speed: 0.007, baseAngle: Math.PI },
        { id: 'unstoppable', name: 'Unstoppable Grit', color: 0xff007f, target: '#manifesto', radius: 5.2, speed: 0.009, baseAngle: Math.PI * 1.5 }
      ];

      beaconConfigs.forEach((cfg) => {
        const bGroup = new THREE.Group();
        bGroup.userData = cfg;

        // Diamond Polyhedron Mesh
        const mesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.32),
          new THREE.MeshBasicMaterial({ color: cfg.color, wireframe: false, transparent: true, opacity: 0.85 })
        );
        bGroup.add(mesh);

        // Wireframe Shell
        const wire = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.42),
          new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.5 })
        );
        bGroup.add(wire);

        // Point Light attached to each beacon
        const light = new THREE.PointLight(cfg.color, 1.2, 6);
        bGroup.add(light);

        coreGroup.add(bGroup);
        interactiveBeacons.push(bGroup);
      });

      // 4. 3D Cosmic Stardust Particles
      const starCount = 1800;
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i += 3) {
        starPos[i] = (Math.random() - 0.5) * 80;
        starPos[i + 1] = (Math.random() - 0.5) * 80;
        starPos[i + 2] = (Math.random() - 0.5) * 80;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.06,
        transparent: true,
        opacity: 0.65
      });
      stardustPoints = new THREE.Points(starGeo, starMat);
      threeScene.add(stardustPoints);

      // 5. 3D Cyber Ground Grid
      const gridHelper = new THREE.GridHelper(70, 35, 0x00f0ff, 0x141828);
      gridHelper.position.y = -10;
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.25;
      threeScene.add(gridHelper);

      // Lighting
      const ambLight = new THREE.AmbientLight(0xffffff, 0.4);
      threeScene.add(ambLight);

      // 6. Animation Loop for 3D World
      let clock = new THREE.Clock();

      function animateThreeD() {
        requestAnimationFrame(animateThreeD);
        const elapsedTime = clock.getElapsedTime();

        // Rotate Core & Rings
        if (coreGroup) {
          icosaMesh.rotation.x = elapsedTime * 0.12;
          icosaMesh.rotation.y = elapsedTime * 0.16;
          innerMesh.rotation.x = -elapsedTime * 0.18;
          innerMesh.rotation.y = elapsedTime * 0.22;
          ptsMesh.rotation.y = -elapsedTime * 0.14;

          ring1.rotation.z = elapsedTime * 0.18;
          ring2.rotation.x = elapsedTime * 0.15;
          ring3.rotation.y = elapsedTime * 0.22;

          // Orbit Beacons
          interactiveBeacons.forEach((bGroup) => {
            const cfg = bGroup.userData;
            const curAngle = cfg.baseAngle + elapsedTime * cfg.speed * 8;
            bGroup.position.x = Math.cos(curAngle) * cfg.radius;
            bGroup.position.z = Math.sin(curAngle) * cfg.radius;
            bGroup.position.y = Math.sin(curAngle * 2) * 0.8;
            bGroup.rotation.x += 0.02;
            bGroup.rotation.y += 0.03;
          });

          // Drift Stardust
          if (stardustPoints) {
            stardustPoints.rotation.y = elapsedTime * 0.015;
          }
        }

        // Camera Dynamics: Scroll Choreography VS 3D Orbit Mode
        if (isOrbitModeActive) {
          // Smooth Orbit Inertia
          orbitSpherical.theta += (targetOrbitSpherical.theta - orbitSpherical.theta) * 0.1;
          orbitSpherical.phi += (targetOrbitSpherical.phi - orbitSpherical.phi) * 0.1;
          orbitSpherical.radius += (targetOrbitSpherical.radius - orbitSpherical.radius) * 0.1;

          threeCamera.position.x = orbitSpherical.radius * Math.sin(orbitSpherical.phi) * Math.sin(orbitSpherical.theta);
          threeCamera.position.y = orbitSpherical.radius * Math.cos(orbitSpherical.phi);
          threeCamera.position.z = orbitSpherical.radius * Math.sin(orbitSpherical.phi) * Math.cos(orbitSpherical.theta);
          threeCamera.lookAt(0, 0, 0);
        } else {
          // Scroll-driven camera trajectory
          const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const scrollFrac = Math.min(1, Math.max(0, window.scrollY / maxScroll));

          const targetCamY = -scrollFrac * 12 + (mouseNdc ? -mouseNdc.y * 0.5 : 0);
          const targetCamX = Math.sin(scrollFrac * Math.PI * 2) * 2.2 + (mouseNdc ? mouseNdc.x * 0.6 : 0);
          const targetCamZ = 9.5 - Math.sin(scrollFrac * Math.PI) * 1.5;

          threeCamera.position.x += (targetCamX - threeCamera.position.x) * 0.06;
          threeCamera.position.y += (targetCamY - threeCamera.position.y) * 0.06;
          threeCamera.position.z += (targetCamZ - threeCamera.position.z) * 0.06;

          threeCamera.lookAt(0, targetCamY * 0.8, 0);
        }

        // 3D Raycasting Detection on Orbiting Beacons
        if (raycaster && mouseNdc && interactiveBeacons.length) {
          raycaster.setFromCamera(mouseNdc, threeCamera);
          const hits = raycaster.intersectObjects(interactiveBeacons, true);

          if (hits.length > 0) {
            let hitGroup = hits[0].object.parent;
            if (hitGroup && hitGroup.userData && hitGroup.userData.id) {
              if (hoveredBeacon !== hitGroup) {
                hoveredBeacon = hitGroup;
                Sound.hover();
                document.body.classList.add('cursor-hover');
                hitGroup.scale.set(1.4, 1.4, 1.4);
              }
            }
          } else if (hoveredBeacon) {
            hoveredBeacon.scale.set(1.0, 1.0, 1.0);
            hoveredBeacon = null;
            document.body.classList.remove('cursor-hover');
          }
        }

        threeRenderer.render(threeScene, threeCamera);
      }

      animateThreeD();

      // Window resize
      window.addEventListener('resize', () => {
        if (!threeCamera || !threeRenderer) return;
        threeCamera.aspect = window.innerWidth / window.innerHeight;
        threeCamera.updateProjectionMatrix();
        threeRenderer.setSize(window.innerWidth, window.innerHeight);
      });

      // Mousemove for Raycasting & Parallax
      window.addEventListener('mousemove', (e) => {
        if (mouseNdc) {
          mouseNdc.x = (e.clientX / window.innerWidth) * 2 - 1;
          mouseNdc.y = -(e.clientY / window.innerHeight) * 2 + 1;
        }

        // Orbit drag
        if (isOrbitModeActive && isDragging3D) {
          const deltaX = e.clientX - prevMouse3D.x;
          const deltaY = e.clientY - prevMouse3D.y;
          prevMouse3D.x = e.clientX;
          prevMouse3D.y = e.clientY;

          targetOrbitSpherical.theta -= deltaX * 0.007;
          targetOrbitSpherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, targetOrbitSpherical.phi - deltaY * 0.007));
        }
      });

      // Mousedown & Mouseup for 3D Orbit drag
      webglCanvas.addEventListener('mousedown', (e) => {
        if (isOrbitModeActive) {
          isDragging3D = true;
          prevMouse3D.x = e.clientX;
          prevMouse3D.y = e.clientY;
        }
      });

      window.addEventListener('mouseup', () => {
        isDragging3D = false;
      });

      // Mouse wheel zoom in 3D Orbit mode
      window.addEventListener('wheel', (e) => {
        if (isOrbitModeActive) {
          targetOrbitSpherical.radius = Math.max(4.0, Math.min(22.0, targetOrbitSpherical.radius + e.deltaY * 0.015));
        }
      }, { passive: true });

      // Click on 3D Beacon triggers navigation
      webglCanvas.addEventListener('click', () => {
        if (hoveredBeacon && hoveredBeacon.userData && hoveredBeacon.userData.target) {
          Sound.click();
          const targetEl = document.querySelector(hoveredBeacon.userData.target);
          if (targetEl) {
            if (isOrbitModeActive) toggle3DOrbitMode(false);
            targetEl.scrollIntoView({ behavior: 'smooth' });
            showToast(`🚀 Warped to: ${hoveredBeacon.userData.name}`);
          }
        }
      });

    } catch (err) {
      console.warn('Three.js initialization notice:', err);
    }
  }

  // 3D Orbit Mode Toggle Functions
  function toggle3DOrbitMode(forceState) {
    Sound.click();
    isOrbitModeActive = typeof forceState === 'boolean' ? forceState : !isOrbitModeActive;

    const threeDModeBtn = document.getElementById('threeDModeBtn');
    const threeDModeLabel = document.getElementById('threeDModeLabel');
    const threeDHud = document.getElementById('threeDHud');

    if (isOrbitModeActive) {
      document.body.classList.add('mode-3d-active');
      if (threeDModeBtn) threeDModeBtn.classList.add('active');
      if (threeDModeLabel) threeDModeLabel.textContent = '3D Orbit: ON';
      if (threeDHud) threeDHud.setAttribute('aria-hidden', 'false');
      showToast('🌐 3D NEURAL CORE ACTIVE: Drag to orbit • Scroll to zoom');
      Sound.success();
    } else {
      document.body.classList.remove('mode-3d-active');
      if (threeDModeBtn) threeDModeBtn.classList.remove('active');
      if (threeDModeLabel) threeDModeLabel.textContent = '3D Orbit';
      if (threeDHud) threeDHud.setAttribute('aria-hidden', 'true');
      showToast('Exited 3D Orbit Mode');
    }
  }

  const threeDModeBtn = document.getElementById('threeDModeBtn');
  if (threeDModeBtn) {
    threeDModeBtn.addEventListener('click', () => toggle3DOrbitMode());
  }

  const exitThreeDBtn = document.getElementById('exitThreeDBtn');
  if (exitThreeDBtn) {
    exitThreeDBtn.addEventListener('click', () => toggle3DOrbitMode(false));
  }

  const reset3DCameraBtn = document.getElementById('reset3DCameraBtn');
  if (reset3DCameraBtn) {
    reset3DCameraBtn.addEventListener('click', () => {
      Sound.click();
      targetOrbitSpherical = { radius: 9.5, theta: 0, phi: Math.PI / 2 };
      showToast('🔄 3D Camera view reset to center');
    });
  }

  // ==========================================
  // 3.6 HERO 3D HOLOGRAPHIC STAGE
  // Mini Three.js viewport inside the hero avatar frame with 3D/Photo switch
  // ==========================================
  function initHero3DHologram() {
    const holoCanvas = document.getElementById('heroHoloCanvas');
    const avatarFrame = document.getElementById('avatarFrame');
    if (!holoCanvas || !avatarFrame || typeof THREE === 'undefined') return;

    try {
      const hScene = new THREE.Scene();
      const hWidth = avatarFrame.clientWidth || 360;
      const hHeight = avatarFrame.clientHeight || 360;

      const hCamera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
      hCamera.position.z = 4.8;

      const hRenderer = new THREE.WebGLRenderer({
        canvas: holoCanvas,
        alpha: true,
        antialias: true
      });
      hRenderer.setSize(hWidth, hHeight);
      hRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Hologram Cyber Orb
      const holoGroup = new THREE.Group();
      hScene.add(holoGroup);

      // Core Dodecahedron
      const dodeca = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.35, 1),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.8 })
      );
      holoGroup.add(dodeca);

      // Inner Icosahedron
      const icoInner = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.9, 1),
        new THREE.MeshBasicMaterial({ color: 0xff007f, wireframe: true, transparent: true, opacity: 0.6 })
      );
      holoGroup.add(icoInner);

      // Outer Torus Ring
      const hRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.9, 0.03, 16, 80),
        new THREE.MeshBasicMaterial({ color: 0x9d4edd, transparent: true, opacity: 0.7 })
      );
      hRing.rotation.x = Math.PI / 3;
      holoGroup.add(hRing);

      // Micro Particles
      const microGeo = new THREE.BufferGeometry();
      const microPos = new Float32Array(240 * 3);
      for (let i = 0; i < 240 * 3; i += 3) {
        microPos[i] = (Math.random() - 0.5) * 4.2;
        microPos[i + 1] = (Math.random() - 0.5) * 4.2;
        microPos[i + 2] = (Math.random() - 0.5) * 4.2;
      }
      microGeo.setAttribute('position', new THREE.BufferAttribute(microPos, 3));
      const microPts = new THREE.Points(
        microGeo,
        new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.045, transparent: true, opacity: 0.85 })
      );
      holoGroup.add(microPts);

      let hClock = new THREE.Clock();
      let mouseOverHero = false;
      let targetRotX = 0, targetRotY = 0;

      function animateHeroHolo() {
        requestAnimationFrame(animateHeroHolo);
        const t = hClock.getElapsedTime();

        if (!mouseOverHero) {
          holoGroup.rotation.y = t * 0.4;
          holoGroup.rotation.x = Math.sin(t * 0.3) * 0.3;
        } else {
          holoGroup.rotation.y += (targetRotY - holoGroup.rotation.y) * 0.1;
          holoGroup.rotation.x += (targetRotX - holoGroup.rotation.x) * 0.1;
        }

        dodeca.rotation.z = -t * 0.2;
        hRing.rotation.z = t * 0.3;
        microPts.rotation.y = -t * 0.15;

        hRenderer.render(hScene, hCamera);
      }
      animateHeroHolo();

      // Mouse interaction on Hero Avatar card
      avatarFrame.addEventListener('mouseenter', () => { mouseOverHero = true; });
      avatarFrame.addEventListener('mouseleave', () => { mouseOverHero = false; });
      avatarFrame.addEventListener('mousemove', (e) => {
        const rect = avatarFrame.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        targetRotY = nx * 1.2;
        targetRotX = -ny * 1.2;
      });

      // Switcher Buttons: 3D Core VS Photo
      const btnHolo3D = document.getElementById('btnHolo3D');
      const btnHoloPhoto = document.getElementById('btnHoloPhoto');

      if (btnHolo3D && btnHoloPhoto) {
        btnHolo3D.addEventListener('click', () => {
          Sound.click();
          btnHolo3D.classList.add('active');
          btnHoloPhoto.classList.remove('active');
          avatarFrame.classList.remove('show-photo');
          showToast('🌐 Displaying: 3D Holographic Cyber Core');
        });

        btnHoloPhoto.addEventListener('click', () => {
          Sound.click();
          btnHoloPhoto.classList.add('active');
          btnHolo3D.classList.remove('active');
          avatarFrame.classList.add('show-photo');
          showToast('⚡ Displaying: AI Developer Portrait');
        });
      }
    } catch (err) {
      console.warn('Hero 3D hologram notice:', err);
    }
  }

  // Initialize 3D engines
  initThreeDWorld();
  initHero3DHologram();

  // ==========================================
  // 4. CUSTOM CYBER CURSOR & MAGNETIC HOVERS
  // ==========================================
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  let curX = -100, curY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener('mousemove', (e) => {
    curX = e.clientX;
    curY = e.clientY;
    if (cursorDot) {
      cursorDot.style.left = `${curX}px`;
      cursorDot.style.top = `${curY}px`;
    }
  });

  function updateCursorRing() {
    ringX += (curX - ringX) * 0.15;
    ringY += (curY - ringY) * 0.15;
    if (cursorRing) {
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
    }
    requestAnimationFrame(updateCursorRing);
  }
  updateCursorRing();

  // Attach hover triggers
  const hoverables = document.querySelectorAll('a, button, input, textarea, select, .tilt-card, .chip-cmd');
  hoverables.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      Sound.hover();
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });

  // ==========================================
  // 5. TEXT SCRAMBLE / DECODER EFFECT
  // ==========================================
  const phrases = [
    'AN UNSTOPPABLE BUILDER',
    'AI & ML ARCHITECT',
    'SIH HACKATHON INNOVATOR',
    'OPEN SOURCE WARRIOR',
    'RELENTLESS PROBLEM SOLVER',
    'WORLD-CLASS IN THE MAKING'
  ];

  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#________';
      this.update = this.update.bind(this);
    }
    setText(newText) {
      const oldText = this.el.innerText;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise((resolve) => (this.resolve = resolve));
      this.queue = [];
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 25);
        const end = start + Math.floor(Math.random() * 25);
        this.queue.push({ from, to, start, end });
      }
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }
    update() {
      let output = '';
      let complete = 0;
      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.chars[Math.floor(Math.random() * this.chars.length)];
            this.queue[i].char = char;
          }
          output += `<span class="scramble-glyph">${char}</span>`;
        } else {
          output += from;
        }
      }
      this.el.innerHTML = output;
      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }
  }

  const scrambleEl = document.getElementById('scrambleText');
  if (scrambleEl) {
    const fx = new TextScramble(scrambleEl);
    let counter = 0;
    const nextPhrase = () => {
      fx.setText(phrases[counter]).then(() => {
        setTimeout(nextPhrase, 2600);
      });
      counter = (counter + 1) % phrases.length;
    };
    nextPhrase();
  }

  // ==========================================
  // 6. 3D CARD TILT EFFECT (Hologram & Cards)
  // ==========================================
  const tiltCards = document.querySelectorAll('.tilt-card, .holo-card');

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  // ==========================================
  // 7. SKILL RADAR CANVAS (Real-Time Competency Graph)
  // ==========================================
  const radarCanvas = document.getElementById('radarCanvas');
  if (radarCanvas) {
    const rCtx = radarCanvas.getContext('2d');
    const skillsData = [
      { label: 'AI & ML', value: 0.90, color: '#00f0ff' },
      { label: 'Determination', value: 1.00, color: '#ff007f' },
      { label: 'Hackathons', value: 0.95, color: '#ff7300' },
      { label: 'Web Systems', value: 0.92, color: '#00ff9d' },
      { label: 'Open Source', value: 0.94, color: '#9d4edd' },
      { label: 'Algorithms', value: 0.86, color: '#ffd000' }
    ];

    function drawRadar() {
      const cw = radarCanvas.width;
      const ch = radarCanvas.height;
      const cx = cw / 2;
      const cy = ch / 2 + 10;
      const radius = 100;
      const sides = skillsData.length;

      rCtx.clearRect(0, 0, cw, ch);

      // Draw concentric polygons (levels 20%, 40%, 60%, 80%, 100%)
      for (let level = 1; level <= 5; level++) {
        const r = (radius / 5) * level;
        rCtx.beginPath();
        for (let i = 0; i < sides; i++) {
          const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          if (i === 0) rCtx.moveTo(x, y);
          else rCtx.lineTo(x, y);
        }
        rCtx.closePath();
        rCtx.strokeStyle = level === 5 ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)';
        rCtx.lineWidth = 1;
        rCtx.stroke();
      }

      // Draw spoke axes
      for (let i = 0; i < sides; i++) {
        const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        rCtx.beginPath();
        rCtx.moveTo(cx, cy);
        rCtx.lineTo(x, y);
        rCtx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        rCtx.stroke();

        // Draw labels
        const labelX = cx + (radius + 24) * Math.cos(angle);
        const labelY = cy + (radius + 18) * Math.sin(angle);
        rCtx.font = '10px JetBrains Mono, monospace';
        rCtx.fillStyle = skillsData[i].color;
        rCtx.textAlign = 'center';
        rCtx.textBaseline = 'middle';
        rCtx.fillText(skillsData[i].label, labelX, labelY);
      }

      // Draw Data Shape
      rCtx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
        const val = skillsData[i].value;
        const x = cx + radius * val * Math.cos(angle);
        const y = cy + radius * val * Math.sin(angle);
        if (i === 0) rCtx.moveTo(x, y);
        else rCtx.lineTo(x, y);
      }
      rCtx.closePath();

      // Fill gradient
      const grad = rCtx.createRadialGradient(cx, cy, 10, cx, cy, radius);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
      grad.addColorStop(1, 'rgba(157, 78, 221, 0.25)');
      rCtx.fillStyle = grad;
      rCtx.fill();

      rCtx.strokeStyle = '#00f0ff';
      rCtx.lineWidth = 2;
      rCtx.stroke();

      // Draw data nodes
      for (let i = 0; i < sides; i++) {
        const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
        const val = skillsData[i].value;
        const x = cx + radius * val * Math.cos(angle);
        const y = cy + radius * val * Math.sin(angle);

        rCtx.beginPath();
        rCtx.arc(x, y, 4, 0, Math.PI * 2);
        rCtx.fillStyle = '#fff';
        rCtx.shadowBlur = 10;
        rCtx.shadowColor = skillsData[i].color;
        rCtx.fill();
        rCtx.shadowBlur = 0;
      }
    }

    drawRadar();
  }

  // ==========================================
  // 8. ARSENAL TABS FILTER
  // ==========================================
  const tabBtns = document.querySelectorAll('.tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      Sound.click();
      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-tab');
      skillCards.forEach((card) => {
        const cat = card.getAttribute('data-cat');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  // ==========================================
  // 9. INTERACTIVE CYBER TERMINAL CLI (CLI v2.0)
  // ==========================================
  const termBody = document.getElementById('terminalBody');
  const termInput = document.getElementById('terminalInput');
  const termRunBtn = document.getElementById('terminalRunBtn');
  const chipCmds = document.querySelectorAll('.chip-cmd');

  const termHistory = [];
  let historyIdx = -1;

  const Commands = {
    help: () => `
<span class="highlight-cyan">AVAILABLE COMMANDS IN SURAJ-OS:</span>
  • <span class="highlight-yellow">whoami</span>       : Display developer identity & core mission
  • <span class="highlight-yellow">hackathons</span>   : Full recap of SIH & Hacktoberfest battlegrounds
  • <span class="highlight-yellow">skills</span>       : AI/ML, Python, Web & Systems competency matrix
  • <span class="highlight-yellow">projects</span>     : Showcase of high-impact deployed systems
  • <span class="highlight-yellow">manifesto</span>    : The unstoppable mindset of a 1st-year builder
  • <span class="highlight-yellow">3d</span> / <span class="highlight-yellow">orbit</span>   : Launch 3D Neural Core Interactive Orbit Mode
  • <span class="highlight-yellow">matrix</span>       : Switch visual canvas engine to Matrix Rain
  • <span class="highlight-yellow">contact</span>      : Direct encrypted communication channels
  • <span class="highlight-yellow">stats</span>        : Real-time telemetry & determination metrics
  • <span class="highlight-yellow">sudo</span>         : Acquire root privileges
  • <span class="highlight-yellow">clear</span>        : Wipe the terminal buffer
`,

    whoami: () => `
<span class="highlight-green">[IDENTITY VERIFIED]</span>
  Name        : ${profile.name}
  Title       : 1st Year B.Tech CSE (AI & ML)
  Objective   : To become one of the world's best AI software engineers
  Mindset     : <strong class="highlight-pink">UNSTOPPABLE & RELENTLESS</strong>
  Current YR  : Year 1 (Compounding early advantage)
  Status      : Online & shipping code daily
`,

    hackathons: () => `
<span class="highlight-cyan">[HACKATHON CRUCIBLES: 2+ MAJOR DEPLOYMENTS]</span>
  <strong class="highlight-yellow">1. Smart India Hackathon (SIH):</strong>
     - Domain: High-stakes National Problem Solving
     - Duration: 36h continuous sprint
     - Key Takeaway: Real-time AI model pipeline under intense jury review. Pressure immunity.

  <strong class="highlight-yellow">2. Hacktoberfest:</strong>
     - Domain: Global Decentralized Open Source
     - Impact: Merged production PRs, Git rebase workflows, global maintainer code reviews.
     - Key Takeaway: Writing clean, modular, maintainable open-source code for thousands.
`,

    skills: () => `
<span class="highlight-cyan">[NEURAL & CODE ARSENAL]</span>
  • <strong class="highlight-yellow">AI & Machine Learning</strong>: Python, NumPy, Pandas, Scikit-Learn, CNNs, OpenCV
  • <strong class="highlight-yellow">Web & Interfaces</strong>    : HTML5, Modern CSS3, JavaScript ES6+, Web APIs, Canvas 2D
  • <strong class="highlight-yellow">Systems & Core</strong>      : C / C++, Data Structures & Algorithms, Git / GitHub
  • <strong class="highlight-yellow">Superpower</strong>          : 48h Hackathon Endurance & Rapid Zero-to-One Mastery
`,

    projects: () => `
<span class="highlight-cyan">[PRODUCTION LAB HIGHLIGHTS]</span>
  1. <strong class="highlight-green">NeuroVision</strong>: Real-Time Pattern & Biometric Analyzer (Python, OpenCV, CNNs)
  2. <strong class="highlight-green">Aegis Swarm</strong>: Autonomous AI Agent Orchestration Console (AsyncIO, WebSockets, LLM)
  3. <strong class="highlight-green">OpenForge</strong>  : High-Velocity Dev Automation Toolkit (Node.js, Shell, Git CI)
  Type 'open &lt;neurovision|aegis|openforge&gt;' or click Explore Specs on cards above.
`,

    manifesto: () => `
<span class="highlight-pink">[THE UNSTOPPABLE CREED]</span>
  "Why wait 4 years when you can build the future today?
   Determination beats passive talent every single time.
   No bug is insurmountable, no algorithm is too complex,
   and no challenge can halt an unstoppable mind."
`,

    matrix: () => {
      canvasMode = 'matrix';
      initCanvasMode();
      if (canvasModeLabel) canvasModeLabel.textContent = 'Matrix';
      return `<span class="highlight-green">[MATRIX PROTOCOL INITIALIZED] Visual engine running green rain.</span>`;
    },

    contact: () => `
<span class="highlight-cyan">[COMMUNICATION FREQUENCIES]</span>
  Email    : ${profile.email}
  GitHub   : https://${profile.github}
  LinkedIn : https://${profile.linkedin}
  Location : ${profile.location}
`,

    stats: () => `
<span class="highlight-cyan">[TELEMETRY METRICS]</span>
  Determination : 100% [MAX]
  Hackathons    : 2 Completed (SIH + Hacktoberfest)
  Curiosity     : Infinite
  Coffee/Sleep  : Optimized for execution
`,

    sudo: () => `<span class="highlight-pink">[ACCESS GRANTED] You are now root of Suraj-OS. Build something legendary today.</span>`,

    '3d': () => {
      toggle3DOrbitMode(true);
      return `<span class="highlight-cyan">[3D ORBIT MODE ENGAGED] Use mouse to orbit and scroll to zoom. Press ESC to return.</span>`;
    },

    orbit: () => {
      toggle3DOrbitMode(true);
      return `<span class="highlight-cyan">[3D ORBIT MODE ENGAGED] Free fly 3D space. Press ESC to return.</span>`;
    },

    reset3d: () => {
      targetOrbitSpherical = { radius: 9.5, theta: 0, phi: Math.PI / 2 };
      return `<span class="highlight-green">[3D CAMERA RESET] View centered on Quantum Neural Core.</span>`;
    },

    clear: () => {
      termBody.innerHTML = '';
      return null;
    }
  };

  function executeCommand(rawCmd) {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    termHistory.push(cmd);
    historyIdx = termHistory.length;
    Sound.terminal();

    // Echo input
    const echoLine = document.createElement('div');
    echoLine.className = 'term-line cmd-echo';
    echoLine.innerHTML = `<span class="prompt-symbol">suraj@core:~$</span> ${escapeHTML(rawCmd)}`;
    termBody.appendChild(echoLine);

    // Run command
    if (Commands[cmd]) {
      const output = Commands[cmd]();
      if (output !== null) {
        const outLine = document.createElement('div');
        outLine.className = 'term-line';
        outLine.innerHTML = output;
        termBody.appendChild(outLine);
      }
    } else if (cmd.startsWith('open ')) {
      const proj = cmd.split(' ')[1];
      if (['neurovision', 'aegis', 'openforge'].includes(proj)) {
        openProjectModal(proj);
        const outLine = document.createElement('div');
        outLine.className = 'term-line highlight-green';
        outLine.textContent = `[OPENING SPECIFICATIONS FOR: ${proj.toUpperCase()}]`;
        termBody.appendChild(outLine);
      } else {
        const errLine = document.createElement('div');
        errLine.className = 'term-line highlight-pink';
        errLine.textContent = `Unknown project: ${proj}. Try 'open neurovision', 'open aegis', or 'open openforge'.`;
        termBody.appendChild(errLine);
      }
    } else {
      const errLine = document.createElement('div');
      errLine.className = 'term-line highlight-pink';
      errLine.innerHTML = `Command not found: '${escapeHTML(cmd)}'. Type <span class="highlight-cyan">'help'</span> for list of commands.`;
      termBody.appendChild(errLine);
    }

    termBody.scrollTop = termBody.scrollHeight;
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  if (termInput) {
    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeCommand(termInput.value);
        termInput.value = '';
      } else if (e.key === 'ArrowUp') {
        if (historyIdx > 0) {
          historyIdx--;
          termInput.value = termHistory[historyIdx] || '';
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIdx < termHistory.length - 1) {
          historyIdx++;
          termInput.value = termHistory[historyIdx] || '';
        } else {
          historyIdx = termHistory.length;
          termInput.value = '';
        }
      }
    });
  }

  if (termRunBtn && termInput) {
    termRunBtn.addEventListener('click', () => {
      executeCommand(termInput.value);
      termInput.value = '';
    });
  }

  chipCmds.forEach((chip) => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      if (cmd) executeCommand(cmd);
    });
  });

  // ==========================================
  // 10. DEVELOPER CREED GENERATOR
  // ==========================================
  const creeds = [
    '"When you treat learning like oxygen, no algorithm is too hard, no bug is too stubborn, and no goal is out of reach."',
    '"Year 1 is not a waiting room—it is an early compounding runway to engineer the impossible."',
    '"Hackathons teach you in 36 hours what textbooks take 6 months to explain."',
    '"First-class execution beats third-party excuses. Code the solution."',
    '"Mastering AI requires both mathematical patience and high-velocity shipping courage."'
  ];

  const inspireBtn = document.getElementById('inspireBtn');
  const creedDisplay = document.getElementById('creedDisplay');

  if (inspireBtn && creedDisplay) {
    inspireBtn.addEventListener('click', () => {
      Sound.click();
      const randomCreed = creeds[Math.floor(Math.random() * creeds.length)];
      creedDisplay.style.opacity = '0';
      setTimeout(() => {
        creedDisplay.textContent = randomCreed;
        creedDisplay.style.opacity = '1';
      }, 150);
      showToast('⚡ Injected New Developer Creed');
    });
  }

  // ==========================================
  // 11. PROJECT SPECS MODAL
  // ==========================================
  const projectModal = document.getElementById('projectModal');
  const modalProjectTitle = document.getElementById('modalProjectTitle');
  const modalProjectContent = document.getElementById('modalProjectContent');

  const projectDetails = {
    neurovision: {
      title: 'NEUROVISION // TECHNICAL BLUEPRINT',
      html: `
        <div style="font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.8;">
          <h4 style="color: var(--neon-cyan); margin-bottom: 12px; font-family: var(--font-heading);">System Architecture & Implementation</h4>
          <p style="color: var(--text-muted); margin-bottom: 16px;">
            NeuroVision is a high-framerate computer vision pipeline optimized for real-time edge processing and biometric telemetry.
          </p>
          <div style="background: rgba(0,0,0,0.5); padding: 16px; border-radius: 8px; border: 1px solid var(--border-subtle); margin-bottom: 20px;">
            <p><strong>Primary Frameworks:</strong> Python 3.11, OpenCV 4.x, TensorFlow Lite / Keras, NumPy</p>
            <p><strong>Inference Latency:</strong> &lt; 48ms on standard CPU, &lt; 14ms on GPU acceleration</p>
            <p><strong>Target Use-Case:</strong> Real-time situational awareness, gesture command interpretation, automated verification.</p>
          </div>
          <h4 style="color: var(--neon-pink); margin-bottom: 8px;">Key Engineering Highlights:</h4>
          <ul style="color: var(--text-muted); padding-left: 20px; margin-bottom: 20px;">
            <li>Custom spatial feature extraction minimizing memory footprint by 35%.</li>
            <li>Multi-threaded video capture queue preventing pipeline frame drops.</li>
            <li>Embedded REST endpoint for rapid hookup into web dashboards.</li>
          </ul>
        </div>
      `
    },
    aegis: {
      title: 'AEGIS SWARM // TECHNICAL BLUEPRINT',
      html: `
        <div style="font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.8;">
          <h4 style="color: var(--neon-cyan); margin-bottom: 12px; font-family: var(--font-heading);">Autonomous Multi-Agent Architecture</h4>
          <p style="color: var(--text-muted); margin-bottom: 16px;">
            A distributed orchestrator capable of delegating, supervising, and verifying concurrent AI agents handling disparate tasks.
          </p>
          <div style="background: rgba(0,0,0,0.5); padding: 16px; border-radius: 8px; border: 1px solid var(--border-subtle); margin-bottom: 20px;">
            <p><strong>Stack:</strong> Python AsyncIO, WebSockets, FastAPI, Vector Search Indices</p>
            <p><strong>Agent Topologies:</strong> Hierarchical Commander-Worker and Peer-to-Peer Consensus</p>
            <p><strong>Fault Tolerance:</strong> Self-healing retry loops and automatic state checkpointing</p>
          </div>
          <h4 style="color: var(--neon-pink); margin-bottom: 8px;">Engineering Highlights:</h4>
          <ul style="color: var(--text-muted); padding-left: 20px; margin-bottom: 20px;">
            <li>Dynamic load balancing preventing API rate limits.</li>
            <li>Telemetry event stream providing instant console observability.</li>
            <li>Built for Hackathon scenarios requiring rapid autonomous data gathering.</li>
          </ul>
        </div>
      `
    },
    openforge: {
      title: 'OPENFORGE TOOLKIT // TECHNICAL BLUEPRINT',
      html: `
        <div style="font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.8;">
          <h4 style="color: var(--neon-cyan); margin-bottom: 12px; font-family: var(--font-heading);">High-Velocity Developer Automation</h4>
          <p style="color: var(--text-muted); margin-bottom: 16px;">
            Engineered during Hacktoberfest to streamline open-source repository maintenance, commit health, and algorithmic profiling.
          </p>
          <div style="background: rgba(0,0,0,0.5); padding: 16px; border-radius: 8px; border: 1px solid var(--border-subtle); margin-bottom: 20px;">
            <p><strong>Technologies:</strong> Vanilla JavaScript ES6, Node.js CLI, POSIX Shell Scripts</p>
            <p><strong>Installation:</strong> Zero dependencies, execution under 200ms</p>
            <p><strong>Adoption:</strong> Integrated into multiple open source repositories</p>
          </div>
          <h4 style="color: var(--neon-pink); margin-bottom: 8px;">Features:</h4>
          <ul style="color: var(--text-muted); padding-left: 20px; margin-bottom: 20px;">
            <li>Git commit message validator checking conventional commits syntax.</li>
            <li>Automated benchmark runner comparing Big-O scaling across commits.</li>
            <li>One-command changelog and release notes compiler.</li>
          </ul>
        </div>
      `
    }
  };

  window.openProjectModal = function (projKey) {
    Sound.click();
    if (projectDetails[projKey] && projectModal && modalProjectTitle && modalProjectContent) {
      modalProjectTitle.textContent = projectDetails[projKey].title;
      modalProjectContent.innerHTML = projectDetails[projKey].html;
      projectModal.classList.add('active');
    }
  };

  window.closeProjectModal = function () {
    if (projectModal) projectModal.classList.remove('active');
  };

  // ==========================================
  // 12. PROFILE CUSTOMIZER MODAL & LIVE DOM SYNC
  // ==========================================
  const infoCustomizerModal = document.getElementById('infoCustomizerModal');
  const quickEditBtn = document.getElementById('quickEditBtn');
  const customizerForm = document.getElementById('profileCustomizerForm');

  const custName = document.getElementById('custName');
  const custDegree = document.getElementById('custDegree');
  const custCollege = document.getElementById('custCollege');
  const custEmail = document.getElementById('custEmail');
  const custGithub = document.getElementById('custGithub');
  const custLinkedin = document.getElementById('custLinkedin');
  const custTagline = document.getElementById('custTagline');

  function populateCustomizerInputs() {
    if (custName) custName.value = profile.name;
    if (custDegree) custDegree.value = profile.degree;
    if (custCollege) custCollege.value = profile.college;
    if (custEmail) custEmail.value = profile.email;
    if (custGithub) custGithub.value = profile.github;
    if (custLinkedin) custLinkedin.value = profile.linkedin;
    if (custTagline) custTagline.value = profile.tagline;
  }

  function applyProfileToDOM() {
    // Email updates
    const emailVal = document.getElementById('emailVal');
    if (emailVal) emailVal.textContent = profile.email;

    // Github updates
    const githubVal = document.getElementById('githubVal');
    if (githubVal) githubVal.textContent = profile.github;

    // LinkedIn updates
    const linkedinVal = document.getElementById('linkedinVal');
    if (linkedinVal) linkedinVal.textContent = profile.linkedin;

    // Location
    const locationVal = document.getElementById('locationVal');
    if (locationVal) locationVal.textContent = profile.college ? `${profile.college} • India` : profile.location;
  }

  if (quickEditBtn) {
    quickEditBtn.addEventListener('click', () => {
      Sound.click();
      populateCustomizerInputs();
      if (infoCustomizerModal) infoCustomizerModal.classList.add('active');
    });
  }

  window.closeCustomizerModal = function () {
    if (infoCustomizerModal) infoCustomizerModal.classList.remove('active');
  };

  if (customizerForm) {
    customizerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      profile.name = custName ? custName.value.trim() : profile.name;
      profile.degree = custDegree ? custDegree.value.trim() : profile.degree;
      profile.college = custCollege ? custCollege.value.trim() : profile.college;
      profile.email = custEmail ? custEmail.value.trim() : profile.email;
      profile.github = custGithub ? custGithub.value.trim() : profile.github;
      profile.linkedin = custLinkedin ? custLinkedin.value.trim() : profile.linkedin;
      profile.tagline = custTagline ? custTagline.value.trim() : profile.tagline;

      try {
        localStorage.setItem('suraj_portfolio_profile', JSON.stringify(profile));
      } catch (err) {}

      applyProfileToDOM();
      closeCustomizerModal();
      Sound.success();
      showToast('✅ Profile information updated & synced across portfolio!');
    });
  }

  // Initial DOM sync
  applyProfileToDOM();

  // ==========================================
  // 13. COPY EMAIL & TOAST NOTIFICATION SYSTEM
  // ==========================================
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      Sound.click();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(profile.email).then(() => {
          showToast(`📋 Copied to clipboard: ${profile.email}`);
        }).catch(() => {
          fallbackCopyText(profile.email);
        });
      } else {
        fallbackCopyText(profile.email);
      }
    });
  }

  function fallbackCopyText(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast(`📋 Copied: ${text}`);
  }

  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'cyber-toast';
    toast.innerHTML = `<span style="color: var(--neon-cyan)">⚡</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ==========================================
  // 14. CONTACT FORM ENCRYPTED TRANSMISSION
  // ==========================================
  const contactForm = document.getElementById('contactForm');
  const formStatusMsg = document.getElementById('formStatusMsg');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const senderName = document.getElementById('senderName');
      const senderEmail = document.getElementById('senderEmail');
      const senderMsg = document.getElementById('senderMsg');

      if (!senderName.value.trim() || !senderEmail.value.trim() || !senderMsg.value.trim()) {
        if (formStatusMsg) {
          formStatusMsg.className = 'form-status error';
          formStatusMsg.textContent = '⚠️ Transmission Error: Please populate all payload fields.';
        }
        return;
      }

      Sound.click();
      if (formStatusMsg) {
        formStatusMsg.className = 'form-status';
        formStatusMsg.innerHTML = '<span class="highlight-cyan">Encrypting transmission packet... [8080 SSL]</span>';
      }

      setTimeout(() => {
        Sound.success();
        if (formStatusMsg) {
          formStatusMsg.className = 'form-status success';
          formStatusMsg.innerHTML = '🚀 Transmission successfully broadcasted! Suraj will reply shortly.';
        }
        contactForm.reset();
        showToast('🚀 Transmission packet delivered successfully!');
      }, 900);
    });
  }

  // ==========================================
  // 15. MOBILE MENU & NAVBAR SCROLL REACTION
  // ==========================================
  const mainHeader = document.getElementById('mainHeader');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (mainHeader) {
      if (window.scrollY > 40) mainHeader.classList.add('scrolled');
      else mainHeader.classList.remove('scrolled');
    }

    // Scroll spy for active link
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 180;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          if (link.getAttribute('data-nav') === id) link.classList.add('active');
          else link.classList.remove('active');
        });
      }
    });
  });

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      Sound.click();
      navMenu.classList.toggle('open');
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // Close modals on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProjectModal();
      closeCustomizerModal();
    }
  });

  console.log('%c⚡ SURAJ KUMAR // AI & ML PORTFOLIO ONLINE ⚡', 'color: #00f0ff; font-size: 16px; font-weight: bold;');
})();
