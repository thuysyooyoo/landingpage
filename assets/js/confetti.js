/**
 * Confetti & Modal Engine
 * Pure HTML5 Canvas Particle System + Winning Modal Interactions
 */

let confettiAnimationId = null;
const confettiCanvas = document.getElementById('confetti-canvas');
let confettiCtx = null;
let confettiParticles = [];

if (confettiCanvas) {
  confettiCtx = confettiCanvas.getContext('2d');
}

function startConfetti() {
  if (!confettiCanvas || !confettiCtx) return;
  confettiCanvas.classList.remove('hidden');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  confettiParticles = [];

  const colors = ['#F59E0B', '#EA580C', '#FDE047', '#38BDF8', '#10B981', '#FFFFFF'];
  for (let i = 0; i < 160; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: Math.random() * 4 - 2,
      vy: Math.random() * 4 + 3,
      tilt: Math.random() * 10,
      tiltSpeed: Math.random() * 0.1 + 0.05
    });
  }

  function drawConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.tilt += p.tiltSpeed;
      confettiCtx.beginPath();
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(p.x, p.y, p.size, p.size);
    });

    confettiParticles.forEach(p => {
      if (p.y > confettiCanvas.height) {
        p.y = -10;
        p.x = Math.random() * confettiCanvas.width;
      }
    });

    confettiAnimationId = requestAnimationFrame(drawConfetti);
  }

  drawConfetti();
}

function stopConfetti() {
  if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
  if (confettiCanvas) confettiCanvas.classList.add('hidden');
}

function showWinningResult(prizeObj, orderCode) {
  const modal = document.getElementById('win-modal');
  const titleEl = document.getElementById('modal-prize-title');
  const codeEl = document.getElementById('modal-voucher-code');

  if (titleEl) titleEl.innerText = prizeObj.prize;
  if (codeEl) codeEl.innerText = 'ERK-WIN-' + Math.floor(100000 + Math.random() * 900000);
  if (modal) modal.classList.remove('hidden');

  // Add to live stream ticker
  const ticker = document.getElementById('winner-ticker-list');
  if (ticker) {
    const newEntry = document.createElement('div');
    newEntry.className = 'flex items-center justify-between text-xs p-2 rounded-lg bg-brand-500/10 border border-brand-500/40 animate-pulse';
    newEntry.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-amber-400 font-mono font-bold">${orderCode}</span>
        <span class="text-white font-medium">Doanh nghiệp vừa quay</span>
      </div>
      <span class="font-bold text-emerald-400">${prizeObj.text}</span>
    `;
    ticker.insertBefore(newEntry, ticker.firstChild);
  }

  startConfetti();
}

function closeWinModal() {
  const modal = document.getElementById('win-modal');
  if (modal) modal.classList.add('hidden');
  stopConfetti();
}

function copyVoucherCode() {
  const codeEl = document.getElementById('modal-voucher-code');
  if (!codeEl) return;
  const code = codeEl.innerText;
  navigator.clipboard.writeText(code);

  const btn = document.getElementById('copy-btn');
  if (btn) {
    btn.innerText = 'ĐÃ SAO CHÉP!';
    btn.classList.add('bg-emerald-600');
    setTimeout(() => {
      btn.innerText = 'SAO CHÉP MÃ';
      btn.classList.remove('bg-emerald-600');
    }, 2000);
  }
}

// Window resize handler for confetti
window.addEventListener('resize', () => {
  if (confettiCanvas && !confettiCanvas.classList.contains('hidden')) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
});
