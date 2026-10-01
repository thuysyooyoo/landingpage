/**
 * Admin Management Module for Eureka Customer Awards 2026
 * Handles:
 * 1. Admin Authentication & UI Permissions
 * 2. Probability & Stock Settings for Welcome Wheel
 * 3. Customer Spin Leads Management (Lưu lịch sử SĐT điền quay voucher, Xuất CSV, Copy SĐT)
 * 4. Official Monthly 05 Winners Management (Chỉ quản lý mã booking trúng thưởng, không cần che)
 */

const ADMIN_PASSWORD_DEFAULT = 'eureka2026';
const STORAGE_KEY_AUTH = 'eureka_admin_auth';
const STORAGE_KEY_WHEEL_CONFIG = 'eureka_welcome_wheel_config';
const STORAGE_KEY_MONTHLY_WINNERS = 'eureka_monthly_winners';
const STORAGE_KEY_SPIN_LEADS_LOCAL = 'eureka_spin_leads';

// Check if Admin is logged in
function isAdminLoggedIn() {
  return sessionStorage.getItem(STORAGE_KEY_AUTH) === 'true';
}

// Open Admin Modal (Login or Dashboard)
function openAdminModal() {
  if (isAdminLoggedIn()) {
    showAdminDashboard();
  } else {
    const modal = document.getElementById('admin-login-modal');
    if (modal) {
      modal.classList.remove('hidden');
      const input = document.getElementById('admin-password-input');
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  }
}

function closeAdminLoginModal() {
  const modal = document.getElementById('admin-login-modal');
  if (modal) modal.classList.add('hidden');
}

function handleAdminLogin(event) {
  if (event) event.preventDefault();
  const input = document.getElementById('admin-password-input');
  const errorMsg = document.getElementById('admin-login-error');
  const password = input ? input.value.trim() : '';

  if (password === ADMIN_PASSWORD_DEFAULT) {
    sessionStorage.setItem(STORAGE_KEY_AUTH, 'true');
    if (errorMsg) errorMsg.classList.add('hidden');
    closeAdminLoginModal();
    updateAdminUiState();
    showAdminDashboard();
  } else {
    if (errorMsg) {
      errorMsg.textContent = 'Mật khẩu quản trị viên không chính xác!';
      errorMsg.classList.remove('hidden');
    }
  }
}

function adminLogout() {
  sessionStorage.removeItem(STORAGE_KEY_AUTH);
  closeAdminDashboard();
  updateAdminUiState();
  alert('Đã đăng xuất tài khoản Quản Trị Viên!');
}

function updateAdminUiState() {
  const isAuth = isAdminLoggedIn();
  const adminBadge = document.getElementById('admin-status-badge');
  const m05AdminBtn = document.getElementById('m05-admin-spin-btn');
  const m05UserNotice = document.getElementById('m05-user-notice');

  if (adminBadge) {
    if (isAuth) {
      adminBadge.classList.remove('hidden');
      adminBadge.style.display = 'inline-flex';
    } else {
      adminBadge.classList.add('hidden');
      adminBadge.style.display = 'none';
    }
  }

  if (m05AdminBtn && m05UserNotice) {
    if (isAuth) {
      m05AdminBtn.classList.remove('hidden');
      m05UserNotice.classList.add('hidden');
    } else {
      m05AdminBtn.classList.add('hidden');
      m05UserNotice.classList.remove('hidden');
    }
  }
}

// Show Admin Dashboard & Populate settings
function showAdminDashboard() {
  const modal = document.getElementById('admin-dashboard-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  renderAdminWheelConfigTable();
  renderAdminSpinLeadsTable();
  renderAdminM05BookingManager();
  renderAdminWinnersTable();
  renderAdminWeeklyWinnerForm();
  renderAdminGalaToggle();
  renderAdminLeaderboardTable();
  renderAdminAffiliateContest();
  renderAdminNhiemVuManager();
}

function closeAdminDashboard() {
  const modal = document.getElementById('admin-dashboard-modal');
  if (modal) modal.classList.add('hidden');
}

// ==================== TAB 1: WHEEL 1 CONFIG ====================
function getActiveWheelSegments() {
  const saved = localStorage.getItem(STORAGE_KEY_WHEEL_CONFIG);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return [
    { id: 1, text: 'VOUCHER 400K', color: '#ea580c', textColor: '#FFFFFF', prize: 'Voucher 400.000 đ Lộc Xuân', probability_weight: 10, stock_quantity: 8 },
    { id: 2, text: 'VOUCHER 300K', color: '#1e293b', textColor: '#FBBF24', prize: 'Voucher Chiết Khấu 300.000 đ', probability_weight: 20, stock_quantity: 25 },
    { id: 3, text: 'ƯU TIÊN XẾP CONT', color: '#f59e0b', textColor: '#0F172A', prize: 'Vé Ưu Tiên Xếp Cont Sớm', probability_weight: 15, stock_quantity: 18 },
    { id: 4, text: 'GIẢM 50% LƯU KHO', color: '#0f172a', textColor: '#FFFFFF', prize: 'Giảm 50% Phí Lưu Kho Bãi', probability_weight: 15, stock_quantity: 15 },
    { id: 5, text: 'VOUCHER 300K', color: '#ea580c', textColor: '#FFFFFF', prize: 'Voucher Chiết Khấu 300.000 đ', probability_weight: 15, stock_quantity: 20 },
    { id: 6, text: 'GÓI SQUAD 2-IN-1', color: '#1e293b', textColor: '#38BDF8', prize: 'Gói Hỗ Trợ Squad 2-in-1', probability_weight: 10, stock_quantity: 12 },
    { id: 7, text: 'VOUCHER 400K', color: '#f59e0b', textColor: '#0F172A', prize: 'Voucher 400.000 đ Lộc Xuân', probability_weight: 10, stock_quantity: 10 },
    { id: 8, text: 'MAY MẮN LẦN SAU', color: '#0f172a', textColor: '#94A3B8', prize: 'Vé Tích Lũy Quay Mùng 05', probability_weight: 5, stock_quantity: 999 }
  ];
}

function renderAdminWheelConfigTable() {
  const container = document.getElementById('admin-wheel-config-body');
  const mobileContainer = document.getElementById('admin-wheel-config-mobile');
  const currentSegments = getActiveWheelSegments();

  if (container) container.innerHTML = '';
  if (mobileContainer) mobileContainer.innerHTML = '';

  currentSegments.forEach((seg, idx) => {
    // 1. Desktop table row
    if (container) {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-700/60 hover:bg-slate-800/40 text-xs text-slate-200';
      tr.innerHTML = `
        <td class="py-2.5 px-3 font-bold text-amber-400">Ô số ${idx + 1}</td>
        <td class="py-2.5 px-3">
          <input type="text" value="${seg.text}" id="seg-text-${idx}" oninput="syncWheelInput('text', ${idx}, this.value)" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold text-xs" />
        </td>
        <td class="py-2.5 px-3">
          <input type="text" value="${seg.prize}" id="seg-prize-${idx}" oninput="syncWheelInput('prize', ${idx}, this.value)" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs" />
        </td>
        <td class="py-2.5 px-3 text-center">
          <div class="flex items-center justify-center gap-1">
            <input type="number" min="0" max="100" value="${seg.probability_weight}" id="seg-prob-${idx}" oninput="syncWheelInput('prob', ${idx}, this.value)" class="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-amber-300 font-bold text-center text-xs" />
            <span class="text-slate-400">%</span>
          </div>
        </td>
        <td class="py-2.5 px-3 text-center">
          <input type="number" min="0" max="9999" value="${seg.stock_quantity}" id="seg-stock-${idx}" oninput="syncWheelInput('stock', ${idx}, this.value)" class="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-bold text-center text-xs" />
        </td>
      `;
      container.appendChild(tr);
    }

    // 2. Mobile card view (Zero horizontal scroll)
    if (mobileContainer) {
      const card = document.createElement('div');
      card.className = 'p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow';
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-bold text-amber-400 text-xs">Ô số ${idx + 1}</span>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1 text-[11px] text-slate-400">
              <span>Tỉ lệ:</span>
              <input type="number" min="0" max="100" value="${seg.probability_weight}" id="seg-prob-m-${idx}" oninput="syncWheelInput('prob', ${idx}, this.value)" class="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-amber-300 font-bold text-center text-xs" />
              <span>%</span>
            </div>
            <div class="flex items-center gap-1 text-[11px] text-slate-400">
              <span>Kho:</span>
              <input type="number" min="0" max="9999" value="${seg.stock_quantity}" id="seg-stock-m-${idx}" oninput="syncWheelInput('stock', ${idx}, this.value)" class="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-emerald-400 font-bold text-center text-xs" />
            </div>
          </div>
        </div>
        <div class="space-y-1">
          <label class="block text-[10px] uppercase font-bold text-slate-500">Nhãn hiển thị:</label>
          <input type="text" value="${seg.text}" id="seg-text-m-${idx}" oninput="syncWheelInput('text', ${idx}, this.value)" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold text-xs" />
        </div>
        <div class="space-y-1">
          <label class="block text-[10px] uppercase font-bold text-slate-500">Tên phần thưởng:</label>
          <input type="text" value="${seg.prize}" id="seg-prize-m-${idx}" oninput="syncWheelInput('prize', ${idx}, this.value)" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs" />
        </div>
      `;
      mobileContainer.appendChild(card);
    }
  });
}

function syncWheelInput(field, idx, val) {
  const deskEl = document.getElementById(`seg-${field}-${idx}`);
  const mobEl = document.getElementById(`seg-${field}-m-${idx}`);
  if (deskEl && deskEl.value !== val) deskEl.value = val;
  if (mobEl && mobEl.value !== val) mobEl.value = val;
}

function saveAdminWheelConfig() {
  const currentSegments = getActiveWheelSegments();
  let totalProb = 0;

  for (let idx = 0; idx < currentSegments.length; idx++) {
    const textInput = document.getElementById(`seg-text-m-${idx}`) || document.getElementById(`seg-text-${idx}`);
    const prizeInput = document.getElementById(`seg-prize-m-${idx}`) || document.getElementById(`seg-prize-${idx}`);
    const probInput = document.getElementById(`seg-prob-m-${idx}`) || document.getElementById(`seg-prob-${idx}`);
    const stockInput = document.getElementById(`seg-stock-m-${idx}`) || document.getElementById(`seg-stock-${idx}`);

    if (textInput) currentSegments[idx].text = textInput.value.trim();
    if (prizeInput) currentSegments[idx].prize = prizeInput.value.trim();
    if (probInput) {
      const prob = parseInt(probInput.value, 10) || 0;
      currentSegments[idx].probability_weight = prob;
      totalProb += prob;
    }
    if (stockInput) {
      currentSegments[idx].stock_quantity = parseInt(stockInput.value, 10) || 0;
    }
  }

  localStorage.setItem(STORAGE_KEY_WHEEL_CONFIG, JSON.stringify(currentSegments));
  if (typeof initWelcomeWheelData === 'function') initWelcomeWheelData();
  if (typeof drawWheel === 'function') drawWheel();

  alert(`✅ Lưu cấu hình thành công!\nTổng tỉ lệ các ô hiện tại là: ${totalProb}%. Hệ thống đã áp dụng vào Vòng Quay!`);
}

function resetAdminWheelConfig() {
  if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ tỉ lệ và kho quà về mặc định của chương trình?')) {
    localStorage.removeItem(STORAGE_KEY_WHEEL_CONFIG);
    renderAdminWheelConfigTable();
    if (typeof initWelcomeWheelData === 'function') initWelcomeWheelData();
    if (typeof drawWheel === 'function') drawWheel();
    alert('Đã khôi phục cài đặt mặc định!');
  }
}

// ==================== TAB 2: SPIN LEADS (SĐT ĐÃ QUAY VOUCHER) ====================
function getSpinLeadsList() {
  if (typeof getSpinLeads === 'function') {
    return getSpinLeads();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SPIN_LEADS_LOCAL);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function renderAdminSpinLeadsTable() {
  const container = document.getElementById('admin-leads-body');
  const mobileContainer = document.getElementById('admin-leads-cards-mobile');
  const countBadge = document.getElementById('admin-leads-count');
  const leads = getSpinLeadsList();

  if (countBadge) countBadge.textContent = `${leads.length} SĐT`;
  if (container) container.innerHTML = '';
  if (mobileContainer) mobileContainer.innerHTML = '';

  if (leads.length === 0) {
    if (container) {
      container.innerHTML = `
        <tr>
          <td colspan="8" class="py-6 text-center text-slate-500 text-xs">
            Chưa có khách hàng nào quay voucher.
          </td>
        </tr>
      `;
    }
    if (mobileContainer) {
      mobileContainer.innerHTML = `
        <div class="py-6 text-center text-slate-500 text-xs italic">
          Chưa có khách hàng nào quay voucher.
        </div>
      `;
    }
    return;
  }

  leads.forEach((item, idx) => {
    const rawDigits = (item.phone || '').replace(/\D/g, '');
    const zaloPhone = rawDigits.startsWith('0') ? '84' + rawDigits.slice(1) : (rawDigits.startsWith('84') ? rawDigits : ('84' + rawDigits));
    const ref = (item.ref && item.ref !== 'direct') ? item.ref.toUpperCase() : null;
    const refBadge = ref 
      ? `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">👤 ${ref}</span>`
      : `<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">🌐 Trực tiếp</span>`;

    // 1. Desktop table row
    if (container) {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-700/60 hover:bg-slate-800/40 text-xs text-slate-200 transition-colors';
      tr.innerHTML = `
        <td class="py-2.5 px-3 text-slate-400 font-bold">${idx + 1}</td>
        <td class="py-2.5 px-3 text-slate-300 font-mono text-[11px]">${item.createdAt || 'Hôm nay'}</td>
        <td class="py-2.5 px-3 font-mono font-black text-amber-300 text-sm tracking-wider">
          ${item.phone}
        </td>
        <td class="py-2.5 px-3 font-mono font-bold text-white bg-slate-900/60 px-2 py-1 rounded">
          ${item.voucherCode || 'ERK-VOUCHER'}
        </td>
        <td class="py-2.5 px-3 font-bold text-emerald-400">
          ${item.prize}
        </td>
        <td class="py-2.5 px-3">
          ${refBadge}
        </td>
        <td class="py-2.5 px-3">
          <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
            ${item.status || 'Chờ áp dụng'}
          </span>
        </td>
        <td class="py-2.5 px-3 text-center space-x-1 whitespace-nowrap">
          <a href="https://zalo.me/${zaloPhone}" target="_blank" class="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] inline-flex items-center gap-1 shadow transition-colors" title="Chat Zalo với số ${item.phone}">
            💬 Chat Zalo
          </a>
          <a href="tel:${item.phone}" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] inline-flex items-center gap-1 shadow transition-colors" title="Gọi trực tiếp số ${item.phone}">
            📞 Gọi
          </a>
          <button onclick="deleteSpinLead(${idx})" class="p-1 text-rose-400 hover:text-rose-300 text-xs font-semibold cursor-pointer" title="Xóa">
            ✕
          </button>
        </td>
      `;
      container.appendChild(tr);
    }

    // 2. Mobile card view (Zero horizontal scroll!)
    if (mobileContainer) {
      const card = document.createElement('div');
      card.className = 'p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 shadow';
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-300 font-bold">${idx + 1}</span>
            <span class="font-mono font-black text-amber-300 text-sm tracking-wider">${item.phone}</span>
          </div>
          <span class="text-[10px] text-slate-400 font-mono">${item.createdAt || 'Hôm nay'}</span>
        </div>
        <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
          <span class="font-bold text-emerald-400 text-xs">${item.prize}</span>
          <span class="font-mono text-[10px] text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">${item.voucherCode || 'ERK-VOUCHER'}</span>
        </div>
        <div class="flex items-center justify-between pt-1 border-t border-slate-800/40">
          <div class="flex items-center gap-1.5">
            ${refBadge}
            <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">${item.status || 'Chờ áp dụng'}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <a href="https://zalo.me/${zaloPhone}" target="_blank" class="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] inline-flex items-center gap-1 shadow">
              💬 Zalo
            </a>
            <a href="tel:${item.phone}" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] inline-flex items-center gap-1 shadow">
              📞 Gọi
            </a>
            <button onclick="deleteSpinLead(${idx})" class="p-1 text-rose-400 hover:text-rose-300 text-xs">✕</button>
          </div>
        </div>
      `;
      mobileContainer.appendChild(card);
    }
  });
}

function deleteSpinLead(idx) {
  const leads = getSpinLeadsList();
  if (confirm('Bạn có chắc muốn xóa số điện thoại này khỏi danh sách?')) {
    leads.splice(idx, 1);
    localStorage.setItem(STORAGE_KEY_SPIN_LEADS_LOCAL, JSON.stringify(leads));
    renderAdminSpinLeadsTable();
  }
}

function clearAllSpinLeads() {
  if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ lịch sử số điện thoại đã quay?')) {
    localStorage.setItem(STORAGE_KEY_SPIN_LEADS_LOCAL, JSON.stringify([]));
    renderAdminSpinLeadsTable();
    alert('Đã xóa sạch lịch sử SĐT!');
  }
}

function copyAllSpinLeadPhones() {
  const leads = getSpinLeadsList();
  if (leads.length === 0) {
    alert('Danh sách SĐT đang trống!');
    return;
  }
  const phoneList = leads.map(l => l.phone).join('\n');
  navigator.clipboard.writeText(phoneList).then(() => {
    alert(`✅ Đã sao chép ${leads.length} số điện thoại vào bộ nhớ tạm!`);
  });
}

function exportSpinLeadsCsv() {
  const leads = getSpinLeadsList();
  if (leads.length === 0) {
    alert('Không có dữ liệu để xuất file!');
    return;
  }
  let csv = 'STT,Thoi Gian,So Dien Thoai,Ma Voucher,Phan Qua,Nguon Gioi Thieu (Ref),Trang Thai\n';
  leads.forEach((l, idx) => {
    const ref = (l.ref && l.ref !== 'direct') ? l.ref.toUpperCase() : 'Truc tiep';
    csv += `"${idx + 1}","${l.createdAt || ''}","${l.phone}","${l.voucherCode || ''}","${l.prize || ''}","${ref}","${l.status || ''}"\n`;
  });

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Danh_Sach_SDT_Quay_Voucher_Eureka_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ==================== TAB 3: MÙNG 05 BOOKING POOL & QUẢN LÝ GIẢI THƯỞNG ====================

// 1. Cấu hình Giải thưởng Mùng 05
function saveAdminM05Prize() {
  const prizeInput = document.getElementById('admin-m05-prize-input');
  if (!prizeInput) return;
  const val = prizeInput.value.trim();
  if (!val) {
    alert('⚠️ Vui lòng nhập tên giải thưởng!');
    return;
  }
  if (typeof setM05CurrentPrize === 'function') {
    setM05CurrentPrize(val);
  } else {
    localStorage.setItem('eureka_m05_current_prize', val);
  }
  if (typeof updateM05PublicInfo === 'function') {
    updateM05PublicInfo();
  }
  alert(`✅ Đã cập nhật giải thưởng định kỳ thành: "${val}"`);
}

function setQuickM05Prize(prizeText) {
  const prizeInput = document.getElementById('admin-m05-prize-input');
  if (prizeInput) {
    prizeInput.value = prizeText;
    saveAdminM05Prize();
  }
}

// 2. Parser và quản lý Danh sách Mã Booking Dự Thưởng
function parseBookingCodesFromText(text) {
  if (!text) return [];
  // Tách theo dòng mới, dấu phẩy, chấm phẩy, tab, khoảng trắng
  const rawTokens = text.split(/[\r\n,;\t]+/);
  const codes = [];
  const seen = new Set();

  rawTokens.forEach(t => {
    let clean = t.trim().replace(/^["']+|["']+$/g, '');
    if (clean.length >= 3) {
      const upper = clean.toUpperCase();
      if (!seen.has(upper)) {
        seen.add(upper);
        codes.push(clean);
      }
    }
  });
  return codes;
}

function saveM05BookingPoolFromTextarea() {
  const textarea = document.getElementById('admin-m05-booking-textarea');
  if (!textarea) return;
  const codes = parseBookingCodesFromText(textarea.value);
  if (codes.length === 0) {
    alert('⚠️ Vui lòng nhập hoặc dán ít nhất 01 mã booking hợp lệ!');
    return;
  }

  localStorage.setItem('eureka_m05_booking_pool', JSON.stringify(codes));

  if (typeof initM05WheelSegments === 'function') initM05WheelSegments();
  if (typeof drawM05Wheel === 'function') drawM05Wheel();
  if (typeof updateM05PublicInfo === 'function') updateM05PublicInfo();

  renderAdminM05BookingManager();
  alert(`✅ Đã lưu thành công ${codes.length} mã booking vào Vòng Quay Mùng 05!`);
}

function loadDemoM05Bookings() {
  const demoCodes = [
    "ERK-BK-2026-8891", "ERK-BK-2026-4432", "ERK-BK-2026-1205", "ERK-BK-2026-9012",
    "ERK-BK-2026-7731", "ERK-BK-2026-5524", "ERK-BK-2026-3198", "ERK-BK-2026-6640",
    "ERK-BK-2026-2287", "ERK-BK-2026-9914", "ERK-BK-2026-1043", "ERK-BK-2026-8320",
    "ERK-BK-2026-4176", "ERK-BK-2026-5902", "ERK-BK-2026-7241", "ERK-BK-2026-3819",
    "ERK-BK-2026-6055", "ERK-BK-2026-2790", "ERK-BK-2026-8411", "ERK-BK-2026-9533"
  ];
  localStorage.setItem('eureka_m05_booking_pool', JSON.stringify(demoCodes));

  if (typeof initM05WheelSegments === 'function') initM05WheelSegments();
  if (typeof drawM05Wheel === 'function') drawM05Wheel();
  if (typeof updateM05PublicInfo === 'function') updateM05PublicInfo();

  renderAdminM05BookingManager();
  alert(`✅ Đã nạp ${demoCodes.length} mã booking mẫu vào hệ thống!`);
}

function clearM05BookingPool() {
  if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ danh sách mã booking dự thưởng hiện tại?')) {
    localStorage.removeItem('eureka_m05_booking_pool');
    if (typeof initM05WheelSegments === 'function') initM05WheelSegments();
    if (typeof drawM05Wheel === 'function') drawM05Wheel();
    if (typeof updateM05PublicInfo === 'function') updateM05PublicInfo();
    renderAdminM05BookingManager();
    alert('Đã xóa sạch danh sách mã booking!');
  }
}

function handleM05FileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    const codes = parseBookingCodesFromText(content);
    if (codes.length === 0) {
      alert('⚠️ Không tìm thấy mã booking nào trong file vừa chọn!');
      return;
    }

    const textarea = document.getElementById('admin-m05-booking-textarea');
    if (textarea) textarea.value = codes.join('\n');

    // Auto save to pool
    localStorage.setItem('eureka_m05_booking_pool', JSON.stringify(codes));
    if (typeof initM05WheelSegments === 'function') initM05WheelSegments();
    if (typeof drawM05Wheel === 'function') drawM05Wheel();
    if (typeof updateM05PublicInfo === 'function') updateM05PublicInfo();
    renderAdminM05BookingManager();

    alert(`🎉 Đã tải lên và nhập thành công ${codes.length} mã booking từ file: ${file.name}!`);
  };
  reader.readAsText(file);
  event.target.value = '';
}

function exportM05BookingPoolTxt() {
  const pool = (typeof getM05BookingPool === 'function') ? getM05BookingPool() : [];
  if (pool.length === 0) {
    alert('Danh sách mã booking đang trống!');
    return;
  }
  const text = pool.join('\r\n');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Danh_Sach_Ma_Booking_Du_Thuong_${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function renderAdminM05BookingManager() {
  const pool = (typeof getM05BookingPool === 'function') ? getM05BookingPool() : [];
  const currentPrize = (typeof getM05CurrentPrize === 'function') ? getM05CurrentPrize() : 'Voucher Chiết Khấu 300.000 đ';

  // Update prize input
  const prizeInput = document.getElementById('admin-m05-prize-input');
  if (prizeInput) prizeInput.value = currentPrize;

  // Update total count badge in Tab 3
  const countBadge = document.getElementById('admin-m05-booking-count');
  if (countBadge) countBadge.textContent = `${pool.length}`;

  // Update textarea
  const textarea = document.getElementById('admin-m05-booking-textarea');
  if (textarea) {
    textarea.value = pool.join('\n');
  }

  // Update preview chip cloud (first 30 codes)
  const chipsContainer = document.getElementById('admin-m05-preview-chips');
  if (chipsContainer) {
    chipsContainer.innerHTML = '';
    if (pool.length === 0) {
      chipsContainer.innerHTML = '<span class="text-xs text-slate-500">Chưa có mã booking nào trong danh sách. Hãy nhấn "Nạp 20 Mã Mẫu" hoặc "Tải File" để bắt đầu!</span>';
    } else {
      const showCount = Math.min(pool.length, 30);
      for (let i = 0; i < showCount; i++) {
        const span = document.createElement('span');
        span.className = 'px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px] font-bold border border-slate-700';
        span.textContent = pool[i];
        chipsContainer.appendChild(span);
      }
      if (pool.length > showCount) {
        const moreSpan = document.createElement('span');
        moreSpan.className = 'px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 font-mono text-[11px]';
        moreSpan.textContent = `+ ${pool.length - showCount} mã khác...`;
        chipsContainer.appendChild(moreSpan);
      }
    }
  }

  // Render winners table
  renderAdminWinnersTable();
}

// 3. Quản lý Lịch sử Trúng Thưởng Mùng 05
function getMonthlyWinners() {
  const saved = localStorage.getItem(STORAGE_KEY_MONTHLY_WINNERS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return [
    { period: "Kỳ 10/2026 (Mùng 05/11)", booking_code: "ERK-BK-2026-8891", prize: "Voucher Chiết Khấu 300.000 đ", draw_time: "10h05 - 05/11/2026", status: "✅ Đã đối soát & trừ cước" },
    { period: "Kỳ 10/2026 (Mùng 05/11)", booking_code: "ERK-BK-2026-4432", prize: "Voucher Chiết Khấu 300.000 đ", draw_time: "10h10 - 05/11/2026", status: "✅ Đã đối soát & trừ cước" },
    { period: "Kỳ 10/2026 (Mùng 05/11)", booking_code: "ERK-BK-2026-1205", prize: "Voucher Chiết Khấu 300.000 đ", draw_time: "10h15 - 05/11/2026", status: "✅ Đã đối soát & trừ cước" },
    { period: "Kỳ 09/2026 (Mùng 05/10)", booking_code: "ERK-BK-2026-7731", prize: "Voucher Chiết Khấu 300.000 đ", draw_time: "10h08 - 05/10/2026", status: "✅ Đã hoàn tất trừ phí" }
  ];
}

function renderAdminWinnersTable() {
  const container = document.getElementById('admin-winners-body');
  const mobileContainer = document.getElementById('admin-winners-cards-mobile');

  const winners = getMonthlyWinners();
  if (container) container.innerHTML = '';
  if (mobileContainer) mobileContainer.innerHTML = '';

  if (winners.length === 0) {
    if (container) {
      container.innerHTML = `
        <tr>
          <td colspan="6" class="py-6 text-center text-slate-500 text-xs">
            Chưa có lượt quay trúng thưởng nào.
          </td>
        </tr>
      `;
    }
    if (mobileContainer) {
      mobileContainer.innerHTML = `
        <div class="py-6 text-center text-slate-500 text-xs italic">
          Chưa có lượt quay trúng thưởng nào.
        </div>
      `;
    }
    return;
  }

  winners.forEach((w, idx) => {
    // 1. Desktop table row
    if (container) {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-700/60 hover:bg-slate-800/40 text-xs text-slate-200';
      tr.innerHTML = `
        <td class="py-2.5 px-3 text-slate-400">${w.period}</td>
        <td class="py-2.5 px-3 font-mono font-black text-amber-300 text-sm tracking-wider">
          ${w.booking_code || w.order_masked || 'ERK-BK-' + (1000 + idx)}
        </td>
        <td class="py-2.5 px-3 font-bold text-emerald-400">${w.prize}</td>
        <td class="py-2.5 px-3 text-slate-400 font-mono text-[11px]">${w.draw_time || '10h00 - Mùng 05'}</td>
        <td class="py-2.5 px-3 text-slate-300">${w.status || 'Đã ghi nhận'}</td>
        <td class="py-2.5 px-3 text-center">
          <button onclick="deleteMonthlyWinner(${idx})" class="text-rose-400 hover:text-rose-300 font-bold text-[11px]">Xóa</button>
        </td>
      `;
      container.appendChild(tr);
    }

    // 2. Mobile card view (Zero horizontal scroll)
    if (mobileContainer) {
      const card = document.createElement('div');
      card.className = 'p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs shadow';
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-amber-400 font-mono font-bold text-sm tracking-wide">${w.booking_code || w.order_masked || 'ERK-BK-' + (1000 + idx)}</span>
          <span class="text-[10px] text-slate-400 font-mono">${w.period}</span>
        </div>
        <div class="flex items-center justify-between text-[11px]">
          <span class="font-bold text-emerald-400">${w.prize}</span>
          <span class="text-slate-400 text-[10px]">${w.draw_time || '10h00 - Mùng 05'}</span>
        </div>
        <div class="flex items-center justify-between pt-1 border-t border-slate-800/60">
          <span class="text-[10px] text-slate-300">${w.status || 'Đã ghi nhận'}</span>
          <button onclick="deleteMonthlyWinner(${idx})" class="text-rose-400 hover:text-rose-300 font-bold text-[11px]">✕ Xóa</button>
        </div>
      `;
      mobileContainer.appendChild(card);
    }
  });
}

function deleteMonthlyWinner(idx) {
  const winners = getMonthlyWinners();
  if (confirm('Bạn có chắc muốn xóa bản ghi mã booking trúng thưởng này?')) {
    winners.splice(idx, 1);
    localStorage.setItem(STORAGE_KEY_MONTHLY_WINNERS, JSON.stringify(winners));
    renderAdminWinnersTable();
    if (typeof renderPublicMonthlyWinners === 'function') {
      renderPublicMonthlyWinners();
    }
  }
}

function exportMonthlyWinnersCsv() {
  const winners = getMonthlyWinners();
  if (winners.length === 0) {
    alert('Chưa có dữ liệu trúng thưởng để xuất file!');
    return;
  }
  let csv = 'STT,Ky Quay,Ma Booking Trung Thuong,Giai Thuong,Thoi Gian Quay,Trang Thai\n';
  winners.forEach((w, idx) => {
    csv += `"${idx + 1}","${w.period || ''}","${w.booking_code || ''}","${w.prize || ''}","${w.draw_time || ''}","${w.status || ''}"\n`;
  });

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Danh_Sach_Ma_Booking_Trung_Thuong_Mung_05_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ==================== TAB 4: QUẢN LÝ BẢNG XẾP HẠNG & CÔNG BỐ TOP TUẦN ====================

// --- PHẦN 1: CÔNG BỐ CHIẾN TƯỚNG / GIẢI TOP TUẦN ---
function renderAdminWeeklyWinnerForm() {
  let winner = null;
  try {
    const raw = localStorage.getItem('eureka_weekly_winner');
    if (raw) winner = JSON.parse(raw);
  } catch (e) {}

  const activeCheck = document.getElementById('admin-weekly-active');
  const titleInput = document.getElementById('admin-weekly-title');
  const nameInput = document.getElementById('admin-weekly-name');
  const codeInput = document.getElementById('admin-weekly-code');
  const spendInput = document.getElementById('admin-weekly-spending');
  const prizeInput = document.getElementById('admin-weekly-prize');
  const msgInput = document.getElementById('admin-weekly-msg');
  const statusBadge = document.getElementById('admin-weekly-status-badge');

  if (winner) {
    if (activeCheck) activeCheck.checked = !!winner.is_active;
    if (titleInput) titleInput.value = winner.week_title || '';
    if (nameInput) nameInput.value = winner.customer_name || '';
    if (codeInput) codeInput.value = winner.customer_code || winner.code || '';
    if (spendInput) spendInput.value = winner.weekly_spending || '';
    if (prizeInput) prizeInput.value = winner.prize_name || '';
    if (msgInput) msgInput.value = winner.congrats_message || '';
    
    if (statusBadge) {
      if (winner.is_active) {
        statusBadge.textContent = '🟢 ĐANG HIỂN THỊ TRÊN MÀN HÌNH CHÍNH';
        statusBadge.className = 'text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30';
      } else {
        statusBadge.textContent = '⚪ ĐANG TẮT / ẨN KHỎI MÀN HÌNH CHÍNH';
        statusBadge.className = 'text-[11px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700';
      }
    }
  } else {
    if (activeCheck) activeCheck.checked = false;
    if (statusBadge) {
      statusBadge.textContent = '⚪ CHƯA CÔNG BỐ';
      statusBadge.className = 'text-[11px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700';
    }
  }
}

function saveAdminWeeklyWinner() {
  const activeCheck = document.getElementById('admin-weekly-active');
  const titleInput = document.getElementById('admin-weekly-title');
  const nameInput = document.getElementById('admin-weekly-name');
  const codeInput = document.getElementById('admin-weekly-code');
  const spendInput = document.getElementById('admin-weekly-spending');
  const prizeInput = document.getElementById('admin-weekly-prize');
  const msgInput = document.getElementById('admin-weekly-msg');

  const isActive = activeCheck ? activeCheck.checked : false;
  const nameVal = nameInput ? nameInput.value.trim() : '';
  const spendVal = spendInput ? spendInput.value.trim() : '';

  if (isActive && (!nameVal || !spendVal)) {
    alert('⚠️ Vui lòng nhập Tên khách hàng và Số tiền chi tiêu dịch vụ tuần trước khi kích hoạt hiển thị!');
    return;
  }

  // Helper mask functions
  const maskName = (typeof maskCustomerName === 'function') ? maskCustomerName : (n => n);

  const winnerData = {
    is_active: isActive,
    week_title: titleInput ? titleInput.value.trim() : 'Tuần Chương Trình',
    customer_name: maskName(nameVal),
    customer_code: codeInput ? codeInput.value.trim().toUpperCase() : 'ERK-KH-8891',
    weekly_spending: spendVal,
    prize_name: prizeInput ? prizeInput.value.trim() : 'Voucher 1.000.000 đ',
    congrats_message: msgInput ? msgInput.value.trim() : '',
    updated_at: new Date().toLocaleString('vi-VN')
  };

  localStorage.setItem('eureka_weekly_winner', JSON.stringify(winnerData));
  if (typeof syncAdminConfigToCloud === 'function') {
    syncAdminConfigToCloud('eureka_weekly_winner', winnerData);
  }

  if (typeof renderWeeklyWinnerSpotlight === 'function') {
    renderWeeklyWinnerSpotlight();
  }
  renderAdminWeeklyWinnerForm();

  if (isActive) {
    alert(`🎉 ĐÃ CÔNG BỐ THÀNH CÔNG LÊN MÀN HÌNH CHÍNH!\n\n👑 Khách Hàng: ${winnerData.customer_name}\n🏷️ Mã: ${winnerData.customer_code}\n💰 Doanh Số Dịch Vụ Tuần: ${winnerData.weekly_spending}\n🎁 Phần Thưởng: ${winnerData.prize_name}`);
  } else {
    alert('✅ Đã lưu cấu hình (Đang ở trạng thái TẮT hiển thị trên trang chủ).');
  }
}

function loadDemoWeeklyWinner() {
  const demoData = {
    is_active: true,
    week_title: 'Tuần 42 (05/10 - 11/10/2026)',
    customer_name: 'Khách hàng T*** Đ*** XNK *** Châu',
    customer_code: 'ERK-KH-8891',
    weekly_spending: '148.650.000 đ',
    prize_name: 'Voucher 1.000.000 đ',
    congrats_message: 'Nhiệt liệt chúc mừng Quý khách đã xuất sắc dẫn đầu bảng vàng chi tiêu dịch vụ tuần qua, bứt phá tiến độ vận chuyển vượt bậc!',
    updated_at: new Date().toLocaleString('vi-VN')
  };

  localStorage.setItem('eureka_weekly_winner', JSON.stringify(demoData));
  if (typeof renderWeeklyWinnerSpotlight === 'function') {
    renderWeeklyWinnerSpotlight();
  }
  renderAdminWeeklyWinnerForm();
  alert('✅ Đã nạp mẫu Chiến Tướng Tuần 42 và kích hoạt hiển thị lên màn hình chính!');
}

function disableAdminWeeklyWinner() {
  let winner = null;
  try {
    const raw = localStorage.getItem('eureka_weekly_winner');
    if (raw) winner = JSON.parse(raw);
  } catch (e) {}

  if (winner) {
    winner.is_active = false;
    localStorage.setItem('eureka_weekly_winner', JSON.stringify(winner));
  } else {
    localStorage.removeItem('eureka_weekly_winner');
  }

  if (typeof renderWeeklyWinnerSpotlight === 'function') {
    renderWeeklyWinnerSpotlight();
  }
  renderAdminWeeklyWinnerForm();
  alert('🚫 Đã gỡ bỏ / ẩn khối vinh danh Chiến Tướng Top Tuần khỏi màn hình chính!');
}

// --- GALA AWARDS VISIBILITY TOGGLE ---
function renderAdminGalaToggle() {
  let galaConfig = null;
  try {
    const raw = localStorage.getItem('eureka_gala_awards_config');
    if (raw) galaConfig = JSON.parse(raw);
  } catch (e) {}

  const activeCheck = document.getElementById('admin-gala-active');
  const statusBadge = document.getElementById('admin-gala-status-badge');

  if (galaConfig) {
    if (activeCheck) activeCheck.checked = !!galaConfig.is_active;
    if (statusBadge) {
      if (galaConfig.is_active) {
        statusBadge.textContent = '🟢 ĐANG HIỂN THỊ';
        statusBadge.className = 'text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30';
      } else {
        statusBadge.textContent = '⚪ ĐANG ẨN';
        statusBadge.className = 'text-[11px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700';
      }
    }
  } else {
    // Default: visible
    if (activeCheck) activeCheck.checked = true;
    if (statusBadge) {
      statusBadge.textContent = '🟢 ĐANG HIỂN THỊ (Mặc định)';
      statusBadge.className = 'text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30';
    }
  }

  // Apply visibility to main page
  applyGalaVisibility();
}

function saveAdminGalaToggle() {
  const activeCheck = document.getElementById('admin-gala-active');
  const isActive = activeCheck ? activeCheck.checked : true;

  const config = {
    is_active: isActive,
    updated_at: new Date().toLocaleString('vi-VN')
  };
  localStorage.setItem('eureka_gala_awards_config', JSON.stringify(config));
  if (typeof syncAdminConfigToCloud === 'function') {
    syncAdminConfigToCloud('eureka_gala_awards_config', config);
  }
  applyGalaVisibility();
  renderAdminGalaToggle();
  alert(isActive ? '🟢 Đã BẬT hiển thị phần Vinh danh Đêm Gala trên trang chính!' : '⚪ Đã TẮT / ẨN phần Vinh danh Đêm Gala khỏi trang chính!');
}

function applyGalaVisibility() {
  const section = document.getElementById('gala-awards-section');
  if (!section) return;

  let galaConfig = null;
  try {
    const raw = localStorage.getItem('eureka_gala_awards_config');
    if (raw) galaConfig = JSON.parse(raw);
  } catch (e) {}

  if (galaConfig && galaConfig.is_active === false) {
    section.style.display = 'none';
  } else {
    section.style.display = '';
  }
}

// Apply on page load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    applyGalaVisibility();
  });
}

