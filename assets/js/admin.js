/**
 * Admin Management Module for Eureka Customer Awards 2026
 * Handles Admin Authentication, Probability & Stock Settings for Welcome Wheel,
 * and Official Spin Controls for Monthly 05 Wheel.
 */

const ADMIN_PASSWORD_DEFAULT = 'eureka2026';
const STORAGE_KEY_AUTH = 'eureka_admin_auth';
const STORAGE_KEY_WHEEL_CONFIG = 'eureka_welcome_wheel_config';
const STORAGE_KEY_MONTHLY_WINNERS = 'eureka_monthly_winners';

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
    } else {
      adminBadge.classList.add('hidden');
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
  renderAdminWinnersTable();
}

function closeAdminDashboard() {
  const modal = document.getElementById('admin-dashboard-modal');
  if (modal) modal.classList.add('hidden');
}

// Load Wheel 1 Config (From localStorage or default in prizes-data.json)
function getActiveWheelSegments() {
  const saved = localStorage.getItem(STORAGE_KEY_WHEEL_CONFIG);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return [
    { id: 1, text: 'VOUCHER 400K', color: '#ea580c', textColor: '#FFFFFF', prize: 'Voucher 400.000 đ', probability_weight: 10, stock_quantity: 8 },
    { id: 2, text: 'VOUCHER 300K', color: '#1e293b', textColor: '#FBBF24', prize: 'Voucher 300.000 đ', probability_weight: 20, stock_quantity: 25 },
    { id: 3, text: 'ƯU TIÊN XẾP CONT', color: '#f59e0b', textColor: '#0F172A', prize: 'Vé Ưu Tiên Xếp Cont Sớm', probability_weight: 15, stock_quantity: 18 },
    { id: 4, text: 'GIẢM 50% LƯU KHO', color: '#0f172a', textColor: '#FFFFFF', prize: 'Giảm 50% Phí Lưu Kho Bãi', probability_weight: 15, stock_quantity: 15 },
    { id: 5, text: 'VOUCHER 300K', color: '#ea580c', textColor: '#FFFFFF', prize: 'Voucher 300.000 đ', probability_weight: 15, stock_quantity: 20 },
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

  currentSegments.forEach((seg, idx) => {
    const textVal = document.getElementById(`seg-text-${idx}`)?.value || seg.text;
    const prizeVal = document.getElementById(`seg-prize-${idx}`)?.value || seg.prize;
    const probVal = parseInt(document.getElementById(`seg-prob-${idx}`)?.value, 10) || 0;
    const stockVal = parseInt(document.getElementById(`seg-stock-${idx}`)?.value, 10) || 0;

    seg.text = textVal;
    seg.prize = prizeVal;
    seg.probability_weight = probVal;
    seg.stock_quantity = stockVal;
    totalProb += probVal;
  });

  localStorage.setItem(STORAGE_KEY_WHEEL_CONFIG, JSON.stringify(currentSegments));
  
  // Update in-memory wheel engine
  if (typeof updateWheelSegments === 'function') {
    updateWheelSegments(currentSegments);
  }

  alert(`Đã lưu cấu hình Vòng Quay thành công!\nTổng tỉ lệ các ô: ${totalProb}%`);
}

function resetAdminWheelConfig() {
  if (confirm('Bạn có chắc chắn muốn khôi phục về cài đặt tỉ lệ và số lượng quà mặc định?')) {
    localStorage.removeItem(STORAGE_KEY_WHEEL_CONFIG);
    renderAdminWheelConfigTable();
    if (typeof updateWheelSegments === 'function') {
      updateWheelSegments(getActiveWheelSegments());
    }
    alert('Đã khôi phục cài đặt mặc định!');
  }
}

// Monthly 05 Winners Management
function getMonthlyWinners() {
  const saved = localStorage.getItem(STORAGE_KEY_MONTHLY_WINNERS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return [
    { period: "Tháng 10 (Kỳ 1)", phone_masked: "098***6789", company_masked: "Tập Đoàn XNK *** Á Châu", order_masked: "ERK-***89", prize: "Voucher 300.000 đ", status: "Đã trừ cước đơn mới" },
    { period: "Tháng 10 (Kỳ 1)", phone_masked: "091***4321", company_masked: "Công Ty CP Thương Mại *** Minh", order_masked: "ERK-***45", prize: "Voucher 300.000 đ", status: "Đã trừ cước đơn mới" },
    { period: "Tháng 10 (Kỳ 1)", phone_masked: "090***8827", company_masked: "TNHH SX & PP Gia Dụng *** An", order_masked: "ERK-***12", prize: "Voucher 300.000 đ", status: "Đang chờ xuất kho" }
  ];
}

function renderAdminWinnersTable() {
  const container = document.getElementById('admin-winners-body');
  if (!container) return;

  const winners = getMonthlyWinners();
  container.innerHTML = '';

  winners.forEach((w, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-700/60 hover:bg-slate-800/40 text-xs text-slate-200';
    tr.innerHTML = `
      <td class="py-2 px-3 text-slate-400">${w.period}</td>
      <td class="py-2 px-3 font-mono text-amber-300 font-bold">${w.phone_masked}</td>
      <td class="py-2 px-3">${w.company_masked}</td>
      <td class="py-2 px-3 font-mono text-slate-400">${w.order_masked}</td>
      <td class="py-2 px-3 font-bold text-emerald-400">${w.prize}</td>
      <td class="py-2 px-3 text-slate-300">${w.status}</td>
      <td class="py-2 px-3 text-center">
        <button onclick="deleteMonthlyWinner(${idx})" class="text-rose-400 hover:text-rose-300 font-bold">Xóa</button>
      </td>
    `;
    container.appendChild(tr);
  });
}

function deleteMonthlyWinner(idx) {
  const winners = getMonthlyWinners();
  if (confirm('Bạn có chắc muốn xóa bản ghi này?')) {
    winners.splice(idx, 1);
    localStorage.setItem(STORAGE_KEY_MONTHLY_WINNERS, JSON.stringify(winners));
    renderAdminWinnersTable();
    if (typeof renderPublicMonthlyWinners === 'function') {
      renderPublicMonthlyWinners();
    }
  }
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
}

// URL triggers (e.g. #admin or ?admin=true)
window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash === '#admin' || window.location.search.includes('admin')) {
    openAdminModal();
  }
  updateAdminUiState();
});
