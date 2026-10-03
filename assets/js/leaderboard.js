
function formatLeaderboardPrizeTag(tag) {
  if (!tag) return '';
  return tag
    .replace(/Ứng viên Vua Số Đơn/gi, 'Kỷ Lục Số Đơn')
    .replace(/Vua Số Đơn/gi, 'Kỷ Lục Số Đơn')
    .replace(/Dẫn đầu Tân Binh/gi, 'Khách Hàng Mới Tiêu Biểu')
    .replace(/Ứng viên Tân Binh/gi, 'Ứng viên Khách Mới')
    .replace(/Tân Binh Tiềm Năng/gi, 'Khách Mới Tiềm Năng')
    .replace(/Ứng viên Vua Tải Trọng/gi, 'Kỷ Lục Tải Trọng (Kg)')
    .replace(/Vua Tải Trọng/gi, 'Kỷ Lục Tải Trọng (Kg)')
    .replace(/Sự Trở Lại Ấn Tượng/gi, 'Tái Hợp Tác Ấn Tượng')
    .replace(/Ứng viên Vua Thể Tích/gi, 'Kỷ Lục Thể Tích (M³)')
    .replace(/Vua Thể Tích/gi, 'Kỷ Lục Thể Tích (M³)')
    .replace(/Vua Khối Lượng/gi, 'Kỷ Lục Thể Tích (M³)')
    .replace(/Ứng viên Tiềm Năng/gi, 'Khách Hàng Tiềm Năng');
}
/**
 * Leaderboard Engine for Eureka Customer Awards 2026
 * Privacy-First: Masked Customer Names (>=50% masked) & Official Customer Codes (Mã Khách: ERK-KH-XXXX)
 * No Phone Number Exposed. Full participating customer roster with sticky scroll & instant search filter.
 * Dynamic Fetch with In-Memory Safe Fallback
 */

let leaderboardData = [];

