/**
 * EUREKA CUSTOMER AWARDS 2026 - UI INTERACTIONS ENGINE
 * Design Philosophy: Huashu Design (HTML-Native High Craft)
 * Scope: Isolated Visual & Interactive FX (Does NOT touch business/data logic)
 */

(function () {
  'use strict';

  // --- 1. Interactive Specular Mouse Glare Engine (Prism Chromatic Dispersion) ---
  function initSpecularEngine() {
    const cards = document.querySelectorAll(
      '.glass-card, .glass-ultra, .arcade-wheel-rim, [class*="bg-slate-900"], [class*="bg-slate-800"], .crystal-plate'
    );
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '20%');
      });
    });
  }

  // --- 2. 3D Arcade Wheel LED Bulbs Controller (Chasing Light Effect) ---
  let arcadeLedInterval = null;

  function initArcadeLedBulbs() {
    const containers = [
      document.getElementById('led-bulbs-container'),
      document.getElementById('m05-led-bulbs-container')
    ];

    containers.forEach((container) => {
      if (!container || container.children.length > 0) return;
      const numBulbs = 16;
      const radius = container.offsetWidth > 0 ? container.offsetWidth / 2 - 12 : 140;
      const center = container.offsetWidth > 0 ? container.offsetWidth / 2 : 150;

      for (let i = 0; i < numBulbs; i++) {
        const angle = (i * 2 * Math.PI) / numBulbs;
        const x = center + radius * Math.cos(angle) - 6;
        const y = center + radius * Math.sin(angle) - 6;

        const bulb = document.createElement('div');
        bulb.className = 'arcade-bulb' + (i % 2 === 0 ? ' bulb-on' : '');
        bulb.style.left = x + 'px';
        bulb.style.top = y + 'px';
        container.appendChild(bulb);
      }
    });

    if (!arcadeLedInterval) {
      arcadeLedInterval = setInterval(() => {
        document.querySelectorAll('.arcade-bulb, .led-bulb').forEach((bulb) => {
          bulb.classList.toggle('bulb-on');
        });
      }, 300);
    }
  }

  // --- 3. DOM Ready Initialization ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initSpecularEngine();
      initArcadeLedBulbs();
    });
  } else {
    initSpecularEngine();
    initArcadeLedBulbs();
  }

  window.initArcadeLedBulbs = initArcadeLedBulbs;
})();