// --- PHẦN 2: NẠP & QUẢN LÝ DANH SÁCH BẢNG XẾP HẠNG DOANH SỐ ---
function getAdminLeaderboardList() {
  try {
    const custom = localStorage.getItem('eureka_custom_leaderboard');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  if (typeof fallbackLeaderboardData !== 'undefined' && Array.isArray(fallbackLeaderboardData)) {
    return [...fallbackLeaderboardData];
  }
  return [];
}

function renderAdminLeaderboardTable() {
  const tbody = document.getElementById('admin-bxh-table-body');
  const countEl = document.getElementById('admin-bxh-count');
  if (!tbody) return;

  const data = getAdminLeaderboardList();
  if (countEl) countEl.textContent = `${data.length}`;

  tbody.innerHTML = '';

  data.forEach((row, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-700/60 hover:bg-slate-800/40 text-xs text-slate-200';
    tr.innerHTML = `
      <td class="py-2 px-2 text-center">
        <input type="number" min="1" max="999" value="${row.rank || (idx + 1)}" class="admin-bxh-rank w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-center font-bold text-amber-400">
      </td>
      <td class="py-2 px-2">
        <input type="text" value="${row.customer_name || ''}" placeholder="Tên khách hàng..." class="admin-bxh-name w-full min-w-[170px] bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-semibold">
      </td>
      <td class="py-2 px-2">
        <input type="text" value="${row.customer_code || row.code || ('ERK-KH-' + (8800 + idx))}" placeholder="ERK-KH-8891" class="admin-bxh-code w-28 bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-amber-300 font-bold uppercase">
      </td>
      <td class="py-2 px-2">
        <select class="admin-bxh-vip bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200">
          <option value="VIP ELITE" ${row.vip_tier === 'VIP ELITE' ? 'selected' : ''}>VIP ELITE</option>
          <option value="VIP PREMIUM" ${row.vip_tier === 'VIP PREMIUM' ? 'selected' : ''}>VIP PREMIUM</option>
          <option value="VIP PRO" ${row.vip_tier === 'VIP PRO' ? 'selected' : ''}>VIP PRO</option>
          <option value="KH MỚI" ${row.vip_tier === 'KH MỚI' ? 'selected' : ''}>KH MỚI</option>
          <option value="KH CŨ" ${row.vip_tier === 'KH CŨ' ? 'selected' : ''}>KH CŨ</option>
          <option value="BASIC" ${row.vip_tier === 'BASIC' ? 'selected' : ''}>BASIC</option>
        </select>
      </td>
      <td class="py-2 px-2">
        <input type="number" min="0" value="${row.order_count || 0}" class="admin-bxh-orders w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-right font-bold text-white">
      </td>
      <td class="py-2 px-2">
        <input type="text" value="${row.volume_weight || ''}" placeholder="142,5 tấn | 190 m³" class="admin-bxh-volume w-32 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 text-right">
      </td>
      <td class="py-2 px-2">
        <input type="number" min="0" value="${row.service_fee || 0}" class="admin-bxh-fee w-32 bg-slate-900 border border-slate-700 rounded px-2 py-1 font-bold text-amber-300 text-right">
      </td>
      <td class="py-2 px-2">
        <input type="text" value="${row.prize_tag || ''}" placeholder="💻 Laptop Surface 35Tr" class="admin-bxh-prize w-36 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200">
      </td>
      <td class="py-2 px-2 text-center">
        <button type="button" onclick="deleteAdminLeaderboardRow(${idx})" class="text-rose-400 hover:text-rose-300 font-bold text-[11px]">Xóa</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function addAdminLeaderboardRow() {
  const current = getAdminLeaderboardList();
  const nextRank = current.length + 1;
  const randNum = Math.floor(1000 + Math.random() * 8999);
  current.push({
    rank: nextRank,
    customer_name: "Khách hàng Mới *** ***",
    customer_code: `ERK-KH-${randNum}`,
    vip_tier: "KH MỚI",
    order_count: 5,
    volume_weight: "10,0 tấn | 25 m³",
    service_fee: 50000000,
    prize_tag: "Ứng viên Tiềm Năng",
    prize_type: "regular"
  });
  localStorage.setItem('eureka_custom_leaderboard', JSON.stringify(current));
  renderAdminLeaderboardTable();
}

function deleteAdminLeaderboardRow(idx) {
  const current = getAdminLeaderboardList();
  if (confirm(`Bạn có chắc muốn xóa dòng khách hàng thứ ${idx + 1}?`)) {
    current.splice(idx, 1);
    current.forEach((item, i) => item.rank = i + 1);
    localStorage.setItem('eureka_custom_leaderboard', JSON.stringify(current));
    renderAdminLeaderboardTable();
    if (typeof loadLeaderboardData === 'function') loadLeaderboardData();
  }
}

function saveAdminLeaderboardFromTable() {
  const tbody = document.getElementById('admin-bxh-table-body');
  if (!tbody) return;

  const rows = Array.from(tbody.querySelectorAll('tr'));
  if (rows.length === 0) {
    alert('Bảng xếp hạng đang trống!');
    return;
  }

  const maskName = (typeof maskCustomerName === 'function') ? maskCustomerName : (n => n);

  const updatedList = rows.map((tr, idx) => {
    const rank = parseInt(tr.querySelector('.admin-bxh-rank')?.value, 10) || (idx + 1);
    const rawName = tr.querySelector('.admin-bxh-name')?.value.trim() || 'Khách hàng Eureka';
    const rawCode = tr.querySelector('.admin-bxh-code')?.value.trim().toUpperCase() || ('ERK-KH-' + (8800 + idx));
    const vip = tr.querySelector('.admin-bxh-vip')?.value || 'VIP PRO';
    const orders = parseInt(tr.querySelector('.admin-bxh-orders')?.value, 10) || 0;
    const volume = tr.querySelector('.admin-bxh-volume')?.value.trim() || '0 tấn | 0 m³';
    const fee = parseInt(tr.querySelector('.admin-bxh-fee')?.value, 10) || 0;
    const prize = tr.querySelector('.admin-bxh-prize')?.value.trim() || 'Bám đuổi Top 3';

    return {
      rank: rank,
      customer_name: maskName(rawName),
      original_name: rawName,
      customer_code: rawCode,
      vip_tier: vip,
      order_count: orders,
      volume_weight: volume,
      service_fee: fee,
      prize_tag: prize,
      prize_type: rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : 'regular'
    };
  });

  updatedList.sort((a, b) => a.rank - b.rank);

  localStorage.setItem('eureka_custom_leaderboard', JSON.stringify(updatedList));
  if (typeof syncAdminConfigToCloud === 'function') {
    syncAdminConfigToCloud('eureka_custom_leaderboard', updatedList);
  }

  if (typeof loadLeaderboardData === 'function') {
    loadLeaderboardData();
  }
  renderAdminLeaderboardTable();

  alert(`✅ Đã lưu thành công ${updatedList.length} khách hàng vào Bảng Xếp Hạng Doanh Số!\nDữ liệu đã được cập nhật trực tiếp lên màn hình chính.`);
}

function loadDemoLeaderboardToAdmin() {
  if (confirm('Đặt lại toàn bộ Bảng Xếp Hạng về 25 khách hàng tham gia mẫu chuẩn ban đầu?')) {
    if (typeof fallbackLeaderboardData !== 'undefined') {
      localStorage.setItem('eureka_custom_leaderboard', JSON.stringify(fallbackLeaderboardData));
    }
    renderAdminLeaderboardTable();
    if (typeof loadLeaderboardData === 'function') loadLeaderboardData();
    alert('✅ Đã nạp lại dữ liệu 25 khách hàng mẫu chuẩn!');
  }
}

function handleBxhFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    let list = [];

    const maskName = (typeof maskCustomerName === 'function') ? maskCustomerName : (n => n);

    try {
      if (file.name.endsWith('.json')) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          list = parsed.map((item, idx) => {
            const rawName = item.customer_name || item.name || 'Khách hàng Eureka';
            return {
              rank: item.rank || (idx + 1),
              customer_name: maskName(rawName),
              original_name: rawName,
              customer_code: (item.customer_code || item.code || ('ERK-KH-' + (8800 + idx))).toUpperCase(),
              vip_tier: item.vip_tier || 'VIP PRO',
              order_count: parseInt(item.order_count, 10) || 0,
              volume_weight: item.volume_weight || '0 tấn | 0 m³',
              service_fee: parseInt(item.service_fee, 10) || 0,
              prize_tag: item.prize_tag || '',
              prize_type: (item.rank === 1 || idx === 0) ? 'top1' : (item.rank === 2 || idx === 1) ? 'top2' : (item.rank === 3 || idx === 2) ? 'top3' : 'regular'
            };
          });
        }
      } else {
        // Parse CSV
        const lines = content.split(/[\r\n]+/).filter(l => l.trim().length > 0);
        const startIndex = (lines[0].toLowerCase().includes('hạng') || lines[0].toLowerCase().includes('rank') || lines[0].toLowerCase().includes('khách')) ? 1 : 0;
        
        for (let i = startIndex; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^["']+|["']+$/g, ''));
          if (cols.length >= 3) {
            const rawName = cols[1] || 'Khách hàng Eureka';
            list.push({
              rank: parseInt(cols[0], 10) || (list.length + 1),
              customer_name: maskName(rawName),
              original_name: rawName,
              customer_code: (cols[2] || ('ERK-KH-' + (8800 + list.length))).toUpperCase(),
              vip_tier: cols[3] || 'VIP PRO',
              order_count: parseInt(cols[4], 10) || 0,
              volume_weight: cols[5] || '0 tấn | 0 m³',
              service_fee: parseInt(cols[6], 10) || 0,
              prize_tag: cols[7] || '',
              prize_type: list.length === 0 ? 'top1' : list.length === 1 ? 'top2' : list.length === 2 ? 'top3' : 'regular'
            });
          }
        }
      }

      if (list.length > 0) {
        localStorage.setItem('eureka_custom_leaderboard', JSON.stringify(list));
        renderAdminLeaderboardTable();
        if (typeof loadLeaderboardData === 'function') loadLeaderboardData();
        alert(`🎉 Tải lên thành công ${list.length} khách hàng từ file ${file.name} vào Bảng Xếp Hạng!`);
      } else {
        alert('⚠️ Không tìm thấy dữ liệu hợp lệ trong file!');
      }
    } catch (err) {
      alert('⚠️ Lỗi khi đọc file: ' + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function exportLeaderboardJson() {
  const list = getAdminLeaderboardList();
  if (list.length === 0) {
    alert('Bảng xếp hạng đang trống!');
    return;
  }
  const jsonStr = JSON.stringify(list, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bang_Xep_Hang_Eureka_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ==================== SUB-PANEL 3: CẤU HÌNH CÔNG BỐ NHIỆM VỤ HỆ THỐNG ====================
let adminSelectedNhiemVuMode = 'chang-1'; // Selected tab in editor: 'chang-1' | 'chang-2' | 'chang-3' | 'tong-ket'

function getAdminNhiemVuConfig() {
  if (typeof getNhiemVuConfig === 'function') {
    return getNhiemVuConfig();
  }
  try {
    const raw = localStorage.getItem('eureka_nhiem_vu_config');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return (typeof DEFAULT_NHIEM_VU_CONFIG !== 'undefined') ? JSON.parse(JSON.stringify(DEFAULT_NHIEM_VU_CONFIG)) : {};
}

function renderAdminNhiemVuManager() {
  const cfg = getAdminNhiemVuConfig();
  if (!cfg) return;

  adminSelectedNhiemVuMode = cfg.active_mode || 'chang-1';
  updateAdminNhiemVuUI();
}

function setAdminNhiemVuMode(mode) {
  adminSelectedNhiemVuMode = mode;
  updateAdminNhiemVuUI();
}

function updateAdminNhiemVuUI() {
  const cfg = getAdminNhiemVuConfig();
  const currentMode = adminSelectedNhiemVuMode;

  // 1. Update Mode Buttons
  ['chang-1', 'chang-2', 'chang-3', 'tong-ket'].forEach(m => {
    const btn = document.getElementById(`btn-mode-${m}`);
    if (btn) {
      if (m === currentMode) {
        btn.className = 'admin-nhiemvu-mode-btn p-2.5 rounded-xl border text-left transition-all bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold text-xs ring-1 ring-cyan-400/50';
      } else {
        btn.className = 'admin-nhiemvu-mode-btn p-2.5 rounded-xl border text-left transition-all bg-slate-900 border-slate-700 text-slate-400 hover:text-white font-bold text-xs';
      }
    }
  });

  // 2. Status Badge
  const statusBadge = document.getElementById('admin-nhiemvu-status-badge');
  if (statusBadge) {
    if (currentMode === 'tong-ket') {
      statusBadge.textContent = '📊 ĐANG CÔNG BỐ: TỔNG KẾT 3 CHẶNG';
      statusBadge.className = 'px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold shrink-0';
    } else if (currentMode === 'chang-1') {
      statusBadge.textContent = '⚡ ĐANG CÔNG BỐ: CHẶNG 1 (THÁNG 10)';
      statusBadge.className = 'px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold shrink-0';
    } else if (currentMode === 'chang-2') {
      statusBadge.textContent = '⚡ ĐANG CÔNG BỐ: CHẶNG 2 (THÁNG 11)';
      statusBadge.className = 'px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-bold shrink-0';
    } else if (currentMode === 'chang-3') {
      statusBadge.textContent = '⚡ ĐANG CÔNG BỐ: CHẶNG 3 (THÁNG 12)';
      statusBadge.className = 'px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold shrink-0';
    }
  }

  // 3. Show/hide editor vs summary
  const singleEditor = document.getElementById('admin-nhiemvu-single-editor');
  const tongKetInfo = document.getElementById('admin-nhiemvu-tongket-info');

  if (currentMode === 'tong-ket') {
    if (singleEditor) singleEditor.classList.add('hidden');
    if (tongKetInfo) tongKetInfo.classList.remove('hidden');

    // Populate counts in summary box
    const c1El = document.getElementById('admin-tongket-c1-count');
    const c2El = document.getElementById('admin-tongket-c2-count');
    const c3El = document.getElementById('admin-tongket-c3-count');
    const c1List = cfg.chang_1?.customer_codes || cfg.chang_1?.codes || [];
    const c2List = cfg.chang_2?.customer_codes || cfg.chang_2?.codes || [];
    const c3List = cfg.chang_3?.customer_codes || cfg.chang_3?.codes || [];
    if (c1El) c1El.textContent = `${c1List.length} mã`;
    if (c2El) c2El.textContent = `${c2List.length} mã`;
    if (c3El) c3El.textContent = `${c3List.length} mã`;
  } else {
    if (singleEditor) singleEditor.classList.remove('hidden');
    if (tongKetInfo) tongKetInfo.classList.add('hidden');

    const changKey = currentMode.replace('-', '_'); // e.g. chang_1
    const changData = cfg[changKey] || {};

    const tagEl = document.getElementById('admin-nhiemvu-editor-tag');
    const titleEl = document.getElementById('admin-nhiemvu-editor-title');
    const timeInput = document.getElementById('admin-nhiemvu-time');
    const rewardInput = document.getElementById('admin-nhiemvu-reward');
    const condInput = document.getElementById('admin-nhiemvu-condition');
    const codesTextarea = document.getElementById('admin-nhiemvu-codes-input');
    const countEl = document.getElementById('admin-nhiemvu-editor-count');

    const periodTitle = changData.period_title || changData.title || currentMode.toUpperCase();
    const subTitle = changData.title ? `"${changData.title}"` : (changData.subtitle ? `"${changData.subtitle}"` : '');
    if (tagEl) tagEl.textContent = periodTitle;
    if (titleEl) titleEl.textContent = `${periodTitle} ${subTitle}`.trim();
    if (timeInput) timeInput.value = changData.time_range || changData.time_window || '';
    if (rewardInput) rewardInput.value = changData.reward || '';
    if (condInput) condInput.value = changData.condition || '';

    const codes = changData.customer_codes || changData.codes || [];
    if (codesTextarea) codesTextarea.value = codes.join('\n');
    if (countEl) countEl.textContent = `${codes.length} mã`;

    updateAdminNhiemVuPreview();
  }
}

function updateAdminNhiemVuPreview() {
  const textarea = document.getElementById('admin-nhiemvu-codes-input');
  const preview = document.getElementById('admin-nhiemvu-preview-chips');
  const countEl = document.getElementById('admin-nhiemvu-editor-count');
  if (!textarea || !preview) return;

  const raw = textarea.value;
  const codes = raw.split(/[\r\n,]+/).map(s => s.trim().toUpperCase()).filter(s => s.length > 0);

  if (countEl) countEl.textContent = `${codes.length} mã`;
  preview.innerHTML = '';

  if (codes.length === 0) {
    preview.innerHTML = '<span class="text-xs text-slate-500 italic">Chưa có mã nào trong danh sách. Hãy nhập hoặc nhấn "Nạp mã mẫu".</span>';
    return;
  }

  codes.forEach(code => {
    const chip = document.createElement('span');
    chip.className = 'px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px] font-bold border border-slate-700';
    chip.textContent = code;
    preview.appendChild(chip);
  });
}

function loadDemoNhiemVuCurrentChang() {
  const changKey = adminSelectedNhiemVuMode.replace('-', '_');
  let defaultChang = (typeof DEFAULT_NHIEM_VU_CONFIG !== 'undefined') ? DEFAULT_NHIEM_VU_CONFIG[changKey] : null;
  if (!defaultChang) return;

  const codes = defaultChang.customer_codes || defaultChang.codes || [];
  const textarea = document.getElementById('admin-nhiemvu-codes-input');
  if (textarea) {
    textarea.value = codes.join('\n');
    updateAdminNhiemVuPreview();
  }
}

function saveAdminNhiemVuConfig() {
  const cfg = getAdminNhiemVuConfig();
  cfg.active_mode = adminSelectedNhiemVuMode;

  if (adminSelectedNhiemVuMode !== 'tong-ket') {
    const changKey = adminSelectedNhiemVuMode.replace('-', '_');
    if (!cfg[changKey]) cfg[changKey] = {};

    const timeInput = document.getElementById('admin-nhiemvu-time');
    const rewardInput = document.getElementById('admin-nhiemvu-reward');
    const condInput = document.getElementById('admin-nhiemvu-condition');
    const codesTextarea = document.getElementById('admin-nhiemvu-codes-input');

    if (timeInput) {
      cfg[changKey].time_range = timeInput.value.trim();
      cfg[changKey].time_window = timeInput.value.trim();
    }
    if (rewardInput) cfg[changKey].reward = rewardInput.value.trim();
    if (condInput) cfg[changKey].condition = condInput.value.trim();

    if (codesTextarea) {
      const parsedCodes = codesTextarea.value.split(/[\r\n,]+/).map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
      cfg[changKey].customer_codes = parsedCodes;
      cfg[changKey].codes = parsedCodes;
    }
  }

  localStorage.setItem('eureka_nhiem_vu_config', JSON.stringify(cfg));
  if (typeof syncAdminConfigToCloud === 'function') {
    syncAdminConfigToCloud('eureka_nhiem_vu_config', cfg);
  }

  // Sync to frontend display
  if (typeof renderNhiemVuDisplay === 'function') {
    renderNhiemVuDisplay();
  }

  updateAdminNhiemVuUI();

  let modeLabel = 'Chặng 1 (Tháng 10)';
  if (cfg.active_mode === 'chang-2') modeLabel = 'Chặng 2 (Tháng 11)';
  if (cfg.active_mode === 'chang-3') modeLabel = 'Chặng 3 (Tháng 12)';
  if (cfg.active_mode === 'tong-ket') modeLabel = 'Bản Tổng Kết 3 Chặng';

  alert(`✅ ĐÃ LƯU & CẬP NHẬT CÔNG BỐ NHIỆM VỤ HỆ THỐNG!\n\nChế độ hiển thị: ${modeLabel}\nTrang chủ đã được tự động làm mới ngay lập tức.`);
}

function resetAdminNhiemVuConfig() {
  if (confirm('Khôi phục cấu hình Nhiệm Vụ Hệ Thống về mặc định của chương trình?')) {
    localStorage.removeItem('eureka_nhiem_vu_config');
    renderAdminNhiemVuManager();
    if (typeof renderNhiemVuDisplay === 'function') renderNhiemVuDisplay();
    alert('✅ Đã khôi phục cài đặt mặc định!');
  }
}

// ==================== CẤU HÌNH BOT & WEBHOOK THÔNG BÁO TỰ ĐỘNG ====================
function getBotConfig() {
  try {
    const raw = localStorage.getItem('eureka_bot_config');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    telegram_enabled: false,
    telegram_token: '',
    telegram_chat_id: '',
    webhook_enabled: false,
    webhook_url: ''
  };
}

function loadBotConfigToAdminForm() {
  const config = getBotConfig();
  const tgActive = document.getElementById('admin-bot-tg-active');
  const tgToken = document.getElementById('admin-bot-tg-token');
  const tgChatId = document.getElementById('admin-bot-tg-chatid');
  const whActive = document.getElementById('admin-bot-webhook-active');
  const whUrl = document.getElementById('admin-bot-webhook-url');
  const statusBadge = document.getElementById('bot-status-badge');

  if (tgActive) tgActive.checked = !!config.telegram_enabled;
  if (tgToken) tgToken.value = config.telegram_token || '';
  if (tgChatId) tgChatId.value = config.telegram_chat_id || '';
  if (whActive) whActive.checked = !!config.webhook_enabled;
  if (whUrl) whUrl.value = config.webhook_url || '';

  if (statusBadge) {
    if (config.telegram_enabled || config.webhook_enabled) {
      statusBadge.textContent = '🟢 ĐANG BẬT BẮN TIN TỰ ĐỘNG';
      statusBadge.className = 'px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold shrink-0';
    } else {
      statusBadge.textContent = '⚪ CHƯA KÍCH HOẠT';
      statusBadge.className = 'px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold shrink-0';
    }
  }
}

function saveBotConfig() {
  const tgActive = document.getElementById('admin-bot-tg-active')?.checked || false;
  const tgToken = document.getElementById('admin-bot-tg-token')?.value.trim() || '';
  let tgChatId = document.getElementById('admin-bot-tg-chatid')?.value.trim() || '';
  const whActive = document.getElementById('admin-bot-webhook-active')?.checked || false;
  const whUrl = document.getElementById('admin-bot-webhook-url')?.value.trim() || '';

  // Auto-normalize: If Chat ID is a supergroup ID (>= 10 digits starting with 100) but missing leading '-'
  if (tgChatId && /^[0-9]{10,}$/.test(tgChatId)) {
    tgChatId = '-' + tgChatId;
    const input = document.getElementById('admin-bot-tg-chatid');
    if (input) input.value = tgChatId;
  }

  const config = {
    telegram_enabled: tgActive,
    telegram_token: tgToken,
    telegram_chat_id: tgChatId,
    webhook_enabled: whActive,
    webhook_url: whUrl,
    updated_at: new Date().toLocaleString('vi-VN')
  };

  localStorage.setItem('eureka_bot_config', JSON.stringify(config));
  loadBotConfigToAdminForm();
  alert('💾 Đã lưu thành công cấu hình Bot & Webhook!\nHệ thống sẽ tự động chuyển dữ liệu khách quay thưởng theo cấu hình này.');
}

async function testBotNotification() {
  const tgToken = document.getElementById('admin-bot-tg-token')?.value.trim();
  let tgChatId = document.getElementById('admin-bot-tg-chatid')?.value.trim();
  const whUrl = document.getElementById('admin-bot-webhook-url')?.value.trim();
  const tgActive = document.getElementById('admin-bot-tg-active')?.checked;
  const whActive = document.getElementById('admin-bot-webhook-active')?.checked;

  // Auto-normalize: If Chat ID is a supergroup ID (>= 10 digits starting with 100) but missing leading '-'
  if (tgChatId && /^[0-9]{10,}$/.test(tgChatId)) {
    tgChatId = '-' + tgChatId;
    const input = document.getElementById('admin-bot-tg-chatid');
    if (input) input.value = tgChatId;
  }

  if (!tgActive && !whActive) {
    alert('⚠️ Vui lòng tích chọn Kích hoạt ít nhất 01 kênh (Telegram Bot hoặc Webhook) để thử nghiệm!');
    return;
  }

  let results = [];

  if (tgActive) {
    if (!tgToken || !tgChatId) {
      alert('⚠️ Vui lòng điền đủ Bot Token và Chat ID của Telegram để test!');
      return;
    }
    try {
      const testMsg = `🧪 *[EUREKA LOGISTICS - TEST KẾT NỐI BOT]*\n━━━━━━━━━━━━━━━━━━\n✅ *Kết nối Telegram Bot thành công!*\n⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}\n👉 Sẵn sàng nhận thông báo khi khách quay thưởng!\n━━━━━━━━━━━━━━━━━━`;
      const res = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId,
          text: testMsg,
          parse_mode: 'Markdown'
        })
      });
      const data = await res.json();
      if (data.ok) {
        results.push('✅ Telegram Bot: Gửi tin nhắn thử nghiệm thành công! Hãy kiểm tra ứng dụng Telegram của bạn.');
      } else {
        let errDesc = data.description || 'Lỗi Token hoặc Chat ID';
        if (errDesc.includes('chat not found')) {
          errDesc += '\n\n💡 HƯỚNG DẪN XỬ LÝ:\n1. Bạn ĐÃ THÊM BOT VÀO NHÓM CHƯA? Bắt buộc phải thêm Bot vào làm thành viên nhóm thì bot mới gửi tin được.\n2. Chat ID của nhóm phải có dấu trừ (-) ở đầu (ví dụ: -' + tgChatId.replace(/^-/, '') + ').';
        }
        results.push(`❌ Telegram Bot thất bại: ${errDesc}`);
      }
    } catch (e) {
      results.push(`❌ Lỗi kết nối Telegram: ${e.message}`);
    }
  }

  if (whActive) {
    if (!whUrl) {
      alert('⚠️ Vui lòng nhập Webhook URL để test!');
      return;
    }
    try {
      await fetch(whUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'test_connection',
          message: 'Test webhook connection from Eureka Logistics',
          time: new Date().toLocaleString('vi-VN')
        }),
        mode: 'no-cors'
      });
      results.push('✅ Webhook: Đã gửi payload thử nghiệm đến URL!');
    } catch (e) {
      results.push(`❌ Lỗi gửi Webhook: ${e.message}`);
    }
  }

  alert(results.join('\n\n'));
}

// Admin Tab switcher in modal
function switchAdminTab(tabName) {
  document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.classList.remove('bg-brand-600', 'text-white');
    btn.classList.add('text-slate-400');
  });

  const activeContent = document.getElementById(`admin-tab-${tabName}`);
  const activeBtn = document.getElementById(`admin-btn-${tabName}`);
  if (activeContent) activeContent.classList.remove('hidden');
  if (activeBtn) {
    activeBtn.classList.add('bg-brand-600', 'text-white');
    activeBtn.classList.remove('text-slate-400');
  }

  if (tabName === 'spin-leads') {
    renderAdminSpinLeadsTable();
    loadBotConfigToAdminForm();
  }
  if (tabName === 'monthly-winners') {
    renderAdminM05BookingManager();
  }
  if (tabName === 'leaderboard-manager') {
    renderAdminWeeklyWinnerForm();
    renderAdminGalaToggle();
    renderAdminLeaderboardTable();
    renderAdminNhiemVuManager();
  }
  if (tabName === 'affiliate-contest') {
    renderAdminAffiliateContest();
  }
  if (tabName === 'sheets-sync') {
    renderAdminSheetsSyncTab();
  }
}

// ==================== TAB 5: THI ĐUA NỘI BỘ (AFFILIATE / REF TRACKING) ====================
function getAffiliateClicksData() {
  try {
    const raw = localStorage.getItem('eureka_ref_clicks');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    "nam": 38,
    "lan": 24,
    "thao": 15
  };
}

function renderAdminAffiliateContest() {
  const container = document.getElementById('admin-affiliate-table-body');
  const leads = getSpinLeadsList();
  const clicksData = getAffiliateClicksData();

  // Aggregate stats per referrer
  const staffMap = {};

  // Register all refs from clicks
  Object.keys(clicksData).forEach(ref => {
    const cleanRef = ref.toLowerCase().trim();
    if (!staffMap[cleanRef]) {
      staffMap[cleanRef] = { ref: cleanRef, clicks: clicksData[ref] || 0, leads: [] };
    } else {
      staffMap[cleanRef].clicks = clicksData[ref] || 0;
    }
  });

  // Register all refs from leads
  leads.forEach(lead => {
    const cleanRef = (lead.ref && lead.ref !== 'direct') ? lead.ref.toLowerCase().trim() : null;
    if (cleanRef) {
      if (!staffMap[cleanRef]) {
        staffMap[cleanRef] = { ref: cleanRef, clicks: 0, leads: [] };
      }
      staffMap[cleanRef].leads.push(lead);
    }
  });

  const staffList = Object.values(staffMap);

  // Sắp xếp: Tiêu chí chính là Số SĐT thu về (leads.length) giảm dần, sau đó là Clicks giảm dần
  staffList.sort((a, b) => {
    if (b.leads.length !== a.leads.length) {
      return b.leads.length - a.leads.length;
    }
    return b.clicks - a.clicks;
  });

  // Update KPI Cards
  let totalClicks = 0;
  let totalLeadsCount = 0;
  staffList.forEach(s => {
    totalClicks += s.clicks;
    totalLeadsCount += s.leads.length;
  });

  const kpiMembers = document.getElementById('kpi-affiliate-members');
  const kpiClicks = document.getElementById('kpi-affiliate-clicks');
  const kpiLeads = document.getElementById('kpi-affiliate-leads');
  const badge = document.getElementById('admin-affiliate-badge');

  const mobileContainer = document.getElementById('admin-affiliate-cards-mobile');

  if (kpiMembers) kpiMembers.textContent = staffList.length;
  if (kpiClicks) kpiClicks.textContent = totalClicks;
  if (kpiLeads) kpiLeads.textContent = totalLeadsCount;
  if (badge) badge.textContent = `${staffList.length} NV`;

  if (container) container.innerHTML = '';
  if (mobileContainer) mobileContainer.innerHTML = '';

  if (staffList.length === 0) {
    if (container) {
      container.innerHTML = `
        <tr>
          <td colspan="7" class="py-6 text-center text-slate-500 italic text-xs">
            Chưa có dữ liệu thi đua. Hãy tạo link cho nhân viên bên trên để bắt đầu!
          </td>
        </tr>
      `;
    }
    if (mobileContainer) {
      mobileContainer.innerHTML = `
        <div class="py-6 text-center text-slate-500 italic text-xs">
          Chưa có dữ liệu thi đua. Hãy tạo link cho nhân viên bên trên để bắt đầu!
        </div>
      `;
    }
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];

  staffList.forEach((staff, idx) => {
    const rankBadge = idx < 3 
      ? `<span class="text-base">${medals[idx]}</span>` 
      : `<span class="font-bold text-slate-400 font-mono">#${idx + 1}</span>`;

    const convRate = staff.clicks > 0 
      ? ((staff.leads.length / staff.clicks) * 100).toFixed(1) + '%' 
      : (staff.leads.length > 0 ? '100%' : '0%');

    // 1. Desktop table row
    if (container) {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-800/80 hover:bg-slate-900/50 text-xs transition-colors';
      tr.innerHTML = `
        <td class="py-3 px-3.5 text-center font-bold">${rankBadge}</td>
        <td class="py-3 px-3.5 font-bold text-white flex items-center gap-2">
          <span class="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] text-amber-400 uppercase font-mono font-black shrink-0">
            ${staff.ref.slice(0, 2)}
          </span>
          <div>
            <div class="text-amber-300 font-bold uppercase tracking-wider font-mono">${staff.ref}</div>
            <div class="text-[10px] text-slate-400">Nhân viên thi đua</div>
          </div>
        </td>
        <td class="py-3 px-3.5 text-center font-mono font-bold text-slate-300">
          ${staff.clicks}
        </td>
        <td class="py-3 px-3.5 text-center font-mono font-black text-emerald-400 text-sm">
          ${staff.leads.length} SĐT
        </td>
        <td class="py-3 px-3.5 text-center font-mono font-bold text-sky-400">
          ${convRate}
        </td>
        <td class="py-3 px-3.5 text-center font-mono text-[11px] text-slate-300">
          <button type="button" onclick="copyAffiliateDirectLink('${staff.ref}')" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold text-[11px] inline-flex items-center gap-1 transition-all cursor-pointer" title="Sao chép link tiếp thị của ${staff.ref}">
            <span>🔗</span> ?ref=${staff.ref}
          </button>
        </td>
        <td class="py-3 px-3.5 text-center">
          <button type="button" onclick="viewAffiliateLeads('${staff.ref}')" class="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] inline-flex items-center gap-1 transition-all cursor-pointer">
            <span>👁️</span> Xem ${staff.leads.length} SĐT
          </button>
        </td>
      `;
      container.appendChild(tr);
    }

    // 2. Mobile card view (Zero horizontal scroll)
    if (mobileContainer) {
      const card = document.createElement('div');
      card.className = 'p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow';
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold shrink-0">${rankBadge}</span>
            <div>
              <div class="text-amber-300 font-bold uppercase tracking-wider font-mono text-xs">${staff.ref}</div>
              <div class="text-[10px] text-slate-400">Nhân viên thi đua</div>
            </div>
          </div>
          <div class="text-right">
            <span class="font-mono font-black text-emerald-400 text-sm">${staff.leads.length} SĐT</span>
            <div class="text-[10px] text-slate-400 font-mono">${staff.clicks} clicks (${convRate})</div>
          </div>
        </div>
        <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <button type="button" onclick="copyAffiliateDirectLink('${staff.ref}')" class="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold text-[11px] inline-flex items-center justify-center gap-1">
            <span>🔗</span> ?ref=${staff.ref}
          </button>
          <button type="button" onclick="viewAffiliateLeads('${staff.ref}')" class="py-1.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] inline-flex items-center justify-center gap-1">
            <span>👁️</span> Xem ${staff.leads.length} SĐT
          </button>
        </div>
      `;
      mobileContainer.appendChild(card);
    }
  });
}

function getBaseCampaignUrl() {
  const loc = window.location;
  return `${loc.protocol}//${loc.host}${loc.pathname}`;
}

function generateAffiliateLink() {
  const input = document.getElementById('affiliate-name-input');
  if (!input) return;
  const rawName = input.value.trim().toLowerCase();
  if (!rawName) {
    alert('⚠️ Vui lòng nhập tên hoặc mã nhân viên (ví dụ: nam, lan, erk01)!');
    return;
  }
  const cleanRef = rawName.replace(/[^a-z0-9_-]/g, '');
  if (!cleanRef) {
    alert('⚠️ Tên nhân viên chỉ nên gồm chữ cái, số, hoặc dấu gạch nối!');
    return;
  }

  const baseUrl = getBaseCampaignUrl();
  const fullUrl = `${baseUrl}?ref=${cleanRef}`;

  const resultBox = document.getElementById('affiliate-link-result-box');
  const resultUrl = document.getElementById('affiliate-generated-url');
  if (resultBox && resultUrl) {
    resultUrl.textContent = fullUrl;
    resultBox.classList.remove('hidden');
  }

  // Ensure this staff appears in clicks tracking
  const clicks = getAffiliateClicksData();
  if (clicks[cleanRef] === undefined) {
    clicks[cleanRef] = 0;
    localStorage.setItem('eureka_ref_clicks', JSON.stringify(clicks));
    renderAdminAffiliateContest();
  }
}

function copyAffiliateGeneratedLink() {
  const resultUrl = document.getElementById('affiliate-generated-url');
  if (!resultUrl) return;
  const text = resultUrl.textContent.trim();
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copy-affiliate-btn');
    if (btn) {
      const origHtml = btn.innerHTML;
      btn.innerHTML = '<span>✅ ĐÃ SAO CHÉP!</span>';
      setTimeout(() => { btn.innerHTML = origHtml; }, 2000);
    }
    alert(`✅ Đã sao chép link tiếp thị thi đua:\n${text}\n\nHãy gửi link này cho nhân viên đăng bài!`);
  }).catch(() => {
    alert(`Link tiếp thị:\n${text}`);
  });
}

function copyAffiliateDirectLink(refCode) {
  const baseUrl = getBaseCampaignUrl();
  const fullUrl = `${baseUrl}?ref=${refCode}`;
  navigator.clipboard.writeText(fullUrl).then(() => {
    alert(`✅ Đã sao chép link tiếp thị của nhân viên ${refCode.toUpperCase()}:\n${fullUrl}`);
  }).catch(() => {
    alert(`Link tiếp thị:\n${fullUrl}`);
  });
}

function viewAffiliateLeads(refCode) {
  const leads = getSpinLeadsList();
  const matched = leads.filter(l => l.ref && l.ref.toLowerCase().trim() === refCode.toLowerCase().trim());
  
  const container = document.getElementById('affiliate-leads-detail-container');
  const title = document.getElementById('affiliate-detail-title');
  const tbody = document.getElementById('affiliate-detail-table-body');
  const mobileCards = document.getElementById('affiliate-detail-cards-mobile');

  if (!container) return;
  if (title) title.innerHTML = `<span>📋</span> Danh sách ${matched.length} khách hàng do nhân viên <strong class="text-amber-400 uppercase font-mono">[${refCode}]</strong> mang về:`;
  if (tbody) tbody.innerHTML = '';
  if (mobileCards) mobileCards.innerHTML = '';

  if (matched.length === 0) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-slate-500 italic">Nhân viên này chưa mang về số điện thoại nào.</td></tr>`;
    if (mobileCards) mobileCards.innerHTML = `<div class="py-4 text-center text-slate-500 italic text-xs">Nhân viên này chưa mang về số điện thoại nào.</div>`;
  } else {
    matched.forEach((item, idx) => {
      const rawDigits = (item.phone || '').replace(/\D/g, '');
      const zaloPhone = rawDigits.startsWith('0') ? '84' + rawDigits.slice(1) : (rawDigits.startsWith('84') ? rawDigits : ('84' + rawDigits));
      
      // Desktop row
      if (tbody) {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-800/60 hover:bg-slate-900/40 text-xs';
        tr.innerHTML = `
          <td class="py-2 px-3 text-slate-400">${item.createdAt || 'Hôm nay'}</td>
          <td class="py-2 px-3 font-mono font-bold text-amber-300">${item.phone}</td>
          <td class="py-2 px-3 text-emerald-400 font-semibold">${item.prize}</td>
          <td class="py-2 px-3 text-white">${item.voucherCode || 'ERK-VOUCHER'}</td>
          <td class="py-2 px-3 text-center">
            <a href="https://zalo.me/${zaloPhone}" target="_blank" class="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] inline-flex items-center gap-1">
              💬 Chat
            </a>
          </td>
        `;
        tbody.appendChild(tr);
      }

      // Mobile card
      if (mobileCards) {
        const mcard = document.createElement('div');
        mcard.className = 'p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs';
        mcard.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="font-mono font-bold text-amber-300">${item.phone}</span>
            <span class="text-[10px] text-slate-400">${item.createdAt || 'Hôm nay'}</span>
          </div>
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-emerald-400 font-semibold">${item.prize}</span>
            <span class="text-white font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">${item.voucherCode || 'ERK-VOUCHER'}</span>
          </div>
          <div class="pt-1 border-t border-slate-800/80 flex justify-end">
            <a href="https://zalo.me/${zaloPhone}" target="_blank" class="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] inline-flex items-center gap-1">
              💬 Chat Zalo
            </a>
          </div>
        `;
        mobileCards.appendChild(mcard);
      }
    });
  }

  container.classList.remove('hidden');
  container.scrollIntoView({ behavior: 'smooth' });
}

function closeAffiliateDetail() {
  const container = document.getElementById('affiliate-leads-detail-container');
  if (container) container.classList.add('hidden');
}

function exportAffiliateContestCsv() {
  const leads = getSpinLeadsList();
  const clicksData = getAffiliateClicksData();

  const staffMap = {};
  Object.keys(clicksData).forEach(ref => {
    const cleanRef = ref.toLowerCase().trim();
    staffMap[cleanRef] = { ref: cleanRef, clicks: clicksData[ref] || 0, leads: [] };
  });
  leads.forEach(lead => {
    const cleanRef = (lead.ref && lead.ref !== 'direct') ? lead.ref.toLowerCase().trim() : null;
    if (cleanRef) {
      if (!staffMap[cleanRef]) staffMap[cleanRef] = { ref: cleanRef, clicks: 0, leads: [] };
      staffMap[cleanRef].leads.push(lead);
    }
  });

  const staffList = Object.values(staffMap);
  staffList.sort((a, b) => b.leads.length - a.leads.length);

  let csvContent = '\uFEFF'; // UTF-8 BOM
  csvContent += 'BẢNG XẾP HẠNG THI ĐUA NỘI BỘ - EUREKA 2026\n';
  csvContent += `Thời gian xuất: ${new Date().toLocaleString('vi-VN')}\n\n`;
  csvContent += 'Hạng,Nhân Viên (Ref),Lượt Click (Traffic),Số SĐT Thu Về (Điểm),Tỉ Lệ Chuyển Đổi\n';

  staffList.forEach((s, idx) => {
    const convRate = s.clicks > 0 ? ((s.leads.length / s.clicks) * 100).toFixed(1) + '%' : (s.leads.length > 0 ? '100%' : '0%');
    csvContent += `"${idx + 1}","${s.ref.toUpperCase()}","${s.clicks}","${s.leads.length}","${convRate}"\n`;
  });

  csvContent += '\n\nDANH SÁCH CHI TIẾT KHÁCH HÀNG THEO TỪNG NHÂN VIÊN\n';
  csvContent += 'Nhân Viên (Ref),Thời Gian,Số Điện Thoại,Phần Quà,Mã Voucher\n';
  leads.forEach(l => {
    const ref = (l.ref && l.ref !== 'direct') ? l.ref.toUpperCase() : 'Nguồn Trực Tiếp';
    csvContent += `"${ref}","${l.createdAt || ''}","${l.phone || ''}","${l.prize || ''}","${l.voucherCode || ''}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bao_Cao_Thi_Dua_Noi_Bo_Eureka_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// URL triggers (e.g. #admin or ?admin=true)
function initAdminTriggers() {
  if (window.location.hash === '#admin' || window.location.search.includes('admin')) {
    openAdminModal();
  }
  updateAdminUiState();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initAdminTriggers);
} else {
  initAdminTriggers();
}

// ==================== TAB 6: GOOGLE SHEETS CLOUD DATABASE ====================

const APPS_SCRIPT_SOURCE_CODE = `/**
 * GOOGLE APPS SCRIPT DATABASE - EUREKA CUSTOMER AWARDS 2026
 * Hướng dẫn:
 * 1. Mở một Google Spreadsheet mới trên Google Drive của bạn.
 * 2. Đặt tên file: "Eureka Customer Awards 2026 - Database"
 * 3. Trên menu: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 4. Xóa hết code cũ trong Code.gs và dán toàn bộ đoạn mã này vào.
 * 5. Bấm nút "Lưu" (biểu tượng đĩa mềm 💾).
 * 6. Bấm "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment).
 *    - Loại: "Ứng dụng web" (Web app).
 *    - Mô tả: "v1.0 Eureka Cloud DB".
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me).
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone).
 * 7. Bấm "Triển khai" -> Chọn tài khoản Google -> Bấm "Nâng cao" (Advanced) -> "Đi tới ... (không an toàn)" -> Bấm "Cho phép" (Allow).
 * 8. Copy đường dẫn "URL ứng dụng web" (kết thúc bằng /exec) và dán vào mục Quản Trị Website!
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAllData';
  if (action === 'ping') {
    return jsonOutput({ status: 'ok', message: 'Kết nối Google Sheets Cloud Database thành công!', timestamp: new Date().toISOString() });
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    initDatabaseSheets(ss);

    // 1. Leads & Phones
    var leadsSheet = ss.getSheetByName('VongQuayMayMan');
    var spinLeads = [];
    var lockedPhones = [];
    if (leadsSheet && leadsSheet.getLastRow() > 1) {
      var leadsData = leadsSheet.getRange(2, 1, leadsSheet.getLastRow() - 1, 6).getValues();
      for (var i = leadsData.length - 1; i >= 0; i--) {
        var row = leadsData[i];
        if (row[1]) {
          var phoneStr = String(row[1]).trim();
          spinLeads.push({
            id: 'L-' + (i + 1),
            createdAt: formatDate(row[0]),
            phone: phoneStr,
            voucherCode: String(row[2]),
            prize: String(row[3]),
            ref: String(row[4] || 'direct'),
            status: String(row[5] || 'Chờ áp dụng')
          });
          lockedPhones.push(phoneStr);
        }
      }
    }

    // 2. M05 Winners
    var m05Sheet = ss.getSheetByName('VongQuayM05');
    var monthlyWinners = [];
    if (m05Sheet && m05Sheet.getLastRow() > 1) {
      var m05Data = m05Sheet.getRange(2, 1, m05Sheet.getLastRow() - 1, 5).getValues();
      for (var j = m05Data.length - 1; j >= 0; j--) {
        var mRow = m05Data[j];
        if (mRow[2]) {
          monthlyWinners.push({
            id: 'W-' + (j + 1),
            draw_time: formatDate(mRow[0]),
            period: String(mRow[1]),
            booking_code: String(mRow[2]),
            prize: String(mRow[3]),
            status: String(mRow[4] || '✅ Đã ghi nhận')
          });
        }
      }
    }

    // 3. Admin Configs
    var cfgSheet = ss.getSheetByName('AdminConfig');
    var configs = {};
    if (cfgSheet && cfgSheet.getLastRow() > 1) {
      var cfgData = cfgSheet.getRange(2, 1, cfgSheet.getLastRow() - 1, 2).getValues();
      for (var k = 0; k < cfgData.length; k++) {
        var key = String(cfgData[k][0]).trim();
        var valStr = String(cfgData[k][1]).trim();
        if (key && valStr) {
          try { configs[key] = JSON.parse(valStr); } catch (err) { configs[key] = valStr; }
        }
      }
    }

    return jsonOutput({
      status: 'success',
      data: {
        spinLeads: spinLeads,
        lockedPhones: lockedPhones,
        monthlyWinners: monthlyWinners,
        nhiemVuConfig: configs['eureka_nhiem_vu_config'] || null,
        galaConfig: configs['eureka_gala_awards_config'] || null,
        weeklyWinner: configs['eureka_weekly_winner'] || null,
        customLeaderboard: configs['eureka_custom_leaderboard'] || null
      }
    });
  } catch (err) {
    return jsonOutput({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    initDatabaseSheets(ss);
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;

    if (action === 'record_spin_lead') {
      var lead = payload.lead || {};
      var leadsSheet = ss.getSheetByName('VongQuayMayMan');
      leadsSheet.appendRow([new Date(), "'" + String(lead.phone || '').trim(), lead.voucherCode || '', lead.prize || '', lead.ref || 'direct', lead.status || 'Chờ áp dụng qua Zalo']);
      return jsonOutput({ status: 'success', message: 'Đã lưu lead' });
    }

    if (action === 'record_m05_winner') {
      var winner = payload.winner || {};
      var m05Sheet = ss.getSheetByName('VongQuayM05');
      m05Sheet.appendRow([new Date(), winner.period || '', winner.booking_code || '', winner.prize || '', winner.status || '✅ Vừa quay trúng']);
      return jsonOutput({ status: 'success', message: 'Đã lưu người trúng M05' });
    }

    if (action === 'save_config') {
      var cfgKey = payload.key;
      var cfgVal = JSON.stringify(payload.value);
      var cfgSheet = ss.getSheetByName('AdminConfig');
      var foundRow = -1;
      if (cfgSheet.getLastRow() > 1) {
        var keys = cfgSheet.getRange(2, 1, cfgSheet.getLastRow() - 1, 1).getValues();
        for (var r = 0; r < keys.length; r++) {
          if (keys[r][0] === cfgKey) { foundRow = r + 2; break; }
        }
      }
      if (foundRow > 0) {
        cfgSheet.getRange(foundRow, 2).setValue(cfgVal);
        cfgSheet.getRange(foundRow, 3).setValue(new Date());
      } else {
        cfgSheet.appendRow([cfgKey, cfgVal, new Date()]);
      }
      return jsonOutput({ status: 'success', message: 'Đã lưu cấu hình' });
    }

    if (action === 'sync_all') {
      var all = payload.data || {};
      if (all.spinLeads && Array.isArray(all.spinLeads)) {
        var lSheet = ss.getSheetByName('VongQuayMayMan');
        if (lSheet.getLastRow() > 1) lSheet.getRange(2, 1, lSheet.getLastRow() - 1, 6).clearContent();
        var leadRows = all.spinLeads.map(function(l) {
          return [l.createdAt || new Date(), "'" + String(l.phone || ''), l.voucherCode || '', l.prize || '', l.ref || 'direct', l.status || 'Chờ áp dụng qua Zalo'];
        });
        if (leadRows.length > 0) lSheet.getRange(2, 1, leadRows.length, 6).setValues(leadRows);
      }
      if (all.monthlyWinners && Array.isArray(all.monthlyWinners)) {
        var mSheet = ss.getSheetByName('VongQuayM05');
        if (mSheet.getLastRow() > 1) mSheet.getRange(2, 1, mSheet.getLastRow() - 1, 5).clearContent();
        var mRows = all.monthlyWinners.map(function(w) {
          return [w.draw_time || new Date(), w.period || '', w.booking_code || '', w.prize || '', w.status || '✅ Đã ghi nhận'];
        });
        if (mRows.length > 0) mSheet.getRange(2, 1, mRows.length, 5).setValues(mRows);
      }
      var cSheet = ss.getSheetByName('AdminConfig');
      if (cSheet.getLastRow() > 1) cSheet.getRange(2, 1, cSheet.getLastRow() - 1, 3).clearContent();
      var configItems = [
        ['eureka_nhiem_vu_config', JSON.stringify(all.nhiemVuConfig || {})],
        ['eureka_gala_awards_config', JSON.stringify(all.galaConfig || {})],
        ['eureka_weekly_winner', JSON.stringify(all.weeklyWinner || {})],
        ['eureka_custom_leaderboard', JSON.stringify(all.customLeaderboard || [])]
      ];
      var cRows = configItems.map(function(item) { return [item[0], item[1], new Date()]; });
      cSheet.getRange(2, 1, cRows.length, 3).setValues(cRows);
      return jsonOutput({ status: 'success', message: 'Đã đồng bộ toàn bộ' });
    }

    return jsonOutput({ status: 'ignored' });
  } catch (err) {
    return jsonOutput({ status: 'error', message: err.toString() });
  }
}

function initDatabaseSheets(ss) {
  var sheet1 = ss.getSheetByName('VongQuayMayMan');
  if (!sheet1) {
    sheet1 = ss.insertSheet('VongQuayMayMan');
    sheet1.appendRow(['Thời Gian Quay', 'Số Điện Thoại', 'Mã Voucher', 'Giải Thưởng Trúng', 'Nguồn Giới Thiệu', 'Trạng Thái Chăm Sóc']);
    sheet1.getRange(1, 1, 1, 6).setBackground('#1e293b').setFontColor('#38bdf8').setFontWeight('bold');
    sheet1.setFrozenRows(1);
  }
  var sheet2 = ss.getSheetByName('VongQuayM05');
  if (!sheet2) {
    sheet2 = ss.insertSheet('VongQuayM05');
    sheet2.appendRow(['Thời Gian Quay', 'Kỳ Quay Thưởng', 'Mã Booking Trúng Thưởng', 'Giải Thưởng Tri Ân', 'Trạng Thái']);
    sheet2.getRange(1, 1, 1, 5).setBackground('#1e293b').setFontColor('#fbbf24').setFontWeight('bold');
    sheet2.setFrozenRows(1);
  }
  var sheet3 = ss.getSheetByName('AdminConfig');
  if (!sheet3) {
    sheet3 = ss.insertSheet('AdminConfig');
    sheet3.appendRow(['Tên Cấu Hình (Key)', 'Dữ Liệu JSON (Value)', 'Thời Gian Cập Nhật']);
    sheet3.getRange(1, 1, 1, 3).setBackground('#1e293b').setFontColor('#34d399').setFontWeight('bold');
    sheet3.setFrozenRows(1);
  }
}

function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'HH:mm - dd/MM/yyyy');
  return String(val);
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
`;

function renderAdminSheetsSyncTab() {
  const urlInput = document.getElementById('admin-sheets-url-input');
  const codeBox = document.getElementById('apps-script-code-box');
  const statusPill = document.getElementById('sheets-connection-status-pill');

  if (urlInput) {
    urlInput.value = (typeof getSheetsApiUrl === 'function') ? getSheetsApiUrl() : '';
  }

  if (codeBox) {
    codeBox.value = APPS_SCRIPT_SOURCE_CODE;
  }

  const isConnected = (typeof isSheetsConnected === 'function') && isSheetsConnected();
  if (statusPill) {
    if (isConnected) {
      statusPill.className = 'self-start sm:self-center px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold';
      statusPill.innerHTML = '🟢 Đã kết nối Google Sheets';
    } else {
      statusPill.className = 'self-start sm:self-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold';
      statusPill.innerHTML = '🟡 Chưa kết nối';
    }
  }

  const dot = document.getElementById('admin-sheets-status-dot');
  if (dot) {
    dot.className = isConnected ? 'w-2 h-2 rounded-full bg-emerald-400' : 'w-2 h-2 rounded-full bg-amber-400';
  }
}

async function handleSaveSheetsUrl() {
  const urlInput = document.getElementById('admin-sheets-url-input');
  const val = urlInput ? urlInput.value.trim() : '';
  if (!val) {
    if (confirm('Bạn có chắc muốn xóa URL Google Sheets? Hệ thống sẽ quay về chế độ lưu trữ cục bộ.')) {
      if (typeof setSheetsApiUrl === 'function') setSheetsApiUrl('');
      renderAdminSheetsSyncTab();
      if (typeof updateCloudSyncStatusBadge === 'function') updateCloudSyncStatusBadge(false, 'Chưa liên kết');
      alert('Đã xóa liên kết Google Sheets!');
    }
    return;
  }

  if (!val.startsWith('https://script.google.com/macros/s/')) {
    alert('⚠️ Đường dẫn không hợp lệ!\nURL Google Apps Script Web App phải có dạng:\nhttps://script.google.com/macros/s/.../exec');
    return;
  }

  if (typeof setSheetsApiUrl === 'function') setSheetsApiUrl(val);
  renderAdminSheetsSyncTab();

  const msgEl = document.getElementById('sheets-test-result-msg');
  if (msgEl) {
    msgEl.className = 'text-xs font-semibold text-sky-400 block';
    msgEl.textContent = '⏳ Đang kiểm tra kết nối tới Google Sheets...';
  }

  const testRes = (typeof testCloudConnection === 'function') ? await testCloudConnection(val) : { success: true };
  if (testRes.success) {
    if (msgEl) {
      msgEl.className = 'text-xs font-semibold text-emerald-400 block';
      msgEl.textContent = '✅ ' + testRes.message;
    }
    if (typeof fetchCloudData === 'function') {
      await fetchCloudData(false);
    }
    alert('🎉 KẾT NỐI GOOGLE SHEETS THÀNH CÔNG!\n\nTừ bây giờ, dữ liệu Vòng quay may mắn và Cấu hình Admin sẽ được đồng bộ dùng chung trên toàn bộ hệ thống.');
  } else {
    if (msgEl) {
      msgEl.className = 'text-xs font-semibold text-rose-400 block';
      msgEl.textContent = '❌ Lỗi: ' + testRes.message;
    }
    alert('⚠️ Lưu URL thành công nhưng kiểm tra kết nối thất bại:\n' + testRes.message + '\n\nVui lòng kiểm tra lại xem bạn đã chọn quyền truy cập là "Anyone" (Bất kỳ ai) khi Triển khai Web App chưa nhé!');
  }
}

async function handleTestSheetsConnection() {
  const urlInput = document.getElementById('admin-sheets-url-input');
  const val = urlInput ? urlInput.value.trim() : '';
  const msgEl = document.getElementById('sheets-test-result-msg');

  if (!val) {
    alert('Vui lòng nhập URL Google Apps Script Web App trước!');
    return;
  }

  if (msgEl) {
    msgEl.className = 'text-xs font-semibold text-sky-400 block';
    msgEl.textContent = '⏳ Đang gửi yêu cầu kiểm tra (Ping)...';
  }

  const res = (typeof testCloudConnection === 'function') ? await testCloudConnection(val) : { success: false, message: 'Chưa nạp script sync' };
  if (res.success) {
    if (msgEl) {
      msgEl.className = 'text-xs font-semibold text-emerald-400 block';
      msgEl.textContent = '✅ ' + res.message;
    }
    alert('✅ KẾT NỐI TỐT! Google Apps Script phản hồi bình thường.');
  } else {
    if (msgEl) {
      msgEl.className = 'text-xs font-semibold text-rose-400 block';
      msgEl.textContent = '❌ ' + res.message;
    }
    alert('❌ KẾT NỐI THẤT BẠI: ' + res.message);
  }
}

async function handleFetchFromCloud() {
  if (typeof fetchCloudData === 'function') {
    const success = await fetchCloudData(false);
    if (success) {
      alert('✅ ĐÃ KÉO DỮ LIỆU MỚI NHẤT TỪ GOOGLE SHEETS VỀ MÁY THÀNH CÔNG!');
    } else {
      alert('❌ Không thể kéo dữ liệu từ Google Sheets. Vui lòng kiểm tra kết nối mạng hoặc URL Web App.');
    }
  }
}

async function handlePushAllToCloud() {
  if (confirm('Bạn có chắc muốn đẩy toàn bộ cấu hình, danh sách SĐT quay và lịch sử từ máy này lên Google Sheets?\n(Dữ liệu trên Google Sheets sẽ được đồng bộ cập nhật)')) {
    if (typeof pushAllLocalDataToCloud === 'function') {
      await pushAllLocalDataToCloud();
    }
  }
}

function copyAppsScriptCode() {
  const codeBox = document.getElementById('apps-script-code-box');
  const feedback = document.getElementById('copy-script-feedback');
  if (codeBox) {
    codeBox.select();
    navigator.clipboard.writeText(codeBox.value).then(() => {
      if (feedback) {
        feedback.classList.remove('hidden');
        setTimeout(() => feedback.classList.add('hidden'), 3000);
      }
      alert('📋 ĐÃ SAO CHÉP MÃ APPS SCRIPT!\n\nBây giờ bạn chỉ cần mở Google Sheets -> Tiện ích mở rộng -> Apps Script -> Xóa code cũ và bấm Ctrl+V để dán.');
    }).catch(() => {
      document.execCommand('copy');
      alert('📋 Đã sao chép mã Apps Script!');
    });
  }
}