// Fallback data (25 participating customers with Customer Code)
const fallbackLeaderboardData = [
  {
    "rank": 1,
    "customer_name": "Khách hàng T*** Đ*** XNK *** Châu",
    "original_name": "Khách hàng Tập Đoàn XNK Toàn Châu",
    "customer_code": "ERK-KH-8891",
    "vip_tier": "VIP ELITE",
    "order_count": 48,
    "volume_weight": "142,5 tấn | 190 m³",
    "service_fee": 428650000,
    "prize_tag": "Laptop Surface 35Tr",
    "prize_type": "top1",
    "weight_kg": 142500,
    "volume_m3": 190
  },
  {
    "rank": 2,
    "customer_name": "Khách hàng CP TM *** *** Minh",
    "original_name": "Khách hàng CP TM Bình Minh",
    "customer_code": "ERK-KH-4432",
    "vip_tier": "VIP ELITE",
    "order_count": 35,
    "volume_weight": "98,2 tấn | 135 m³",
    "service_fee": 312400000,
    "prize_tag": "iPad Air M3 20Tr",
    "prize_type": "top2",
    "weight_kg": 98200,
    "volume_m3": 135
  },
  {
    "rank": 3,
    "customer_name": "Khách hàng SX & PP *** *** An",
    "original_name": "Khách hàng SX & PP Trường An",
    "customer_code": "ERK-KH-1205",
    "vip_tier": "VIP PREMIUM",
    "order_count": 29,
    "volume_weight": "76,0 tấn | 110 m³",
    "service_fee": 245900000,
    "prize_tag": "Máy Lọc Dyson 10Tr",
    "prize_type": "top3",
    "weight_kg": 76000,
    "volume_m3": 110
  },
  {
    "rank": 4,
    "customer_name": "Khách hàng XNK Y Tế *** *** Long",
    "original_name": "Khách hàng XNK Y Tế Hoàng Long",
    "customer_code": "ERK-KH-9012",
    "vip_tier": "VIP PREMIUM",
    "order_count": 22,
    "volume_weight": "54,1 tấn | 68 m³",
    "service_fee": 188300000,
    "prize_tag": "Bám đuổi Top 3",
    "prize_type": "regular",
    "weight_kg": 54100,
    "volume_m3": 68
  },
  {
    "rank": 5,
    "customer_name": "Khách hàng Hộ KD *** *** Hưng",
    "original_name": "Khách hàng Hộ KD Hưng Phát",
    "customer_code": "ERK-KH-7731",
    "vip_tier": "VIP PRO",
    "order_count": 19,
    "volume_weight": "42,8 tấn | 55 m³",
    "service_fee": 154200000,
    "prize_tag": "Cột mốc VIP+1",
    "prize_type": "regular",
    "weight_kg": 42800,
    "volume_m3": 55
  },
  {
    "rank": 6,
    "customer_name": "Khách hàng Phụ Kiện *** *** Việt",
    "original_name": "Khách hàng Phụ Kiện Đại Việt",
    "customer_code": "ERK-KH-5524",
    "vip_tier": "VIP PRO",
    "order_count": 26,
    "volume_weight": "31,5 tấn | 45 m³",
    "service_fee": 141050000,
    "prize_tag": "Kỷ Lục Số Đơn",
    "prize_type": "regular",
    "weight_kg": 31500,
    "volume_m3": 45
  },
  {
    "rank": 7,
    "customer_name": "Khách hàng Đồ Chơi *** *** Tech",
    "original_name": "Khách hàng Đồ Chơi Quang Tech",
    "customer_code": "ERK-KH-3198",
    "vip_tier": "KH MỚI",
    "order_count": 14,
    "volume_weight": "18,2 tấn | 88 m³",
    "service_fee": 128900000,
    "prize_tag": "Khách Hàng Mới Tiêu Biểu",
    "prize_type": "regular",
    "weight_kg": 18200,
    "volume_m3": 88
  },
  {
    "rank": 8,
    "customer_name": "Khách hàng Cơ Khí *** *** Trung",
    "original_name": "Khách hàng Cơ Khí Thành Trung",
    "customer_code": "ERK-KH-6640",
    "vip_tier": "VIP PRO",
    "order_count": 11,
    "volume_weight": "85,6 tấn | 32 m³",
    "service_fee": 115400000,
    "prize_tag": "Kỷ Lục Tải Trọng (Kg)",
    "prize_type": "regular",
    "weight_kg": 85600,
    "volume_m3": 32
  },
  {
    "rank": 9,
    "customer_name": "Khách hàng Tiêu Dùng *** *** Nam",
    "original_name": "Khách hàng Tiêu Dùng Phương Nam",
    "customer_code": "ERK-KH-2287",
    "vip_tier": "KH CŨ",
    "order_count": 12,
    "volume_weight": "24,0 tấn | 38 m³",
    "service_fee": 98700000,
    "prize_tag": "Tái Hợp Tác Ấn Tượng",
    "prize_type": "regular",
    "weight_kg": 24000,
    "volume_m3": 38
  },
  {
    "rank": 10,
    "customer_name": "Khách hàng Nội Thất *** *** Đô",
    "original_name": "Khách hàng Nội Thất Hà Đô",
    "customer_code": "ERK-KH-9914",
    "vip_tier": "KH MỚI",
    "order_count": 9,
    "volume_weight": "12,5 tấn | 72 m³",
    "service_fee": 86300000,
    "prize_tag": "Kỷ Lục Thể Tích (M³)",
    "prize_type": "regular",
    "weight_kg": 12500,
    "volume_m3": 72
  },
  {
    "rank": 11,
    "customer_name": "Khách hàng Gia Dụng *** *** Phát",
    "original_name": "Khách hàng Gia Dụng Tấn Phát",
    "customer_code": "ERK-KH-1043",
    "vip_tier": "VIP PRO",
    "order_count": 15,
    "volume_weight": "21,4 tấn | 34 m³",
    "service_fee": 81200000,
    "prize_tag": "Cột mốc VIP+1",
    "prize_type": "regular",
    "weight_kg": 21400,
    "volume_m3": 34
  },
  {
    "rank": 12,
    "customer_name": "Khách hàng Thiết Bị *** *** Thắng",
    "original_name": "Khách hàng Thiết Bị Quyết Thắng",
    "customer_code": "ERK-KH-8320",
    "vip_tier": "VIP PRO",
    "order_count": 13,
    "volume_weight": "19,8 tấn | 28 m³",
    "service_fee": 76500000,
    "prize_tag": "Bám đuổi Top 10",
    "prize_type": "regular",
    "weight_kg": 19800,
    "volume_m3": 28
  },
  {
    "rank": 13,
    "customer_name": "Khách hàng May Mặc *** *** Linh",
    "original_name": "Khách hàng May Mặc Trúc Linh",
    "customer_code": "ERK-KH-4176",
    "vip_tier": "KH MỚI",
    "order_count": 10,
    "volume_weight": "15,2 tấn | 42 m³",
    "service_fee": 72100000,
    "prize_tag": "Ứng viên Khách Mới",
    "prize_type": "regular",
    "weight_kg": 15200,
    "volume_m3": 42
  },
  {
    "rank": 14,
    "customer_name": "Khách hàng Hóa Mỹ Phẩm *** *** Hà",
    "original_name": "Khách hàng Hóa Mỹ Phẩm Thu Hà",
    "customer_code": "ERK-KH-5902",
    "vip_tier": "VIP PRO",
    "order_count": 11,
    "volume_weight": "14,0 tấn | 22 m³",
    "service_fee": 68400000,
    "prize_tag": "Cột mốc VIP+1",
    "prize_type": "regular",
    "weight_kg": 14000,
    "volume_m3": 22
  },
  {
    "rank": 15,
    "customer_name": "Khách hàng Điện Tử *** *** Quang",
    "original_name": "Khách hàng Điện Tử Nhật Quang",
    "customer_code": "ERK-KH-7241",
    "vip_tier": "VIP PREMIUM",
    "order_count": 8,
    "volume_weight": "11,5 tấn | 19 m³",
    "service_fee": 64800000,
    "prize_tag": "Đặc quyền VIP",
    "prize_type": "regular",
    "weight_kg": 11500,
    "volume_m3": 19
  },
  {
    "rank": 16,
    "customer_name": "Khách hàng Bao Bì *** *** Hưng",
    "original_name": "Khách hàng Bao Bì Gia Hưng",
    "customer_code": "ERK-KH-3819",
    "vip_tier": "BASIC",
    "order_count": 9,
    "volume_weight": "16,8 tấn | 31 m³",
    "service_fee": 59900000,
    "prize_tag": "Đua mốc VIP PRO",
    "prize_type": "regular",
    "weight_kg": 16800,
    "volume_m3": 31
  },
  {
    "rank": 17,
    "customer_name": "Khách hàng Hộ KD Giày Dép *** *** Vy",
    "original_name": "Khách hàng Hộ KD Giày Dép Thúy Vy",
    "customer_code": "ERK-KH-6055",
    "vip_tier": "BASIC",
    "order_count": 12,
    "volume_weight": "10,2 tấn | 29 m³",
    "service_fee": 56200000,
    "prize_tag": "Đua mốc VIP PRO",
    "prize_type": "regular",
    "weight_kg": 10200,
    "volume_m3": 29
  },
  {
    "rank": 18,
    "customer_name": "Khách hàng Vật Liệu Xây Dựng *** *** Sơn",
    "original_name": "Khách hàng Vật Liệu Xây Dựng Thái Sơn",
    "customer_code": "ERK-KH-2790",
    "vip_tier": "VIP PRO",
    "order_count": 6,
    "volume_weight": "45,0 tấn | 18 m³",
    "service_fee": 52700000,
    "prize_tag": "Tải trọng bứt phá",
    "prize_type": "regular",
    "weight_kg": 45000,
    "volume_m3": 18
  },
  {
    "rank": 19,
    "customer_name": "Khách hàng VPP & Quà Tặng *** *** Mai",
    "original_name": "Khách hàng VPP & Quà Tặng Ban Mai",
    "customer_code": "ERK-KH-8411",
    "vip_tier": "KH MỚI",
    "order_count": 8,
    "volume_weight": "8,5 tấn | 20 m³",
    "service_fee": 49100000,
    "prize_tag": "Khách Hàng Tiềm Năng",
    "prize_type": "regular",
    "weight_kg": 8500,
    "volume_m3": 20
  },
  {
    "rank": 20,
    "customer_name": "Khách hàng Nông Sản Chế Biến *** *** Lộc",
    "original_name": "Khách hàng Nông Sản Chế Biến Tấn Lộc",
    "customer_code": "ERK-KH-9533",
    "vip_tier": "KH CŨ",
    "order_count": 7,
    "volume_weight": "13,2 tấn | 17 m³",
    "service_fee": 45800000,
    "prize_tag": "Tái kích hoạt",
    "prize_type": "regular",
    "weight_kg": 13200,
    "volume_m3": 17
  },
  {
    "rank": 21,
    "customer_name": "Khách hàng Thủ Công Mỹ Nghệ *** *** Tâm",
    "original_name": "Khách hàng Thủ Công Mỹ Nghệ Thành Tâm",
    "customer_code": "ERK-KH-1188",
    "vip_tier": "BASIC",
    "order_count": 6,
    "volume_weight": "7,1 tấn | 24 m³",
    "service_fee": 42300000,
    "prize_tag": "Đua mốc VIP PRO",
    "prize_type": "regular",
    "weight_kg": 7100,
    "volume_m3": 24
  },
  {
    "rank": 22,
    "customer_name": "Khách hàng Phụ Tùng Xe Máy *** *** Dũng",
    "original_name": "Khách hàng Phụ Tùng Xe Máy Tiến Dũng",
    "customer_code": "ERK-KH-7629",
    "vip_tier": "BASIC",
    "order_count": 5,
    "volume_weight": "9,4 tấn | 15 m³",
    "service_fee": 38900000,
    "prize_tag": "Đua mốc VIP PRO",
    "prize_type": "regular",
    "weight_kg": 9400,
    "volume_m3": 15
  },
  {
    "rank": 23,
    "customer_name": "Khách hàng Hộ KD Mẹ & Bé *** *** Thảo",
    "original_name": "Khách hàng Hộ KD Mẹ & Bé Phương Thảo",
    "customer_code": "ERK-KH-3341",
    "vip_tier": "KH MỚI",
    "order_count": 7,
    "volume_weight": "6,2 tấn | 19 m³",
    "service_fee": 35400000,
    "prize_tag": "Khách Mới Tiềm Năng",
    "prize_type": "regular",
    "weight_kg": 6200,
    "volume_m3": 19
  },
  {
    "rank": 24,
    "customer_name": "Khách hàng Đèn Trang Trí *** *** Hoàng",
    "original_name": "Khách hàng Đèn Trang Trí Huy Hoàng",
    "customer_code": "ERK-KH-5820",
    "vip_tier": "BASIC",
    "order_count": 4,
    "volume_weight": "5,8 tấn | 18 m³",
    "service_fee": 31200000,
    "prize_tag": "Đua mốc VIP PRO",
    "prize_type": "regular",
    "weight_kg": 5800,
    "volume_m3": 18
  },
  {
    "rank": 25,
    "customer_name": "Khách hàng Dược Liệu Tự Nhiên *** *** Trúc",
    "original_name": "Khách hàng Dược Liệu Tự Nhiên Thanh Trúc",
    "customer_code": "ERK-KH-9102",
    "vip_tier": "BASIC",
    "order_count": 4,
    "volume_weight": "4,9 tấn | 12 m³",
    "service_fee": 28600000,
    "prize_tag": "Khởi động 2026",
    "prize_type": "regular",
    "weight_kg": 4900,
    "volume_m3": 12
  }
];


