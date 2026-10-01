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
 *    - Mô tả: "v1.0 Eureka Cloud DB".
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

    // 3. Lấy Cấu hình Admin
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

    // 3. Lưu Cấu hình Admin (Nhiệm vụ, Gala, Top tuần...)
    if (action === 'save_config') {
      var cfgKey = payload.key;
      var cfgVal = JSON.stringify(payload.value);
      var cfgSheet = ss.getSheetByName('AdminConfig');
      
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
      return jsonOutput({ status: 'success', message: 'Đã lưu cấu hình ' + cfgKey });
    }

    // 4. Đồng bộ toàn bộ dữ liệu máy lên Cloud
    if (action === 'sync_all') {
      var all = payload.data || {};

      // Đồng bộ leads
      if (all.spinLeads && Array.isArray(all.spinLeads)) {
        var lSheet = ss.getSheetByName('VongQuayMayMan');
        // Clear old rows except header
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

      // Đồng bộ Configs
      var cSheet = ss.getSheetByName('AdminConfig');
      var configItems = [
        ['eureka_nhiem_vu_config', JSON.stringify(all.nhiemVuConfig || {})],
        ['eureka_gala_awards_config', JSON.stringify(all.galaConfig || {})],
        ['eureka_weekly_winner', JSON.stringify(all.weeklyWinner || {})],
        ['eureka_custom_leaderboard', JSON.stringify(all.customLeaderboard || [])]
      ];
      if (cSheet.getLastRow() > 1) {
        cSheet.getRange(2, 1, cSheet.getLastRow() - 1, 3).clearContent();
      }
      var cRows = configItems.map(function(item) {
        return [item[0], item[1], new Date()];
      });
      cSheet.getRange(2, 1, cRows.length, 3).setValues(cRows);

      return jsonOutput({ status: 'success', message: 'Đã đồng bộ toàn bộ lên Sheets' });
    }

    return jsonOutput({ status: 'ignored', message: 'Action không xác định' });
  } catch (err) {
    return jsonOutput({ status: 'error', message: err.toString() });
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

  // 3. Sheet AdminConfig
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
