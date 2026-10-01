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

  const btnText = document.getElementById('modal-zalo-btn-text');
  if (btnText) {
    btnText.textContent = '✅ ĐÃ SAO CHÉP LỜI NHẮN! ĐANG MỞ ZALO...';
    setTimeout(() => {
      btnText.textContent = 'Áp Dụng Mã Ngay Qua Zalo Hotline';
    }, 3000);
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
    if (typeof closeGiaiPhuModal === 'function') closeGiaiPhuModal();
  }
});

// ==================== 5. NHIỆM VỤ HỆ THỐNG DYNAMIC PUBLISHING ENGINE ====================
const STORAGE_KEY_NHIEM_VU = 'eureka_nhiem_vu_config';

const DEFAULT_NHIEM_VU_CONFIG = {
  active_mode: 'chang-1', // 'chang-1' | 'chang-2' | 'chang-3' | 'tong-ket'
  chang_1: {
    title: 'Khởi Động Sớm',
    period_title: 'CHẶNG 1 — THÁNG 10',
    time_range: '01/10 – 30/10/2026',
    desc: 'Tránh nguy cơ tắc nghẽn kho bãi mùa cao điểm bằng việc lên đơn ngay từ đầu tháng 10.',
    condition: 'Tối thiểu 01 đơn booking',
    condition_detail: 'Tạo từ 01/10 đến 30/10, hoàn thành trước 15/01/2027',
    reward: 'VIP+1 Trọn Tháng 11',
    reward_desc: 'Giảm đến 30% cước gom cont theo cấp VIP',
    theme: 'amber',
    image: 'assets/images/chang-1-khoi-dong.jpg',
    customer_codes: [
      'ERK-KH-8891', 'ERK-KH-4432', 'ERK-KH-1205', 'ERK-KH-9012',
      'ERK-KH-7731', 'ERK-KH-5524', 'ERK-KH-3198', 'ERK-KH-6640',
      'ERK-KH-2287', 'ERK-KH-9914', 'ERK-KH-1043', 'ERK-KH-8320',
      'ERK-KH-4176', 'ERK-KH-5902', 'ERK-KH-7241', 'ERK-KH-3819',
      'ERK-KH-6055', 'ERK-KH-2790'
    ]
  },
  chang_2: {
    title: 'Giữ Nhịp Cao Điểm',
    period_title: 'CHẶNG 2 — THÁNG 11',
    time_range: '01/11 – 20/11/2026',
    desc: 'Tâm điểm mùa săn sale Black Friday & 11/11. Giữ vững tốc độ nhập hàng cung ứng thị trường Tết.',
    condition: '02 đơn booking trong tháng 11',
    condition_detail: 'Trong đó ít nhất 01 đơn trước ngày 20/11',
    reward: 'VIP+1 Trọn Tháng 12',
    reward_desc: 'Giảm đến 30% cước gom cont theo cấp VIP',
    theme: 'orange',
    image: 'assets/images/chang-2-cao-diem.jpg',
    customer_codes: [
      'ERK-KH-8891', 'ERK-KH-4432', 'ERK-KH-1205', 'ERK-KH-9012',
      'ERK-KH-7731', 'ERK-KH-5524', 'ERK-KH-3198', 'ERK-KH-6640',
      'ERK-KH-2287', 'ERK-KH-9914', 'ERK-KH-1043', 'ERK-KH-8320',
      'ERK-KH-4176', 'ERK-KH-5902'
    ]
  },
  chang_3: {
    title: 'Về Đích An Toàn',
    period_title: 'CHẶNG 3 — THÁNG 12',
    time_range: '01/12 – 20/12/2026',
    desc: 'Chặng nước rút thông quan trước khi nhà máy Trung Quốc nghỉ Tết. Bảo đảm hàng về kho trước Tết.',
    condition: 'Tối thiểu 01 đơn booking',
    condition_detail: 'Tạo từ 01/12 đến 20/12, hoàn thành trước 15/01/2027',
    reward: 'VIP+1 Trọn Tháng 01/2027',
    reward_desc: 'Tăng thêm 15 ngày công nợ cho VIP Elite+',
    theme: 'blue',
    image: 'assets/images/chang-3-ve-dich.jpg',
    customer_codes: [
      'ERK-KH-8891', 'ERK-KH-4432', 'ERK-KH-1205', 'ERK-KH-9012',
      'ERK-KH-7731', 'ERK-KH-5524', 'ERK-KH-3198', 'ERK-KH-6640',
      'ERK-KH-2287', 'ERK-KH-9914', 'ERK-KH-1043'
    ]
  }
};

function getNhiemVuConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NHIEM_VU);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.active_mode) return parsed;
    }
  } catch (e) {}
  return DEFAULT_NHIEM_VU_CONFIG;
}

function saveNhiemVuConfig(config) {
  localStorage.setItem(STORAGE_KEY_NHIEM_VU, JSON.stringify(config));
}

let currentNhiemVuCodes = [];

