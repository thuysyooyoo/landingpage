/**
 * EUREKA CUSTOMER AWARDS 2026 - GOOGLE SHEETS CLOUD DATABASE INTEGRATION
 * Đồng bộ dữ liệu 2 chiều thời gian thực giữa Landing Page và Google Sheets qua Google Apps Script
 */

const STORAGE_KEY_SHEETS_URL = 'eureka_sheets_api_url';
const DEFAULT_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbx_placeholder/exec'; // Placeholder, configured via Admin

// Get active API URL
function getSheetsApiUrl() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SHEETS_URL);
    if (saved && saved.trim().startsWith('http')) return saved.trim();
  } catch (e) {}
  return '';
}

function setSheetsApiUrl(url) {
  if (!url) {
    localStorage.removeItem(STORAGE_KEY_SHEETS_URL);
  } else {
    localStorage.setItem(STORAGE_KEY_SHEETS_URL, url.trim());
  }
}

function isSheetsConnected() {
  const url = getSheetsApiUrl();
  return !!url && url.length > 20;
}

// -------------------------------------------------------------
// FETCH ALL DATA FROM GOOGLE SHEETS CLOUD (Called on page load)
// -------------------------------------------------------------
async function fetchCloudData(silent = true) {
  const url = getSheetsApiUrl();
  if (!url) return false;

  try {
    console.log('[GoogleSheets DB] Đang tải dữ liệu từ Cloud...');
    const response = await fetch(`${url}?action=getAllData&t=${Date.now()}`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });

    if (!response.ok) throw new Error('HTTP ' + response.status);
    const result = await response.json();

    if (result && result.status === 'success' && result.data) {
      const data = result.data;
      let hasUpdates = false;

      // 1. Đồng bộ Số điện thoại đã quay & Danh sách Leads
      if (Array.isArray(data.lockedPhones) && data.lockedPhones.length > 0) {
        try {
          const currentLocked = JSON.parse(localStorage.getItem('eureka_locked_spun_phones') || '{}');
          data.lockedPhones.forEach(item => {
            const phone = typeof item === 'string' ? item : item.phone;
            if (phone) {
              const norm = phone.replace(/[\s\.\-_]/g, '').replace(/^\+?84/, '0');
              if (!currentLocked[norm]) {
                currentLocked[norm] = typeof item === 'object' ? item : { phone: norm, createdAt: 'Đồng bộ từ Cloud' };
              }
            }
          });
          localStorage.setItem('eureka_locked_spun_phones', JSON.stringify(currentLocked));
        } catch (e) {}
      }

      if (Array.isArray(data.spinLeads) && data.spinLeads.length > 0) {
        try {
          const currentLeads = JSON.parse(localStorage.getItem('eureka_spin_leads') || '[]');
          // Merge unique leads by phone or voucherCode
          const leadMap = new Map();
          currentLeads.forEach(l => leadMap.set(l.phone || l.id, l));
          data.spinLeads.forEach(l => leadMap.set(l.phone || l.id, l));
          const mergedLeads = Array.from(leadMap.values());
          localStorage.setItem('eureka_spin_leads', JSON.stringify(mergedLeads));
          hasUpdates = true;
        } catch (e) {}
      }

      // 2. Đồng bộ Danh sách Trúng Thưởng M05
      if (Array.isArray(data.monthlyWinners) && data.monthlyWinners.length > 0) {
        try {
          localStorage.setItem('eureka_monthly_winners', JSON.stringify(data.monthlyWinners));
          if (typeof renderPublicMonthlyWinners === 'function') {
            renderPublicMonthlyWinners();
          }
          if (typeof renderAdminWinnersTable === 'function') {
            renderAdminWinnersTable();
          }
          hasUpdates = true;
        } catch (e) {}
      }

      // 3. Đồng bộ Cấu hình Nhiệm Vụ Hệ Thống
      if (data.nhiemVuConfig && typeof data.nhiemVuConfig === 'object') {
        try {
          localStorage.setItem('eureka_nhiem_vu_config', JSON.stringify(data.nhiemVuConfig));
          if (typeof renderNhiemVuDisplay === 'function') {
            renderNhiemVuDisplay();
          }
          if (typeof updateAdminNhiemVuUI === 'function') {
            updateAdminNhiemVuUI();
          }
          hasUpdates = true;
        } catch (e) {}
      }

      // 4. Đồng bộ Cấu hình Ẩn / Hiện Vinh Danh Đêm Gala
      if (data.galaConfig && typeof data.galaConfig === 'object') {
        try {
          localStorage.setItem('eureka_gala_awards_config', JSON.stringify(data.galaConfig));
          if (typeof applyGalaVisibility === 'function') {
            applyGalaVisibility();
          }
          if (typeof renderAdminGalaToggle === 'function') {
            renderAdminGalaToggle();
          }
          hasUpdates = true;
        } catch (e) {}
      }

      // 5. Đồng bộ Người Đạt Giải Top Tuần
      if (data.weeklyWinner && typeof data.weeklyWinner === 'object') {
        try {
          localStorage.setItem('eureka_weekly_winner', JSON.stringify(data.weeklyWinner));
          if (typeof renderWeeklyWinnerDisplay === 'function') {
            renderWeeklyWinnerDisplay();
          }
          if (typeof renderAdminWeeklyWinner === 'function') {
            renderAdminWeeklyWinner();
          }
          hasUpdates = true;
        } catch (e) {}
      }

      // 6. Đồng bộ Bảng Xếp Hạng Custom
      if (Array.isArray(data.customLeaderboard) && data.customLeaderboard.length > 0) {
        try {
          localStorage.setItem('eureka_custom_leaderboard', JSON.stringify(data.customLeaderboard));
          if (typeof renderLeaderboardTable === 'function') {
            renderLeaderboardTable();
          }
          hasUpdates = true;
        } catch (e) {}
      }

      console.log('✅ [GoogleSheets DB] Đồng bộ Cloud thành công! Dữ liệu mới nhất đã được áp dụng.');
      updateCloudSyncStatusBadge(true, 'Đã đồng bộ ' + new Date().toLocaleTimeString('vi-VN'));
      return true;
    }
  } catch (err) {
    console.warn('[GoogleSheets DB] Lỗi tải dữ liệu Cloud:', err);
    updateCloudSyncStatusBadge(false, 'Lỗi kết nối');
    return false;
  }
}

