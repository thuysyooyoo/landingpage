/**
 * =========================================================================
 * GOOGLE APPS SCRIPT DATABASE - EUREKA CUSTOMER AWARDS 2026
 * Hướng dẫn:
 * 1. Mở một Google Spreadsheet mới trên Google Drive của bạn.
 * 2. Đặt tên file: "Eureka Customer Awards 2026 - Database"
 * 3. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 4. Xóa hết code mặc định trong file Code.gs và DÁN TOÀN BỘ MÃ NÀY VÀO.
 * 5. Bấm nút "Lưu" (biểu tượng đĩa mềm 💾).
 * 6. Bấm "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment).
 *    - Chọn loại: "Ứng dụng web" (Web app).
 *    - Mô tả: "v2.0 Eureka Cloud DB - BangXepHang 2 Cot Can & Khoi".
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me).
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone).
 * 7. Bấm "Triển khai" -> Chọn tài khoản Google -> Chọn "Nâng cao" (Advanced) -> "Đi tới ... (không an toàn)" -> Bấm "Cho phép" (Allow).
 * 8. Copy đường dẫn "URL ứng dụng web" (kết thúc bằng /exec) và dán vào mục Quản Trị Website!
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

  // Mặc định: Lấy toàn bộ dữ liệu trả về cho Landing Page
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    initDatabaseSheets(ss);

    // 1. Lấy danh sách Spin Leads & Locked Phones
    var leadsSheet = ss.getSheetByName('VongQuayMayMan');
    var spinLeads = [];
    var lockedPhones = [];
    if (leadsSheet && leadsSheet.getLastRow() > 1) {
      var leadsData = leadsSheet.getRange(2, 1, leadsSheet.getLastRow() - 1, 6).getValues();
      for (var i = leadsData.length - 1; i >= 0; i--) { // Đảo ngược để mới nhất lên đầu
        var row = leadsData[i];
        if (row[1]) {
          var phoneStr = String(row[1]).trim();
          var leadObj = {
            id: 'L-' + (i + 1),
            createdAt: formatDate(row[0]),
            phone: phoneStr,
            voucherCode: String(row[2]),
            prize: String(row[3]),
            ref: String(row[4] || 'direct'),
            status: String(row[5] || 'Chờ áp dụng')
          };
          spinLeads.push(leadObj);
          lockedPhones.push(phoneStr);
        }
      }
    }

    // 2. Lấy danh sách Trúng Thưởng M05
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

    // 3. Lấy Cấu hình Admin từ Sheet AdminConfig
    var cfgSheet = ss.getSheetByName('AdminConfig');
    var configs = {};
    if (cfgSheet && cfgSheet.getLastRow() > 1) {
      var cfgData = cfgSheet.getRange(2, 1, cfgSheet.getLastRow() - 1, 2).getValues();
      for (var k = 0; k < cfgData.length; k++) {
        var key = String(cfgData[k][0]).trim();
        var valStr = String(cfgData[k][1]).trim();
        if (key && valStr) {
          try {
            configs[key] = JSON.parse(valStr);
          } catch (err) {
            configs[key] = valStr;
          }
        }
      }
    }

    // 4. Lấy BẢNG XẾP HẠNG (Ưu tiên đọc trực tiếp từ Sheet BangXepHang với 2 cột Cân & Khối riêng)
    var bxhSheet = ss.getSheetByName('BangXepHang');
    var customLeaderboard = [];
    if (bxhSheet && bxhSheet.getLastRow() > 1) {
      var bxhData = bxhSheet.getRange(2, 1, bxhSheet.getLastRow() - 1, 11).getValues();
      for (var b = 0; b < bxhData.length; b++) {
        var r = bxhData[b];
        if (r[1] || r[2]) {
          var rank = Number(r[0]) || (b + 1);
          var weightKg = Number(r[6]) || 0;
          var volumeM3 = Number(r[7]) || 0;
          var vwStr = (weightKg >= 1000 ? (weightKg / 1000).toFixed(1).replace('.', ',') + ' tấn' : weightKg + ' kg') + ' | ' + volumeM3 + ' m³';
          customLeaderboard.push({
            rank: rank,
            customer_code: String(r[1] || '').trim().toUpperCase(),
            customer_name: String(r[2] || '').trim(),
            original_name: String(r[3] || r[2] || '').trim(),
            vip_tier: String(r[4] || 'VIP PRO').trim(),
            order_count: Number(r[5]) || 0,
            weight_kg: weightKg,
            volume_m3: volumeM3,
            volume_weight: vwStr,
            service_fee: Number(r[8]) || 0,
            prize_tag: String(r[9] || '').trim(),
            prize_type: rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : 'regular'
          });
        }
      }
    }

    // Fallback nếu Sheet BangXepHang chưa có dữ liệu thì lấy từ AdminConfig
    if (customLeaderboard.length === 0 && configs['eureka_custom_leaderboard']) {
      customLeaderboard = configs['eureka_custom_leaderboard'];
    }

    return jsonOutput({
      status: 'success',
      data: {
        spinLeads: spinLeads,
        lockedPhones: lockedPhones,
        monthlyWinners: monthlyWinners,
        customLeaderboard: customLeaderboard && customLeaderboard.length > 0 ? customLeaderboard : null,
        nhiemVuConfig: configs['eureka_nhiem_vu_config'] || null,
        galaConfig: configs['eureka_gala_awards_config'] || null,
        weeklyWinner: configs['eureka_weekly_winner'] || null,
        botConfig: configs['eureka_bot_config'] || null,
        wheelConfig: configs['eureka_welcome_wheel_config'] || null,
        m05BookingPool: configs['eureka_m05_booking_pool'] || null,
        m05CurrentPrize: configs['eureka_m05_current_prize'] || null,
        refClicks: configs['eureka_ref_clicks'] || null,
        configs: configs
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

    // 1. Ghi nhận lượt quay Voucher trải nghiệm của khách
    if (action === 'record_spin_lead') {
      var lead = payload.lead || {};
      var leadsSheet = ss.getSheetByName('VongQuayMayMan');
      var phoneFormatted = "'" + String(lead.phone || '').trim(); // Dấu nháy đơn để giữ số 0 ở đầu
      leadsSheet.appendRow([
        new Date(),
        phoneFormatted,
        lead.voucherCode || '',
        lead.prize || '',
        lead.ref || 'direct',
        lead.status || 'Chờ áp dụng qua Zalo'
      ]);
      return jsonOutput({ status: 'success', message: 'Đã lưu lead' });
    }

    // 2. Ghi nhận mã booking trúng thưởng Vòng Quay M05
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
      return jsonOutput({ status: 'success', message: 'Đã lưu người trúng M05' });
    }

    // 3. Đồng bộ riêng Bảng Xếp Hạng với 2 cột Cân & Khối
    if (action === 'sync_leaderboard') {
      var lbList = payload.leaderboard || payload.data || [];
      if (Array.isArray(lbList)) {
        writeLeaderboardToSheet(ss, lbList);
        saveAdminConfigDirect(ss, 'eureka_custom_leaderboard', JSON.stringify(lbList));
        return jsonOutput({ status: 'success', message: 'Đã đồng bộ ' + lbList.length + ' khách hàng vào Sheet BangXepHang' });
      }
    }

    // 4. Lưu Cấu hình Admin (Nhiệm vụ, Gala, Top tuần...)
    if (action === 'save_config') {
      var cfgKey = payload.key;
      var cfgVal = JSON.stringify(payload.value);
      saveAdminConfigDirect(ss, cfgKey, cfgVal);

      // Nếu cấu hình lưu là Bảng Xếp Hạng -> Đồng bộ luôn vào Sheet BangXepHang
      if (cfgKey === 'eureka_custom_leaderboard' && Array.isArray(payload.value)) {
        writeLeaderboardToSheet(ss, payload.value);
      }

      return jsonOutput({ status: 'success', message: 'Đã lưu cấu hình ' + cfgKey });
    }

    // 5. Đồng bộ toàn bộ dữ liệu máy lên Cloud (One-Click Backup)
    if (action === 'sync_all') {
      var all = payload.data || {};

      // Đồng bộ leads
      if (all.spinLeads && Array.isArray(all.spinLeads)) {
        var lSheet = ss.getSheetByName('VongQuayMayMan');
        if (lSheet.getLastRow() > 1) {
          lSheet.getRange(2, 1, lSheet.getLastRow() - 1, 6).clearContent();
        }
        var leadRows = [];
        all.spinLeads.forEach(function(l) {
          leadRows.push([
            l.createdAt || new Date(),
            "'" + String(l.phone || ''),
            l.voucherCode || '',
            l.prize || '',
            l.ref || 'direct',
            l.status || 'Chờ áp dụng qua Zalo'
          ]);
        });
        if (leadRows.length > 0) {
          lSheet.getRange(2, 1, leadRows.length, 6).setValues(leadRows);
        }
      }

      // Đồng bộ M05 winners
      if (all.monthlyWinners && Array.isArray(all.monthlyWinners)) {
        var mSheet = ss.getSheetByName('VongQuayM05');
        if (mSheet.getLastRow() > 1) {
          mSheet.getRange(2, 1, mSheet.getLastRow() - 1, 5).clearContent();
        }
        var mRows = [];
        all.monthlyWinners.forEach(function(w) {
          mRows.push([
            w.draw_time || new Date(),
            w.period || '',
            w.booking_code || '',
            w.prize || '',
            w.status || '✅ Đã ghi nhận'
          ]);
        });
        if (mRows.length > 0) {
          mSheet.getRange(2, 1, mRows.length, 5).setValues(mRows);
        }
      }

      // Đồng bộ Bảng Xếp Hạng vào Sheet BangXepHang với 2 cột Cân & Khối
      if (all.customLeaderboard && Array.isArray(all.customLeaderboard)) {
        writeLeaderboardToSheet(ss, all.customLeaderboard);
      }

      // Đồng bộ Configs
      var cSheet = ss.getSheetByName('AdminConfig');
      var configItems = [
        ['eureka_nhiem_vu_config', JSON.stringify(all.nhiemVuConfig || {})],
        ['eureka_gala_awards_config', JSON.stringify(all.galaConfig || {})],
        ['eureka_weekly_winner', JSON.stringify(all.weeklyWinner || {})],
        ['eureka_custom_leaderboard', JSON.stringify(all.customLeaderboard || [])],
        ['eureka_bot_config', JSON.stringify(all.botConfig || {})],
        ['eureka_welcome_wheel_config', JSON.stringify(all.wheelConfig || [])],
        ['eureka_m05_booking_pool', JSON.stringify(all.m05BookingPool || [])],
        ['eureka_m05_current_prize', JSON.stringify(all.m05CurrentPrize || '')],
        ['eureka_ref_clicks', JSON.stringify(all.refClicks || {})]
      ];
      if (cSheet.getLastRow() > 1) {
        cSheet.getRange(2, 1, cSheet.getLastRow() - 1, 3).clearContent();
      }
      var cRows = configItems.map(function(item) {
        return [item[0], item[1], new Date()];
      });
      cSheet.getRange(2, 1, cRows.length, 3).setValues(cRows);

      return jsonOutput({ status: 'success', message: 'Đã đồng bộ toàn bộ lên Sheets (kèm Sheet BangXepHang)' });
    }

    return jsonOutput({ status: 'ignored', message: 'Action không xác định' });
  } catch (err) {
    return jsonOutput({ status: 'error', message: err.toString() });
  }
}

// Ghi mảng khách hàng vào Sheet BangXepHang với 2 cột độc lập
function writeLeaderboardToSheet(ss, list) {
  if (!Array.isArray(list) || list.length === 0) return;
  var bxhSheet = ss.getSheetByName('BangXepHang');
  if (!bxhSheet) return;

  // Xóa sạch nội dung cũ trừ hàng tiêu đề
  if (bxhSheet.getLastRow() > 1) {
    bxhSheet.getRange(2, 1, bxhSheet.getLastRow() - 1, 11).clearContent();
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

    // Fallback tự bóc tách nếu item chỉ có chuỗi volume_weight
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
    bxhSheet.getRange(2, 1, rows.length, 11).setValues(rows);
  }
}

// Lưu một cấu hình vào sheet AdminConfig
function saveAdminConfigDirect(ss, cfgKey, cfgVal) {
  var cfgSheet = ss.getSheetByName('AdminConfig');
  if (!cfgSheet) return;
  var foundRow = -1;
  if (cfgSheet.getLastRow() > 1) {
    var existingKeys = cfgSheet.getRange(2, 1, cfgSheet.getLastRow() - 1, 1).getValues();
    for (var r = 0; r < existingKeys.length; r++) {
      if (existingKeys[r][0] === cfgKey) {
        foundRow = r + 2;
        break;
      }
    }
  }
  if (foundRow > 0) {
    cfgSheet.getRange(foundRow, 2).setValue(cfgVal);
    cfgSheet.getRange(foundRow, 3).setValue(new Date());
  } else {
    cfgSheet.appendRow([cfgKey, cfgVal, new Date()]);
  }
}

// Khởi tạo các Sheet và tiêu đề nếu chưa có
function initDatabaseSheets(ss) {
  // 1. Sheet VongQuayMayMan
  var sheet1 = ss.getSheetByName('VongQuayMayMan');
  if (!sheet1) {
    sheet1 = ss.insertSheet('VongQuayMayMan');
    sheet1.appendRow(['Thời Gian Quay', 'Số Điện Thoại', 'Mã Voucher', 'Giải Thưởng Trúng', 'Nguồn Giới Thiệu', 'Trạng Thái Chăm Sóc']);
    var h1 = sheet1.getRange(1, 1, 1, 6);
    h1.setBackground('#1e293b').setFontColor('#38bdf8').setFontWeight('bold');
    sheet1.setFrozenRows(1);
    sheet1.setColumnWidth(1, 160);
    sheet1.setColumnWidth(2, 130);
    sheet1.setColumnWidth(3, 130);
    sheet1.setColumnWidth(4, 250);
    sheet1.setColumnWidth(5, 140);
    sheet1.setColumnWidth(6, 180);
  }

  // 2. Sheet VongQuayM05
  var sheet2 = ss.getSheetByName('VongQuayM05');
  if (!sheet2) {
    sheet2 = ss.insertSheet('VongQuayM05');
    sheet2.appendRow(['Thời Gian Quay', 'Kỳ Quay Thưởng', 'Mã Booking Trúng Thưởng', 'Giải Thưởng Tri Ân', 'Trạng Thái']);
    var h2 = sheet2.getRange(1, 1, 1, 5);
    h2.setBackground('#1e293b').setFontColor('#fbbf24').setFontWeight('bold');
    sheet2.setFrozenRows(1);
    sheet2.setColumnWidth(1, 160);
    sheet2.setColumnWidth(2, 180);
    sheet2.setColumnWidth(3, 180);
    sheet2.setColumnWidth(4, 250);
    sheet2.setColumnWidth(5, 180);
  }

  // 3. Sheet BangXepHang (Bảng Xếp Hạng Doanh Số với 2 cột Cân và Khối riêng biệt)
  var sheet4 = ss.getSheetByName('BangXepHang');
  if (!sheet4) {
    sheet4 = ss.insertSheet('BangXepHang');
    sheet4.appendRow([
      'Hạng',
      'Mã Khách Hàng',
      'Tên Khách Hàng (Bảo Mật)',
      'Tên Doanh Nghiệp Gốc',
      'Hạng VIP',
      'Tổng Đơn',
      'Tải Trọng (Kg)',
      'Thể Tích (M³)',
      'Phí Dịch Vụ (VNĐ)',
      'Quà Tạm Tính / Giải Thưởng',
      'Thời Gian Cập Nhật'
    ]);
    var h4 = sheet4.getRange(1, 1, 1, 11);
    h4.setBackground('#1e293b').setFontColor('#f59e0b').setFontWeight('bold');
    sheet4.setFrozenRows(1);
    sheet4.setColumnWidth(1, 70);   // Hạng
    sheet4.setColumnWidth(2, 130);  // Mã
    sheet4.setColumnWidth(3, 220);  // Tên Bảo Mật
    sheet4.setColumnWidth(4, 220);  // Tên Doanh Nghiệp Gốc
    sheet4.setColumnWidth(5, 120);  // VIP
    sheet4.setColumnWidth(6, 100);  // Tổng Đơn
    sheet4.setColumnWidth(7, 130);  // Tải Trọng (Kg)
    sheet4.setColumnWidth(8, 130);  // Thể Tích (M³)
    sheet4.setColumnWidth(9, 150);  // Phí Dịch Vụ
    sheet4.setColumnWidth(10, 220); // Quà
    sheet4.setColumnWidth(11, 170); // Thời Gian
  }

  // 4. Sheet AdminConfig
  var sheet3 = ss.getSheetByName('AdminConfig');
  if (!sheet3) {
    sheet3 = ss.insertSheet('AdminConfig');
    sheet3.appendRow(['Tên Cấu Hình (Key)', 'Dữ Liệu JSON (Value)', 'Thời Gian Cập Nhật']);
    var h3 = sheet3.getRange(1, 1, 1, 3);
    h3.setBackground('#1e293b').setFontColor('#34d399').setFontWeight('bold');
    sheet3.setFrozenRows(1);
    sheet3.setColumnWidth(1, 240);
    sheet3.setColumnWidth(2, 450);
    sheet3.setColumnWidth(3, 180);
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
