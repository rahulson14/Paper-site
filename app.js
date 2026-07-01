/* ==========================================================================
   SKETCHBOOK / DOODLE LINK-IN-BIO — INTERACTIVITY & MARIO 8-BIT SOUND ENGINE
   Inspired by Kevin Basset (kevin.tw) & Nintendo Entertainment System (NES)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. ORGANIC HOVER RANDOMIZER ---
  // Gives each squiggly button slightly different tilt and rotation when interacted with
  const buttons = document.querySelectorAll('.squiggly-btn');
  buttons.forEach((btn, idx) => {
    // Set a slight natural rotation on load
    const randomAngle = (Math.random() * 1.2 - 0.6).toFixed(2);
    btn.style.transform = `rotate(${randomAngle}deg)`;

    btn.addEventListener('mouseenter', () => {
      const hoverAngle = (Math.random() * 2 - 1).toFixed(2);
      btn.style.transform = `translateY(-3px) rotate(${hoverAngle}deg) scale(1.015)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `rotate(${randomAngle}deg)`;
    });
  });

  // --- 2. EMAIL COPY TO CLIPBOARD ---
  const emailBtn = document.getElementById('btn-email');
  if (emailBtn) {
    emailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const emailText = emailBtn.getAttribute('data-email') || 'rahulsonboro@gmail.com';
      
      navigator.clipboard.writeText(emailText).then(() => {
        const originalHTML = emailBtn.querySelector('.btn-text').innerHTML;
        emailBtn.querySelector('.btn-text').innerHTML = '<span class="btn-title" style="color:#161618;">🍄 1-UP! Copied!</span><span class="btn-subtitle">ready to paste in your email app</span>';
        emailBtn.classList.add('is-highlight');
        
        // Play Super Mario 1-UP Power-Up Sound!
        playMario1Up();

        setTimeout(() => {
          emailBtn.querySelector('.btn-text').innerHTML = originalHTML;
          emailBtn.classList.remove('is-highlight');
        }, 2000);
      }).catch(err => {
        window.location.href = `mailto:${emailText}`;
      });
    });
  }

  // --- 3. INTERACTIVE DOODLE / SCRIBBLE CANVAS MODE ---
  const doodleBtn = document.getElementById('toggle-doodle-mode');
  const canvas = document.getElementById('scribble-canvas');
  const clearBtn = document.getElementById('clear-canvas-btn');
  const colorBtns = document.querySelectorAll('.color-pick-btn');
  
  if (doodleBtn && canvas) {
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let isDoodleMode = false;
    let currentColor = '#161618'; // Pencil black by default
    let currentWidth = 3.5;

    // Resize canvas to match notebook sheet size
    const resizeCanvas = () => {
      const sheet = document.querySelector('.notebook-sheet');
      if (sheet) {
        canvas.width = sheet.offsetWidth;
        canvas.height = sheet.offsetHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Toggle Doodle Mode
    doodleBtn.addEventListener('click', () => {
      isDoodleMode = !isDoodleMode;
      document.body.classList.toggle('is-drawing', isDoodleMode);
      doodleBtn.innerHTML = isDoodleMode ? '🍄 Exit Doodle Mode' : '✏️ Doodle on Paper!';
      doodleBtn.style.background = isDoodleMode ? '#ffd6e0' : '#fff';
      if (isDoodleMode) {
        playMario1Up();
      } else {
        playMarioJump();
      }
    });

    // Color Pickers
    colorBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentColor = btn.getAttribute('data-color');
        currentWidth = btn.getAttribute('data-width') || 3.5;
        playMarioCoin();
      });
    });

    // Clear Canvas
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        playMarioJump();
      });
    }

    // Drawing Event Listeners (Mouse & Touch)
    const startPos = (e) => {
      if (!isDoodleMode) return;
      isDrawing = true;
      draw(e);
      playMarioFireball();
    };

    const endPos = () => {
      isDrawing = false;
      ctx.beginPath();
    };

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const draw = (e) => {
      if (!isDrawing || !isDoodleMode) return;
      e.preventDefault();

      const pos = getPos(e);
      
      ctx.lineWidth = currentWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = currentColor;

      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    canvas.addEventListener('mousedown', startPos);
    canvas.addEventListener('mouseup', endPos);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseleave', endPos);

    // Touch support for phones
    canvas.addEventListener('touchstart', startPos, { passive: false });
    canvas.addEventListener('touchend', endPos);
    canvas.addEventListener('touchmove', draw, { passive: false });
  }

  // ==========================================================================
  // 4. SUPER MARIO / RETRO 8-BIT AUDIO SYNTHESIZERS (Web Audio API)
  // Zero external MP3 files needed — pure retro square/pulse wave synthesis!
  // ==========================================================================

  // Global Audio Context helper
  let audioCtx = null;
  const getAudioContext = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  };

  // 🪙 RETRO MARIO COIN SOUND (Played on Button Hover)
  // Authentic 2-note arpeggio: B5 (987Hz) -> E6 (1318Hz) on square wave!
  const playMarioCoin = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      // First note B5 for 60ms, then jump to E6 for 200ms
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.06);

      // Volume envelope: crisp punch then quick decay
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.setValueAtTime(0.04, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {
      // Ignore if browser blocks autoplay before interaction
    }
  };

  // 🍄 RETRO MARIO 1-UP / POWER-UP SOUND (Played on Button Click & Copy)
  // Euphoric 6-note arpeggio: E5 -> G5 -> E6 -> C6 -> D6 -> G6!
  const playMario1Up = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const notes = [659.25, 783.99, 1318.51, 1046.50, 1174.66, 1567.98];
      const noteDuration = 0.07;

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + index * noteDuration);

        gain.gain.setValueAtTime(0.05, now + index * noteDuration);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (index + 1) * noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * noteDuration);
        osc.stop(now + (index + 1) * noteDuration);
      });
    } catch (e) {
      // Ignore
    }
  };

  // 🦘 RETRO MARIO JUMP SOUND (Played on Erase & Exit Doodle Mode)
  // Upward frequency sweep from 150Hz to 600Hz
  const playMarioJump = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.18);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {
      // Ignore
    }
  };

  // 🔥 RETRO MARIO FIREBALL SOUND (Played when starting to draw a line)
  // Downward pitch slide on triangle wave
  const playMarioFireball = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      // Ignore
    }
  };

  // Attach crisp Mario Coin sound to all regular external link clicks
  buttons.forEach(btn => {
    if (btn.id !== 'btn-email') {
      btn.addEventListener('click', () => {
        playMarioCoin();
      });
    }
  });

  // Make audio functions accessible globally for console debugging
  window.playMarioCoin = playMarioCoin;
  window.playMario1Up = playMario1Up;
  window.playMarioJump = playMarioJump;

  // ==========================================================================
  // 5. INTERACTIVE SKETCHBOOK SPARKLE / PENCIL DUST CURSOR TRAIL
  // Spawns floating ink stars & dust as you move the mouse across the paper!
  // ==========================================================================
  let lastSparkleTime = 0;
  const sparkleSymbols = ['★', '✨', '•', '♥', '✦', '⭐'];
  const sparkleColors = ['#161618', '#eb5f73', '#2b5c8f', '#20b260', '#fff080', '#ffd6e0'];

  document.addEventListener('mousemove', (e) => {
    if (document.body.classList.contains('is-drawing')) return;
    const now = Date.now();
    if (now - lastSparkleTime < 80) return;
    lastSparkleTime = now;

    const sparkle = document.createElement('span');
    sparkle.className = 'cursor-sparkle';
    sparkle.textContent = sparkleSymbols[Math.floor(Math.random() * sparkleSymbols.length)];
    sparkle.style.color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
    sparkle.style.left = `${e.clientX + (Math.random() * 16 - 8)}px`;
    sparkle.style.top = `${e.clientY + (Math.random() * 16 - 8)}px`;
    sparkle.style.fontSize = `${Math.floor(Math.random() * 10 + 12)}px`;

    document.body.appendChild(sparkle);

    setTimeout(() => {
      sparkle.remove();
    }, 600);
  });
});