// -------------------------------------------------------------
// POST ACTIONS TO GOOGLE SHEETS
// -------------------------------------------------------------

// Helper POST request using Content-Type text/plain to avoid CORS OPTIONS preflight
async function postToSheets(payload) {
  const url = getSheetsApiUrl();
  if (!url) return false;

  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) return false;
    const res = await response.json();
    return res && res.status === 'success';
  } catch (err) {
    console.warn('[GoogleSheets DB] Lỗi gửi dữ liệu lên Cloud:', err);
    return false;
  }
}

// 1. Khi Khách Hàng Quay Trúng Quà (Lưu Lead & Khóa SĐT)
async function syncSpinLeadToCloud(lead) {
  if (!isSheetsConnected()) return;
  const payload = {
    action: 'record_spin_lead',
    lead: {
      phone: lead.phone,
      voucherCode: lead.voucherCode,
      prize: lead.prize,
      createdAt: lead.createdAt || new Date().toLocaleString('vi-VN'),
      ref: lead.ref || 'direct',
      status: lead.status || 'Chờ áp dụng qua Zalo'
    }
  };
  return postToSheets(payload);
}

// 2. Khi Admin Quay Thưởng M05 (Lưu Mã Booking Trúng Thưởng)
async function syncM05WinnerToCloud(winner) {
  if (!isSheetsConnected()) return;
  const payload = {
    action: 'record_m05_winner',
    winner: {
      period: winner.period,
      booking_code: winner.booking_code,
      prize: winner.prize,
      draw_time: winner.draw_time || new Date().toLocaleString('vi-VN'),
      status: winner.status || '✅ Vừa quay trúng'
    }
  };
  return postToSheets(payload);
}