;

function formatCurrency(num) {
  return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
}

function getCustomerWeightKg(item) {
  if (typeof item.weight_kg === 'number') return item.weight_kg;
  if (item.weight_kg && !isNaN(parseFloat(item.weight_kg))) return parseFloat(item.weight_kg);
  if (item.volume_weight) {
    const part = item.volume_weight.split('|')[0] || '';
    const match = part.replace(',', '.').match(/([\d.]+)\s*(tấn|kg|t)/i);
    if (match) {
      const val = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      return unit.includes('t') ? Math.round(val * 1000) : Math.round(val);
    }
  }
  return 0;
}

function getCustomerVolumeM3(item) {
  if (typeof item.volume_m3 === 'number') return item.volume_m3;
  if (item.volume_m3 && !isNaN(parseFloat(item.volume_m3))) return parseFloat(item.volume_m3);
  if (item.volume_weight) {
    const parts = item.volume_weight.split('|');
    const part = parts[1] || parts[0] || '';
    const match = part.replace(',', '.').match(/([\d.]+)\s*(m³|m3|cbm)/i);
    if (match) return parseFloat(match[1]);
  }
  return 0;
}

function formatWeightDisplay(kg) {
  const num = typeof kg === 'number' ? kg : parseFloat(kg) || 0;
  if (num >= 1000) {
    const ton = (num / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
    return `<div class="font-black text-amber-900 font-mono text-xs sm:text-sm">${num.toLocaleString('vi-VN')} kg</div><div class="text-[10px] text-slate-500 font-semibold">(${ton} tấn)</div>`;
  }
  return `<div class="font-black text-amber-900 font-mono text-xs sm:text-sm">${num.toLocaleString('vi-VN')} kg</div>`;
}

function formatVolumeDisplay(m3) {
  const num = typeof m3 === 'number' ? m3 : parseFloat(m3) || 0;
  return `<div class="font-black text-sky-900 font-mono text-xs sm:text-sm">${num.toLocaleString('vi-VN')} m³</div>`;
}

function renderLeaderboard(data) {
  const tbody = document.getElementById('leaderboard-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  // Empty state handling
  if (!data || data.length === 0) {
    const emptyTr = document.createElement('tr');
    emptyTr.innerHTML = `
      <td colspan="8" class="py-12 text-center text-slate-500">
        
        <div class="font-black text-slate-900 text-sm sm:text-base">Không tìm thấy khách hàng nào khớp với từ khóa</div>
        <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">Vui lòng kiểm tra lại Tên khách hàng hoặc Mã khách (Ví dụ: ERK-KH-8891, Cty...).</p>
        <button onclick="clearLeaderboardSearch()" class="mt-3 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm">
          Xóa tìm kiếm & Hiện tất cả
        </button>
      </td>
    `;
    tbody.appendChild(emptyTr);
    return;
  }

  data.forEach(item => {
    const tr = document.createElement('tr');

    let rowClass = 'hover:bg-amber-50/60 transition-colors border-b border-slate-200';
    let rankBadge = '';
    let prizeBadge = '';

    if (item.rank === 1) {
      rowClass = 'bg-amber-50/80 hover:bg-amber-100/60 transition-colors border-b border-amber-200';
      rankBadge = `
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black flex items-center justify-center text-xs sm:text-sm shadow mx-auto sm:mx-0">
          1
        </div>
      `;
      prizeBadge = `
        <span class="whitespace-nowrap inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wide shadow-sm">
          ${formatLeaderboardPrizeTag(item.prize_tag)}
        </span>
      `;
    } else if (item.rank === 2) {
      rowClass = 'bg-sky-50/70 hover:bg-sky-100/60 transition-colors border-b border-sky-200';
      rankBadge = `
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-100 text-sky-900 border border-sky-300 font-black flex items-center justify-center text-xs sm:text-sm shadow mx-auto sm:mx-0">
          2
        </div>
      `;
      prizeBadge = `
        <span class="whitespace-nowrap inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300 font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wide shadow-sm">
          ${formatLeaderboardPrizeTag(item.prize_tag)}
        </span>
      `;
    } else if (item.rank === 3) {
      rowClass = 'bg-orange-50/70 hover:bg-orange-100/60 transition-colors border-b border-orange-200';
      rankBadge = `
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-600 text-white font-black flex items-center justify-center text-xs sm:text-sm shadow mx-auto sm:mx-0">
          3
        </div>
      `;
      prizeBadge = `
        <span class="whitespace-nowrap inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wide shadow-sm">
          ${formatLeaderboardPrizeTag(item.prize_tag)}
        </span>
      `;
    } else {
      rankBadge = `<span class="font-bold text-slate-700 text-xs sm:text-sm text-center block sm:inline sm:ml-2">${item.rank}</span>`;
      prizeBadge = `<span class="text-slate-700 text-[10px] sm:text-xs font-medium whitespace-nowrap inline-block">${formatLeaderboardPrizeTag(item.prize_tag)}</span>`;
    }

    let vipBadgeClass = 'bg-slate-100 text-slate-800 border border-slate-300';
    if (item.vip_tier.includes('ELITE')) vipBadgeClass = 'bg-purple-100 text-purple-900 border border-purple-300 font-bold';
    else if (item.vip_tier.includes('PREMIUM')) vipBadgeClass = 'bg-blue-100 text-blue-900 border border-blue-300 font-bold';
    else if (item.vip_tier.includes('MỚI')) vipBadgeClass = 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold';

    const displayName = item.customer_name || item.company_name || 'Khách hàng Eureka';
    const customerCode = item.customer_code || item.code || ('ERK-KH-' + (1000 + item.rank));
    const weightKg = getCustomerWeightKg(item);
    const volumeM3 = getCustomerVolumeM3(item);

    tr.className = rowClass;
    tr.innerHTML = `
      <td class="py-2.5 sm:py-3.5 px-1.5 sm:px-3 whitespace-nowrap text-center">${rankBadge}</td>
      <td class="py-2.5 sm:py-3.5 px-2 sm:px-3">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="font-bold text-slate-900 text-xs sm:text-sm leading-snug">${displayName}</span>
          <a href="https://www.erktransport.com/pricing" target="_blank" rel="noopener noreferrer" class="sm:hidden px-1.5 py-0.5 rounded text-[9px] font-bold ${vipBadgeClass} inline-flex items-center gap-0.5 shadow-sm whitespace-nowrap" title="Chi tiết gói ${item.vip_tier}">
            <span>${item.vip_tier}</span>
            <span class="text-[8px] opacity-70">↗</span>
          </a>
        </div>
        <div class="flex items-center gap-1.5 mt-1 flex-wrap text-[10px] sm:text-[11px]">
          <span class="font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 sm:px-2 py-0.5 rounded tracking-wide inline-flex items-center gap-1 shadow-sm whitespace-nowrap">
            <span class="text-[9px] opacity-80 text-amber-800">MÃ:</span>${customerCode}
          </span>
          <span class="md:hidden text-slate-500 font-medium inline-flex items-center gap-1 flex-wrap">
            <span class="whitespace-nowrap">· ${item.order_count} đơn</span>
            <span class="whitespace-nowrap text-amber-900 font-bold">· ${weightKg.toLocaleString('vi-VN')} kg</span>
            <span class="whitespace-nowrap text-sky-900 font-bold">· ${volumeM3.toLocaleString('vi-VN')} m³</span>
          </span>
        </div>
        <div class="sm:hidden mt-1.5">
          ${prizeBadge}
        </div>
      </td>
      <td class="py-2.5 sm:py-3.5 px-3 whitespace-nowrap hidden sm:table-cell">
        <a href="https://www.erktransport.com/pricing" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded text-xs font-bold ${vipBadgeClass} hover:scale-105 transition-transform inline-flex items-center gap-1 cursor-pointer shadow-sm" title="Bấm để xem chi tiết quyền lợi gói ${item.vip_tier} tại bảng giá Eureka Logistics">
          <span>${item.vip_tier}</span>
          <span class="text-[9px] opacity-70">↗</span>
        </a>
      </td>
      <td class="py-2.5 sm:py-3.5 px-3 text-right font-bold text-slate-800 whitespace-nowrap hidden md:table-cell">${item.order_count} đơn</td>
      <td class="py-2.5 sm:py-3.5 px-3 text-right whitespace-nowrap hidden md:table-cell">${formatWeightDisplay(weightKg)}</td>
      <td class="py-2.5 sm:py-3.5 px-3 text-right whitespace-nowrap hidden md:table-cell">${formatVolumeDisplay(volumeM3)}</td>
      <td class="py-2.5 sm:py-3.5 px-2 sm:px-3 text-right font-black whitespace-nowrap font-mono ${item.rank === 1 ? 'text-amber-900 text-xs sm:text-base' : item.rank === 2 ? 'text-sky-900 text-xs sm:text-base' : item.rank === 3 ? 'text-orange-950 text-xs sm:text-base' : 'text-slate-900 text-[11px] sm:text-sm'}">
        ${formatCurrency(item.service_fee)}
      </td>
      <td class="py-2.5 sm:py-3.5 px-3 text-center whitespace-nowrap hidden sm:table-cell">${prizeBadge}</td>
    `;
    tbody.appendChild(tr);
  });
}

const STORAGE_KEY_LEADERBOARD = 'eureka_custom_leaderboard';
const STORAGE_KEY_WEEKLY_WINNER = 'eureka_weekly_winner';

function maskCustomerName(name) {
  if (!name) return 'Khách hàng Eureka';
  if (name.includes('***')) return name;
  const words = name.trim().split(/\s+/);
  if (words.length <= 2) {
    return name.slice(0, 2) + '***' + name.slice(-1);
  }
  return words.map((w, idx) => {
    if (idx === 0 || idx === words.length - 1) return w;
    return w.slice(0, 1) + '***';
  }).join(' ');
}

function renderWeeklyWinnerSpotlight() {
  const container = document.getElementById('weekly-winner-spotlight');
  if (!container) return;

  let winner = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WEEKLY_WINNER);
    if (raw) winner = JSON.parse(raw);
  } catch (e) {}

  // ONLY show when Admin has inputted data AND active status is true
  if (winner && winner.is_active && winner.customer_name && winner.weekly_spending) {
    const weekEl = document.getElementById('spotlight-week-title');
    const nameEl = document.getElementById('spotlight-customer-name');
    const codeEl = document.getElementById('spotlight-customer-code');
    const spendEl = document.getElementById('spotlight-weekly-spending');
    const prizeEl = document.getElementById('spotlight-prize-tag');
    const msgEl = document.getElementById('spotlight-congrats-msg');

    if (weekEl) weekEl.textContent = `VINH DANH KHÁCH HÀNG XUẤT SẮC: ${winner.week_title || 'TOP TUẦN'}`;
    if (nameEl) nameEl.textContent = maskCustomerName(winner.customer_name);
    if (codeEl) codeEl.textContent = `MÃ: ${winner.customer_code || winner.code || 'ERK-KH-8891'}`;
    function formatWeeklySpending(val) {
      const s = String(val || '').trim();
      if (!s) return '0 đ';
      if (s.includes('đ') || s.includes('VNĐ') || s.includes('VND')) return s;
      const digits = s.replace(/[^\d]/g, '');
      if (digits) {
        return new Intl.NumberFormat('vi-VN').format(Number(digits)) + ' đ';
      }
      return s;
    }
    if (spendEl) spendEl.textContent = formatWeeklySpending(winner.weekly_spending);
    let prizeName = winner.prize_name || 'Voucher 1.000.000 đ';
    if (prizeName.includes('2.000.000')) {
      prizeName = 'Voucher 1.000.000 đ';
    }
    if (prizeEl) prizeEl.textContent = prizeName;
    if (msgEl) msgEl.textContent = winner.congrats_message || 'Nhiệt liệt chúc mừng Quý khách đã xuất sắc dẫn đầu doanh số chi tiêu dịch vụ tuần qua, bứt phá tiến độ vận chuyển vượt bậc!';

    container.classList.remove('hidden');
    container.style.display = 'block';

    // Also update Prize Tab "Giải Top Tuần" panel
    const prizeTopName = document.getElementById('prize-top-tuan-name');
    const prizeTopCode = document.getElementById('prize-top-tuan-code');
    const prizeTopSpending = document.getElementById('prize-top-tuan-spending');
    const prizeTopPrize = document.getElementById('prize-top-tuan-prize');
    if (prizeTopName) prizeTopName.textContent = maskCustomerName(winner.customer_name);
    if (prizeTopCode) prizeTopCode.textContent = 'MÃ: ' + (winner.customer_code || winner.code || 'ERK-KH-8891');
    if (prizeTopSpending) prizeTopSpending.textContent = formatWeeklySpending(winner.weekly_spending);
    if (prizeTopPrize) prizeTopPrize.textContent = prizeName;
  } else {
    // Hidden when admin has not entered information
    container.classList.add('hidden');
    container.style.display = 'none';
  }
}

