/**
 * Main Application Script for Eureka Customer Awards 2026 Landing Page
 * Handles UI tab switches, FAQ accordion, modals, and user interactions.
 */

// --- 1. Prize Tab Switching ---
function switchPrizeTab(tabId) {
  // Hide all tab contents
  document.querySelectorAll('.prize-tab-content').forEach(el => {
    el.classList.add('hidden');
  });

  // Reset all tab button styles
  document.querySelectorAll('.prize-tab-btn').forEach(btn => {
    btn.classList.remove('bg-brand-600', 'text-white', 'shadow-md');
    btn.classList.add('text-slate-400', 'hover:text-white');
  });

  // Activate target content
  const activeContent = document.getElementById('tab-content-' + tabId);
  const activeBtn = document.getElementById('tab-btn-' + tabId);

  if (activeContent) {
    activeContent.classList.remove('hidden');
  }
  if (activeBtn) {
    activeBtn.classList.add('bg-brand-600', 'text-white', 'shadow-md');
    activeBtn.classList.remove('text-slate-400', 'hover:text-white');
  }
}

// --- 2. FAQ Accordion Toggle ---
function toggleFaq(index) {
  const content = document.getElementById('faq-content-' + index);
  const icon = document.getElementById('faq-icon-' + index);

  if (!content || !icon) return;

  if (content.classList.contains('hidden')) {
    content.classList.remove('hidden');
    icon.textContent = '−';
    icon.classList.add('rotate-180');
  } else {
    content.classList.add('hidden');
    icon.textContent = '+';
    icon.classList.remove('rotate-180');
  }
}

// --- 3. Winning Modal & Confetti Handler ---
function showWinningResult(prizeObj, orderCode) {
  const modal = document.getElementById('win-modal');
  const titleEl = document.getElementById('modal-prize-title');
  const codeEl = document.getElementById('modal-voucher-code');

  if (titleEl) titleEl.innerText = prizeObj.prize || prizeObj.text;
  if (codeEl) codeEl.innerText = 'ERK-' + Math.floor(100000 + Math.random() * 900000);
  if (modal) modal.classList.remove('hidden');

  // Push to Live Winner Stream ticker
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

    // Keep max 10 entries
    while (ticker.children.length > 10) {
      ticker.removeChild(ticker.lastChild);
    }
  }

  // Trigger celebration confetti
  if (typeof startConfetti === 'function') {
    startConfetti();
  }
}

function closeWinModal() {
  const modal = document.getElementById('win-modal');
  if (modal) modal.classList.add('hidden');
  if (typeof stopConfetti === 'function') {
    stopConfetti();
  }
}

function copyVoucherCode() {
  const codeEl = document.getElementById('modal-voucher-code');
  if (!codeEl) return;
  const code = codeEl.innerText;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copy-btn');
    if (btn) {
      const originalText = btn.innerText;
      btn.innerText = 'ĐÃ SAO CHÉP!';
      btn.classList.add('bg-emerald-600');
      setTimeout(() => {
        btn.innerText = originalText;
        btn.classList.remove('bg-emerald-600');
      }, 2000);
    }
  }).catch(() => {
    alert('Đã chọn mã: ' + code);
  });
}

// Global keyboard accessibility (ESC closes modal)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeWinModal();
  }
});