function renderNhiemVuDisplay() {
  const container = document.getElementById('nhiem-vu-display-wrapper');
  if (!container) return;

  const cfg = getNhiemVuConfig();
  const mode = cfg.active_mode || 'chang-1';

  if (mode === 'tong-ket') {
    // Mode Tổng Kết Cả 3 Chặng
    const count1 = (cfg.chang_1?.customer_codes || []).length;
    const count2 = (cfg.chang_2?.customer_codes || []).length;
    const count3 = (cfg.chang_3?.customer_codes || []).length;

    container.innerHTML = `
      <div class="rounded-3xl p-6 sm:p-8 bg-slate-800/40 backdrop-blur-2xl border border-white/15 shadow-2xl relative overflow-hidden">
        <div class="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="text-center max-w-2xl mx-auto mb-8 relative z-10">
          <span class="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30 uppercase tracking-wider inline-block mb-3">
            📊 BẢNG TỔNG KẾT TOÀN DIỆN CHƯƠNG TRÌNH
          </span>
          <h3 class="text-2xl sm:text-3xl font-black text-white font-display">
            Tổng Kết 3 Chặng Nhiệm Vụ Hệ Thống
          </h3>
          <p class="text-xs sm:text-sm text-slate-300 mt-2">
            Thống kê số lượng khách hàng hoàn thành nhiệm vụ và được tự động nâng hạng VIP+1 qua từng cột mốc
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
          <!-- Cột 1 -->
          <div class="p-6 rounded-2xl bg-slate-900/80 border-t-4 border-amber-400 border-x border-b border-slate-700/80 shadow-xl flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg">CHẶNG 1 — T10</span>
                <span class="text-xs text-slate-400 font-semibold">01/10 – 30/10</span>
              </div>
              <h4 class="text-lg font-black text-white mb-1 font-display">"Khởi Động Sớm"</h4>
              <p class="text-xs text-slate-400 mb-3">Tối thiểu 01 đơn booking</p>
              <div class="my-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Số KH Đạt Chuẩn</span>
                <div class="text-3xl sm:text-4xl font-black text-amber-400 font-mono">${count1}</div>
                <span class="text-[11px] text-emerald-400 font-semibold mt-1 block">✓ Đã nhận VIP+1 Tháng 11</span>
              </div>
            </div>
            <div class="pt-3 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>Giảm tới 30% cước</span>
              <span class="text-emerald-400 font-bold">100% Hoàn tất</span>
            </div>
          </div>

          <!-- Cột 2 -->
          <div class="p-6 rounded-2xl bg-slate-900/80 border-t-4 border-orange-500 border-x border-b border-slate-700/80 shadow-xl flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-black text-orange-300 bg-orange-500/15 border border-orange-500/30 px-2.5 py-1 rounded-lg">CHẶNG 2 — T11</span>
                <span class="text-xs text-slate-400 font-semibold">01/11 – 20/11</span>
              </div>
              <h4 class="text-lg font-black text-white mb-1 font-display">"Giữ Nhịp Cao Điểm"</h4>
              <p class="text-xs text-slate-400 mb-3">02 đơn booking Tháng 11</p>
              <div class="my-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Số KH Đạt Chuẩn</span>
                <div class="text-3xl sm:text-4xl font-black text-orange-400 font-mono">${count2}</div>
                <span class="text-[11px] text-emerald-400 font-semibold mt-1 block">✓ Đã nhận VIP+1 Tháng 12</span>
              </div>
            </div>
            <div class="pt-3 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>Giảm tới 30% cước</span>
              <span class="text-emerald-400 font-bold">100% Hoàn tất</span>
            </div>
          </div>

          <!-- Cột 3 -->
          <div class="p-6 rounded-2xl bg-slate-900/80 border-t-4 border-blue-400 border-x border-b border-slate-700/80 shadow-xl flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-black text-blue-300 bg-blue-500/15 border border-blue-500/30 px-2.5 py-1 rounded-lg">CHẶNG 3 — T12</span>
                <span class="text-xs text-slate-400 font-semibold">01/12 – 20/12</span>
              </div>
              <h4 class="text-lg font-black text-white mb-1 font-display">"Về Đích An Toàn"</h4>
              <p class="text-xs text-slate-400 mb-3">Tối thiểu 01 đơn booking</p>
              <div class="my-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Số KH Đạt Chuẩn</span>
                <div class="text-3xl sm:text-4xl font-black text-blue-400 font-mono">${count3}</div>
                <span class="text-[11px] text-emerald-400 font-semibold mt-1 block">✓ Đã nhận VIP+1 Tháng 01/2027</span>
              </div>
            </div>
            <div class="pt-3 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>Tăng 15 ngày nợ Elite+</span>
              <span class="text-emerald-400 font-bold">100% Hoàn tất</span>
            </div>
          </div>
        </div>

        <!-- Super VIP Grand Banner -->
        <div class="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900/90 to-blue-500/20 border-2 border-amber-400/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div class="flex items-center gap-4">
            <span class="text-4xl sm:text-5xl">🏆</span>
            <div>
              <h4 class="text-base sm:text-lg font-black text-amber-300 font-display">Chiến Binh Bứt Phá — Hoàn Thành Trọn Vẹn 3 Chặng</h4>
              <p class="text-xs sm:text-sm text-slate-300 mt-0.5 leading-relaxed">
                Các khách hàng xuất sắc hoàn thành liên tiếp cả 3 chặng được vinh danh tại Gala Year-End Party và duy trì đặc quyền VIP ELITE+ dài hạn!
              </p>
            </div>
          </div>
          <span class="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black whitespace-nowrap self-start sm:self-center">
            🎖️ Tôn Vinh Đêm Gala
          </span>
        </div>
      </div>
    `;
    return;
  }

  // Single Chặng Mode ('chang-1', 'chang-2', 'chang-3')
  const curChang = cfg[mode.replace('-', '_')] || cfg.chang_1;
  const codes = curChang.customer_codes || [];
  currentNhiemVuCodes = codes;

  const themeColors = {
    amber: { border: 'border-amber-400/80', badge: 'bg-amber-400/20 text-amber-300 border-amber-400/40', text: 'text-amber-300' },
    orange: { border: 'border-orange-500/80', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40', text: 'text-orange-300' },
    blue: { border: 'border-blue-400/80', badge: 'bg-blue-400/20 text-blue-300 border-blue-400/40', text: 'text-blue-300' }
  }[curChang.theme || 'amber'];

  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      <!-- Cột Trái (lg:col-span-7 xl:col-span-8): BẢNG THỂ HIỆN CHẶNG THI ĐUA NỔI BẬT & TIẾN TRÌNH -->
      <div class="lg:col-span-7 xl:col-span-8 flex flex-col justify-between rounded-3xl p-6 sm:p-8 bg-slate-800/50 backdrop-blur-2xl border-2 ${themeColors.border} shadow-2xl relative overflow-hidden group">
        <div class="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10">
          <!-- Mini 3-Chặng Progress Roadmap -->
          <div class="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 mb-5">
            <div class="p-2 sm:p-2.5 rounded-xl border text-center transition-all ${mode === 'chang-1' ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-md ring-1 ring-amber-400/50' : 'bg-slate-900/60 border-slate-800 text-slate-400'}">
              <div class="flex items-center justify-center gap-1 text-[11px] font-black uppercase">
                <span>Chặng 1</span>
                ${mode === 'chang-1' ? '<span class="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>' : '<span class="text-emerald-400">✓</span>'}
              </div>
              <div class="text-[10px] text-slate-400 mt-0.5 font-medium">01/10 – 30/10</div>
              <div class="text-[9px] ${mode === 'chang-1' ? 'text-amber-300 font-bold' : 'text-emerald-400 font-semibold'} mt-0.5">
                ${mode === 'chang-1' ? '⚡ Đang công bố' : 'Hoàn thành'}
              </div>
            </div>

            <div class="p-2 sm:p-2.5 rounded-xl border text-center transition-all ${mode === 'chang-2' ? 'bg-orange-500/20 border-orange-400 text-orange-300 font-bold shadow-md ring-1 ring-orange-400/50' : 'bg-slate-900/60 border-slate-800 text-slate-400'}">
              <div class="flex items-center justify-center gap-1 text-[11px] font-black uppercase">
                <span>Chặng 2</span>
                ${mode === 'chang-2' ? '<span class="inline-block w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping"></span>' : ''}
              </div>
              <div class="text-[10px] text-slate-400 mt-0.5 font-medium">01/11 – 20/11</div>
              <div class="text-[9px] ${mode === 'chang-2' ? 'text-orange-300 font-bold' : 'text-slate-500'} mt-0.5">
                ${mode === 'chang-2' ? '⚡ Đang công bố' : 'Kế tiếp'}
              </div>
            </div>

            <div class="p-2 sm:p-2.5 rounded-xl border text-center transition-all ${mode === 'chang-3' ? 'bg-blue-500/20 border-blue-400 text-blue-300 font-bold shadow-md ring-1 ring-blue-400/50' : 'bg-slate-900/60 border-slate-800 text-slate-400'}">
              <div class="flex items-center justify-center gap-1 text-[11px] font-black uppercase">
                <span>Chặng 3</span>
                ${mode === 'chang-3' ? '<span class="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>' : ''}
              </div>
              <div class="text-[10px] text-slate-400 mt-0.5 font-medium">01/12 – 20/12</div>
              <div class="text-[9px] ${mode === 'chang-3' ? 'text-blue-300 font-bold' : 'text-slate-500'} mt-0.5">
                ${mode === 'chang-3' ? '⚡ Đang công bố' : 'Về đích Gala'}
              </div>
            </div>
          </div>

          <!-- Header Chặng & Hero Banner Hình Ảnh Với Blur Đen -->
          <div class="relative rounded-2xl overflow-hidden mb-5 border border-white/15 shadow-2xl h-44 sm:h-52 group/hero">
            <img src="${curChang.image || (mode === 'chang-2' ? 'assets/images/chang-2-cao-diem.jpg' : (mode === 'chang-3' ? 'assets/images/chang-3-ve-dich.jpg' : 'assets/images/chang-1-khoi-dong.jpg'))}" alt="${curChang.title}" class="w-full h-full object-cover group-hover/hero:scale-105 transition-transform duration-700 brightness-90" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/25 backdrop-blur-[1px]"></div>
            
            <div class="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between z-10">
              <div class="flex items-center justify-between">
                <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border backdrop-blur-md shadow-lg ${themeColors.badge}">
                  ${curChang.period_title}
                </span>
                <span class="text-xs font-bold text-white bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 shadow">
                  📅 ${curChang.time_range}
                </span>
              </div>

              <div>
                <span class="text-[11px] font-bold text-amber-300 uppercase tracking-widest block mb-1 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  TIÊU ĐIỂM CHẶNG ĐUA CAO ĐIỂM
                </span>
                <h3 class="text-2xl sm:text-3xl font-black text-white font-display drop-shadow-lg mb-1">
                  "${curChang.title}"
                </h3>
                <p class="text-xs text-slate-200 line-clamp-2 max-w-xl drop-shadow leading-relaxed">
                  ${curChang.desc}
                </p>
              </div>
            </div>
          </div>

          <!-- 2 Cột: Điều kiện & Phần thưởng đặt song song -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <!-- Điều kiện xét giải -->
            <div class="p-4 rounded-2xl bg-slate-900/85 border border-slate-700/80 flex flex-col justify-between">
              <div>
                <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  📋 Thể Lệ & Điều Kiện:
                </span>
                <span class="text-base font-extrabold ${themeColors.text} block">
                  ${curChang.condition}
                </span>
              </div>
              <span class="block text-xs text-slate-400 mt-2 leading-snug pt-2 border-t border-slate-800">
                ${curChang.condition_detail}
              </span>
            </div>

            <!-- Phần thưởng -->
            <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-between">
              <div>
                <span class="block text-[11px] font-bold text-emerald-400 uppercase tracking-wide mb-1">
                  🎁 Quyền Lợi Đạt Chuẩn:
                </span>
                <span class="text-base font-black text-emerald-300 block">
                  ${curChang.reward}
                </span>
              </div>
              <span class="block text-xs text-slate-300 mt-2 leading-snug pt-2 border-t border-emerald-500/20">
                ${curChang.reward_desc || 'Tự động nâng hạng VIP lên cấp cao hơn, giảm cước vận chuyển.'}
              </span>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-700/80 flex items-center justify-between relative z-10 mt-2">
          <span class="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            ĐANG CÔNG BỐ KẾT QUẢ CHÍNH THỨC
          </span>
          <a href="#cot-moc-vip" class="text-xs font-bold text-amber-300 hover:text-white transition-colors flex items-center gap-1">
            <span>Khung đặc quyền VIP</span>
            <span>↓</span>
          </a>
        </div>
      </div>

      <!-- Cột Phải (lg:col-span-5 xl:col-span-4): DANH SÁCH MÃ KH ĐẠT CHUẨN THU NHỎ GỌN GÀNG -->
      <div class="lg:col-span-5 xl:col-span-4 flex flex-col justify-between rounded-3xl p-5 sm:p-6 bg-slate-800/40 backdrop-blur-2xl border border-white/15 shadow-2xl relative overflow-hidden">
        <div class="absolute -top-24 -right-24 w-52 h-52 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10">
          <!-- Header danh sách thu gọn -->
          <div class="flex items-center justify-between gap-2 mb-3.5 pb-3 border-b border-slate-700">
            <div>
              <h3 class="text-base font-black text-white font-display flex items-center gap-1.5">
                <span>👑</span> Mã KH Đạt Chuẩn
              </h3>
              <p class="text-[11px] text-slate-300">Đã nâng hạng VIP+1</p>
            </div>
            <span id="nhiem-vu-count-badge" class="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black whitespace-nowrap">
              🎉 ${codes.length} Mã KH
            </span>
          </div>

          <!-- Quick Filter Input Compact -->
          <div class="relative mb-3">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input type="text" id="nhiem-vu-code-filter" oninput="filterNhiemVuCodes(this.value)" placeholder="Tra cứu mã nhanh (VD: 8891)..." class="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 shadow-inner" />
          </div>

          <!-- Codes Badges Grid: 2 cột compact, chiều cao vừa vặn -->
          <div id="nhiem-vu-codes-list" class="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
            ${renderNhiemVuCodeBadges(codes)}
          </div>
        </div>

        <!-- Footer Notice Compact -->
        <div class="pt-3 border-t border-slate-700/80 mt-3 flex items-center justify-between text-[11px] relative z-10 text-slate-400">
          <span>⚡ Hệ thống nâng cấp tự động</span>
          <span class="text-emerald-400 font-bold whitespace-nowrap">
            ✓ Đối soát hợp lệ
          </span>
        </div>
      </div>
    </div>
  `;
}

function renderNhiemVuCodeBadges(codes) {
  if (!codes || codes.length === 0) {
    return `<div class="col-span-full py-6 text-center text-xs text-slate-400">Chưa có mã khách hàng nào đạt chuẩn.</div>`;
  }
  return codes.map(code => `
    <div class="py-1.5 px-2.5 rounded-lg bg-slate-900/85 border border-slate-700/70 hover:border-amber-400/50 transition-all flex items-center justify-between gap-1.5 group">
      <span class="font-mono text-xs font-bold text-amber-300 tracking-wider group-hover:text-amber-200 truncate">
        ${code}
      </span>
      <span class="text-[9px] font-bold text-emerald-300 bg-emerald-500/15 px-1 py-0.2 rounded border border-emerald-500/30 shrink-0">
        VIP+1
      </span>
    </div>
  `).join('');
}

function filterNhiemVuCodes(query) {
  const container = document.getElementById('nhiem-vu-codes-list');
  if (!container) return;
  const q = (query || '').toLowerCase().trim();
  const qClean = q.replace(/[^a-z0-9]/g, '');

  const filtered = currentNhiemVuCodes.filter(c => {
    const code = c.toLowerCase();
    const codeClean = code.replace(/[^a-z0-9]/g, '');
    return code.includes(q) || (qClean && codeClean.includes(qClean));
  });

  container.innerHTML = renderNhiemVuCodeBadges(filtered);
}

// ==================== 7. HỆ THỐNG PHÂN PHỐI BẢNG XẾP HẠNG 05 GIẢI PHỤ CHUYÊN MÔN ====================
function parseWeightKg(str) {
  if (!str) return { kg: 0, label: '0 kg' };
  const part = str.split('|')[0] || '';
  const numStr = part.replace(',', '.').match(/([\d.]+)\s*(tấn|kg|t)/i);
  if (numStr) {
    const val = parseFloat(numStr[1]);
    const unit = numStr[2].toLowerCase();
    if (unit.includes('t')) {
      return { kg: val * 1000, label: `${val.toLocaleString('vi-VN')} tấn (${(val * 1000).toLocaleString('vi-VN')} kg)` };
    }
    return { kg: val, label: `${(val / 1000).toLocaleString('vi-VN')} tấn (${val.toLocaleString('vi-VN')} kg)` };
  }
  return { kg: 0, label: part.trim() || '0 kg' };
}

function parseVolumeM3(str) {
  if (!str) return { m3: 0, label: '0 m³' };
  const parts = str.split('|');
  const part = parts[1] || parts[0] || '';
  const numStr = part.replace(',', '.').match(/([\d.]+)\s*(m³|m3|cbm)/i);
  if (numStr) {
    const val = parseFloat(numStr[1]);
    return { m3: val, label: `${val.toLocaleString('vi-VN')} m³` };
  }
  return { m3: 0, label: part.trim() || '0 m³' };
}

function formatVND(num) {
  if (typeof num !== 'number') num = parseFloat(num) || 0;
  return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
}

const GIAI_PHU_CONFIGS = {
  'vua-so-luong-don': {
    id: 'vua-so-luong-don',
    name: 'Vua Số Lượng Đơn',
    icon: '📦',
    prize: '3.000.000 đ',
    badge: 'Tiêu chí đơn hàng',
    criterion: 'Khách hàng có tổng số đơn booking hoàn tất nhiều nhất trong chương trình.',
    colMetric: 'Tổng Đơn',
    filterAndSort: (data) => {
      return [...data].sort((a, b) => (b.order_count || 0) - (a.order_count || 0) || (b.service_fee || 0) - (a.service_fee || 0));
    },
    formatMetric: (item) => `${item.order_count || 0} đơn`
  },
  'tan-binh-xuat-sac': {
    id: 'tan-binh-xuat-sac',
    name: 'Tân Binh Xuất Sắc',
    icon: '🌟',
    prize: '3.000.000 đ',
    badge: 'Khách hàng mới',
    criterion: 'Khách hàng Mới (tạo tài khoản từ 01/10) có Phí Dịch Vụ tích lũy cao nhất.',
    colMetric: 'Phí Dịch Vụ Mới',
    filterAndSort: (data) => {
      const filtered = data.filter(item => {
        const tier = (item.vip_tier || '').toUpperCase();
        const tag = (item.prize_tag || '').toLowerCase();
        return tier.includes('MỚI') || tag.includes('tân binh');
      });
      return filtered.sort((a, b) => (b.service_fee || 0) - (a.service_fee || 0));
    },
    formatMetric: (item) => formatVND(item.service_fee)
  },
  'su-tro-lai-an-tuong': {
    id: 'su-tro-lai-an-tuong',
    name: 'Sự Trở Lại Ấn Tượng',
    icon: '🔄',
    prize: '3.000.000 đ',
    badge: 'Tái kích hoạt',
    criterion: 'Khách hàng cũ (từ đầu năm chưa gửi hàng) quay lại gửi hàng bứt phá nhất.',
    colMetric: 'Doanh Số Bứt Phá',
    filterAndSort: (data) => {
      const filtered = data.filter(item => {
        const tier = (item.vip_tier || '').toUpperCase();
        const tag = (item.prize_tag || '').toLowerCase();
        return tier.includes('CŨ') || tag.includes('trở lại') || tag.includes('tái kích hoạt');
      });
      return filtered.sort((a, b) => (b.service_fee || 0) - (a.service_fee || 0));
    },
    formatMetric: (item) => formatVND(item.service_fee)
  },
  'vua-tai-trong': {
    id: 'vua-tai-trong',
    name: 'Vua Tải Trọng (Kg)',
    icon: '⚓',
    prize: '3.000.000 đ',
    badge: 'Tổng khối lượng',
    criterion: 'Tổng khối lượng kg cao nhất (áp dụng lô hàng đi term E & F quốc tế).',
    colMetric: 'Tổng Tải Trọng',
    filterAndSort: (data) => {
      return [...data].map(item => {
        const p = parseWeightKg(item.volume_weight);
        return { ...item, _metricValue: p.kg, _metricLabel: p.label };
      }).sort((a, b) => b._metricValue - a._metricValue || (b.service_fee || 0) - (a.service_fee || 0));
    },
    formatMetric: (item) => item._metricLabel || parseWeightKg(item.volume_weight).label
  },
  'vua-khoi-luong': {
    id: 'vua-khoi-luong',
    name: 'Vua Khối Lượng (M³)',
    icon: '🚛',
    prize: '3.000.000 đ',
    badge: 'Tổng thể tích',
    criterion: 'Tổng thể tích m³ cao nhất (áp dụng lô hàng gom cont chính ngạch).',
    colMetric: 'Tổng Thể Tích',
    filterAndSort: (data) => {
      return [...data].map(item => {
        const p = parseVolumeM3(item.volume_weight);
        return { ...item, _metricValue: p.m3, _metricLabel: p.label };
      }).sort((a, b) => b._metricValue - a._metricValue || (b.service_fee || 0) - (a.service_fee || 0));
    },
    formatMetric: (item) => item._metricLabel || parseVolumeM3(item.volume_weight).label
  }
};

let currentGiaiPhuKey = 'vua-so-luong-don';
let currentGiaiPhuList = [];

function openGiaiPhuModal(awardKey = 'vua-so-luong-don') {
  currentGiaiPhuKey = awardKey;
  const modal = document.getElementById('giai-phu-modal');
  if (!modal) return;

  const searchInput = document.getElementById('giai-phu-search-input');
  if (searchInput) searchInput.value = '';

  switchGiaiPhuTab(awardKey);
  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

function closeGiaiPhuModal() {
  const modal = document.getElementById('giai-phu-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
}

function switchGiaiPhuTab(awardKey) {
  currentGiaiPhuKey = awardKey;
  const cfg = GIAI_PHU_CONFIGS[awardKey];
  if (!cfg) return;

  // Cập nhật Active Tab buttons
  document.querySelectorAll('.giai-phu-tab-btn').forEach(btn => {
    btn.className = 'giai-phu-tab-btn px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700';
  });
  const activeBtn = document.getElementById(`tab-btn-${awardKey}`);
  if (activeBtn) {
    activeBtn.className = 'giai-phu-tab-btn px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all bg-amber-400 text-slate-950 shadow';
  }

  // Header info
  const iconEl = document.getElementById('giai-phu-modal-icon');
  const nameEl = document.getElementById('giai-phu-modal-name');
  const descEl = document.getElementById('giai-phu-modal-desc');
  const colMetricEl = document.getElementById('giai-phu-col-metric');
  if (iconEl) iconEl.textContent = cfg.icon;
  if (nameEl) nameEl.textContent = cfg.name;
  if (descEl) descEl.textContent = cfg.criterion;
  if (colMetricEl) colMetricEl.textContent = cfg.colMetric;

  // Lấy dữ liệu từ leaderboard
  const rawData = (typeof getLeaderboardData === 'function') ? getLeaderboardData() : (window.leaderboardData || []);
  currentGiaiPhuList = cfg.filterAndSort(rawData);

  // Render bảng
  const searchInput = document.getElementById('giai-phu-search-input');
  const query = searchInput ? searchInput.value.trim() : '';
  renderGiaiPhuTable(currentGiaiPhuList, query);
}

function renderGiaiPhuTable(list, query = '') {
  const tbody = document.getElementById('giai-phu-table-body');
  const banner = document.getElementById('giai-phu-search-banner');
  const bannerText = document.getElementById('giai-phu-search-banner-text');
  if (!tbody) return;

  tbody.innerHTML = '';
  const q = (query || '').toLowerCase().trim();
  const qClean = q.replace(/[^a-z0-9]/g, '');

  let userFoundItem = null;
  let userFoundRank = null;

  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-10 text-center text-xs text-slate-400">Chưa có khách hàng nào trong nhóm tiêu chí này.</td></tr>`;
    if (banner) banner.classList.add('hidden');
    return;
  }

  list.forEach((item, index) => {
    const rank = index + 1;
    const cfg = GIAI_PHU_CONFIGS[currentGiaiPhuKey];
    const metricStr = cfg.formatMetric(item);
    const code = item.customer_code || 'ERK-KH-XXXX';
    const codeClean = code.toLowerCase().replace(/[^a-z0-9]/g, '');
    const name = item.customer_name || item.original_name || 'Khách hàng';

    const isMatch = q && (code.toLowerCase().includes(q) || (qClean && codeClean.includes(qClean)) || name.toLowerCase().includes(q));
    if (isMatch && !userFoundItem) {
      userFoundItem = item;
      userFoundRank = rank;
    }

    let rankBadge = '';
    let rowBg = 'hover:bg-slate-800/40 transition-colors';
    if (rank === 1) {
      rankBadge = `<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-md">🥇 1</span>`;
      rowBg = 'bg-amber-500/10 hover:bg-amber-500/15';
    } else if (rank === 2) {
      rankBadge = `<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-950 font-black text-xs shadow">🥈 2</span>`;
    } else if (rank === 3) {
      rankBadge = `<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs shadow">🥉 3</span>`;
    } else {
      rankBadge = `<span class="font-mono text-xs font-bold text-slate-400">#${rank}</span>`;
    }

    let highlightClass = '';
    if (isMatch) {
      highlightClass = 'ring-2 ring-amber-400 bg-amber-500/20';
    }

    const tr = document.createElement('tr');
    tr.className = `${rowBg} ${highlightClass} border-b border-slate-800/60 transition-all`;
    tr.id = `giai-phu-row-${code}`;
    tr.innerHTML = `
      <td class="py-3 px-3 sm:px-4 text-center">${rankBadge}</td>
      <td class="py-3 px-3 sm:px-4 font-mono font-bold text-amber-300 text-xs sm:text-sm whitespace-nowrap">
        ${code}
      </td>
      <td class="py-3 px-3 sm:px-4 font-medium text-slate-200">
        <div>${name}</div>
        <div class="text-[10px] text-slate-400 mt-0.5 sm:hidden">${metricStr}</div>
      </td>
      <td class="py-3 px-3 sm:px-4 text-right font-black text-amber-300 font-mono text-xs sm:text-sm whitespace-nowrap">
        ${metricStr}
      </td>
      <td class="py-3 px-3 sm:px-4 text-right font-mono text-xs text-slate-300 hidden sm:table-cell whitespace-nowrap">
        ${formatVND(item.service_fee || 0)}
      </td>
      <td class="py-3 px-3 sm:px-4 text-center">
        ${rank <= 3 ? '<span class="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black border border-amber-400/30">Top Xét Giải</span>' : '<span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold">Ứng viên</span>'}
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Cập nhật banner tìm kiếm vị trí
  if (banner && bannerText) {
    if (q) {
      if (userFoundItem) {
        banner.classList.remove('hidden');
        bannerText.innerHTML = `
          <span>Mã <strong>${userFoundItem.customer_code}</strong> hiện đang xếp hạng <strong class="text-amber-300 text-sm">#${userFoundRank}</strong> trong giải này với chỉ số <strong class="text-emerald-300">${GIAI_PHU_CONFIGS[currentGiaiPhuKey].formatMetric(userFoundItem)}</strong>!</span>
        `;
        // Tự động cuộn tới dòng
        setTimeout(() => {
          const matchedRow = document.getElementById(`giai-phu-row-${userFoundItem.customer_code}`);
          if (matchedRow) matchedRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      } else {
        banner.classList.remove('hidden');
        bannerText.innerHTML = `<span>Không tìm thấy mã khách hàng khớp với từ khóa "<strong>${query}</strong>" trong giải này.</span>`;
      }
    } else {
      banner.classList.add('hidden');
    }
  }
}

function handleGiaiPhuSearch(query) {
  const clearBtn = document.getElementById('giai-phu-search-clear');
  if (clearBtn) {
    if (query) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }
  renderGiaiPhuTable(currentGiaiPhuList, query);
}

function clearGiaiPhuSearch() {
  const input = document.getElementById('giai-phu-search-input');
  if (input) {
    input.value = '';
    input.focus();
  }
  handleGiaiPhuSearch('');
}

window.openGiaiPhuModal = openGiaiPhuModal;
window.closeGiaiPhuModal = closeGiaiPhuModal;
window.switchGiaiPhuTab = switchGiaiPhuTab;
window.handleGiaiPhuSearch = handleGiaiPhuSearch;
window.clearGiaiPhuSearch = clearGiaiPhuSearch;


// ==================== 6. LIVE VOUCHER FLOATING TOAST TICKER ====================
let liveToastTimer = null;

const DEMO_PHONE_PREFIXES = ['098', '097', '096', '090', '093', '091', '089', '088', '077', '086', '094'];
const DEMO_VOUCHERS = [
  'Voucher 200.000 đ',
  'Voucher 100.000 đ',
  'Voucher 500.000 đ',
  'Voucher Giảm 10% Cước',
  'Voucher 300.000 đ',
  'Voucher Miễn Phí Lưu Kho 7 Ngày'
];

function initLiveVoucherToast() {
  const toast = document.getElementById('live-voucher-toast');
  if (!toast) return;

  // Show first toast after 3.5 seconds
  setTimeout(() => {
    cycleLiveToast();
  }, 3500);
}

function cycleLiveToast() {
  const toast = document.getElementById('live-voucher-toast');
  const phoneEl = document.getElementById('toast-phone');
  const voucherEl = document.getElementById('toast-voucher');
  if (!toast || !phoneEl || !voucherEl) return;

  // Generate masked phone
  const prefix = DEMO_PHONE_PREFIXES[Math.floor(Math.random() * DEMO_PHONE_PREFIXES.length)];
  const suffix = Math.floor(100 + Math.random() * 899);
  const maskedPhone = `${prefix}****${suffix}`;

  // Get voucher from welcome wheel config if available, else fallback
  let voucherName = DEMO_VOUCHERS[Math.floor(Math.random() * DEMO_VOUCHERS.length)];
  try {
    const rawWheel = localStorage.getItem('eureka_welcome_wheel_config');
    if (rawWheel) {
      const parsed = JSON.parse(rawWheel);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const item = parsed[Math.floor(Math.random() * parsed.length)];
        if (item && item.name) voucherName = item.name;
      }
    }
  } catch (e) {}

  phoneEl.textContent = maskedPhone;
  voucherEl.textContent = voucherName;

  // Slide IN
  toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');

  // Stay visible for 4.5 seconds
  liveToastTimer = setTimeout(() => {
    // Slide OUT
    toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');

    // Next popup after 7-11 seconds
    const nextDelay = 7000 + Math.floor(Math.random() * 4000);
    setTimeout(cycleLiveToast, nextDelay);
  }, 4500);
}

function closeLiveVoucherToast() {
  const toast = document.getElementById('live-voucher-toast');
  if (toast) {
    toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  renderNhiemVuDisplay();
  initLiveVoucherToast();
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  renderNhiemVuDisplay();
  initLiveVoucherToast();
}

function scrollToVongQuayTriAn(e) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }
  const target = document.getElementById('vong-quay-mung-05');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.classList.add('transition-all', 'duration-500', 'ring-4', 'ring-sky-400/80', 'ring-offset-4', 'ring-offset-slate-900');
    setTimeout(() => {
      target.classList.remove('ring-4', 'ring-sky-400/80', 'ring-offset-4', 'ring-offset-slate-900');
    }, 2500);
  }
}
window.scrollToVongQuayTriAn = scrollToVongQuayTriAn;

// ==================== 8. CHẾ ĐỘ TỔNG KẾT & VINH DANH GALA 2026 ====================
let isGalaCelebrationMode = true; // Mặc định mở chế độ tổng kết vinh danh đêm gala

function applyGalaCelebrationState(active) {
  isGalaCelebrationMode = active;
  
  const sectionGala = document.getElementById('gala-awards-section');
  const sectionGiaiThuong = document.getElementById('giai-thuong');
  const sectionTheLe = document.getElementById('the-le');
  const sectionVongQuay = document.getElementById('vong-quay-mung-05');
  const heroSpinBtn = document.getElementById('hero-spin-btn-wrapper');
  const heroGalaBtn = document.getElementById('hero-gala-jump-btn');
  const toggleBtnText = document.getElementById('gala-mode-text');
  const toggleBtnIcon = document.getElementById('gala-mode-icon');
  const navCampaignLinks = document.querySelectorAll('.nav-campaign-only');
  const navGalaLink = document.getElementById('nav-gala-link');

  if (active) {
    // Ẩn tất cả những phần đang đua: vòng quay tri ân, nhiệm vụ hệ thống, cơ cấu giải thưởng, thể lệ
    if (sectionGiaiThuong) sectionGiaiThuong.style.display = 'none';
    if (sectionTheLe) sectionTheLe.style.display = 'none';
    if (sectionVongQuay) sectionVongQuay.style.display = 'none';
    if (heroSpinBtn) heroSpinBtn.style.display = 'none';
    if (heroGalaBtn) heroGalaBtn.classList.remove('hidden');

    // Chỉ để lại: Tổng quan, Vinh danh Gala, Bảng xếp hạng
    if (sectionGala) sectionGala.style.display = 'block';

    // Cập nhật Header Menu
    navCampaignLinks.forEach(el => el.classList.add('hidden'));
    if (navGalaLink) navGalaLink.classList.remove('hidden');

    // Nút trạng thái
    if (toggleBtnText) toggleBtnText.textContent = 'Chế Độ Vinh Danh Gala (Đang Bật) ⇋ Bấm xem Toàn Bộ';
    if (toggleBtnIcon) toggleBtnIcon.textContent = '🏆';
  } else {
    // Hiện lại toàn bộ chương trình bình thường
    if (sectionGiaiThuong) sectionGiaiThuong.style.display = '';
    if (sectionTheLe) sectionTheLe.style.display = '';
    if (sectionVongQuay) sectionVongQuay.style.display = '';
    if (heroSpinBtn) heroSpinBtn.style.display = '';
    if (heroGalaBtn) heroGalaBtn.classList.add('hidden');
    if (sectionGala) sectionGala.style.display = 'block';

    // Hiện lại Header Menu
    navCampaignLinks.forEach(el => el.classList.remove('hidden'));

    // Nút trạng thái
    if (toggleBtnText) toggleBtnText.textContent = 'Bật Chế Độ Vinh Danh Gala (Chỉ Hiện Tổng Kết & BXH)';
    if (toggleBtnIcon) toggleBtnIcon.textContent = '📋';
  }

  try {
    localStorage.setItem('eureka_gala_celebration_mode', active ? '1' : '0');
  } catch (e) {}
}

function toggleGalaCelebrationMode() {
  applyGalaCelebrationState(!isGalaCelebrationMode);
}

window.applyGalaCelebrationState = applyGalaCelebrationState;
window.toggleGalaCelebrationMode = toggleGalaCelebrationMode;

// Tự động khởi chạy chế độ Gala khi load trang
document.addEventListener('DOMContentLoaded', () => {
  let saved = null;
  try {
    saved = localStorage.getItem('eureka_gala_celebration_mode');
  } catch (e) {}
  // Mặc định active = true (chế độ vinh danh đêm gala)
  const shouldBeActive = saved === null ? true : saved === '1';
  applyGalaCelebrationState(shouldBeActive);
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  let saved = null;
  try {
    saved = localStorage.getItem('eureka_gala_celebration_mode');
  } catch (e) {}
  const shouldBeActive = saved === null ? true : saved === '1';
  applyGalaCelebrationState(shouldBeActive);
}