function loadLeaderboardData() {
  renderWeeklyWinnerSpotlight();

  // 1. Check custom admin-uploaded leaderboard first
  const custom = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
  if (custom) {
    try {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed) && parsed.length > 0) {
        leaderboardData = parsed;
        window.leaderboardData = parsed;
        renderLeaderboard(parsed);
        updateSearchCounter(parsed.length, parsed.length);
        if (typeof window.renderGalaSummaryData === 'function') window.renderGalaSummaryData();
        return;
      }
    } catch (e) {}
  }

  // 2. Fetch file if no custom data exists
  fetch('data/leaderboard-data.json')
    .then(res => res.json())
    .then(data => {
      leaderboardData = data;
      window.leaderboardData = data;
      renderLeaderboard(data);
      updateSearchCounter(data.length, data.length);
      if (typeof window.renderGalaSummaryData === 'function') window.renderGalaSummaryData();
    })
    .catch(() => {
      leaderboardData = fallbackLeaderboardData;
      window.leaderboardData = fallbackLeaderboardData;
      renderLeaderboard(fallbackLeaderboardData);
      updateSearchCounter(fallbackLeaderboardData.length, fallbackLeaderboardData.length);
      if (typeof window.renderGalaSummaryData === 'function') window.renderGalaSummaryData();
    });
}

