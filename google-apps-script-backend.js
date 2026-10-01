/**
 * =========================================================================
 * GOOGLE APPS SCRIPT CLOUD DATABASE v3.0 - EUREKA CUSTOMER AWARDS 2026
 * HỆ THỐNG QUẢN LÝ DỮ LIỆU ĐỘC LẬP TỪNG SHEET CHUYÊN BIỆT:
 * 1. Sheet 'CauHinhVongQuay': Quản lý 8 ô giải thưởng, nhãn, tỉ lệ %, kho quà.
 * 2. Sheet 'CauHinhBotTelegram': Quản lý Telegram Bot Token, Chat ID, Webhook.
 * 3. Sheet 'NhiemVuHeThong': Quản lý Chặng 1, 2, 3 và Danh sách Mã KH hoàn thành.
 * 4. Sheet 'CaiDatChung': Quản lý Mật khẩu Admin, Bật/Tắt Gala, Top Tuần, Giải M05.
 * 5. Sheet 'BangXepHang': Quản lý 25+ khách hàng đua top doanh số (Cân & Khối riêng).
 * 6. Sheet 'VongQuayMayMan': Lưu lịch sử SĐT khách quay nhận Voucher.
 * 7. Sheet 'VongQuayM05': Lưu lịch sử mã booking trúng thưởng Vòng Quay Mùng 05.
 * =========================================================================
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAllData';

  if (action === 'ping') {
    return jsonOutput({
      status: 'ok',
      message: 'Kết nối Google Sheets Cloud Database thành công!',
      timestamp: new Date().toISOString()
    });
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    initDatabaseSheets(ss);

    // 1. Đọc Cấu hình Vòng Quay May Mắn từ Sheet riêng: CauHinhVongQuay
    var wheelConfig = readWheelConfigFromSheet(ss);

    // 2. Đọc Cấu hình Telegram Bot & Webhook từ Sheet riêng: CauHinhBotTelegram
    var botConfig = readBotConfigFromSheet(ss);

    // 3. Đọc Cấu hình Nhiệm Vụ Hệ Thống từ Sheet riêng: NhiemVuHeThong
    var nhiemVuConfig = readNhiemVuConfigFromSheet(ss);

    // 4. Đọc Cài Đặt Chung từ Sheet riêng: CaiDatChung
    var generalSettings = readGeneralSettingsFromSheet(ss);

    // 5. Đọc Bảng Xếp Hạng Doanh Số từ Sheet riêng: BangXepHang
    var customLeaderboard = readLeaderboardFromSheet(ss);

    // 6. Đọc Lịch Sử Khách Quay từ Sheet riêng: VongQuayMayMan
    var spinData = readSpinLeadsFromSheet(ss);

    // 7. Đọc Danh Sách Trúng Thưởng M05 từ Sheet riêng: VongQuayM05
    var monthlyWinners = readM05WinnersFromSheet(ss);

    return jsonOutput({
      status: 'success',
      data: {
        wheelConfig: wheelConfig,
        botConfig: botConfig,
        nhiemVuConfig: nhiemVuConfig,
        customLeaderboard: customLeaderboard,
        spinLeads: spinData.spinLeads,
        lockedPhones: spinData.lockedPhones,
        monthlyWinners: monthlyWinners,
        adminPassword: generalSettings.admin_password || '',
        galaConfig: generalSettings.gala_config || null,
        weeklyWinner: generalSettings.weekly_winner || null,
        m05BookingPool: generalSettings.m05_booking_pool || null,
        m05CurrentPrize: generalSettings.m05_current_prize || '',
        refClicks: generalSettings.ref_clicks || null
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

    // 1. Lưu Cấu Hình Vòng Quay vào Sheet riêng 'CauHinhVongQuay'
    if (action === 'save_wheel_config' || (action === 'save_config' && payload.key === 'eureka_welcome_wheel_config')) {
      var segments = payload.wheelConfig || payload.value || [];
      if (Array.isArray(segments) && segments.length > 0) {
        writeWheelConfigToSheet(ss, segments);
        return jsonOutput({ status: 'success', message: 'Đã lưu cấu hình Vòng Quay vào Sheet CauHinhVongQuay' });
      }
    }

    // 2. Lưu Cấu Hình Bot & Webhook vào Sheet riêng 'CauHinhBotTelegram'
    if (action === 'save_bot_config' || (action === 'save_config' && payload.key === 'eureka_bot_config')) {
      var bConfig = payload.botConfig || payload.value || {};
      writeBotConfigToSheet(ss, bConfig);
      return jsonOutput({ status: 'success', message: 'Đã lưu cấu hình Bot vào Sheet CauHinhBotTelegram' });
    }

    // 3. Lưu Cấu Hình Nhiệm Vụ Hệ Thống vào Sheet riêng 'NhiemVuHeThong'
    if (action === 'save_nhiem_vu' || (action === 'save_config' && payload.key === 'eureka_nhiem_vu_config')) {
      var nvConfig = payload.nhiemVuConfig || payload.value || {};
      writeNhiemVuConfigToSheet(ss, nvConfig);
      return jsonOutput({ status: 'success', message: 'Đã lưu cấu hình Nhiệm Vụ vào Sheet NhiemVuHeThong' });
    }

    // 4. Lưu Bảng Xếp Hạng Doanh Số vào Sheet riêng 'BangXepHang'
    if (action === 'sync_leaderboard' || (action === 'save_config' && payload.key === 'eureka_custom_leaderboard')) {
      var lbList = payload.leaderboard || payload.value || [];
      if (Array.isArray(lbList)) {
        writeLeaderboardToSheet(ss, lbList);
        return jsonOutput({ status: 'success', message: 'Đã lưu ' + lbList.length + ' khách hàng vào Sheet BangXepHang' });
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

      // Đồng thời tự động trừ 1 số lượng kho trong Sheet 'CauHinhVongQuay' nếu tìm thấy phần thưởng tương ứng
      decrementWheelStock(ss, lead.prize);

      return jsonOutput({ status: 'success', message: 'Đã lưu lead khách quay và cập nhật kho quà' });
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
      return jsonOutput({ status: 'success', message: 'Đã lưu kết quả quay M05' });
    }

    // 7. Lưu Cài Đặt Chung (Mật khẩu Admin, Gala, Top Tuần...) vào Sheet 'CaiDatChung'
    if (action === 'save_general_setting' || action === 'save_config') {
      var key = payload.key;
      var val = payload.value;
      writeGeneralSettingToSheet(ss, key, val);
      return jsonOutput({ status: 'success', message: 'Đã lưu cài đặt ' + key + ' vào Sheet CaiDatChung' });
    }

    // 8. Đẩy toàn bộ dữ liệu máy lên Cloud (One-Click Sync All)
    if (action === 'sync_all') {
      var all = payload.data || {};

      if (all.wheelConfig && Array.isArray(all.wheelConfig)) {
        writeWheelConfigToSheet(ss, all.wheelConfig);
      }
      if (all.botConfig && typeof all.botConfig === 'object') {
        writeBotConfigToSheet(ss, all.botConfig);
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

      // Lưu các cài đặt còn lại vào CaiDatChung
      if (all.adminPasswordCustom !== undefined) writeGeneralSettingToSheet(ss, 'eureka_admin_password_custom', all.adminPasswordCustom);
      if (all.galaConfig) writeGeneralSettingToSheet(ss, 'eureka_gala_awards_config', all.galaConfig);
      if (all.weeklyWinner) writeGeneralSettingToSheet(ss, 'eureka_weekly_winner', all.weeklyWinner);
      if (all.m05BookingPool) writeGeneralSettingToSheet(ss, 'eureka_m05_booking_pool', all.m05BookingPool);
      if (all.m05CurrentPrize) writeGeneralSettingToSheet(ss, 'eureka_m05_current_prize', all.m05CurrentPrize);
      if (all.refClicks) writeGeneralSettingToSheet(ss, 'eureka_ref_clicks', all.refClicks);

      return jsonOutput({ status: 'success', message: 'Đã đồng bộ toàn bộ dữ liệu vào từng Sheet riêng biệt thành công!' });
    }

    return jsonOutput({ status: 'ignored', message: 'Action không xác định: ' + action });
  } catch (err) {
    return jsonOutput({ status: 'error', message: err.toString() });
  }
}

// =========================================================================
// CÁC HÀM XỬ LÝ ĐỌC / GHI CHO TỪNG SHEET CHUYÊN BIỆT
// =========================================================================

// 1. SHEET 'CauHinhVongQuay'
function readWheelConfigFromSheet(ss) {
  var sheet = ss.getSheetByName('CauHinhVongQuay');
  if (!sheet || sheet.getLastRow() < 2) return null;

  var data = sheet.getRange(2, 1, Math.min(sheet.getLastRow() - 1, 8), 7).getValues();
  var segments = [];
  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    segments.push({
      id: Number(r[0]) || (i + 1),
      text: String(r[1] || '').trim(),
      prize: String(r[2] || '').trim(),
      probability_weight: Number(r[3]) || 0,
      stock_quantity: Number(r[4]) || 0,
      color: String(r[5] || '#1e293b').trim(),
      textColor: String(r[6] || '#FFFFFF').trim()
    });
  }
  return segments.length === 8 ? segments : null;
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

  sheet.getRange(2, 1, rows.length, 8).setValues(rows);
}

function decrementWheelStock(ss, prizeName) {
  if (!prizeName) return;
  var sheet = ss.getSheetByName('CauHinhVongQuay');
  if (!sheet || sheet.getLastRow() < 2) return;

  var data = sheet.getRange(2, 3, sheet.getLastRow() - 1, 3).getValues();
  for (var i = 0; i < data.length; i++) {
    var pName = String(data[i][0]).trim();
    if (pName === prizeName || prizeName.includes(pName) || pName.includes(prizeName)) {
      var currentStock = Number(data[i][2]) || 0;
      if (currentStock > 0) {
        sheet.getRange(i + 2, 5).setValue(currentStock - 1);
        sheet.getRange(i + 2, 8).setValue(formatDate(new Date()));
      }
      break;
    }
  }
}

// 2. SHEET 'CauHinhBotTelegram'
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
    var channel = String(data[i][0]).toLowerCase();
    var status = String(data[i][1]).toUpperCase();
    var val1 = String(data[i][2] || '').trim();
    var val2 = String(data[i][3] || '').trim();

    if (channel.includes('telegram')) {
      config.telegram_enabled = (status === 'BẬT' || status === 'TRUE' || status === '1');
      config.telegram_token = val1;
      config.telegram_chat_id = val2;
    } else if (channel.includes('webhook')) {
      config.webhook_enabled = (status === 'BẬT' || status === 'TRUE' || status === '1');
      config.webhook_url = val1;
    }
  }
  return config;
}

function writeBotConfigToSheet(ss, config) {
  var sheet = ss.getSheetByName('CauHinhBotTelegram');
  if (!sheet) return;

  var rows = [
    [
      'Telegram Bot',
      config.telegram_enabled ? 'BẬT' : 'TẮT',
      String(config.telegram_token || '').trim(),
      String(config.telegram_chat_id || '').trim(),
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

// 3. SHEET 'NhiemVuHeThong'
function readNhiemVuConfigFromSheet(ss) {
  var sheet = ss.getSheetByName('NhiemVuHeThong');
  if (!sheet || sheet.getLastRow() < 2) return null;

  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
  var config = {
    active_mode: 'chang-1',
    chang_1: { customer_codes: [] },
    chang_2: { customer_codes: [] },
    chang_3: { customer_codes: [] },
    tong_ket: { customer_codes: [] }
  };

  for (var i = 0; i < data.length; i++) {
    var key = String(data[i][0]).trim();
    var time = String(data[i][2] || '').trim();
    var reward = String(data[i][3] || '').trim();
    var condition = String(data[i][4] || '').trim();
    var rawCodes = String(data[i][5] || '').trim();
    var isCurrentMode = String(data[i][6] || '').toUpperCase().includes('ĐANG');

    var codeList = rawCodes.split(/[\r\n,]+/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; });

    if (isCurrentMode) {
      config.active_mode = key.replace('_', '-');
    }

    if (config[key]) {
      config[key] = {
        time_range: time,
        time_window: time,
        reward: reward,
        condition: condition,
        customer_codes: codeList
      };
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

// 4. SHEET 'CaiDatChung'
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
        settings[key] = valStr;
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

// 5. SHEET 'BangXepHang'
function readLeaderboardFromSheet(ss) {
  var sheet = ss.getSheetByName('BangXepHang');
  var list = [];
  if (!sheet || sheet.getLastRow() < 2) return list;

  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues();
  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    if (r[1]) {
      var rank = Number(r[0]) || (i + 1);
      var w = Number(r[6]) || 0;
      var v = Number(r[7]) || 0;
      var vwStr = '';
      if (w > 0 && v > 0) {
        var wTon = (w / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
        var vM3 = v.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
        vwStr = wTon + ' tấn | ' + vM3 + ' m³';
      }

      list.push({
        rank: rank,
        customer_code: String(r[1]).trim(),
        customer_name: String(r[2]).trim(),
        original_name: String(r[3] || r[2]).trim(),
        vip_tier: String(r[4] || 'VIP PRO').trim(),
        order_count: Number(r[5]) || 0,
        weight_kg: w,
        volume_m3: v,
        volume_weight: vwStr,
        service_fee: Number(r[8]) || 0,
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
        weightKg = m1[2].toLowerCase().includes('t') ? Math.round(num1 * 1000) : Math.round(num1);
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
      var phoneStr = String(row[1]).trim();
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
      "'" + String(l.phone || ''),
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

// =========================================================================
// KHỞI TẠO CÁC SHEET CHUYÊN BIỆT VỚI TIÊU ĐỀ & ĐỊNH DẠNG ĐẸP
// =========================================================================
function initDatabaseSheets(ss) {
  // 1. Sheet CauHinhVongQuay (8 Ô giải thưởng)
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

    // Điền 8 dòng mẫu khởi tạo
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

  // 2. Sheet CauHinhBotTelegram
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

  // 4. Sheet CaiDatChung
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

  // 5. Sheet BangXepHang
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
