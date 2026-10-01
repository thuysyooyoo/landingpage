/**
 * Admin Management Module for Eureka Customer Awards 2026
 * Handles:
 * 1. Admin Authentication & UI Permissions
 * 2. Probability & Stock Settings for Welcome Wheel
 * 3. Customer Spin Leads Management (Lưu lịch sử SĐT điền quay voucher, Xuất CSV, Copy SĐT)
 * 4. Official Monthly 05 Winners Management (Chỉ quản lý mã booking trúng thưởng, không cần che)
 */

const ADMIN_PASSWORD_DEFAULT = 'eureka2026';
const STORAGE_KEY_ADMIN_PASSWORD = 'eureka_admin_password_custom';
const STORAGE_KEY_AUTH = 'eureka_admin_auth';
const STORAGE_KEY_WHEEL_CONFIG = 'eureka_welcome_wheel_config';
const STORAGE_KEY_MONTHLY_WINNERS = 'eureka_monthly_winners';
const STORAGE_KEY_SPIN_LEADS_LOCAL = 'eureka_spin_leads';

// Lấy mật khẩu quản trị viên hiện hành (ưu tiên mật khẩu mới do Admin đổi, fallback về mặc định)
function getAdminPassword() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ADMIN_PASSWORD);
    if (saved && typeof saved === 'string' && saved.trim().length > 0) {
      return saved.trim();
    }
  } catch (e) {}
  return ADMIN_PASSWORD_DEFAULT;
}
window.getAdminPassword = getAdminPassword;

// Toggle hiển thị / ẩn mật khẩu (nút con mắt 👁️)
function togglePasswordVisibility(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.textContent = '🙈';
  } else {
    input.type = 'password';
    if (btn) btn.textContent = '👁️';
  }
}
window.togglePasswordVisibility = togglePasswordVisibility;

// Mở modal đổi mật khẩu quản trị
function openChangeAdminPasswordModal() {
  const modal = document.getElementById('admin-change-password-modal');
  if (modal) {
    modal.classList.remove('hidden');
    const oldInput = document.getElementById('admin-old-password-input');
    const newInput = document.getElementById('admin-new-password-input');
    const confirmInput = document.getElementById('admin-confirm-password-input');
    const msg = document.getElementById('admin-change-password-msg');
    if (oldInput) { oldInput.value = ''; oldInput.type = 'password'; }
    if (newInput) { newInput.value = ''; newInput.type = 'password'; }
    if (confirmInput) { confirmInput.value = ''; confirmInput.type = 'password'; }
    if (msg) { msg.classList.add('hidden'); msg.textContent = ''; }

    // Reset các icon mắt
    ['admin-old-toggle-btn', 'admin-new-toggle-btn', 'admin-confirm-toggle-btn'].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.textContent = '👁️';
    });

    if (oldInput) oldInput.focus();
  }
}
window.openChangeAdminPasswordModal = openChangeAdminPasswordModal;

// Đóng modal đổi mật khẩu quản trị
function closeChangeAdminPasswordModal() {
  const modal = document.getElementById('admin-change-password-modal');
  if (modal) modal.classList.add('hidden');
}
window.closeChangeAdminPasswordModal = closeChangeAdminPasswordModal;

// Xử lý đổi mật khẩu quản trị
function handleChangeAdminPassword(event) {
  if (event) event.preventDefault();
  const oldInput = document.getElementById('admin-old-password-input');
  const newInput = document.getElementById('admin-new-password-input');
  const confirmInput = document.getElementById('admin-confirm-password-input');
  const msg = document.getElementById('admin-change-password-msg');

  const oldPass = oldInput ? oldInput.value.trim() : '';
  const newPass = newInput ? newInput.value.trim() : '';
  const confirmPass = confirmInput ? confirmInput.value.trim() : '';

  function showError(text) {
    if (msg) {
      msg.textContent = text;
      msg.className = 'text-xs font-semibold p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30';
      msg.classList.remove('hidden');
    }
  }

  function showSuccess(text) {
    if (msg) {
      msg.textContent = text;
      msg.className = 'text-xs font-semibold p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      msg.classList.remove('hidden');
    }
  }

  const currentPass = getAdminPassword();
  if (oldPass !== currentPass) {
    showError('❌ Mật khẩu hiện tại không chính xác!');
    if (oldInput) oldInput.focus();
    return;
  }

  if (newPass.length < 6) {
    showError('❌ Mật khẩu mới phải có tối thiểu 6 ký tự để đảm bảo an toàn!');
    if (newInput) newInput.focus();
    return;
  }

  if (newPass === currentPass) {
    showError('❌ Mật khẩu mới không được trùng với mật khẩu hiện tại!');
    if (newInput) newInput.focus();
    return;
  }

  if (newPass !== confirmPass) {
    showError('❌ Xác nhận mật khẩu mới không trùng khớp!');
    if (confirmInput) confirmInput.focus();
    return;
  }

  // 1. Lưu vào localStorage trình duyệt
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_PASSWORD, newPass);
  } catch (e) {
    console.error('Lỗi lưu mật khẩu cục bộ:', e);
  }

  // 2. Tự động đồng bộ lên Google Sheets Cloud nếu đã liên kết
  if (typeof syncAdminConfigToCloud === 'function') {
    syncAdminConfigToCloud(STORAGE_KEY_ADMIN_PASSWORD, newPass);
  }

  showSuccess('✅ Đổi mật khẩu thành công! Mật khẩu mới đã có hiệu lực ngay lập tức.');
  setTimeout(() => {
    closeChangeAdminPasswordModal();
  }, 1300);
}
window.handleChangeAdminPassword = handleChangeAdminPassword;

// Khôi phục mật khẩu gốc mặc định (eureka2026)
function handleResetAdminPassword() {
  const currentPass = getAdminPassword();
  if (currentPass === ADMIN_PASSWORD_DEFAULT) {
    alert('Mật khẩu quản trị viên hiện tại đã là mặc định (eureka2026)!');
    return;
  }

  if (!confirm('Bạn có chắc chắn muốn khôi phục mật khẩu Quản Trị Viên về mặc định ban đầu không?')) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY_ADMIN_PASSWORD);
  } catch (e) {}

  if (typeof syncAdminConfigToCloud === 'function') {
    syncAdminConfigToCloud(STORAGE_KEY_ADMIN_PASSWORD, '');
  }

  alert('Đã khôi phục mật khẩu Quản Trị Viên về mặc định!');
  closeChangeAdminPasswordModal();
}
window.handleResetAdminPassword = handleResetAdminPassword;

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
        input.type = 'password';
        input.focus();
      }
      const toggleBtn = document.getElementById('admin-password-toggle-btn');
      if (toggleBtn) toggleBtn.textContent = '👁️';
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

  if (password === getAdminPassword()) {
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

// Default Wheel Segments (Fix cứng cấu hình trúng giải 10% cước theo chỉ đạo)
const DEFAULT_WHEEL_SEGMENTS = [
  { id: 1, text: 'GIẢM GIÁ 10% CƯỚC', color: '#ea580c', textColor: '#FFFFFF', prize: 'Giảm giá 10% chi phí vận chuyển', probability_weight: 100, stock_quantity: 9999 },
  { id: 2, text: 'VOUCHER 300K', color: '#1e293b', textColor: '#FBBF24', prize: 'Voucher Chiết Khấu 300.000 đ', probability_weight: 0, stock_quantity: 25 },
  { id: 3, text: 'ƯU TIÊN XẾP CONT', color: '#f59e0b', textColor: '#0F172A', prize: 'Vé Ưu Tiên Xếp Cont Sớm', probability_weight: 0, stock_quantity: 18 },
  { id: 4, text: 'GIẢM 50% LƯU KHO', color: '#0f172a', textColor: '#FFFFFF', prize: 'Giảm 50% Phí Lưu Kho Bãi', probability_weight: 0, stock_quantity: 15 },
  { id: 5, text: 'VOUCHER 300K', color: '#ea580c', textColor: '#FFFFFF', prize: 'Voucher Chiết Khấu 300.000 đ', probability_weight: 0, stock_quantity: 20 },
  { id: 6, text: 'GÓI SQUAD 2-IN-1', color: '#1e293b', textColor: '#38BDF8', prize: 'Gói Hỗ Trợ Squad 2–in–1', probability_weight: 0, stock_quantity: 11 },
  { id: 7, text: 'VOUCHER 400K', color: '#f59e0b', textColor: '#0F172A', prize: 'Voucher 400.000 đ Lộc Xuân', probability_weight: 0, stock_quantity: 10 },
  { id: 8, text: 'MAY MẮN LẦN SAU', color: '#0f172a', textColor: '#94A3B8', prize: 'Vé Tích Lũy Quay Mùng 05', probability_weight: 0, stock_quantity: 999 }
];
window.DEFAULT_WHEEL_SEGMENTS = DEFAULT_WHEEL_SEGMENTS;

function getActiveWheelSegments() {
  const saved = localStorage.getItem(STORAGE_KEY_WHEEL_CONFIG);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 8) {
        return parsed;
      }
    } catch (e) {}
  }
  return JSON.parse(JSON.stringify(DEFAULT_WHEEL_SEGMENTS));
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

  // Tự động đồng bộ lên Google Sheets Cloud
  if (typeof syncAdminConfigToCloud === 'function') {
    syncAdminConfigToCloud(STORAGE_KEY_WHEEL_CONFIG, currentSegments);
  }

  alert(`✅ Lưu cấu hình thành công!\nTổng tỉ lệ các ô hiện tại là: ${totalProb}%. Hệ thống đã áp dụng vào Vòng Quay và đẩy lên Cloud!`);
}

