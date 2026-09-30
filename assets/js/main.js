/**
 * Main Application Script for Eureka Customer Awards 2026 Landing Page
 * Handles UI tab switches, FAQ accordion, modals, and Zalo Voucher application.
 */

// --- 1. Prize Tab Switching ---
function switchPrizeTab(tabId) {
  document.querySelectorAll('.prize-tab-content').forEach(el => {
    el.classList.add('hidden');
  });

  const activeClasses = ['bg-gradient-to-r', 'from-brand-600', 'to-amber-500', 'text-white', 'shadow-lg', 'font-black'];
  const inactiveClasses = ['text-slate-300', 'font-bold', 'hover:text-white', 'hover:bg-white/5'];

  document.querySelectorAll('.prize-tab-btn').forEach(btn => {
    btn.classList.remove(...activeClasses);
    btn.classList.remove('bg-brand-600', 'text-white', 'shadow-md', 'active');
    btn.classList.add(...inactiveClasses);
  });

  const activeContent = document.getElementById('tab-content-' + tabId);
  const activeBtn = document.getElementById('tab-btn-' + tabId);

  if (activeContent) {
    activeContent.classList.remove('hidden');
  }
  if (activeBtn) {
    activeBtn.classList.remove(...inactiveClasses);
    activeBtn.classList.add(...activeClasses, 'active');
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

// --- 3. Winning Modal & Confetti Handler for Welcome Wheel ---
let currentWinningInfo = {
  prize: '',
  voucherCode: '',
  phone: ''
};

function showWinningResult(prizeObj, maskedPhone, rawPhone, voucherCode) {
  if (typeof closeWelcomeWheelModal === 'function') {
    closeWelcomeWheelModal();
  }
  const modal = document.getElementById('win-modal');
  const titleEl = document.getElementById('modal-prize-title');
  const codeEl = document.getElementById('modal-voucher-code');

  const finalCode = voucherCode || ('ERK-' + Math.floor(100000 + Math.random() * 900000));
  const finalPrize = prizeObj.prize || prizeObj.text;

  currentWinningInfo = {
    prize: finalPrize,
    voucherCode: finalCode,
    phone: rawPhone || ''
  };

  if (titleEl) titleEl.innerText = finalPrize;
  if (codeEl) codeEl.innerText = finalCode;
  if (modal) modal.classList.remove('hidden');

  // Push to Live Winner Stream ticker
  const ticker = document.getElementById('winner-ticker-list');
  if (ticker) {
    const newEntry = document.createElement('div');
    newEntry.className = 'flex items-center justify-between text-xs p-2 rounded-lg bg-brand-500/10 border border-brand-500/40 animate-pulse';
    newEntry.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-amber-400 font-mono font-bold">${maskedPhone}</span>
        <span class="text-white font-medium">Khách hàng vừa quay</span>
      </div>
      <span class="font-bold text-emerald-400">${prizeObj.text}</span>
    `;
    ticker.insertBefore(newEntry, ticker.firstChild);

    while (ticker.children.length > 8) {
      ticker.removeChild(ticker.lastChild);
    }
  }

  // Trigger celebration confetti
  if (typeof startConfetti === 'function') {
    startConfetti();
  }
}

function handleApplyZaloVoucher(e) {
  const code = currentWinningInfo.voucherCode || 'EUREKA-VOUCHER';
  const prize = currentWinningInfo.prize || 'Voucher Ưu Đãi';
  const phone = currentWinningInfo.phone || '';

  const msg = `Xin chào Eureka Logistics! Tôi có SĐT ${phone} vừa quay trúng thưởng ${prize} (Mã: ${code}) trên website sự kiện Eureka Customer Awards 2026. Nhờ Eureka hỗ trợ áp dụng ưu đãi này vào đơn hàng của tôi nhé!`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(msg).catch(() => {});
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
  });
}

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeWinModal();
    if (typeof closeWelcomeWheelModal === 'function') closeWelcomeWheelModal();
    if (typeof closeAdminLoginModal === 'function') closeAdminLoginModal();
    if (typeof closeAdminDashboard === 'function') closeAdminDashboard();
  }
});