// 3. Khi Admin Lưu Cấu Hình (Nhiệm Vụ, Gala, Top Tuần)
async function syncAdminConfigToCloud(configKey, configData) {
  if (!isSheetsConnected()) return;
  const payload = {
    action: 'save_config',
    key: configKey,
    value: configData
  };
  return postToSheets(payload);
}

// 4. Đẩy Toàn Bộ Dữ Liệu Máy Lên Google Sheets (One-Click Backup)
async function pushAllLocalDataToCloud() {
  if (!isSheetsConnected()) {
    alert('⚠️ Bạn chưa cấu hình đường link Google Apps Script Web App!');
    return false;
  }

  const payload = {
    action: 'sync_all',
    data: {
      spinLeads: JSON.parse(localStorage.getItem('eureka_spin_leads') || '[]'),
      lockedPhones: Object.values(JSON.parse(localStorage.getItem('eureka_locked_spun_phones') || '{}')),
      monthlyWinners: JSON.parse(localStorage.getItem('eureka_monthly_winners') || '[]'),
      nhiemVuConfig: JSON.parse(localStorage.getItem('eureka_nhiem_vu_config') || 'null'),
      galaConfig: JSON.parse(localStorage.getItem('eureka_gala_awards_config') || 'null'),
      weeklyWinner: JSON.parse(localStorage.getItem('eureka_weekly_winner') || 'null'),
      customLeaderboard: JSON.parse(localStorage.getItem('eureka_custom_leaderboard') || '[]')
    }
  };

  const success = await postToSheets(payload);
  if (success) {
    alert('✅ ĐÃ ĐẨY TOÀN BỘ DỮ LIỆU LÊN GOOGLE SHEETS THÀNH CÔNG!\n\nMọi khách hàng truy cập từ máy tính hoặc điện thoại khác từ bây giờ sẽ thấy đầy đủ thông tin này.');
    updateCloudSyncStatusBadge(true, 'Đã đồng bộ ' + new Date().toLocaleTimeString('vi-VN'));
  } else {
    alert('❌ Không thể đồng bộ lên Google Sheets. Vui lòng kiểm tra lại URL hoặc phân quyền Web App!');
  }
  return success;
}

// 5. Kiểm tra kết nối Test Ping
async function testCloudConnection(testUrl) {
  const targetUrl = testUrl || getSheetsApiUrl();
  if (!targetUrl) return { success: false, message: 'Chưa nhập URL Web App' };

  try {
    const res = await fetch(`${targetUrl}?action=ping&t=${Date.now()}`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    if (!res.ok) throw new Error('Mã lỗi HTTP: ' + res.status);
    const data = await res.json();
    if (data && data.status === 'ok') {
      return { success: true, message: data.message || 'Kết nối thành công!' };
    }
    return { success: false, message: 'Dữ liệu phản hồi không đúng định dạng.' };
  } catch (err) {
    return { success: false, message: err.message || 'Không thể kết nối tới Google Apps Script.' };
  }
}

// Cập nhật Badge hiển thị trạng thái Cloud trên thanh Header Admin
function updateCloudSyncStatusBadge(isConnected, text) {
  const badge = document.getElementById('admin-cloud-sync-badge');
  if (!badge) return;
  if (isConnected) {
    badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold';
    badge.innerHTML = `<span>🟢 Google Sheets:</span> <span>${text || 'Đã kết nối'}</span>`;
  } else {
    badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold';
    badge.innerHTML = `<span>🟡 Bộ nhớ cục bộ:</span> <span>${text || 'Chưa liên kết Sheet'}</span>`;
  }
}

// Tự động khởi chạy đồng bộ khi tải trang
document.addEventListener('DOMContentLoaded', () => {
  if (isSheetsConnected()) {
    updateCloudSyncStatusBadge(true, 'Đang đồng bộ...');
    fetchCloudData(true);
  } else {
    updateCloudSyncStatusBadge(false, 'Chưa liên kết Sheet');
  }
});
