/**
 * Main Application Script for Eureka Customer Awards 2026 Landing Page
 * Handles UI tab switches, FAQ accordion, modals, and Zalo Voucher application.
 */

// --- 1. Prize Tab Switching ---
function switchPrizeTab(tabId) {
  document.querySelectorAll('.prize-tab-content').forEach(el => {
    el.classList.add('hidden');
  });

  const activeClasses = ['bg-gradient-to-r', 'from-brand-600', 'via-orange-500', 'to-amber-500', 'text-white', 'shadow-lg', 'shadow-brand-500/25', 'font-black'];
  const inactiveClasses = ['text-slate-600', 'font-bold', 'hover:text-brand-600', 'hover:bg-white/80'];

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
            📊 BẢNG TỔNG KẾT TOÀN DIỆN CHIẾN DỊCH
          </span>
          <h3 class="text-2xl sm:text-3xl font-black text-white font-display">
            Tổng Kết 3 Chặng Nhiệm Vụ Hệ Thống
          </h3>
          <p class="text-xs sm:text-sm text-slate-300 mt-2">
            Thống kê số lượng doanh nghiệp hoàn thành nhiệm vụ và được tự động nâng hạng VIP+1 qua từng cột mốc
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
                Các doanh nghiệp xuất sắc hoàn thành liên tiếp cả 3 chặng được vinh danh tại Gala Year-End Party và duy trì đặc quyền VIP ELITE+ dài hạn!
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
      <!-- Cột Trái (lg:col-span-5): Thông tin chặng đang công bố -->
      <div class="lg:col-span-5 flex flex-col justify-between rounded-3xl p-6 sm:p-8 bg-white/95 backdrop-blur-2xl border-2 border-amber-300/80 shadow-xl relative overflow-hidden group text-left">
        <div class="absolute -top-24 -left-24 w-60 h-60 bg-amber-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <span class="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
              ${curChang.period_title}
            </span>
            <span class="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
              📅 ${curChang.time_range}
            </span>
          </div>

          <h3 class="text-2xl sm:text-3xl font-black text-slate-900 mb-2 font-display">
            "${curChang.title}"
          </h3>
          <p class="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed font-medium">
            ${curChang.desc}
          </p>

          <!-- Điều kiện xét giải: Tương phản cao, chữ sắc nét -->
          <div class="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 mb-4 shadow-xs">
            <span class="block text-[11px] font-black text-amber-900 uppercase tracking-wide mb-1">
              📋 Điều kiện xét giải:
            </span>
            <span class="text-base font-black text-amber-950 block">
              ${curChang.condition}
            </span>
            <span class="block text-xs text-amber-800/90 mt-1 leading-snug font-medium">
              ${curChang.condition_detail}
            </span>
          </div>

          <!-- Phần thưởng: Nền xanh nhạt, chữ xanh đậm tương phản cao -->
          <div class="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 mb-4 shadow-xs">
            <span class="block text-[11px] font-black text-emerald-900 uppercase tracking-wide mb-1">
              🎁 Quyền lợi đạt được:
            </span>
            <span class="text-base font-black text-emerald-900 block">
              ${curChang.reward}
            </span>
            <span class="block text-xs text-emerald-800 mt-1 leading-snug font-medium">
              ${curChang.reward_desc || 'Tự động nâng hạng VIP lên cấp cao hơn, giảm cước vận chuyển.'}
            </span>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-200 flex items-center justify-between relative z-10 mt-2">
          <span class="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-black">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            ĐANG CÔNG BỐ KẾT QUẢ
          </span>
          <a href="#cot-moc-vip" class="text-xs font-black text-slate-600 hover:text-brand-600 transition-colors">
            Xem khung quyền lợi ↓
          </a>
        </div>
      </div>

      <!-- Cột Phải (lg:col-span-7): Danh sách mã KH đạt chuẩn chặng này -->
      <div class="lg:col-span-7 flex flex-col justify-between rounded-3xl p-6 sm:p-8 bg-white/95 backdrop-blur-2xl border-2 border-slate-200/90 shadow-xl relative overflow-hidden text-left">
        <div class="absolute -top-24 -right-24 w-60 h-60 bg-sky-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10">
          <!-- Header danh sách -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200">
            <div>
              <h3 class="text-lg sm:text-xl font-black text-slate-900 font-display flex items-center gap-2">
                👑 Danh Sách Mã KH Đạt Chuẩn
              </h3>
              <p class="text-xs text-slate-600 mt-0.5 font-medium">
                Các doanh nghiệp đã hoàn thành nhiệm vụ và được tự động nâng hạng VIP+1
              </p>
            </div>
            <span id="nhiem-vu-count-badge" class="px-3.5 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black whitespace-nowrap self-start sm:self-center shadow-xs">
              🎉 ${codes.length} Khách hàng đạt chuẩn
            </span>
          </div>

          <!-- Quick Filter Input -->
          <div class="relative mb-4">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input type="text" id="nhiem-vu-code-filter" oninput="filterNhiemVuCodes(this.value)" placeholder="Tra cứu nhanh mã khách hàng (VD: ERK-KH-8891, 8891)..." class="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:border-brand-500 shadow-inner" />
          </div>

          <!-- Codes Badges Grid -->
          <div id="nhiem-vu-codes-list" class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            ${renderNhiemVuCodeBadges(codes)}
          </div>
        </div>

        <!-- Footer Notice -->
        <div class="pt-4 border-t border-slate-200 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs relative z-10">
          <span class="text-slate-600 font-medium">
            ⚡ Hệ thống Eureka tự động nâng cấp hạn mức & chiết khấu cước cho các mã trên.
          </span>
          <span class="text-emerald-700 font-black whitespace-nowrap">
            ✓ Đối soát tự động
          </span>
        </div>
      </div>
    </div>
  `;
}

function renderNhiemVuCodeBadges(codes) {
  if (!codes || codes.length === 0) {
    return `<div class="col-span-full py-8 text-center text-xs text-slate-500 font-medium">Chưa có mã khách hàng nào trong danh sách.</div>`;
  }
  return codes.map(code => `
    <div class="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-amber-400 transition-all flex items-center justify-between gap-2 group shadow-xs">
      <span class="font-mono text-xs font-black text-slate-900 tracking-wider group-hover:text-brand-600">
        ${code}
      </span>
      <span class="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
        ✓ VIP+1
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


// --- 7. Interactive Specular Mouse Glare Engine (Prism Chromatic Dispersion) ---
(function() {
  function initSpecularEngine() {
    const cards = document.querySelectorAll('.glass-card, .glass-ultra, [class*="bg-slate-900"], [class*="bg-slate-800"]');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--mx', `50%`);
        card.style.setProperty('--my', `20%`);
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpecularEngine);
  } else {
    initSpecularEngine();
  }
})();