function resetAdminWheelConfig() {
  if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ tỉ lệ và kho quà về mặc định của chương trình?')) {
    localStorage.removeItem(STORAGE_KEY_WHEEL_CONFIG);
    const defaults = getActiveWheelSegments();
    renderAdminWheelConfigTable();
    if (typeof initWelcomeWheelData === 'function') initWelcomeWheelData();
    if (typeof drawWheel === 'function') drawWheel();
    if (typeof syncAdminConfigToCloud === 'function') {
      syncAdminConfigToCloud(STORAGE_KEY_WHEEL_CONFIG, defaults);
    }
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
  if (typeof syncAdminConfigToCloud === 'function') {
    syncAdminConfigToCloud('eureka_m05_current_prize', val);
  }
  alert(`✅ Đã cập nhật giải thưởng định kỳ thành: "${val}" (Đã lưu lên Cloud)`);
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

  if (typeof syncAdminConfigToCloud === 'function') {
    syncAdminConfigToCloud('eureka_m05_booking_pool', codes);
  }

  renderAdminM05BookingManager();
  alert(`✅ Đã lưu thành công ${codes.length} mã booking vào Vòng Quay Mùng 05 và đồng bộ lên Cloud!`);
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

  if (typeof syncAdminConfigToCloud === 'function') {
    syncAdminConfigToCloud('eureka_m05_booking_pool', demoCodes);
  }

  renderAdminM05BookingManager();
  alert(`✅ Đã nạp ${demoCodes.length} mã booking mẫu vào hệ thống và lưu lên Cloud!`);
}

