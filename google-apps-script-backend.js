/**
 * =========================================================================
 * GOOGLE APPS SCRIPT CLOUD DATABASE v4.0 - EUREKA CUSTOMER AWARDS 2026
 * HỆ THỐNG QUẢN LÝ DỮ LIỆU ĐỘC LẬP TỪNG SHEET CHUYÊN BIỆT (SOURCE OF TRUTH):
 * 1. Sheet 'CauHinhBotTelegram': Quản lý Telegram Bot Token, Chat ID, Webhook.
 * 2. Sheet 'CauHinhVongQuay': Quản lý 8 ô giải thưởng, nhãn nan quạt, tỉ lệ %, kho quà, màu sắc.
 * 3. Sheet 'NhiemVuHeThong': Quản lý Chặng 1, 2, 3 và Danh sách Mã KH hoàn thành.
 * 4. Sheet 'BangXepHang': Quản lý 25+ khách hàng đua top doanh số (Cân & Khối riêng).
 * 5. Sheet 'CaiDatChung': Quản lý Mật khẩu Admin, Bật/Tắt Gala, Top Tuần, Giải M05, Booking Pool.
 * 6. Sheet 'VongQuayMayMan': Lưu lịch sử SĐT khách quay nhận Voucher.
 * 7. Sheet 'VongQuayM05': Lưu lịch sử mã booking trúng thưởng Vòng Quay Mùng 05.
 * 8. Sheet 'LichSuChinhSua': CHỈ DÙNG GHI NHẬN LỊCH SỬ CHỈNH SỬA (AUDIT LOG), KHÔNG LƯU CẤU HÌNH RUNTIME.
 * =========================================================================
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAllData';

  if (action === 'ping') {
    return jsonOutput({
      status: 'ok',
      message: 'Kết nối Google Sheets Cloud Database v4.0 thành công!',
      timestamp: new Date().toISOString()
    });
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    initDatabaseSheets(ss);

    // 1. Đọc Cấu hình Telegram Bot & Webhook từ Sheet riêng: CauHinhBotTelegram
    var botConfig = readBotConfigFromSheet(ss);

    // 2. Đọc Cấu hình Vòng Quay May Mắn từ Sheet riêng: CauHinhVongQuay
    var wheelConfig = readWheelConfigFromSheet(ss);

    // 3. Đọc Cấu hình Nhiệm Vụ Hệ Thống từ Sheet riêng: NhiemVuHeThong
    var nhiemVuConfig = readNhiemVuConfigFromSheet(ss);

    // 4. Đọc Bảng Xếp Hạng Doanh Số từ Sheet riêng: BangXepHang
    var customLeaderboard = readLeaderboardFromSheet(ss);

    // 5. Đọc Cài Đặt Chung từ Sheet riêng: CaiDatChung
    var generalSettings = readGeneralSettingsFromSheet(ss);

    // 6. Đọc Lịch Sử Khách Quay từ Sheet riêng: VongQuayMayMan
    var spinData = readSpinLeadsFromSheet(ss);

    // 7. Đọc Danh Sách Trúng Thưởng M05 từ Sheet riêng: VongQuayM05
    var monthlyWinners = readM05WinnersFromSheet(ss);

    // Trích xuất cài đặt chung chính xác theo đúng tên key
    var adminPassword = generalSettings['eureka_admin_password_custom'] || generalSettings['admin_password'] || '';
    var galaConfig = generalSettings['eureka_gala_awards_config'] || generalSettings['gala_config'] || null;
    var weeklyWinner = generalSettings['eureka_weekly_winner'] || generalSettings['weekly_winner'] || null;
    var m05BookingPool = generalSettings['eureka_m05_booking_pool'] || generalSettings['m05_booking_pool'] || null;
    var m05CurrentPrize = generalSettings['eureka_m05_current_prize'] || generalSettings['m05_current_prize'] || '';
    var refClicks = generalSettings['eureka_ref_clicks'] || generalSettings['ref_clicks'] || null;

    return jsonOutput({
      status: 'success',
      data: {
        botConfig: botConfig,
        wheelConfig: wheelConfig,
        nhiemVuConfig: nhiemVuConfig,
        customLeaderboard: customLeaderboard,
        spinLeads: spinData.spinLeads,
        lockedPhones: spinData.lockedPhones,
        monthlyWinners: monthlyWinners,
        adminPassword: adminPassword,
        galaConfig: galaConfig,
        weeklyWinner: weeklyWinner,
        m05BookingPool: m05BookingPool,
        m05CurrentPrize: m05CurrentPrize,
        refClicks: refClicks,
        configs: {
          eureka_bot_config: botConfig,
          eureka_welcome_wheel_config: wheelConfig,
          eureka_nhiem_vu_config: nhiemVuConfig,
          eureka_custom_leaderboard: customLeaderboard,
          eureka_admin_password_custom: adminPassword,
          eureka_gala_awards_config: galaConfig,
          eureka_weekly_winner: weeklyWinner,
          eureka_m05_booking_pool: m05BookingPool,
          eureka_m05_current_prize: m05CurrentPrize,
          eureka_ref_clicks: refClicks
        }
      }
    });
  } catch (err) {
    return jsonOutput({
      status: 'error',
      message: err.toString()
    });
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    initDatabaseSheets(ss);

    var raw = e.postData.contents;
    var payload = JSON.parse(raw);
    var action = payload.action;

    // 1. Lưu Cấu Hình Bot & Webhook vào Sheet riêng 'CauHinhBotTelegram'
    if (action === 'save_bot_config' || (action === 'save_config' && payload.key === 'eureka_bot_config')) {
      var bConfig = payload.botConfig || payload.value || {};
      writeBotConfigToSheet(ss, bConfig);
      logChangeHistory(ss, 'Telegram Bot & Webhook', 'Cập nhật cấu hình Bot', 'Trạng thái: ' + (bConfig.telegram_enabled ? 'BẬT' : 'TẮT') + ' | Chat ID: ' + (bConfig.telegram_chat_id || 'Trống'), 'Admin Website');
      return jsonOutput({ status: 'success', message: 'Đã lưu cấu hình Bot vào Sheet CauHinhBotTelegram và ghi nhật ký' });
    }

    // 2. Lưu Cấu Hình Vòng Quay vào Sheet riêng 'CauHinhVongQuay'
    if (action === 'save_wheel_config' || (action === 'save_config' && payload.key === 'eureka_welcome_wheel_config')) {
      var segments = payload.wheelConfig || payload.value || [];
      if (Array.isArray(segments) && segments.length > 0) {
        writeWheelConfigToSheet(ss, segments);
        logChangeHistory(ss, 'Vòng Quay May Mắn', 'Cập nhật cấu hình 8 ô quà', 'Cập nhật tỉ lệ và kho của ' + segments.length + ' ô giải thưởng', 'Admin Website');
        return jsonOutput({ status: 'success', message: 'Đã lưu cấu hình Vòng Quay vào Sheet CauHinhVongQuay và ghi nhật ký' });
      }
    }

    // 3. Lưu Cấu Hình Nhiệm Vụ Hệ Thống vào Sheet riêng 'NhiemVuHeThong'
    if (action === 'save_nhiem_vu' || (action === 'save_config' && payload.key === 'eureka_nhiem_vu_config')) {
      var nvConfig = payload.nhiemVuConfig || payload.value || {};
      writeNhiemVuConfigToSheet(ss, nvConfig);
      logChangeHistory(ss, 'Nhiệm Vụ Hệ Thống', 'Cập nhật nhiệm vụ 3 chặng', 'Chế độ hiển thị: ' + (nvConfig.active_mode || 'chang-1'), 'Admin Website');
      return jsonOutput({ status: 'success', message: 'Đã lưu cấu hình Nhiệm Vụ vào Sheet NhiemVuHeThong và ghi nhật ký' });
    }

    // 4. Lưu Bảng Xếp Hạng Doanh Số vào Sheet riêng 'BangXepHang'
    if (action === 'sync_leaderboard' || (action === 'save_config' && payload.key === 'eureka_custom_leaderboard')) {
      var lbList = payload.leaderboard || payload.value || [];
      if (Array.isArray(lbList)) {
        writeLeaderboardToSheet(ss, lbList);
        logChangeHistory(ss, 'Bảng Xếp Hạng', 'Cập nhật danh sách đua top', 'Cập nhật ' + lbList.length + ' khách hàng (Cân & Khối riêng)', 'Admin Website');
        return jsonOutput({ status: 'success', message: 'Đã lưu ' + lbList.length + ' khách hàng vào Sheet BangXepHang và ghi nhật ký' });
      }
    }

    // 5. Ghi nhận lượt quay Voucher của khách hàng vào Sheet 'VongQuayMayMan'
    if (action === 'record_spin_lead') {
      var lead = payload.lead || {};
      var leadsSheet = ss.getSheetByName('VongQuayMayMan');
      var phoneFormatted = "'" + String(lead.phone || '').trim();
      leadsSheet.appendRow([
        new Date(),
        phoneFormatted,
        lead.voucherCode || '',
        lead.prize || '',
        lead.ref || 'direct',
        lead.status || 'Chờ áp dụng qua Zalo'
      ]);

      // Tự động trừ 1 số lượng kho trong Sheet 'CauHinhVongQuay'
      decrementWheelStock(ss, lead.prize);
      return jsonOutput({ status: 'success', message: 'Đã lưu lead khách quay và trừ kho quà trong CauHinhVongQuay' });
    }

    // 6. Ghi nhận mã booking trúng thưởng M05 vào Sheet 'VongQuayM05'
    if (action === 'record_m05_winner') {
      var winner = payload.winner || {};
      var m05Sheet = ss.getSheetByName('VongQuayM05');
      m05Sheet.appendRow([
        new Date(),
        winner.period || '',
        winner.booking_code || '',
        winner.prize || '',
        winner.status || '✅ Vừa quay trúng'
      ]);
      logChangeHistory(ss, 'Vòng Quay M05', 'Quay trúng giải M05', 'Mã trúng: ' + (winner.booking_code || '') + ' | Giải: ' + (winner.prize || ''), 'Admin Quay Thưởng');
      return jsonOutput({ status: 'success', message: 'Đã lưu kết quả quay M05 vào Sheet VongQuayM05' });
    }

    // 7. Lưu Cài Đặt Chung vào Sheet 'CaiDatChung'
    if (action === 'save_general_setting' || action === 'save_config') {
      var key = payload.key;
      var val = payload.value;

      // Phân luồng thông minh nếu payload key thuộc các hạng mục chuyên biệt
      if (key === 'eureka_bot_config') {
        writeBotConfigToSheet(ss, val || {});
        logChangeHistory(ss, 'Telegram Bot & Webhook', 'Cập nhật cấu hình Bot', 'Lưu từ form cài đặt bot', 'Admin Website');
        return jsonOutput({ status: 'success', message: 'Đã lưu Bot vào Sheet CauHinhBotTelegram' });
      }
      if (key === 'eureka_welcome_wheel_config') {
        writeWheelConfigToSheet(ss, val || []);
        logChangeHistory(ss, 'Vòng Quay May Mắn', 'Cập nhật cấu hình vòng quay', 'Lưu cấu hình 8 ô quà', 'Admin Website');
        return jsonOutput({ status: 'success', message: 'Đã lưu Vòng Quay vào Sheet CauHinhVongQuay' });
      }
      if (key === 'eureka_nhiem_vu_config') {
        writeNhiemVuConfigToSheet(ss, val || {});
        logChangeHistory(ss, 'Nhiệm Vụ Hệ Thống', 'Cập nhật nhiệm vụ', 'Chế độ: ' + (val.active_mode || ''), 'Admin Website');
        return jsonOutput({ status: 'success', message: 'Đã lưu Nhiệm Vụ vào Sheet NhiemVuHeThong' });
      }
      if (key === 'eureka_custom_leaderboard') {
        writeLeaderboardToSheet(ss, val || []);
        logChangeHistory(ss, 'Bảng Xếp Hạng', 'Cập nhật bảng xếp hạng', 'Tổng ' + (val ? val.length : 0) + ' khách hàng', 'Admin Website');
        return jsonOutput({ status: 'success', message: 'Đã lưu Bảng Xếp Hạng vào Sheet BangXepHang' });
      }

      // Các cài đặt chung còn lại lưu vào Sheet CaiDatChung
      writeGeneralSettingToSheet(ss, key, val);
      logChangeHistory(ss, 'Cài Đặt Chung', 'Cập nhật ' + key, 'Giá trị đã cập nhật', 'Admin Website');
      return jsonOutput({ status: 'success', message: 'Đã lưu cài đặt ' + key + ' vào Sheet CaiDatChung và ghi nhật ký' });
    }

    // 8. Đẩy toàn bộ dữ liệu máy lên Cloud (One-Click Sync All)
    if (action === 'sync_all') {
      var all = payload.data || {};

      if (all.botConfig && typeof all.botConfig === 'object') {
        writeBotConfigToSheet(ss, all.botConfig);
      }
      if (all.wheelConfig && Array.isArray(all.wheelConfig)) {
        writeWheelConfigToSheet(ss, all.wheelConfig);
      }
      if (all.nhiemVuConfig && typeof all.nhiemVuConfig === 'object') {
        writeNhiemVuConfigToSheet(ss, all.nhiemVuConfig);
      }
      if (all.customLeaderboard && Array.isArray(all.customLeaderboard)) {
        writeLeaderboardToSheet(ss, all.customLeaderboard);
      }
      if (all.spinLeads && Array.isArray(all.spinLeads)) {
        writeSpinLeadsToSheet(ss, all.spinLeads);
      }
      if (all.monthlyWinners && Array.isArray(all.monthlyWinners)) {
        writeM05WinnersToSheet(ss, all.monthlyWinners);
      }

      // Lưu cài đặt chung vào Sheet CaiDatChung
      if (all.adminPasswordCustom !== undefined || (all.configs && all.configs.eureka_admin_password_custom !== undefined)) {
        var p = all.adminPasswordCustom !== undefined ? all.adminPasswordCustom : all.configs.eureka_admin_password_custom;
        writeGeneralSettingToSheet(ss, 'eureka_admin_password_custom', p);
      }
      if (all.galaConfig) writeGeneralSettingToSheet(ss, 'eureka_gala_awards_config', all.galaConfig);
      if (all.weeklyWinner) writeGeneralSettingToSheet(ss, 'eureka_weekly_winner', all.weeklyWinner);
      if (all.m05BookingPool) writeGeneralSettingToSheet(ss, 'eureka_m05_booking_pool', all.m05BookingPool);
      if (all.m05CurrentPrize) writeGeneralSettingToSheet(ss, 'eureka_m05_current_prize', all.m05CurrentPrize);
      if (all.refClicks) writeGeneralSettingToSheet(ss, 'eureka_ref_clicks', all.refClicks);

      logChangeHistory(ss, 'Đồng Bộ Toàn Bộ', 'One-Click Sync All', 'Đã đồng bộ toàn bộ dữ liệu máy vào từng Sheet chuyên biệt', 'Admin Website');
      return jsonOutput({ status: 'success', message: 'Đã đồng bộ toàn bộ dữ liệu vào 7 Sheet chuyên biệt độc lập thành công!' });
    }

    // 9. Dọn dẹp & xóa các sheet thừa không còn sử dụng
    if (action === 'cleanup_unused_sheets') {
      cleanupUnusedSheets(ss);
      return jsonOutput({ status: 'success', message: 'Đã dọn dẹp và xóa các sheet không còn sử dụng!' });
    }

    return jsonOutput({ status: 'ignored', message: 'Action không xác định: ' + action });
  } catch (err) {
    return jsonOutput({ status: 'error', message: err.toString() });
  }
}

// =========================================================================
// CÁC HÀM XỬ LÝ ĐỌC / GHI CHO TỪNG SHEET CHUYÊN BIỆT
// =========================================================================

// 1. SHEET 'CauHinhBotTelegram'
function readBotConfigFromSheet(ss) {
  var sheet = ss.getSheetByName('CauHinhBotTelegram');
  if (!sheet || sheet.getLastRow() < 2) return null;

  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  var config = {
    telegram_enabled: false,
    telegram_token: '',
    telegram_chat_id: '',
    webhook_enabled: false,
    webhook_url: ''
  };

  for (var i = 0; i < data.length; i++) {
    var channel = String(data[i][0] || '').toLowerCase();
    var rawStatus = data[i][1];
    var status = String(rawStatus || '').toUpperCase().trim();
    var isEnabled = (
      rawStatus === true ||
      status === 'BẬT' || status === 'TRUE' || status === '1' ||
      status === 'ON' || status === 'CÓ' || status === 'ENABLE' ||
      status === 'ENABLED' || status === 'HOẠT ĐỘNG'
    );
    var val1 = String(data[i][2] || '').trim();
    var val2 = String(data[i][3] || '').trim();

    if (channel.indexOf('telegram') !== -1) {
      config.telegram_enabled = isEnabled;
      config.telegram_token = val1;
      config.telegram_chat_id = val2;
    } else if (channel.indexOf('webhook') !== -1) {
      config.webhook_enabled = isEnabled;
      config.webhook_url = val1;
    }
  }

  // Tự động chuẩn hóa Chat ID Telegram nếu là nhóm supergroup (>=10 số) nhưng thiếu dấu '-'
  if (config.telegram_chat_id && /^[0-9]{10,}$/.test(config.telegram_chat_id)) {
    config.telegram_chat_id = '-' + config.telegram_chat_id;
  }

  return config;
}

function writeBotConfigToSheet(ss, config) {
  var sheet = ss.getSheetByName('CauHinhBotTelegram');
  if (!sheet) return;

  var chatId = String(config.telegram_chat_id || '').trim();
  if (chatId && /^[0-9]{10,}$/.test(chatId)) {
    chatId = '-' + chatId;
  }

  var rows = [
    [
      'Telegram Bot',
      config.telegram_enabled ? 'BẬT' : 'TẮT',
      String(config.telegram_token || '').trim(),
      chatId,
      'Tự động gửi thông báo khi khách quay thưởng vào nhóm Telegram',
      formatDate(new Date())
    ],
    [
      'Webhook Endpoint',
      config.webhook_enabled ? 'BẬT' : 'TẮT',
      String(config.webhook_url || '').trim(),
      '',
      'Đẩy dữ liệu JSON sang server/CRM ngoài khi khách quay',
      formatDate(new Date())
    ]
  ];

  sheet.getRange(2, 1, 2, 6).setValues(rows);
}

// 2. SHEET 'CauHinhVongQuay'
function readWheelConfigFromSheet(ss) {
  var sheet = ss.getSheetByName('CauHinhVongQuay');
  if (!sheet || sheet.getLastRow() < 2) return null;

  var numRows = Math.min(sheet.getLastRow() - 1, 12);
  var data = sheet.getRange(2, 1, numRows, 7).getValues();
  var segments = [];

  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    var text = String(r[1] || '').trim();
    var prize = String(r[2] || '').trim();
    if (!text && !prize) continue;

    var prob = parseSheetNumber(r[3]);
    var stock = parseSheetNumber(r[4]);

    segments.push({
      id: Number(r[0]) || (segments.length + 1),
      text: text,
      prize: prize || text,
      probability_weight: prob,
      stock_quantity: stock,
      color: String(r[5] || '#1e293b').trim(),
      textColor: String(r[6] || '#FFFFFF').trim()
    });
  }

  return segments.length > 0 ? segments : null;
}

function writeWheelConfigToSheet(ss, segments) {
  if (!Array.isArray(segments) || segments.length === 0) return;
  var sheet = ss.getSheetByName('CauHinhVongQuay');
  if (!sheet) return;

  var rows = [];
  for (var i = 0; i < segments.length; i++) {
    var seg = segments[i];
    rows.push([
      Number(seg.id) || (i + 1),
      String(seg.text || '').trim(),
      String(seg.prize || '').trim(),
      Number(seg.probability_weight) || 0,
      Number(seg.stock_quantity) || 0,
      String(seg.color || '#1e293b').trim(),
      String(seg.textColor || '#FFFFFF').trim(),
      formatDate(new Date())
    ]);
  }

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).clearContent();
  }
  sheet.getRange(2, 1, rows.length, 8).setValues(rows);
}

function decrementWheelStock(ss, prizeName) {
  if (!prizeName) return;
  var sheet = ss.getSheetByName('CauHinhVongQuay');
  if (!sheet || sheet.getLastRow() < 2) return;

  var data = sheet.getRange(2, 3, sheet.getLastRow() - 1, 3).getValues();
  for (var i = 0; i < data.length; i++) {
    var pName = String(data[i][0]).trim();
    if (pName === prizeName || prizeName.indexOf(pName) !== -1 || pName.indexOf(prizeName) !== -1) {
      var currentStock = parseSheetNumber(data[i][2]);
      if (currentStock > 0) {
        sheet.getRange(i + 2, 5).setValue(currentStock - 1);
        sheet.getRange(i + 2, 8).setValue(formatDate(new Date()));
      }
      break;
    }
  }
}

// 3. SHEET 'NhiemVuHeThong'
function readNhiemVuConfigFromSheet(ss) {
  var sheet = ss.getSheetByName('NhiemVuHeThong');
  if (!sheet || sheet.getLastRow() < 2) return null;

  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
  var config = {
    active_mode: 'chang-1',
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
      customer_codes: []
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
      customer_codes: []
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
      customer_codes: []
    }
  };

  for (var i = 0; i < data.length; i++) {
    var rawKey = String(data[i][0] || '').trim().toLowerCase().replace('-', '_');
    var time = String(data[i][2] || '').trim();
    var reward = String(data[i][3] || '').trim();
    var condition = String(data[i][4] || '').trim();
    var rawCodes = String(data[i][5] || '').trim();
    var statusStr = String(data[i][6] || '').toUpperCase();
    var isCurrentMode = (statusStr.indexOf('ĐANG') !== -1 || statusStr.indexOf('HIỆN') !== -1 || statusStr.indexOf('BẬT') !== -1);

    var codeList = rawCodes.split(/[\r\n,;]+/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; });

    if (isCurrentMode) {
      config.active_mode = rawKey.replace('_', '-');
    }

    if (config[rawKey]) {
      if (time) config[rawKey].time_range = time;
      if (reward) config[rawKey].reward = reward;
      if (condition) config[rawKey].condition = condition;
      config[rawKey].customer_codes = codeList;
    }
  }

  return config;
}

function writeNhiemVuConfigToSheet(ss, cfg) {
  var sheet = ss.getSheetByName('NhiemVuHeThong');
  if (!sheet) return;

  var activeMode = (cfg.active_mode || 'chang-1').replace('-', '_');

  var changList = [
    { key: 'chang_1', name: 'Chặng 1 — Khởi Động Sớm' },
    { key: 'chang_2', name: 'Chặng 2 — Giữ Nhịp Cao Điểm' },
    { key: 'chang_3', name: 'Chặng 3 — Về Đích An Toàn' },
    { key: 'tong_ket', name: 'Tổng Kết 3 Chặng' }
  ];

  var rows = [];
  changList.forEach(function(item) {
    var cData = cfg[item.key] || {};
    var codes = cData.customer_codes || cData.codes || [];
    var codesStr = Array.isArray(codes) ? codes.join('\n') : String(codes);
    var isCurrent = (item.key === activeMode) ? '⭐ ĐANG HIỂN THỊ' : 'Chờ công bố';

    rows.push([
      item.key,
      item.name,
      cData.time_range || cData.time_window || '',
      cData.reward || '',
      cData.condition || '',
      codesStr,
      isCurrent,
      formatDate(new Date())
    ]);
  });

  sheet.getRange(2, 1, rows.length, 8).setValues(rows);
}

// 4. SHEET 'BangXepHang'
function readLeaderboardFromSheet(ss) {
  var sheet = ss.getSheetByName('BangXepHang');
  var list = [];
  if (!sheet || sheet.getLastRow() < 2) return list;

  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues();
  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    if (r[1] || r[2]) {
      var rank = parseSheetNumber(r[0]) || (i + 1);
      var w = parseSheetNumber(r[6]);
      var v = parseSheetNumber(r[7]);
      var fee = parseSheetNumber(r[8]);

      var vwParts = [];
      if (w >= 1000) {
        vwParts.push((w / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tấn');
      } else if (w > 0) {
        vwParts.push(w + ' kg');
      }
      if (v > 0) {
        vwParts.push(v.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' m³');
      }
      var vwStr = vwParts.join(' | ');

      list.push({
        rank: rank,
        customer_code: String(r[1] || '').trim().toUpperCase(),
        customer_name: String(r[2] || '').trim(),
        original_name: String(r[3] || r[2] || '').trim(),
        vip_tier: String(r[4] || 'VIP PRO').trim(),
        order_count: parseSheetNumber(r[5]),
        weight_kg: w,
        volume_m3: v,
        volume_weight: vwStr,
        service_fee: fee,
        prize_tag: String(r[9] || '').trim(),
        prize_type: rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : 'regular'
      });
    }
  }
  return list;
}

function writeLeaderboardToSheet(ss, list) {
  if (!Array.isArray(list) || list.length === 0) return;
  var sheet = ss.getSheetByName('BangXepHang');
  if (!sheet) return;

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 11).clearContent();
  }

  var rows = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var rank = Number(item.rank) || (i + 1);
    var code = String(item.customer_code || item.code || ('ERK-KH-' + (8800 + i))).trim().toUpperCase();
    var name = String(item.customer_name || '').trim();
    var origName = String(item.original_name || name).trim();
    var vip = String(item.vip_tier || 'VIP PRO').trim();
    var orders = Number(item.order_count) || 0;
    var weightKg = Number(item.weight_kg) || 0;
    var volM3 = Number(item.volume_m3) || 0;

    if (weightKg === 0 && item.volume_weight) {
      var p1 = String(item.volume_weight).split('|')[0] || '';
      var m1 = p1.replace(',', '.').match(/([\d.]+)\s*(tấn|kg|t)/i);
      if (m1) {
        var num1 = parseFloat(m1[1]);
        weightKg = m1[2].toLowerCase().indexOf('t') !== -1 ? Math.round(num1 * 1000) : Math.round(num1);
      }
    }
    if (volM3 === 0 && item.volume_weight) {
      var p2 = String(item.volume_weight).split('|')[1] || String(item.volume_weight);
      var m2 = p2.replace(',', '.').match(/([\d.]+)\s*(m³|m3|cbm)/i);
      if (m2) volM3 = parseFloat(m2[1]);
    }

    var fee = Number(item.service_fee) || 0;
    var prize = String(item.prize_tag || '').trim();

    rows.push([
      rank,
      code,
      name,
      origName,
      vip,
      orders,
      weightKg,
      volM3,
      fee,
      prize,
      formatDate(new Date())
    ]);
  }

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 11).setValues(rows);
  }
}

// 5. SHEET 'CaiDatChung'
function readGeneralSettingsFromSheet(ss) {
  var sheet = ss.getSheetByName('CaiDatChung');
  var settings = {};
  if (!sheet || sheet.getLastRow() < 2) return settings;

  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  for (var i = 0; i < data.length; i++) {
    var key = String(data[i][0]).trim();
    var valStr = String(data[i][1]).trim();
    if (key && valStr) {
      try {
        settings[key] = JSON.parse(valStr);
      } catch (e) {
        // Nếu là danh sách mã booking cách nhau bằng dấu phẩy
        if (key.indexOf('booking_pool') !== -1 && valStr.indexOf(',') !== -1) {
          settings[key] = valStr.split(/[\r\n,;]+/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; });
        } else {
          settings[key] = valStr;
        }
      }
    }
  }
  return settings;
}

function writeGeneralSettingToSheet(ss, key, val) {
  var sheet = ss.getSheetByName('CaiDatChung');
  if (!sheet) return;

  var valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);

  var foundRow = -1;
  if (sheet.getLastRow() > 1) {
    var keys = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    for (var r = 0; r < keys.length; r++) {
      if (keys[r][0] === key) {
        foundRow = r + 2;
        break;
      }
    }
  }

  if (foundRow > 0) {
    sheet.getRange(foundRow, 2).setValue(valStr);
    sheet.getRange(foundRow, 4).setValue(formatDate(new Date()));
  } else {
    sheet.appendRow([key, valStr, 'Cài đặt hệ thống', formatDate(new Date())]);
  }
}

// 6. SHEET 'VongQuayMayMan' (Leads)
function readSpinLeadsFromSheet(ss) {
  var sheet = ss.getSheetByName('VongQuayMayMan');
  var spinLeads = [];
  var lockedPhones = [];
  if (!sheet || sheet.getLastRow() < 2) return { spinLeads: spinLeads, lockedPhones: lockedPhones };

  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
  for (var i = data.length - 1; i >= 0; i--) {
    var row = data[i];
    if (row[1]) {
      var phoneStr = String(row[1]).trim().replace(/^'/, '');
      spinLeads.push({
        id: 'L-' + (i + 1),
        createdAt: formatDate(row[0]),
        phone: phoneStr,
        voucherCode: String(row[2] || ''),
        prize: String(row[3] || ''),
        ref: String(row[4] || 'direct'),
        status: String(row[5] || 'Chờ áp dụng')
      });
      lockedPhones.push(phoneStr);
    }
  }
  return { spinLeads: spinLeads, lockedPhones: lockedPhones };
}

function writeSpinLeadsToSheet(ss, leads) {
  var sheet = ss.getSheetByName('VongQuayMayMan');
  if (!sheet || !Array.isArray(leads)) return;

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).clearContent();
  }

  var rows = [];
  leads.forEach(function(l) {
    rows.push([
      l.createdAt || new Date(),
      "'" + String(l.phone || '').trim().replace(/^'/, ''),
      l.voucherCode || '',
      l.prize || '',
      l.ref || 'direct',
      l.status || 'Chờ áp dụng qua Zalo'
    ]);
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }
}

// 7. SHEET 'VongQuayM05'
function readM05WinnersFromSheet(ss) {
  var sheet = ss.getSheetByName('VongQuayM05');
  var winners = [];
  if (!sheet || sheet.getLastRow() < 2) return winners;

  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
  for (var j = data.length - 1; j >= 0; j--) {
    var r = data[j];
    if (r[2]) {
      winners.push({
        id: 'W-' + (j + 1),
        draw_time: formatDate(r[0]),
        period: String(r[1] || ''),
        booking_code: String(r[2] || ''),
        prize: String(r[3] || ''),
        status: String(r[4] || '✅ Đã ghi nhận')
      });
    }
  }
  return winners;
}

function writeM05WinnersToSheet(ss, winners) {
  var sheet = ss.getSheetByName('VongQuayM05');
  if (!sheet || !Array.isArray(winners)) return;

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).clearContent();
  }

  var rows = [];
  winners.forEach(function(w) {
    rows.push([
      w.draw_time || new Date(),
      w.period || '',
      w.booking_code || '',
      w.prize || '',
      w.status || '✅ Đã ghi nhận'
    ]);
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 5).setValues(rows);
  }
}

// 8. SHEET 'LichSuChinhSua' (AUDIT LOG - CHỈ GHI NHẬN LỊCH SỬ THAY ĐỔI)
function logChangeHistory(ss, category, action, details, actor) {
  try {
    var sheet = ss.getSheetByName('LichSuChinhSua');
    if (!sheet) {
      sheet = ss.insertSheet('LichSuChinhSua');
      sheet.appendRow(['Thời Gian Sửa', 'Hạng Mục', 'Hành Động / Thay Đổi', 'Chi Tiết Dữ Liệu', 'Người Thực Hiện / Nguồn']);
      var h = sheet.getRange(1, 1, 1, 5);
      h.setBackground('#0f172a').setFontColor('#38bdf8').setFontWeight('bold');
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(1, 160);
      sheet.setColumnWidth(2, 180);
      sheet.setColumnWidth(3, 220);
      sheet.setColumnWidth(4, 350);
      sheet.setColumnWidth(5, 160);
    }

    sheet.appendRow([
      formatDate(new Date()),
      String(category || 'Chung'),
      String(action || 'Cập nhật'),
      String(details || ''),
      String(actor || 'Admin Website')
    ]);
  } catch (e) {
    // Không làm gián đoạn luồng chính nếu lỗi ghi log
  }
}

// =========================================================================
// KHỞI TẠO CÁC SHEET CHUYÊN BIỆT & TỰ ĐỘNG DI CHUYỂN DỮ LIỆU CŨ (AUTO-MIGRATION)
// =========================================================================
function initDatabaseSheets(ss) {
  // 1. Sheet CauHinhBotTelegram
  var sBot = ss.getSheetByName('CauHinhBotTelegram');
  if (!sBot) {
    sBot = ss.insertSheet('CauHinhBotTelegram');
    sBot.appendRow(['Kênh Nhận Tin', 'Trạng Thái', 'Token / URL Webhook', 'Chat ID / Nhóm Nhận', 'Ghi Chú Hướng Dẫn', 'Thời Gian Cập Nhật']);
    var hBot = sBot.getRange(1, 1, 1, 6);
    hBot.setBackground('#0f172a').setFontColor('#38bdf8').setFontWeight('bold');
    sBot.setFrozenRows(1);
    sBot.setColumnWidth(1, 150);
    sBot.setColumnWidth(2, 100);
    sBot.setColumnWidth(3, 300);
    sBot.setColumnWidth(4, 180);
    sBot.setColumnWidth(5, 300);
    sBot.setColumnWidth(6, 160);

    var defaultBotRows = [
      ['Telegram Bot', 'TẮT', '', '', 'Điền Bot Token & Chat ID để nhận thông báo tức thời khi khách quay quà', formatDate(new Date())],
      ['Webhook Endpoint', 'TẮT', '', '', 'Endpoint HTTP nhận dữ liệu JSON payload khách quay thưởng', formatDate(new Date())]
    ];
    sBot.getRange(2, 1, 2, 6).setValues(defaultBotRows);
  }

  // 2. Sheet CauHinhVongQuay (8 Ô giải thưởng)
  var sWheel = ss.getSheetByName('CauHinhVongQuay');
  if (!sWheel) {
    sWheel = ss.insertSheet('CauHinhVongQuay');
    sWheel.appendRow(['Ô Số (STT)', 'Nhãn Hiển Thị Nan Quạt', 'Tên Phần Thưởng Trao Cho Khách', 'Tỉ Lệ Trúng (%)', 'Số Lượng Trong Kho', 'Mã Màu Nan Quạt', 'Màu Chữ', 'Thời Gian Cập Nhật']);
    var h = sWheel.getRange(1, 1, 1, 8);
    h.setBackground('#0f172a').setFontColor('#f59e0b').setFontWeight('bold');
    sWheel.setFrozenRows(1);
    sWheel.setColumnWidth(1, 80);
    sWheel.setColumnWidth(2, 220);
    sWheel.setColumnWidth(3, 260);
    sWheel.setColumnWidth(4, 120);
    sWheel.setColumnWidth(5, 140);
    sWheel.setColumnWidth(6, 120);
    sWheel.setColumnWidth(7, 100);
    sWheel.setColumnWidth(8, 160);

    var defaultSlots = [
      [1, 'GIẢM GIÁ 10% CƯỚC', 'Giảm giá 10% chi phí vận chuyển', 100, 9999, '#ea580c', '#FFFFFF', formatDate(new Date())],
      [2, 'VOUCHER 300K', 'Voucher Chiết Khấu 300.000 đ', 0, 25, '#1e293b', '#FBBF24', formatDate(new Date())],
      [3, 'ƯU TIÊN XẾP CONT', 'Vé Ưu Tiên Xếp Cont Sớm', 0, 18, '#f59e0b', '#0F172A', formatDate(new Date())],
      [4, 'GIẢM 50% LƯU KHO', 'Giảm 50% Phí Lưu Kho Bãi', 0, 15, '#0f172a', '#FFFFFF', formatDate(new Date())],
      [5, 'VOUCHER 300K', 'Voucher Chiết Khấu 300.000 đ', 0, 20, '#ea580c', '#FFFFFF', formatDate(new Date())],
      [6, 'GÓI SQUAD 2-IN-1', 'Gói Hỗ Trợ Squad 2-in-1', 0, 11, '#1e293b', '#38BDF8', formatDate(new Date())],
      [7, 'VOUCHER 400K', 'Voucher 400.000 đ Lộc Xuân', 0, 10, '#f59e0b', '#0F172A', formatDate(new Date())],
      [8, 'MAY MẮN LẦN SAU', 'Vé Tích Lũy Quay Mùng 05', 0, 999, '#0f172a', '#94A3B8', formatDate(new Date())]
    ];
    sWheel.getRange(2, 1, defaultSlots.length, 8).setValues(defaultSlots);
  }

  // 3. Sheet NhiemVuHeThong
  var sNV = ss.getSheetByName('NhiemVuHeThong');
  if (!sNV) {
    sNV = ss.insertSheet('NhiemVuHeThong');
    sNV.appendRow(['Mã Chặng', 'Tên Chặng', 'Thời Gian Diễn Ra', 'Phần Thưởng Đạt Chuẩn', 'Điều Kiện Hoàn Thành', 'Danh Sách Mã KH (Mỗi dòng 1 mã)', 'Trạng Thái Hiển Thị', 'Thời Gian Cập Nhật']);
    var hNV = sNV.getRange(1, 1, 1, 8);
    hNV.setBackground('#0f172a').setFontColor('#34d399').setFontWeight('bold');
    sNV.setFrozenRows(1);
    sNV.setColumnWidth(1, 110);
    sNV.setColumnWidth(2, 200);
    sNV.setColumnWidth(3, 130);
    sNV.setColumnWidth(4, 200);
    sNV.setColumnWidth(5, 200);
    sNV.setColumnWidth(6, 250);
    sNV.setColumnWidth(7, 160);
    sNV.setColumnWidth(8, 160);
  }

  // 4. Sheet BangXepHang
  var sBXH = ss.getSheetByName('BangXepHang');
  if (!sBXH) {
    sBXH = ss.insertSheet('BangXepHang');
    sBXH.appendRow(['Hạng', 'Mã Khách Hàng', 'Tên Khách Hàng (Bảo Mật)', 'Tên Doanh Nghiệp Gốc', 'Hạng VIP', 'Tổng Đơn', 'Tải Trọng (Kg)', 'Thể Tích (M³)', 'Phí Dịch Vụ (VNĐ)', 'Quà Tạm Tính / Giải Thưởng', 'Thời Gian Cập Nhật']);
    var hBXH = sBXH.getRange(1, 1, 1, 11);
    hBXH.setBackground('#0f172a').setFontColor('#fbbf24').setFontWeight('bold');
    sBXH.setFrozenRows(1);
    sBXH.setColumnWidth(1, 60);
    sBXH.setColumnWidth(2, 130);
    sBXH.setColumnWidth(3, 220);
    sBXH.setColumnWidth(4, 220);
    sBXH.setColumnWidth(5, 110);
    sBXH.setColumnWidth(6, 90);
    sBXH.setColumnWidth(7, 130);
    sBXH.setColumnWidth(8, 130);
    sBXH.setColumnWidth(9, 150);
    sBXH.setColumnWidth(10, 220);
    sBXH.setColumnWidth(11, 160);
  }

  // 5. Sheet CaiDatChung
  var sCaiDat = ss.getSheetByName('CaiDatChung');
  if (!sCaiDat) {
    sCaiDat = ss.insertSheet('CaiDatChung');
    sCaiDat.appendRow(['Tên Cài Đặt (Key)', 'Giá Trị (Value)', 'Mô Tả Chức Năng', 'Thời Gian Cập Nhật']);
    var hCD = sCaiDat.getRange(1, 1, 1, 4);
    hCD.setBackground('#0f172a').setFontColor('#f43f5e').setFontWeight('bold');
    sCaiDat.setFrozenRows(1);
    sCaiDat.setColumnWidth(1, 240);
    sCaiDat.setColumnWidth(2, 350);
    sCaiDat.setColumnWidth(3, 300);
    sCaiDat.setColumnWidth(4, 160);
  }

  // 6. Sheet VongQuayMayMan
  var sLeads = ss.getSheetByName('VongQuayMayMan');
  if (!sLeads) {
    sLeads = ss.insertSheet('VongQuayMayMan');
    sLeads.appendRow(['Thời Gian Quay', 'Số Điện Thoại', 'Mã Voucher', 'Giải Thưởng Trúng', 'Nguồn Giới Thiệu', 'Trạng Thái Chăm Sóc']);
    var hL = sLeads.getRange(1, 1, 1, 6);
    hL.setBackground('#0f172a').setFontColor('#38bdf8').setFontWeight('bold');
    sLeads.setFrozenRows(1);
    sLeads.setColumnWidth(1, 160);
    sLeads.setColumnWidth(2, 130);
    sLeads.setColumnWidth(3, 130);
    sLeads.setColumnWidth(4, 240);
    sLeads.setColumnWidth(5, 140);
    sLeads.setColumnWidth(6, 170);
  }

  // 7. Sheet VongQuayM05
  var sM05 = ss.getSheetByName('VongQuayM05');
  if (!sM05) {
    sM05 = ss.insertSheet('VongQuayM05');
    sM05.appendRow(['Thời Gian Quay', 'Kỳ Quay Thưởng', 'Mã Booking Trúng Thưởng', 'Giải Thưởng Tri Ân', 'Trạng Thái']);
    var hM = sM05.getRange(1, 1, 1, 5);
    hM.setBackground('#0f172a').setFontColor('#fbbf24').setFontWeight('bold');
    sM05.setFrozenRows(1);
    sM05.setColumnWidth(1, 160);
    sM05.setColumnWidth(2, 160);
    sM05.setColumnWidth(3, 180);
    sM05.setColumnWidth(4, 240);
    sM05.setColumnWidth(5, 160);
  }

  // 8. Sheet LichSuChinhSua
  var sLog = ss.getSheetByName('LichSuChinhSua');
  if (!sLog) {
    sLog = ss.insertSheet('LichSuChinhSua');
    sLog.appendRow(['Thời Gian Sửa', 'Hạng Mục', 'Hành Động / Thay Đổi', 'Chi Tiết Dữ Liệu', 'Người Thực Hiện / Nguồn']);
    var hLog = sLog.getRange(1, 1, 1, 5);
    hLog.setBackground('#0f172a').setFontColor('#38bdf8').setFontWeight('bold');
    sLog.setFrozenRows(1);
    sLog.setColumnWidth(1, 160);
    sLog.setColumnWidth(2, 180);
    sLog.setColumnWidth(3, 220);
    sLog.setColumnWidth(4, 350);
    sLog.setColumnWidth(5, 160);
  }

  // TỰ ĐỘNG DI CHUYỂN DỮ LIỆU TỪ ADMINCONFIG CŨ SANG TỪNG SHEET CHUYÊN BIỆT (NẾU CÓ)
  migrateLegacyAdminConfig(ss);

  // TỰ ĐỘNG DỌN DẸP / XÓA CÁC SHEET THỪA KHÔNG CÒN SỬ DỤNG
  cleanupUnusedSheets(ss);
}

// Tự động di chuyển dữ liệu từ AdminConfig sang từng Sheet chuyên biệt
function migrateLegacyAdminConfig(ss) {
  var oldSheet = ss.getSheetByName('AdminConfig');
  if (!oldSheet || oldSheet.getLastRow() < 2) return;

  try {
    var oldData = oldSheet.getRange(2, 1, oldSheet.getLastRow() - 1, 2).getValues();
    var configs = {};
    for (var i = 0; i < oldData.length; i++) {
      var k = String(oldData[i][0]).trim();
      var v = String(oldData[i][1]).trim();
      if (k && v) {
        try { configs[k] = JSON.parse(v); } catch (e) { configs[k] = v; }
      }
    }

    // Di chuyển Bot config sang CauHinhBotTelegram nếu sheet đang trống
    var sBot = ss.getSheetByName('CauHinhBotTelegram');
    if (sBot && configs['eureka_bot_config']) {
      var currentBot = readBotConfigFromSheet(ss);
      if (!currentBot || (!currentBot.telegram_token && !currentBot.webhook_url)) {
        writeBotConfigToSheet(ss, configs['eureka_bot_config']);
      }
    }

    // Di chuyển Vòng quay sang CauHinhVongQuay nếu có dữ liệu tùy chỉnh
    if (configs['eureka_welcome_wheel_config'] && Array.isArray(configs['eureka_welcome_wheel_config'])) {
      var currentWheel = readWheelConfigFromSheet(ss);
      if (!currentWheel || currentWheel.length === 0) {
        writeWheelConfigToSheet(ss, configs['eureka_welcome_wheel_config']);
      }
    }

    // Di chuyển Cài Đặt Chung
    var keys = ['eureka_admin_password_custom', 'eureka_gala_awards_config', 'eureka_weekly_winner', 'eureka_m05_booking_pool', 'eureka_m05_current_prize', 'eureka_ref_clicks'];
    keys.forEach(function(key) {
      if (configs[key] !== undefined) {
        writeGeneralSettingToSheet(ss, key, configs[key]);
      }
    });

    logChangeHistory(ss, 'Di Chuyển Dữ Liệu', 'Tự động di chuyển từ AdminConfig cũ', 'Đã chuyển thành công cấu hình sang các sheet chuyên biệt', 'Hệ Thống Cloud v4.0');

    // Sau khi migrate, nếu đã có LichSuChinhSua thì xóa AdminConfig cũ đi
    if (ss.getSheetByName('LichSuChinhSua') && ss.getSheets().length > 1) {
      ss.deleteSheet(oldSheet);
    } else {
      oldSheet.setName('LichSuChinhSua');
      oldSheet.clear();
      oldSheet.appendRow(['Thời Gian Sửa', 'Hạng Mục', 'Hành Động / Thay Đổi', 'Chi Tiết Dữ Liệu', 'Người Thực Hiện / Nguồn']);
      var h = oldSheet.getRange(1, 1, 1, 5);
      h.setBackground('#0f172a').setFontColor('#38bdf8').setFontWeight('bold');
    }
  } catch (err) {
    // Không gián đoạn nếu migration có lỗi
  }
}

// TỰ ĐỘNG DỌN DẸP / XÓA CÁC SHEET KHÔNG CÒN SỬ DỤNG
function cleanupUnusedSheets(ss) {
  var validSheets = [
    'CauHinhBotTelegram',
    'CauHinhVongQuay',
    'NhiemVuHeThong',
    'BangXepHang',
    'CaiDatChung',
    'VongQuayMayMan',
    'VongQuayM05',
    'LichSuChinhSua'
  ];
  var allSheets = ss.getSheets();
  allSheets.forEach(function(sh) {
    var name = sh.getName();
    // Nếu sheet không thuộc 8 sheet chuẩn nêu trên và ss còn nhiều hơn 1 sheet
    if (validSheets.indexOf(name) === -1 && ss.getSheets().length > 1) {
      try {
        ss.deleteSheet(sh);
        logChangeHistory(ss, 'Dọn Dẹp Sheet', 'Xóa sheet thừa', 'Đã tự động xóa sheet không còn sử dụng: ' + name, 'Hệ Thống Cloud v4.0');
      } catch (e) {}
    }
  });
}

// Bóc tách số an toàn từ ô Google Sheets (hỗ trợ cả text có chữ "kg", "tấn", "m³", "%", dấu chấm, dấu phẩy)
function parseSheetNumber(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  var str = String(val).trim().replace(/[%\s₫đvnđVNĐ]/g, '');
  // Nếu có dấu phân cách nghìn kiểu Việt Nam: 428.650.000 -> 428650000
  if (/^\d{1,3}(\.\d{3})+$/.test(str)) {
    str = str.replace(/\./g, '');
  } else if (/^\d{1,3}(,\d{3})+$/.test(str)) {
    str = str.replace(/,/g, '');
  } else {
    str = str.replace(',', '.');
  }
  var num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'HH:mm - dd/MM/yyyy');
  }
  return String(val);
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
