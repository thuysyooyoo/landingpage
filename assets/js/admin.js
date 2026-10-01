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
  renderAdminLeaderboardTable();
  renderAdminAffiliateContest();
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
        ${(() => {
          const ref = (item.ref && item.ref !== 'direct') ? item.ref.toUpperCase() : null;
          if (ref) {
            return `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">👤 ${ref}</span>`;
          }
          return `<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">🌐 Trực tiếp</span>`;
        })()}
      </td>
      <td class="py-2.5 px-3">
        <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
          ${item.status || 'Chờ áp dụng'}
        </span>
      </td>
      <td class="py-2.5 px-3 text-center space-x-1 whitespace-nowrap">
        ${(() => {
          const rawDigits = (item.phone || '').replace(/\D/g, '');
          const zaloPhone = rawDigits.startsWith('0') ? '84' + rawDigits.slice(1) : (rawDigits.startsWith('84') ? rawDigits : ('84' + rawDigits));
          return `
            <a href="https://zalo.me/${zaloPhone}" target="_blank" class="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] inline-flex items-center gap-1 shadow transition-colors" title="Chat Zalo với số ${item.phone}">
              💬 Chat Zalo
            </a>
            <a href="tel:${item.phone}" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] inline-flex items-center gap-1 shadow transition-colors" title="Gọi trực tiếp số ${item.phone}">
              📞 Gọi
            </a>
          `;
        })()}
        <button onclick="deleteSpinLead(${idx})" class="p-1 text-rose-400 hover:text-rose-300 text-xs font-semibold" title="Xóa">
          ✕
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
    week_title: titleInput ? titleInput.value.trim() : 'Tuần Chiến Dịch',
    customer_name: maskName(nameVal),
    customer_code: codeInput ? codeInput.value.trim().toUpperCase() : 'ERK-KH-8891',
    weekly_spending: spendVal,
    prize_name: prizeInput ? prizeInput.value.trim() : 'Voucher Tiền Mặt 2.000.000 đ',
    congrats_message: msgInput ? msgInput.value.trim() : '',
    updated_at: new Date().toLocaleString('vi-VN')
  };

  localStorage.setItem('eureka_weekly_winner', JSON.stringify(winnerData));

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
    prize_name: 'Voucher Tiền Mặt 2.000.000 đ + Cúp Chiến Tướng Tuần',
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
          list = parsed.map((item, idx) => ({
            rank: item.rank || (idx + 1),
            customer_name: maskName(item.customer_name || item.name || 'Khách hàng Eureka'),
            customer_code: (item.customer_code || item.code || ('ERK-KH-' + (8800 + idx))).toUpperCase(),
            vip_tier: item.vip_tier || 'VIP PRO',
            order_count: parseInt(item.order_count, 10) || 0,
            volume_weight: item.volume_weight || '0 tấn | 0 m³',
            service_fee: parseInt(item.service_fee, 10) || 0,
            prize_tag: item.prize_tag || '',
            prize_type: (item.rank === 1 || idx === 0) ? 'top1' : (item.rank === 2 || idx === 1) ? 'top2' : (item.rank === 3 || idx === 2) ? 'top3' : 'regular'
          }));
        }
      } else {
        // Parse CSV
        const lines = content.split(/[\r\n]+/).filter(l => l.trim().length > 0);
        const startIndex = (lines[0].toLowerCase().includes('hạng') || lines[0].toLowerCase().includes('rank') || lines[0].toLowerCase().includes('khách')) ? 1 : 0;
        
        for (let i = startIndex; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^["']+|["']+$/g, ''));
          if (cols.length >= 3) {
            list.push({
              rank: parseInt(cols[0], 10) || (list.length + 1),
              customer_name: maskName(cols[1] || 'Khách hàng Eureka'),
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
    renderAdminLeadsTable();
    loadBotConfigToAdminForm();
  }
  if (tabName === 'monthly-winners') {
    renderAdminM05BookingManager();
  }
  if (tabName === 'leaderboard-manager') {
    renderAdminWeeklyWinnerForm();
    renderAdminLeaderboardTable();
  }
  if (tabName === 'affiliate-contest') {
    renderAdminAffiliateContest();
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

  if (kpiMembers) kpiMembers.textContent = staffList.length;
  if (kpiClicks) kpiClicks.textContent = totalClicks;
  if (kpiLeads) kpiLeads.textContent = totalLeadsCount;
  if (badge) badge.textContent = `${staffList.length} NV`;

  if (!container) return;
  container.innerHTML = '';

  if (staffList.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" class="py-6 text-center text-slate-500 italic text-xs">
          Chưa có dữ liệu thi đua. Hãy tạo link cho nhân viên bên trên để bắt đầu!
        </td>
      </tr>
    `;
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

  if (!container || !tbody) return;
  title.innerHTML = `<span>📋</span> Danh sách ${matched.length} khách hàng do nhân viên <strong class="text-amber-400 uppercase font-mono">[${refCode}]</strong> mang về:`;
  tbody.innerHTML = '';

  if (matched.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-slate-500 italic">Nhân viên này chưa mang về số điện thoại nào.</td></tr>`;
  } else {
    matched.forEach((item, idx) => {
      const rawDigits = (item.phone || '').replace(/\D/g, '');
      const zaloPhone = rawDigits.startsWith('0') ? '84' + rawDigits.slice(1) : (rawDigits.startsWith('84') ? rawDigits : ('84' + rawDigits));
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