window.getLeaderboardData = function() {
  return (leaderboardData && leaderboardData.length > 0) ? leaderboardData : fallbackLeaderboardData;
};

function updateSearchCounter(currentCount, totalCount) {
  const counterEl = document.getElementById('leaderboard-search-count');
  if (!counterEl) return;
  if (currentCount < totalCount) {
    counterEl.textContent = `Tìm thấy ${currentCount} / ${totalCount} KH`;
    counterEl.classList.remove('hidden');
  } else {
    counterEl.textContent = `Hiển thị ${totalCount} khách hàng`;
  }
}

// Helper to strip Vietnamese accents for flexible search
function removeVietnameseTones(str) {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return str.trim();
}

function matchesLeaderboardSearch(item, rawQuery) {
  if (!rawQuery) return true;
  const q = rawQuery.toLowerCase().trim();
  const qNoTone = removeVietnameseTones(q);
  const qAlphaNum = q.replace(/[^a-z0-9]/g, '');

  const code = (item.customer_code || item.code || ('ERK-KH-' + (1000 + (item.rank || 0)))).toLowerCase();
  const codeAlphaNum = code.replace(/[^a-z0-9]/g, '');

  // 1. Customer code match (direct substring or cleaned alphanumeric e.g. '8891', 'kh8891', 'a114', 'erk')
  if (code.includes(q)) return true;
  if (qAlphaNum.length >= 2 && codeAlphaNum.includes(qAlphaNum)) return true;

  // 2. Rank match (e.g. 'top 1', '#1', 'hang 1', '1')
  if (item.rank) {
    if (q === `top ${item.rank}` || q === `#${item.rank}` || q === `hang ${item.rank}` || q === `${item.rank}`) return true;
  }

  // 3. Name match: original unmasked name (with & without Vietnamese tones)
  const origName = (item.original_name || '').toLowerCase();
  const origNameNoTone = removeVietnameseTones(origName);
  if (origName && (origName.includes(q) || (qNoTone && origNameNoTone.includes(qNoTone)))) return true;

  // 4. Name match: displayed customer_name (with & without Vietnamese tones)
  const custName = (item.customer_name || item.company_name || '').toLowerCase();
  const custNameNoTone = removeVietnameseTones(custName);
  if (custName.includes(q) || (qNoTone && custNameNoTone.includes(qNoTone))) return true;

  // 5. Smart masked word matching:
  // e.g. Customer name: "Khách hàng T*** Đ*** XNK *** Châu" -> typing "Toàn Châu", "Tập Đoàn", "Bình Minh"
  const qWords = qNoTone.split(/\s+/).filter(w => w.length > 0);
  const nameWords = custNameNoTone.split(/\s+/).filter(w => w.length > 0);
  if (qWords.length > 0) {
    const allWordsMatch = qWords.every(qw => {
      return nameWords.some(nw => {
        if (nw.includes(qw) || qw.includes(nw.replace(/\*/g, ''))) {
          const cleanNw = nw.replace(/\*/g, '');
          if (cleanNw.length >= 1 && qw.startsWith(cleanNw)) return true;
          if (nw === qw) return true;
        }
        return false;
      });
    });
    if (allWordsMatch) return true;
  }

  return false;
}

function filterLeaderboard() {
  const query = (document.getElementById('leaderboard-search')?.value || '').toLowerCase().trim();
  const clearBtn = document.getElementById('leaderboard-search-clear');
  if (clearBtn) {
    if (query) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }

  if (!query) {
    renderLeaderboard(leaderboardData);
    updateSearchCounter(leaderboardData.length, leaderboardData.length);
    return;
  }

  const filtered = leaderboardData.filter(item => matchesLeaderboardSearch(item, query));

  renderLeaderboard(filtered);
  updateSearchCounter(filtered.length, leaderboardData.length);
}

function clearLeaderboardSearch() {
  const input = document.getElementById('leaderboard-search');
  if (input) {
    input.value = '';
    input.focus();
  }
  filterLeaderboard();
}

function refreshLeaderboardData() {
  const btn = event?.currentTarget;
  if (btn) btn.classList.add('animate-spin');
  setTimeout(() => {
    loadLeaderboardData();
    if (btn) btn.classList.remove('animate-spin');
  }, 600);
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', loadLeaderboardData);
} else {
  loadLeaderboardData();
}
