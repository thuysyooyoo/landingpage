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
  if (!container) return;

  const currentSegments = getActiveWheelSegments();
  container.innerHTML = '';

  currentSegments.forEach((seg, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-700/60 hover:bg-slate-800/40 text-xs text-slate-200';
    tr.innerHTML = `
      <td class="py-2.5 px-3 font-bold text-amber-400">Ô số ${idx + 1}</td>
      <td class="py-2.5 px-3">
        <input type="text" value="${seg.text}" id="seg-text-${idx}" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold text-xs" />
      </td>
      <td class="py-2.5 px-3">
        <input type="text" value="${seg.prize}" id="seg-prize-${idx}" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs" />
      </td>
      <td class="py-2.5 px-3 text-center">
        <div class="flex items-center justify-center gap-1">
          <input type="number" min="0" max="100" value="${seg.probability_weight}" id="seg-prob-${idx}" class="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-amber-300 font-bold text-center text-xs" />
          <span class="text-slate-400">%</span>
        </div>
      </td>
      <td class="py-2.5 px-3 text-center">
        <input type="number" min="0" max="9999" value="${seg.stock_quantity}" id="seg-stock-${idx}" class="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-bold text-center text-xs" />
      </td>
    `;
    container.appendChild(tr);
  });
}

function saveAdminWheelConfig() {
  const currentSegments = getActiveWheelSegments();
  let totalProb = 0;

  for (let idx = 0; idx < currentSegments.length; idx++) {
    const textInput = document.getElementById(`seg-text-${idx}`);
    const prizeInput = document.getElementById(`seg-prize-${idx}`);
    const probInput = document.getElementById(`seg-prob-${idx}`);
    const stockInput = document.getElementById(`seg-stock-${idx}`);

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
  if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ tỉ lệ và kho quà về mặc định của chiến dịch?')) {
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
  const countBadge = document.getElementById('admin-leads-count');
  if (!container) return;

  const leads = getSpinLeadsList();
  if (countBadge) countBadge.textContent = `${leads.length} SĐT`;

  container.innerHTML = '';

  if (leads.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" class="py-6 text-center text-slate-500 text-xs">
          Chưa có khách hàng nào quay voucher.
        </td>
      </tr>
    `;
    return;
  }

  leads.forEach((item, idx) => {
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
        <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
          ${item.status || 'Chờ áp dụng'}
        </span>
      </td>
      <td class="py-2.5 px-3 text-center space-x-2">
        <a href="https://zalo.me/${item.phone}" target="_blank" class="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] inline-flex items-center gap-1">
          Chat Zalo
        </a>
        <button onclick="deleteSpinLead(${idx})" class="text-rose-400 hover:text-rose-300 text-[11px] font-semibold">
          Xóa
        </button>
      </td>
    `;
    container.appendChild(tr);
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
  let csv = 'STT,Thoi Gian,So Dien Thoai,Ma Voucher,Phan Qua,Trang Thai\n';
  leads.forEach((l, idx) => {
    csv += `"${idx + 1}","${l.createdAt || ''}","${l.phone}","${l.voucherCode || ''}","${l.prize || ''}","${l.status || ''}"\n`;
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
  if (!container) return;

  const winners = getMonthlyWinners();
  container.innerHTML = '';

  if (winners.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" class="py-6 text-center text-slate-500 text-xs">
          Chưa có lượt quay trúng thưởng nào.
        </td>
      </tr>
    `;
    return;
  }

  winners.forEach((w, idx) => {
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

  if (tabName === 'monthly-winners') {
    renderAdminM05BookingManager();
  }
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