function clearM05BookingPool() {
  if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ danh sách mã booking dự thưởng hiện tại?')) {
    localStorage.removeItem('eureka_m05_booking_pool');
    if (typeof initM05WheelSegments === 'function') initM05WheelSegments();
    if (typeof drawM05Wheel === 'function') drawM05Wheel();
    if (typeof updateM05PublicInfo === 'function') updateM05PublicInfo();
    if (typeof syncAdminConfigToCloud === 'function') {
      syncAdminConfigToCloud('eureka_m05_booking_pool', []);
    }
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

    if (typeof syncAdminConfigToCloud === 'function') {
      syncAdminConfigToCloud('eureka_m05_booking_pool', codes);
    }

    renderAdminM05BookingManager();

    alert(`🎉 Đã tải lên và nhập thành công ${codes.length} mã booking từ file: ${file.name} (Đã đồng bộ lên Cloud)!`);
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

// --- GALA AWARDS VISIBILITY & CELEBRATION MODE TOGGLE ---
function renderAdminGalaToggle() {
  let galaConfig = null;
  try {
    const raw = localStorage.getItem('eureka_gala_awards_config');
    if (raw) galaConfig = JSON.parse(raw);
  } catch (e) {}

  let celebrationModeSaved = null;
  try {
    celebrationModeSaved = localStorage.getItem('eureka_gala_celebration_mode');
  } catch (e) {}

  const activeCheck = document.getElementById('admin-gala-active');
  const celebrationCheck = document.getElementById('admin-gala-celebration-mode');
  const statusBadge = document.getElementById('admin-gala-status-badge');

  if (activeCheck) {
    activeCheck.checked = galaConfig ? !!galaConfig.is_active : true;
  }
  if (celebrationCheck) {
    celebrationCheck.checked = celebrationModeSaved === null ? true : celebrationModeSaved === '1';
  }

  if (statusBadge) {
    const isActive = activeCheck ? activeCheck.checked : true;
    if (isActive) {
      statusBadge.textContent = '🟢 ĐANG HIỂN THỊ';
      statusBadge.className = 'text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30';
    } else {
      statusBadge.textContent = '⚪ ĐANG ẨN';
      statusBadge.className = 'text-[11px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700';
    }
  }

  // Apply visibility to main page
  applyGalaVisibility();
}

function saveAdminGalaToggle() {
  const activeCheck = document.getElementById('admin-gala-active');
  const celebrationCheck = document.getElementById('admin-gala-celebration-mode');
  const isActive = activeCheck ? activeCheck.checked : true;
  const isCelebration = celebrationCheck ? celebrationCheck.checked : true;

  const config = {
    is_active: isActive,
    celebration_mode: isCelebration,
    updated_at: new Date().toLocaleString('vi-VN')
  };
  localStorage.setItem('eureka_gala_awards_config', JSON.stringify(config));
  localStorage.setItem('eureka_gala_celebration_mode', isCelebration ? '1' : '0');

  if (typeof syncAdminConfigToCloud === 'function') {
    syncAdminConfigToCloud('eureka_gala_awards_config', config);
  }
  
  if (typeof applyGalaCelebrationState === 'function') {
    applyGalaCelebrationState(isCelebration);
  }
  applyGalaVisibility();
  renderAdminGalaToggle();
  alert('✅ Đã lưu cài đặt Gala thành công!\n- Hiển thị khối Gala: ' + (isActive ? 'BẬT' : 'TẮT') + '\n- Chế độ Tổng kết Gala: ' + (isCelebration ? 'BẬT (chỉ giữ Tổng quan, Vinh danh & BXH)' : 'TẮT (hiện toàn bộ chương trình)'));
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

    let rowWeight = 0;
    if (row.weight_kg !== undefined && row.weight_kg !== null && !isNaN(parseFloat(row.weight_kg))) {
      rowWeight = parseFloat(row.weight_kg);
    } else if (typeof getCustomerWeightKg === 'function') {
      rowWeight = getCustomerWeightKg(row);
    }

    let rowVol = 0;
    if (row.volume_m3 !== undefined && row.volume_m3 !== null && !isNaN(parseFloat(row.volume_m3))) {
      rowVol = parseFloat(row.volume_m3);
    } else if (typeof getCustomerVolumeM3 === 'function') {
      rowVol = getCustomerVolumeM3(row);
    }

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
        <input type="number" min="0" step="any" value="${rowWeight}" placeholder="142500" class="admin-bxh-weight w-24 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-amber-300 font-mono text-right" title="Tải trọng tính theo Kg">
      </td>
      <td class="py-2 px-2">
        <input type="number" min="0" step="any" value="${rowVol}" placeholder="190" class="admin-bxh-volm3 w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-sky-300 font-mono text-right" title="Thể tích tính theo M³">
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
    weight_kg: 10000,
    volume_m3: 25,
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
    const weightKg = parseFloat(tr.querySelector('.admin-bxh-weight')?.value) || 0;
    const volumeM3 = parseFloat(tr.querySelector('.admin-bxh-volm3')?.value) || 0;
    const fee = parseInt(tr.querySelector('.admin-bxh-fee')?.value, 10) || 0;
    const prize = tr.querySelector('.admin-bxh-prize')?.value.trim() || 'Bám đuổi Top 3';

    const volWeight = (weightKg >= 1000
      ? (weightKg / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tấn'
      : weightKg.toLocaleString('vi-VN') + ' kg') + ' | ' + volumeM3.toLocaleString('vi-VN') + ' m³';

    return {
      rank: rank,
      customer_name: maskName(rawName),
      original_name: rawName,
      customer_code: rawCode,
      vip_tier: vip,
      order_count: orders,
      weight_kg: weightKg,
      volume_m3: volumeM3,
      volume_weight: volWeight,
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

  alert(`✅ Đã lưu thành công ${updatedList.length} khách hàng vào Bảng Xếp Hạng Doanh Số!\nĐã cập nhật Tải Trọng (Kg) và Thể Tích (M³) độc lập.`);
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
            let w = 0;
            if (item.weight_kg !== undefined && !isNaN(parseFloat(item.weight_kg))) {
              w = parseFloat(item.weight_kg);
            } else if (item.volume_weight) {
              const p = item.volume_weight.split('|')[0] || '';
              const m = p.replace(',', '.').match(/([\d.]+)\s*(tấn|kg|t)/i);
              if (m) {
                const num = parseFloat(m[1]);
                w = m[2].toLowerCase().includes('t') ? Math.round(num * 1000) : Math.round(num);
              }
            }
            let v = 0;
            if (item.volume_m3 !== undefined && !isNaN(parseFloat(item.volume_m3))) {
              v = parseFloat(item.volume_m3);
            } else if (item.volume_weight) {
              const p = item.volume_weight.split('|')[1] || item.volume_weight;
              const m = p.replace(',', '.').match(/([\d.]+)\s*(m³|m3|cbm)/i);
              if (m) v = parseFloat(m[1]);
            }

            const vw = (w >= 1000 ? (w / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tấn' : w + ' kg') + ' | ' + v + ' m³';

            return {
              rank: item.rank || (idx + 1),
              customer_name: maskName(rawName),
              original_name: rawName,
              customer_code: (item.customer_code || item.code || ('ERK-KH-' + (8800 + idx))).toUpperCase(),
              vip_tier: item.vip_tier || 'VIP PRO',
              order_count: parseInt(item.order_count, 10) || 0,
              weight_kg: w,
              volume_m3: v,
              volume_weight: item.volume_weight || vw,
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
          if (cols.length >= 4) {
            const rawName = cols[1] || 'Khách hàng Eureka';
            let w = 0;
            let v = 0;
            let fee = 0;
            let prize = '';

            // Nếu CSV có 9 cột trở lên: Hạng, Tên, Mã, VIP, Đơn, Kg, M3, Phí, Quà
            if (cols.length >= 8 && !isNaN(parseFloat(cols[5])) && !isNaN(parseFloat(cols[6]))) {
              w = parseFloat(cols[5]) || 0;
              v = parseFloat(cols[6]) || 0;
              fee = parseInt(cols[7], 10) || 0;
              prize = cols[8] || '';
            } else {
              // CSV cũ: Hạng, Tên, Mã, VIP, Đơn, SảnLượng, Phí, Quà
              const oldVw = cols[5] || '';
              const p = oldVw.split('|')[0] || '';
              const m = p.replace(',', '.').match(/([\d.]+)\s*(tấn|kg|t)/i);
              if (m) {
                const num = parseFloat(m[1]);
                w = m[2].toLowerCase().includes('t') ? Math.round(num * 1000) : Math.round(num);
              }
              const p2 = oldVw.split('|')[1] || oldVw;
              const m2 = p2.replace(',', '.').match(/([\d.]+)\s*(m³|m3|cbm)/i);
              if (m2) v = parseFloat(m2[1]);
              fee = parseInt(cols[6], 10) || 0;
              prize = cols[7] || '';
            }

            const vw = (w >= 1000 ? (w / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tấn' : w + ' kg') + ' | ' + v + ' m³';

            list.push({
              rank: parseInt(cols[0], 10) || (list.length + 1),
              customer_name: maskName(rawName),
              original_name: rawName,
              customer_code: (cols[2] || ('ERK-KH-' + (8800 + list.length))).toUpperCase(),
              vip_tier: cols[3] || 'VIP PRO',
              order_count: parseInt(cols[4], 10) || 0,
              weight_kg: w,
              volume_m3: v,
              volume_weight: vw,
              service_fee: fee,
              prize_tag: prize,
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

function exportLeaderboardCsv() {
  const list = getAdminLeaderboardList();
  if (list.length === 0) {
    alert('Bảng xếp hạng đang trống!');
    return;
  }
  const headers = ['Hạng', 'Tên Khách Hàng', 'Mã Khách Hàng', 'Hạng VIP', 'Tổng Đơn', 'Tải Trọng (Kg)', 'Thể Tích (M³)', 'Phí Dịch Vụ (VNĐ)', 'Quà Tạm Tính'];
  const rows = list.map(item => {
    let w = item.weight_kg !== undefined ? item.weight_kg : 0;
    let v = item.volume_m3 !== undefined ? item.volume_m3 : 0;
    return [
      item.rank,
      `"${(item.original_name || item.customer_name || '').replace(/"/g, '""')}"`,
      item.customer_code || item.code || '',
      item.vip_tier || 'VIP PRO',
      item.order_count || 0,
      w,
      v,
      item.service_fee || 0,
      `"${(item.prize_tag || '').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bang_Xep_Hang_Eureka_${new Date().toISOString().slice(0, 10)}.csv`;
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
    chip.className = 'px-2 py-0.5 rounded bg-slate-800 text-amber-300 text-[11px] font-bold border border-slate-700 tracking-wide';
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
  if (typeof syncAdminConfigToCloud === 'function') {
    syncAdminConfigToCloud('eureka_bot_config', config);
  }
  loadBotConfigToAdminForm();
  alert('💾 Đã lưu thành công cấu hình Bot & Webhook (Đã đồng bộ lên Cloud)!\nHệ thống sẽ tự động chuyển dữ liệu khách quay thưởng theo cấu hình này.');
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
    btn.classList.remove('bg-brand-600', 'bg-sky-600', 'text-white', 'shadow-lg');
    if (btn.id === 'admin-btn-sheets-sync') {
      btn.classList.add('text-sky-300', 'bg-sky-950/60');
    } else {
      btn.classList.add('text-slate-400');
    }
  });

  const activeContent = document.getElementById(`admin-tab-${tabName}`);
  const activeBtn = document.getElementById(`admin-btn-${tabName}`);
  if (activeContent) activeContent.classList.remove('hidden');
  if (activeBtn) {
    if (tabName === 'sheets-sync') {
      activeBtn.classList.add('bg-sky-600', 'text-white', 'shadow-lg');
      activeBtn.classList.remove('text-sky-300', 'bg-sky-950/60');
    } else {
      activeBtn.classList.add('bg-brand-600', 'text-white', 'shadow-lg');
      activeBtn.classList.remove('text-slate-400');
    }
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
    if (typeof syncAdminConfigToCloud === 'function') {
      syncAdminConfigToCloud('eureka_ref_clicks', clicks);
    }
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

const APPS_SCRIPT_SOURCE_CODE = "/**\n * =========================================================================\n * GOOGLE APPS SCRIPT CLOUD DATABASE v3.0 - EUREKA CUSTOMER AWARDS 2026\n * HỆ THỐNG QUẢN LÝ DỮ LIỆU ĐỘC LẬP TỪNG SHEET CHUYÊN BIỆT:\n * 1. Sheet 'CauHinhVongQuay': Quản lý 8 ô giải thưởng, nhãn, tỉ lệ %, kho quà.\n * 2. Sheet 'CauHinhBotTelegram': Quản lý Telegram Bot Token, Chat ID, Webhook.\n * 3. Sheet 'NhiemVuHeThong': Quản lý Chặng 1, 2, 3 và Danh sách Mã KH hoàn thành.\n * 4. Sheet 'CaiDatChung': Quản lý Mật khẩu Admin, Bật/Tắt Gala, Top Tuần, Giải M05.\n * 5. Sheet 'BangXepHang': Quản lý 25+ khách hàng đua top doanh số (Cân & Khối riêng).\n * 6. Sheet 'VongQuayMayMan': Lưu lịch sử SĐT khách quay nhận Voucher.\n * 7. Sheet 'VongQuayM05': Lưu lịch sử mã booking trúng thưởng Vòng Quay Mùng 05.\n * =========================================================================\n */\n\nfunction doGet(e) {\n  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAllData';\n\n  if (action === 'ping') {\n    return jsonOutput({\n      status: 'ok',\n      message: 'Kết nối Google Sheets Cloud Database thành công!',\n      timestamp: new Date().toISOString()\n    });\n  }\n\n  try {\n    var ss = SpreadsheetApp.getActiveSpreadsheet();\n    initDatabaseSheets(ss);\n\n    // 1. Đọc Cấu hình Vòng Quay May Mắn từ Sheet riêng: CauHinhVongQuay\n    var wheelConfig = readWheelConfigFromSheet(ss);\n\n    // 2. Đọc Cấu hình Telegram Bot & Webhook từ Sheet riêng: CauHinhBotTelegram\n    var botConfig = readBotConfigFromSheet(ss);\n\n    // 3. Đọc Cấu hình Nhiệm Vụ Hệ Thống từ Sheet riêng: NhiemVuHeThong\n    var nhiemVuConfig = readNhiemVuConfigFromSheet(ss);\n\n    // 4. Đọc Cài Đặt Chung từ Sheet riêng: CaiDatChung\n    var generalSettings = readGeneralSettingsFromSheet(ss);\n\n    // 5. Đọc Bảng Xếp Hạng Doanh Số từ Sheet riêng: BangXepHang\n    var customLeaderboard = readLeaderboardFromSheet(ss);\n\n    // 6. Đọc Lịch Sử Khách Quay từ Sheet riêng: VongQuayMayMan\n    var spinData = readSpinLeadsFromSheet(ss);\n\n    // 7. Đọc Danh Sách Trúng Thưởng M05 từ Sheet riêng: VongQuayM05\n    var monthlyWinners = readM05WinnersFromSheet(ss);\n\n    return jsonOutput({\n      status: 'success',\n      data: {\n        wheelConfig: wheelConfig,\n        botConfig: botConfig,\n        nhiemVuConfig: nhiemVuConfig,\n        customLeaderboard: customLeaderboard,\n        spinLeads: spinData.spinLeads,\n        lockedPhones: spinData.lockedPhones,\n        monthlyWinners: monthlyWinners,\n        adminPassword: generalSettings.admin_password || '',\n        galaConfig: generalSettings.gala_config || null,\n        weeklyWinner: generalSettings.weekly_winner || null,\n        m05BookingPool: generalSettings.m05_booking_pool || null,\n        m05CurrentPrize: generalSettings.m05_current_prize || '',\n        refClicks: generalSettings.ref_clicks || null\n      }\n    });\n  } catch (err) {\n    return jsonOutput({\n      status: 'error',\n      message: err.toString()\n    });\n  }\n}\n\nfunction doPost(e) {\n  try {\n    var ss = SpreadsheetApp.getActiveSpreadsheet();\n    initDatabaseSheets(ss);\n\n    var raw = e.postData.contents;\n    var payload = JSON.parse(raw);\n    var action = payload.action;\n\n    // 1. Lưu Cấu Hình Vòng Quay vào Sheet riêng 'CauHinhVongQuay'\n    if (action === 'save_wheel_config' || (action === 'save_config' && payload.key === 'eureka_welcome_wheel_config')) {\n      var segments = payload.wheelConfig || payload.value || [];\n      if (Array.isArray(segments) && segments.length > 0) {\n        writeWheelConfigToSheet(ss, segments);\n        return jsonOutput({ status: 'success', message: 'Đã lưu cấu hình Vòng Quay vào Sheet CauHinhVongQuay' });\n      }\n    }\n\n    // 2. Lưu Cấu Hình Bot & Webhook vào Sheet riêng 'CauHinhBotTelegram'\n    if (action === 'save_bot_config' || (action === 'save_config' && payload.key === 'eureka_bot_config')) {\n      var bConfig = payload.botConfig || payload.value || {};\n      writeBotConfigToSheet(ss, bConfig);\n      return jsonOutput({ status: 'success', message: 'Đã lưu cấu hình Bot vào Sheet CauHinhBotTelegram' });\n    }\n\n    // 3. Lưu Cấu Hình Nhiệm Vụ Hệ Thống vào Sheet riêng 'NhiemVuHeThong'\n    if (action === 'save_nhiem_vu' || (action === 'save_config' && payload.key === 'eureka_nhiem_vu_config')) {\n      var nvConfig = payload.nhiemVuConfig || payload.value || {};\n      writeNhiemVuConfigToSheet(ss, nvConfig);\n      return jsonOutput({ status: 'success', message: 'Đã lưu cấu hình Nhiệm Vụ vào Sheet NhiemVuHeThong' });\n    }\n\n    // 4. Lưu Bảng Xếp Hạng Doanh Số vào Sheet riêng 'BangXepHang'\n    if (action === 'sync_leaderboard' || (action === 'save_config' && payload.key === 'eureka_custom_leaderboard')) {\n      var lbList = payload.leaderboard || payload.value || [];\n      if (Array.isArray(lbList)) {\n        writeLeaderboardToSheet(ss, lbList);\n        return jsonOutput({ status: 'success', message: 'Đã lưu ' + lbList.length + ' khách hàng vào Sheet BangXepHang' });\n      }\n    }\n\n    // 5. Ghi nhận lượt quay Voucher của khách hàng vào Sheet 'VongQuayMayMan'\n    if (action === 'record_spin_lead') {\n      var lead = payload.lead || {};\n      var leadsSheet = ss.getSheetByName('VongQuayMayMan');\n      var phoneFormatted = \"'\" + String(lead.phone || '').trim();\n      leadsSheet.appendRow([\n        new Date(),\n        phoneFormatted,\n        lead.voucherCode || '',\n        lead.prize || '',\n        lead.ref || 'direct',\n        lead.status || 'Chờ áp dụng qua Zalo'\n      ]);\n\n      // Đồng thời tự động trừ 1 số lượng kho trong Sheet 'CauHinhVongQuay' nếu tìm thấy phần thưởng tương ứng\n      decrementWheelStock(ss, lead.prize);\n\n      return jsonOutput({ status: 'success', message: 'Đã lưu lead khách quay và cập nhật kho quà' });\n    }\n\n    // 6. Ghi nhận mã booking trúng thưởng M05 vào Sheet 'VongQuayM05'\n    if (action === 'record_m05_winner') {\n      var winner = payload.winner || {};\n      var m05Sheet = ss.getSheetByName('VongQuayM05');\n      m05Sheet.appendRow([\n        new Date(),\n        winner.period || '',\n        winner.booking_code || '',\n        winner.prize || '',\n        winner.status || '✅ Vừa quay trúng'\n      ]);\n      return jsonOutput({ status: 'success', message: 'Đã lưu kết quả quay M05' });\n    }\n\n    // 7. Lưu Cài Đặt Chung (Mật khẩu Admin, Gala, Top Tuần...) vào Sheet 'CaiDatChung'\n    if (action === 'save_general_setting' || action === 'save_config') {\n      var key = payload.key;\n      var val = payload.value;\n      writeGeneralSettingToSheet(ss, key, val);\n      return jsonOutput({ status: 'success', message: 'Đã lưu cài đặt ' + key + ' vào Sheet CaiDatChung' });\n    }\n\n    // 8. Đẩy toàn bộ dữ liệu máy lên Cloud (One-Click Sync All)\n    if (action === 'sync_all') {\n      var all = payload.data || {};\n\n      if (all.wheelConfig && Array.isArray(all.wheelConfig)) {\n        writeWheelConfigToSheet(ss, all.wheelConfig);\n      }\n      if (all.botConfig && typeof all.botConfig === 'object') {\n        writeBotConfigToSheet(ss, all.botConfig);\n      }\n      if (all.nhiemVuConfig && typeof all.nhiemVuConfig === 'object') {\n        writeNhiemVuConfigToSheet(ss, all.nhiemVuConfig);\n      }\n      if (all.customLeaderboard && Array.isArray(all.customLeaderboard)) {\n        writeLeaderboardToSheet(ss, all.customLeaderboard);\n      }\n      if (all.spinLeads && Array.isArray(all.spinLeads)) {\n        writeSpinLeadsToSheet(ss, all.spinLeads);\n      }\n      if (all.monthlyWinners && Array.isArray(all.monthlyWinners)) {\n        writeM05WinnersToSheet(ss, all.monthlyWinners);\n      }\n\n      // Lưu các cài đặt còn lại vào CaiDatChung\n      if (all.adminPasswordCustom !== undefined) writeGeneralSettingToSheet(ss, 'eureka_admin_password_custom', all.adminPasswordCustom);\n      if (all.galaConfig) writeGeneralSettingToSheet(ss, 'eureka_gala_awards_config', all.galaConfig);\n      if (all.weeklyWinner) writeGeneralSettingToSheet(ss, 'eureka_weekly_winner', all.weeklyWinner);\n      if (all.m05BookingPool) writeGeneralSettingToSheet(ss, 'eureka_m05_booking_pool', all.m05BookingPool);\n      if (all.m05CurrentPrize) writeGeneralSettingToSheet(ss, 'eureka_m05_current_prize', all.m05CurrentPrize);\n      if (all.refClicks) writeGeneralSettingToSheet(ss, 'eureka_ref_clicks', all.refClicks);\n\n      return jsonOutput({ status: 'success', message: 'Đã đồng bộ toàn bộ dữ liệu vào từng Sheet riêng biệt thành công!' });\n    }\n\n    return jsonOutput({ status: 'ignored', message: 'Action không xác định: ' + action });\n  } catch (err) {\n    return jsonOutput({ status: 'error', message: err.toString() });\n  }\n}\n\n// =========================================================================\n// CÁC HÀM XỬ LÝ ĐỌC / GHI CHO TỪNG SHEET CHUYÊN BIỆT\n// =========================================================================\n\n// 1. SHEET 'CauHinhVongQuay'\nfunction readWheelConfigFromSheet(ss) {\n  var sheet = ss.getSheetByName('CauHinhVongQuay');\n  if (!sheet || sheet.getLastRow() < 2) return null;\n\n  var data = sheet.getRange(2, 1, Math.min(sheet.getLastRow() - 1, 8), 7).getValues();\n  var segments = [];\n  for (var i = 0; i < data.length; i++) {\n    var r = data[i];\n    segments.push({\n      id: Number(r[0]) || (i + 1),\n      text: String(r[1] || '').trim(),\n      prize: String(r[2] || '').trim(),\n      probability_weight: Number(r[3]) || 0,\n      stock_quantity: Number(r[4]) || 0,\n      color: String(r[5] || '#1e293b').trim(),\n      textColor: String(r[6] || '#FFFFFF').trim()\n    });\n  }\n  return segments.length === 8 ? segments : null;\n}\n\nfunction writeWheelConfigToSheet(ss, segments) {\n  if (!Array.isArray(segments) || segments.length === 0) return;\n  var sheet = ss.getSheetByName('CauHinhVongQuay');\n  if (!sheet) return;\n\n  var rows = [];\n  for (var i = 0; i < segments.length; i++) {\n    var seg = segments[i];\n    rows.push([\n      Number(seg.id) || (i + 1),\n      String(seg.text || '').trim(),\n      String(seg.prize || '').trim(),\n      Number(seg.probability_weight) || 0,\n      Number(seg.stock_quantity) || 0,\n      String(seg.color || '#1e293b').trim(),\n      String(seg.textColor || '#FFFFFF').trim(),\n      formatDate(new Date())\n    ]);\n  }\n\n  sheet.getRange(2, 1, rows.length, 8).setValues(rows);\n}\n\nfunction decrementWheelStock(ss, prizeName) {\n  if (!prizeName) return;\n  var sheet = ss.getSheetByName('CauHinhVongQuay');\n  if (!sheet || sheet.getLastRow() < 2) return;\n\n  var data = sheet.getRange(2, 3, sheet.getLastRow() - 1, 3).getValues();\n  for (var i = 0; i < data.length; i++) {\n    var pName = String(data[i][0]).trim();\n    if (pName === prizeName || prizeName.includes(pName) || pName.includes(prizeName)) {\n      var currentStock = Number(data[i][2]) || 0;\n      if (currentStock > 0) {\n        sheet.getRange(i + 2, 5).setValue(currentStock - 1);\n        sheet.getRange(i + 2, 8).setValue(formatDate(new Date()));\n      }\n      break;\n    }\n  }\n}\n\n// 2. SHEET 'CauHinhBotTelegram'\nfunction readBotConfigFromSheet(ss) {\n  var sheet = ss.getSheetByName('CauHinhBotTelegram');\n  if (!sheet || sheet.getLastRow() < 2) return null;\n\n  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();\n  var config = {\n    telegram_enabled: false,\n    telegram_token: '',\n    telegram_chat_id: '',\n    webhook_enabled: false,\n    webhook_url: ''\n  };\n\n  for (var i = 0; i < data.length; i++) {\n    var channel = String(data[i][0]).toLowerCase();\n    var status = String(data[i][1]).toUpperCase();\n    var val1 = String(data[i][2] || '').trim();\n    var val2 = String(data[i][3] || '').trim();\n\n    if (channel.includes('telegram')) {\n      config.telegram_enabled = (status === 'BẬT' || status === 'TRUE' || status === '1');\n      config.telegram_token = val1;\n      config.telegram_chat_id = val2;\n    } else if (channel.includes('webhook')) {\n      config.webhook_enabled = (status === 'BẬT' || status === 'TRUE' || status === '1');\n      config.webhook_url = val1;\n    }\n  }\n  return config;\n}\n\nfunction writeBotConfigToSheet(ss, config) {\n  var sheet = ss.getSheetByName('CauHinhBotTelegram');\n  if (!sheet) return;\n\n  var rows = [\n    [\n      'Telegram Bot',\n      config.telegram_enabled ? 'BẬT' : 'TẮT',\n      String(config.telegram_token || '').trim(),\n      String(config.telegram_chat_id || '').trim(),\n      'Tự động gửi thông báo khi khách quay thưởng vào nhóm Telegram',\n      formatDate(new Date())\n    ],\n    [\n      'Webhook Endpoint',\n      config.webhook_enabled ? 'BẬT' : 'TẮT',\n      String(config.webhook_url || '').trim(),\n      '',\n      'Đẩy dữ liệu JSON sang server/CRM ngoài khi khách quay',\n      formatDate(new Date())\n    ]\n  ];\n\n  sheet.getRange(2, 1, 2, 6).setValues(rows);\n}\n\n// 3. SHEET 'NhiemVuHeThong'\nfunction readNhiemVuConfigFromSheet(ss) {\n  var sheet = ss.getSheetByName('NhiemVuHeThong');\n  if (!sheet || sheet.getLastRow() < 2) return null;\n\n  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();\n  var config = {\n    active_mode: 'chang-1',\n    chang_1: { customer_codes: [] },\n    chang_2: { customer_codes: [] },\n    chang_3: { customer_codes: [] },\n    tong_ket: { customer_codes: [] }\n  };\n\n  for (var i = 0; i < data.length; i++) {\n    var key = String(data[i][0]).trim();\n    var time = String(data[i][2] || '').trim();\n    var reward = String(data[i][3] || '').trim();\n    var condition = String(data[i][4] || '').trim();\n    var rawCodes = String(data[i][5] || '').trim();\n    var isCurrentMode = String(data[i][6] || '').toUpperCase().includes('ĐANG');\n\n    var codeList = rawCodes.split(/[\\r\\n,]+/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; });\n\n    if (isCurrentMode) {\n      config.active_mode = key.replace('_', '-');\n    }\n\n    if (config[key]) {\n      config[key] = {\n        time_range: time,\n        time_window: time,\n        reward: reward,\n        condition: condition,\n        customer_codes: codeList\n      };\n    }\n  }\n\n  return config;\n}\n\nfunction writeNhiemVuConfigToSheet(ss, cfg) {\n  var sheet = ss.getSheetByName('NhiemVuHeThong');\n  if (!sheet) return;\n\n  var activeMode = (cfg.active_mode || 'chang-1').replace('-', '_');\n\n  var changList = [\n    { key: 'chang_1', name: 'Chặng 1 — Khởi Động Sớm' },\n    { key: 'chang_2', name: 'Chặng 2 — Giữ Nhịp Cao Điểm' },\n    { key: 'chang_3', name: 'Chặng 3 — Về Đích An Toàn' },\n    { key: 'tong_ket', name: 'Tổng Kết 3 Chặng' }\n  ];\n\n  var rows = [];\n  changList.forEach(function(item) {\n    var cData = cfg[item.key] || {};\n    var codes = cData.customer_codes || cData.codes || [];\n    var codesStr = Array.isArray(codes) ? codes.join('\\n') : String(codes);\n    var isCurrent = (item.key === activeMode) ? '⭐ ĐANG HIỂN THỊ' : 'Chờ công bố';\n\n    rows.push([\n      item.key,\n      item.name,\n      cData.time_range || cData.time_window || '',\n      cData.reward || '',\n      cData.condition || '',\n      codesStr,\n      isCurrent,\n      formatDate(new Date())\n    ]);\n  });\n\n  sheet.getRange(2, 1, rows.length, 8).setValues(rows);\n}\n\n// 4. SHEET 'CaiDatChung'\nfunction readGeneralSettingsFromSheet(ss) {\n  var sheet = ss.getSheetByName('CaiDatChung');\n  var settings = {};\n  if (!sheet || sheet.getLastRow() < 2) return settings;\n\n  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();\n  for (var i = 0; i < data.length; i++) {\n    var key = String(data[i][0]).trim();\n    var valStr = String(data[i][1]).trim();\n    if (key && valStr) {\n      try {\n        settings[key] = JSON.parse(valStr);\n      } catch (e) {\n        settings[key] = valStr;\n      }\n    }\n  }\n  return settings;\n}\n\nfunction writeGeneralSettingToSheet(ss, key, val) {\n  var sheet = ss.getSheetByName('CaiDatChung');\n  if (!sheet) return;\n\n  var valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);\n\n  var foundRow = -1;\n  if (sheet.getLastRow() > 1) {\n    var keys = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();\n    for (var r = 0; r < keys.length; r++) {\n      if (keys[r][0] === key) {\n        foundRow = r + 2;\n        break;\n      }\n    }\n  }\n\n  if (foundRow > 0) {\n    sheet.getRange(foundRow, 2).setValue(valStr);\n    sheet.getRange(foundRow, 4).setValue(formatDate(new Date()));\n  } else {\n    sheet.appendRow([key, valStr, 'Cài đặt hệ thống', formatDate(new Date())]);\n  }\n}\n\n// 5. SHEET 'BangXepHang'\nfunction readLeaderboardFromSheet(ss) {\n  var sheet = ss.getSheetByName('BangXepHang');\n  var list = [];\n  if (!sheet || sheet.getLastRow() < 2) return list;\n\n  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues();\n  for (var i = 0; i < data.length; i++) {\n    var r = data[i];\n    if (r[1]) {\n      var rank = Number(r[0]) || (i + 1);\n      var w = Number(r[6]) || 0;\n      var v = Number(r[7]) || 0;\n      var vwStr = '';\n      if (w > 0 && v > 0) {\n        var wTon = (w / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 });\n        var vM3 = v.toLocaleString('vi-VN', { maximumFractionDigits: 1 });\n        vwStr = wTon + ' tấn | ' + vM3 + ' m³';\n      }\n\n      list.push({\n        rank: rank,\n        customer_code: String(r[1]).trim(),\n        customer_name: String(r[2]).trim(),\n        original_name: String(r[3] || r[2]).trim(),\n        vip_tier: String(r[4] || 'VIP PRO').trim(),\n        order_count: Number(r[5]) || 0,\n        weight_kg: w,\n        volume_m3: v,\n        volume_weight: vwStr,\n        service_fee: Number(r[8]) || 0,\n        prize_tag: String(r[9] || '').trim(),\n        prize_type: rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : 'regular'\n      });\n    }\n  }\n  return list;\n}\n\nfunction writeLeaderboardToSheet(ss, list) {\n  if (!Array.isArray(list) || list.length === 0) return;\n  var sheet = ss.getSheetByName('BangXepHang');\n  if (!sheet) return;\n\n  if (sheet.getLastRow() > 1) {\n    sheet.getRange(2, 1, sheet.getLastRow() - 1, 11).clearContent();\n  }\n\n  var rows = [];\n  for (var i = 0; i < list.length; i++) {\n    var item = list[i];\n    var rank = Number(item.rank) || (i + 1);\n    var code = String(item.customer_code || item.code || ('ERK-KH-' + (8800 + i))).trim().toUpperCase();\n    var name = String(item.customer_name || '').trim();\n    var origName = String(item.original_name || name).trim();\n    var vip = String(item.vip_tier || 'VIP PRO').trim();\n    var orders = Number(item.order_count) || 0;\n    var weightKg = Number(item.weight_kg) || 0;\n    var volM3 = Number(item.volume_m3) || 0;\n\n    if (weightKg === 0 && item.volume_weight) {\n      var p1 = String(item.volume_weight).split('|')[0] || '';\n      var m1 = p1.replace(',', '.').match(/([\\d.]+)\\s*(tấn|kg|t)/i);\n      if (m1) {\n        var num1 = parseFloat(m1[1]);\n        weightKg = m1[2].toLowerCase().includes('t') ? Math.round(num1 * 1000) : Math.round(num1);\n      }\n    }\n    if (volM3 === 0 && item.volume_weight) {\n      var p2 = String(item.volume_weight).split('|')[1] || String(item.volume_weight);\n      var m2 = p2.replace(',', '.').match(/([\\d.]+)\\s*(m³|m3|cbm)/i);\n      if (m2) volM3 = parseFloat(m2[1]);\n    }\n\n    var fee = Number(item.service_fee) || 0;\n    var prize = String(item.prize_tag || '').trim();\n\n    rows.push([\n      rank,\n      code,\n      name,\n      origName,\n      vip,\n      orders,\n      weightKg,\n      volM3,\n      fee,\n      prize,\n      formatDate(new Date())\n    ]);\n  }\n\n  if (rows.length > 0) {\n    sheet.getRange(2, 1, rows.length, 11).setValues(rows);\n  }\n}\n\n// 6. SHEET 'VongQuayMayMan' (Leads)\nfunction readSpinLeadsFromSheet(ss) {\n  var sheet = ss.getSheetByName('VongQuayMayMan');\n  var spinLeads = [];\n  var lockedPhones = [];\n  if (!sheet || sheet.getLastRow() < 2) return { spinLeads: spinLeads, lockedPhones: lockedPhones };\n\n  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();\n  for (var i = data.length - 1; i >= 0; i--) {\n    var row = data[i];\n    if (row[1]) {\n      var phoneStr = String(row[1]).trim();\n      spinLeads.push({\n        id: 'L-' + (i + 1),\n        createdAt: formatDate(row[0]),\n        phone: phoneStr,\n        voucherCode: String(row[2] || ''),\n        prize: String(row[3] || ''),\n        ref: String(row[4] || 'direct'),\n        status: String(row[5] || 'Chờ áp dụng')\n      });\n      lockedPhones.push(phoneStr);\n    }\n  }\n  return { spinLeads: spinLeads, lockedPhones: lockedPhones };\n}\n\nfunction writeSpinLeadsToSheet(ss, leads) {\n  var sheet = ss.getSheetByName('VongQuayMayMan');\n  if (!sheet || !Array.isArray(leads)) return;\n\n  if (sheet.getLastRow() > 1) {\n    sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).clearContent();\n  }\n\n  var rows = [];\n  leads.forEach(function(l) {\n    rows.push([\n      l.createdAt || new Date(),\n      \"'\" + String(l.phone || ''),\n      l.voucherCode || '',\n      l.prize || '',\n      l.ref || 'direct',\n      l.status || 'Chờ áp dụng qua Zalo'\n    ]);\n  });\n\n  if (rows.length > 0) {\n    sheet.getRange(2, 1, rows.length, 6).setValues(rows);\n  }\n}\n\n// 7. SHEET 'VongQuayM05'\nfunction readM05WinnersFromSheet(ss) {\n  var sheet = ss.getSheetByName('VongQuayM05');\n  var winners = [];\n  if (!sheet || sheet.getLastRow() < 2) return winners;\n\n  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();\n  for (var j = data.length - 1; j >= 0; j--) {\n    var r = data[j];\n    if (r[2]) {\n      winners.push({\n        id: 'W-' + (j + 1),\n        draw_time: formatDate(r[0]),\n        period: String(r[1] || ''),\n        booking_code: String(r[2] || ''),\n        prize: String(r[3] || ''),\n        status: String(r[4] || '✅ Đã ghi nhận')\n      });\n    }\n  }\n  return winners;\n}\n\nfunction writeM05WinnersToSheet(ss, winners) {\n  var sheet = ss.getSheetByName('VongQuayM05');\n  if (!sheet || !Array.isArray(winners)) return;\n\n  if (sheet.getLastRow() > 1) {\n    sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).clearContent();\n  }\n\n  var rows = [];\n  winners.forEach(function(w) {\n    rows.push([\n      w.draw_time || new Date(),\n      w.period || '',\n      w.booking_code || '',\n      w.prize || '',\n      w.status || '✅ Đã ghi nhận'\n    ]);\n  });\n\n  if (rows.length > 0) {\n    sheet.getRange(2, 1, rows.length, 5).setValues(rows);\n  }\n}\n\n// =========================================================================\n// KHỞI TẠO CÁC SHEET CHUYÊN BIỆT VỚI TIÊU ĐỀ & ĐỊNH DẠNG ĐẸP\n// =========================================================================\nfunction initDatabaseSheets(ss) {\n  // 1. Sheet CauHinhVongQuay (8 Ô giải thưởng)\n  var sWheel = ss.getSheetByName('CauHinhVongQuay');\n  if (!sWheel) {\n    sWheel = ss.insertSheet('CauHinhVongQuay');\n    sWheel.appendRow(['Ô Số (STT)', 'Nhãn Hiển Thị Nan Quạt', 'Tên Phần Thưởng Trao Cho Khách', 'Tỉ Lệ Trúng (%)', 'Số Lượng Trong Kho', 'Mã Màu Nan Quạt', 'Màu Chữ', 'Thời Gian Cập Nhật']);\n    var h = sWheel.getRange(1, 1, 1, 8);\n    h.setBackground('#0f172a').setFontColor('#f59e0b').setFontWeight('bold');\n    sWheel.setFrozenRows(1);\n    sWheel.setColumnWidth(1, 80);\n    sWheel.setColumnWidth(2, 220);\n    sWheel.setColumnWidth(3, 260);\n    sWheel.setColumnWidth(4, 120);\n    sWheel.setColumnWidth(5, 140);\n    sWheel.setColumnWidth(6, 120);\n    sWheel.setColumnWidth(7, 100);\n    sWheel.setColumnWidth(8, 160);\n\n    // Điền 8 dòng mẫu khởi tạo\n    var defaultSlots = [\n      [1, 'GIẢM GIÁ 10% CƯỚC', 'Giảm giá 10% chi phí vận chuyển', 100, 9999, '#ea580c', '#FFFFFF', formatDate(new Date())],\n      [2, 'VOUCHER 300K', 'Voucher Chiết Khấu 300.000 đ', 0, 25, '#1e293b', '#FBBF24', formatDate(new Date())],\n      [3, 'ƯU TIÊN XẾP CONT', 'Vé Ưu Tiên Xếp Cont Sớm', 0, 18, '#f59e0b', '#0F172A', formatDate(new Date())],\n      [4, 'GIẢM 50% LƯU KHO', 'Giảm 50% Phí Lưu Kho Bãi', 0, 15, '#0f172a', '#FFFFFF', formatDate(new Date())],\n      [5, 'VOUCHER 300K', 'Voucher Chiết Khấu 300.000 đ', 0, 20, '#ea580c', '#FFFFFF', formatDate(new Date())],\n      [6, 'GÓI SQUAD 2-IN-1', 'Gói Hỗ Trợ Squad 2-in-1', 0, 11, '#1e293b', '#38BDF8', formatDate(new Date())],\n      [7, 'VOUCHER 400K', 'Voucher 400.000 đ Lộc Xuân', 0, 10, '#f59e0b', '#0F172A', formatDate(new Date())],\n      [8, 'MAY MẮN LẦN SAU', 'Vé Tích Lũy Quay Mùng 05', 0, 999, '#0f172a', '#94A3B8', formatDate(new Date())]\n    ];\n    sWheel.getRange(2, 1, defaultSlots.length, 8).setValues(defaultSlots);\n  }\n\n  // 2. Sheet CauHinhBotTelegram\n  var sBot = ss.getSheetByName('CauHinhBotTelegram');\n  if (!sBot) {\n    sBot = ss.insertSheet('CauHinhBotTelegram');\n    sBot.appendRow(['Kênh Nhận Tin', 'Trạng Thái', 'Token / URL Webhook', 'Chat ID / Nhóm Nhận', 'Ghi Chú Hướng Dẫn', 'Thời Gian Cập Nhật']);\n    var hBot = sBot.getRange(1, 1, 1, 6);\n    hBot.setBackground('#0f172a').setFontColor('#38bdf8').setFontWeight('bold');\n    sBot.setFrozenRows(1);\n    sBot.setColumnWidth(1, 150);\n    sBot.setColumnWidth(2, 100);\n    sBot.setColumnWidth(3, 300);\n    sBot.setColumnWidth(4, 180);\n    sBot.setColumnWidth(5, 300);\n    sBot.setColumnWidth(6, 160);\n\n    var defaultBotRows = [\n      ['Telegram Bot', 'TẮT', '', '', 'Điền Bot Token & Chat ID để nhận thông báo tức thời khi khách quay quà', formatDate(new Date())],\n      ['Webhook Endpoint', 'TẮT', '', '', 'Endpoint HTTP nhận dữ liệu JSON payload khách quay thưởng', formatDate(new Date())]\n    ];\n    sBot.getRange(2, 1, 2, 6).setValues(defaultBotRows);\n  }\n\n  // 3. Sheet NhiemVuHeThong\n  var sNV = ss.getSheetByName('NhiemVuHeThong');\n  if (!sNV) {\n    sNV = ss.insertSheet('NhiemVuHeThong');\n    sNV.appendRow(['Mã Chặng', 'Tên Chặng', 'Thời Gian Diễn Ra', 'Phần Thưởng Đạt Chuẩn', 'Điều Kiện Hoàn Thành', 'Danh Sách Mã KH (Mỗi dòng 1 mã)', 'Trạng Thái Hiển Thị', 'Thời Gian Cập Nhật']);\n    var hNV = sNV.getRange(1, 1, 1, 8);\n    hNV.setBackground('#0f172a').setFontColor('#34d399').setFontWeight('bold');\n    sNV.setFrozenRows(1);\n    sNV.setColumnWidth(1, 110);\n    sNV.setColumnWidth(2, 200);\n    sNV.setColumnWidth(3, 130);\n    sNV.setColumnWidth(4, 200);\n    sNV.setColumnWidth(5, 200);\n    sNV.setColumnWidth(6, 250);\n    sNV.setColumnWidth(7, 160);\n    sNV.setColumnWidth(8, 160);\n  }\n\n  // 4. Sheet CaiDatChung\n  var sCaiDat = ss.getSheetByName('CaiDatChung');\n  if (!sCaiDat) {\n    sCaiDat = ss.insertSheet('CaiDatChung');\n    sCaiDat.appendRow(['Tên Cài Đặt (Key)', 'Giá Trị (Value)', 'Mô Tả Chức Năng', 'Thời Gian Cập Nhật']);\n    var hCD = sCaiDat.getRange(1, 1, 1, 4);\n    hCD.setBackground('#0f172a').setFontColor('#f43f5e').setFontWeight('bold');\n    sCaiDat.setFrozenRows(1);\n    sCaiDat.setColumnWidth(1, 240);\n    sCaiDat.setColumnWidth(2, 350);\n    sCaiDat.setColumnWidth(3, 300);\n    sCaiDat.setColumnWidth(4, 160);\n  }\n\n  // 5. Sheet BangXepHang\n  var sBXH = ss.getSheetByName('BangXepHang');\n  if (!sBXH) {\n    sBXH = ss.insertSheet('BangXepHang');\n    sBXH.appendRow(['Hạng', 'Mã Khách Hàng', 'Tên Khách Hàng (Bảo Mật)', 'Tên Doanh Nghiệp Gốc', 'Hạng VIP', 'Tổng Đơn', 'Tải Trọng (Kg)', 'Thể Tích (M³)', 'Phí Dịch Vụ (VNĐ)', 'Quà Tạm Tính / Giải Thưởng', 'Thời Gian Cập Nhật']);\n    var hBXH = sBXH.getRange(1, 1, 1, 11);\n    hBXH.setBackground('#0f172a').setFontColor('#fbbf24').setFontWeight('bold');\n    sBXH.setFrozenRows(1);\n    sBXH.setColumnWidth(1, 60);\n    sBXH.setColumnWidth(2, 130);\n    sBXH.setColumnWidth(3, 220);\n    sBXH.setColumnWidth(4, 220);\n    sBXH.setColumnWidth(5, 110);\n    sBXH.setColumnWidth(6, 90);\n    sBXH.setColumnWidth(7, 130);\n    sBXH.setColumnWidth(8, 130);\n    sBXH.setColumnWidth(9, 150);\n    sBXH.setColumnWidth(10, 220);\n    sBXH.setColumnWidth(11, 160);\n  }\n\n  // 6. Sheet VongQuayMayMan\n  var sLeads = ss.getSheetByName('VongQuayMayMan');\n  if (!sLeads) {\n    sLeads = ss.insertSheet('VongQuayMayMan');\n    sLeads.appendRow(['Thời Gian Quay', 'Số Điện Thoại', 'Mã Voucher', 'Giải Thưởng Trúng', 'Nguồn Giới Thiệu', 'Trạng Thái Chăm Sóc']);\n    var hL = sLeads.getRange(1, 1, 1, 6);\n    hL.setBackground('#0f172a').setFontColor('#38bdf8').setFontWeight('bold');\n    sLeads.setFrozenRows(1);\n    sLeads.setColumnWidth(1, 160);\n    sLeads.setColumnWidth(2, 130);\n    sLeads.setColumnWidth(3, 130);\n    sLeads.setColumnWidth(4, 240);\n    sLeads.setColumnWidth(5, 140);\n    sLeads.setColumnWidth(6, 170);\n  }\n\n  // 7. Sheet VongQuayM05\n  var sM05 = ss.getSheetByName('VongQuayM05');\n  if (!sM05) {\n    sM05 = ss.insertSheet('VongQuayM05');\n    sM05.appendRow(['Thời Gian Quay', 'Kỳ Quay Thưởng', 'Mã Booking Trúng Thưởng', 'Giải Thưởng Tri Ân', 'Trạng Thái']);\n    var hM = sM05.getRange(1, 1, 1, 5);\n    hM.setBackground('#0f172a').setFontColor('#fbbf24').setFontWeight('bold');\n    sM05.setFrozenRows(1);\n    sM05.setColumnWidth(1, 160);\n    sM05.setColumnWidth(2, 160);\n    sM05.setColumnWidth(3, 180);\n    sM05.setColumnWidth(4, 240);\n    sM05.setColumnWidth(5, 160);\n  }\n}\n\nfunction formatDate(val) {\n  if (!val) return '';\n  if (val instanceof Date) {\n    return Utilities.formatDate(val, Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'HH:mm - dd/MM/yyyy');\n  }\n  return String(val);\n}\n\nfunction jsonOutput(obj) {\n  return ContentService.createTextOutput(JSON.stringify(obj))\n    .setMimeType(ContentService.MimeType.JSON);\n}\n";

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

