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
    "customer_code": "ERK-KH-8891",
    "vip_tier": "VIP ELITE",
    "order_count": 48,
    "volume_weight": "142,5 tấn | 190 m³",
    "service_fee": 428650000,
    "prize_tag": "💻 Laptop Surface 35Tr",
    "prize_type": "top1"
  },
  {
    "rank": 2,
    "customer_name": "Khách hàng CP TM *** *** Minh",
    "customer_code": "ERK-KH-4432",
    "vip_tier": "VIP ELITE",
    "order_count": 35,
    "volume_weight": "98,2 tấn | 135 m³",
    "service_fee": 312400000,
    "prize_tag": "📱 iPad Air M3 20Tr",
    "prize_type": "top2"
  },
  {
    "rank": 3,
    "customer_name": "Khách hàng SX & PP *** *** An",
    "customer_code": "ERK-KH-1205",
    "vip_tier": "VIP PREMIUM",
    "order_count": 29,
    "volume_weight": "76,0 tấn | 110 m³",
    "service_fee": 245900000,
    "prize_tag": "🌪️ Máy Lọc Dyson 10Tr",
    "prize_type": "top3"
  },
  {
    "rank": 4,
    "customer_name": "Khách hàng XNK Y Tế *** *** Long",
    "customer_code": "ERK-KH-9012",
    "vip_tier": "VIP PREMIUM",
    "order_count": 22,
    "volume_weight": "54,1 tấn | 68 m³",
    "service_fee": 188300000,
    "prize_tag": "Bám đuổi Top 3",
    "prize_type": "regular"
  },
  {
    "rank": 5,
    "customer_name": "Khách hàng Hộ KD *** *** Hưng",
    "customer_code": "ERK-KH-7731",
    "vip_tier": "VIP PRO",
    "order_count": 19,
    "volume_weight": "42,8 tấn | 55 m³",
    "service_fee": 154200000,
    "prize_tag": "Cột mốc VIP+1",
    "prize_type": "regular"
  },
  {
    "rank": 6,
    "customer_name": "Khách hàng Phụ Kiện *** *** Việt",
    "customer_code": "ERK-KH-5524",
    "vip_tier": "VIP PRO",
    "order_count": 26,
    "volume_weight": "31,5 tấn | 45 m³",
    "service_fee": 141050000,
    "prize_tag": "Ứng viên Vua Số Đơn",
    "prize_type": "regular"
  },
  {
    "rank": 7,
    "customer_name": "Khách hàng Đồ Chơi *** *** Tech",
    "customer_code": "ERK-KH-3198",
    "vip_tier": "KH MỚI",
    "order_count": 14,
    "volume_weight": "18,2 tấn | 88 m³",
    "service_fee": 128900000,
    "prize_tag": "Dẫn đầu Tân Binh",
    "prize_type": "regular"
  },
  {
    "rank": 8,
    "customer_name": "Khách hàng Cơ Khí *** *** Trung",
    "customer_code": "ERK-KH-6640",
    "vip_tier": "VIP PRO",
    "order_count": 11,
    "volume_weight": "85,6 tấn | 32 m³",
    "service_fee": 115400000,
    "prize_tag": "Ứng viên Vua Tải Trọng",
    "prize_type": "regular"
  },
  {
    "rank": 9,
    "customer_name": "Khách hàng Tiêu Dùng *** *** Nam",
    "customer_code": "ERK-KH-2287",
    "vip_tier": "KH CŨ",
    "order_count": 12,
    "volume_weight": "24,0 tấn | 38 m³",
    "service_fee": 98700000,
    "prize_tag": "Sự Trở Lại Ấn Tượng",
    "prize_type": "regular"
  },
  {
    "rank": 10,
    "customer_name": "Khách hàng Nội Thất *** *** Đô",
    "customer_code": "ERK-KH-9914",
    "vip_tier": "KH MỚI",
    "order_count": 9,
    "volume_weight": "12,5 tấn | 72 m³",
    "service_fee": 86300000,
    "prize_tag": "Ứng viên Vua Thể Tích",
    "prize_type": "regular"
  },
  {
    "rank": 11,
    "customer_name": "Khách hàng Gia Dụng *** *** Phát",
    "customer_code": "ERK-KH-1043",
    "vip_tier": "VIP PRO",
    "order_count": 15,
    "volume_weight": "21,4 tấn | 34 m³",
    "service_fee": 81200000,
    "prize_tag": "Cột mốc VIP+1",
    "prize_type": "regular"
  },
  {
    "rank": 12,
    "customer_name": "Khách hàng Thiết Bị *** *** Thắng",
    "customer_code": "ERK-KH-8320",
    "vip_tier": "VIP PRO",
    "order_count": 13,
    "volume_weight": "19,8 tấn | 28 m³",
    "service_fee": 76500000,
    "prize_tag": "Bám đuổi Top 10",
    "prize_type": "regular"
  },
  {
    "rank": 13,
    "customer_name": "Khách hàng May Mặc *** *** Linh",
    "customer_code": "ERK-KH-4176",
    "vip_tier": "KH MỚI",
    "order_count": 10,
    "volume_weight": "15,2 tấn | 42 m³",
    "service_fee": 72100000,
    "prize_tag": "Ứng viên Tân Binh",
    "prize_type": "regular"
  },
  {
    "rank": 14,
    "customer_name": "Khách hàng Hóa Mỹ Phẩm *** *** Hà",
    "customer_code": "ERK-KH-5902",
    "vip_tier": "VIP PRO",
    "order_count": 11,
    "volume_weight": "14,0 tấn | 22 m³",
    "service_fee": 68400000,
    "prize_tag": "Cột mốc VIP+1",
    "prize_type": "regular"
  },
  {
    "rank": 15,
    "customer_name": "Khách hàng Điện Tử *** *** Quang",
    "customer_code": "ERK-KH-7241",
    "vip_tier": "VIP PREMIUM",
    "order_count": 8,
    "volume_weight": "11,5 tấn | 19 m³",
    "service_fee": 64800000,
    "prize_tag": "Đặc quyền VIP",
    "prize_type": "regular"
  },
  {
    "rank": 16,
    "customer_name": "Khách hàng Bao Bì *** *** Hưng",
    "customer_code": "ERK-KH-3819",
    "vip_tier": "BASIC",
    "order_count": 9,
    "volume_weight": "16,8 tấn | 31 m³",
    "service_fee": 59900000,
    "prize_tag": "Đua mốc VIP PRO",
    "prize_type": "regular"
  },
  {
    "rank": 17,
    "customer_name": "Khách hàng Hộ KD Giày Dép *** *** Vy",
    "customer_code": "ERK-KH-6055",
    "vip_tier": "BASIC",
    "order_count": 12,
    "volume_weight": "10,2 tấn | 29 m³",
    "service_fee": 56200000,
    "prize_tag": "Đua mốc VIP PRO",
    "prize_type": "regular"
  },
  {
    "rank": 18,
    "customer_name": "Khách hàng Vật Liệu Xây Dựng *** *** Sơn",
    "customer_code": "ERK-KH-2790",
    "vip_tier": "VIP PRO",
    "order_count": 6,
    "volume_weight": "45,0 tấn | 18 m³",
    "service_fee": 52700000,
    "prize_tag": "Tải trọng bứt phá",
    "prize_type": "regular"
  },
  {
    "rank": 19,
    "customer_name": "Khách hàng VPP & Quà Tặng *** *** Mai",
    "customer_code": "ERK-KH-8411",
    "vip_tier": "KH MỚI",
    "order_count": 8,
    "volume_weight": "8,5 tấn | 20 m³",
    "service_fee": 49100000,
    "prize_tag": "Ứng viên Tiềm Năng",
    "prize_type": "regular"
  },
  {
    "rank": 20,
    "customer_name": "Khách hàng Nông Sản Chế Biến *** *** Lộc",
    "customer_code": "ERK-KH-9533",
    "vip_tier": "KH CŨ",
    "order_count": 7,
    "volume_weight": "13,2 tấn | 17 m³",
    "service_fee": 45800000,
    "prize_tag": "Tái kích hoạt",
    "prize_type": "regular"
  },
  {
    "rank": 21,
    "customer_name": "Khách hàng Thủ Công Mỹ Nghệ *** *** Tâm",
    "customer_code": "ERK-KH-1188",
    "vip_tier": "BASIC",
    "order_count": 6,
    "volume_weight": "7,1 tấn | 24 m³",
    "service_fee": 42300000,
    "prize_tag": "Đua mốc VIP PRO",
    "prize_type": "regular"
  },
  {
    "rank": 22,
    "customer_name": "Khách hàng Phụ Tùng Xe Máy *** *** Dũng",
    "customer_code": "ERK-KH-7629",
    "vip_tier": "BASIC",
    "order_count": 5,
    "volume_weight": "9,4 tấn | 15 m³",
    "service_fee": 38900000,
    "prize_tag": "Đua mốc VIP PRO",
    "prize_type": "regular"
  },
  {
    "rank": 23,
    "customer_name": "Khách hàng Hộ KD Mẹ & Bé *** *** Thảo",
    "customer_code": "ERK-KH-3341",
    "vip_tier": "KH MỚI",
    "order_count": 7,
    "volume_weight": "6,2 tấn | 19 m³",
    "service_fee": 35400000,
    "prize_tag": "Tân Binh Tiềm Năng",
    "prize_type": "regular"
  },
  {
    "rank": 24,
    "customer_name": "Khách hàng Đèn Trang Trí *** *** Hoàng",
    "customer_code": "ERK-KH-5820",
    "vip_tier": "BASIC",
    "order_count": 4,
    "volume_weight": "5,8 tấn | 18 m³",
    "service_fee": 31200000,
    "prize_tag": "Đua mốc VIP PRO",
    "prize_type": "regular"
  },
  {
    "rank": 25,
    "customer_name": "Khách hàng Dược Liệu Tự Nhiên *** *** Trúc",
    "customer_code": "ERK-KH-9102",
    "vip_tier": "BASIC",
    "order_count": 4,
    "volume_weight": "4,9 tấn | 12 m³",
    "service_fee": 28600000,
    "prize_tag": "Khởi động 2026",
    "prize_type": "regular"
  }
];

function formatCurrency(num) {
  return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
}

function renderLeaderboard(data) {
  const tbody = document.getElementById('leaderboard-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  // Empty state handling
  if (!data || data.length === 0) {
    const emptyTr = document.createElement('tr');
    emptyTr.innerHTML = `
      <td colspan="7" class="py-12 text-center text-slate-400">
        <div class="text-3xl mb-2">🔍</div>
        <div class="font-bold text-white text-sm sm:text-base">Không tìm thấy khách hàng nào khớp với từ khóa</div>
        <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">Vui lòng kiểm tra lại Tên khách hàng hoặc Mã khách (Ví dụ: ERK-KH-8891, Cty...).</p>
        <button onclick="clearLeaderboardSearch()" class="mt-3 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all">
          Xóa tìm kiếm & Hiện tất cả
        </button>
      </td>
    `;
    tbody.appendChild(emptyTr);
    return;
  }

  data.forEach(item => {
    const tr = document.createElement('tr');

    let rowClass = 'hover:bg-slate-800/40 transition-colors border-b border-slate-800/60';
    let rankBadge = '';
    let prizeBadge = '';

    if (item.rank === 1) {
      rowClass = 'bg-amber-500/10 hover:bg-amber-500/15 transition-colors border-b border-amber-500/20';
      rankBadge = `
        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-sm shadow">
          1
        </div>
      `;
      prizeBadge = `
        <span class="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wide">
          ${item.prize_tag}
        </span>
      `;
    } else if (item.rank === 2) {
      rowClass = 'bg-slate-700/20 hover:bg-slate-700/30 transition-colors border-b border-slate-600/30';
      rankBadge = `
        <div class="w-8 h-8 rounded-full bg-slate-300 text-slate-950 font-black flex items-center justify-center text-sm shadow">
          2
        </div>
      `;
      prizeBadge = `
        <span class="px-2.5 py-1 rounded-full bg-slate-300 text-slate-950 font-extrabold text-[10px] uppercase tracking-wide">
          ${item.prize_tag}
        </span>
      `;
    } else if (item.rank === 3) {
      rowClass = 'bg-amber-900/10 hover:bg-amber-900/20 transition-colors border-b border-amber-800/30';
      rankBadge = `
        <div class="w-8 h-8 rounded-full bg-amber-700 text-white font-black flex items-center justify-center text-sm shadow">
          3
        </div>
      `;
      prizeBadge = `
        <span class="px-2.5 py-1 rounded-full bg-amber-700 text-white font-extrabold text-[10px] uppercase tracking-wide">
          ${item.prize_tag}
        </span>
      `;
    } else {
      rankBadge = `<span class="font-bold text-slate-400 text-sm ml-2">${item.rank}</span>`;
      prizeBadge = `<span class="text-slate-400 text-xs">${item.prize_tag}</span>`;
    }

    let vipBadgeClass = 'bg-slate-700 text-slate-300';
    if (item.vip_tier.includes('ELITE')) vipBadgeClass = 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    else if (item.vip_tier.includes('PREMIUM')) vipBadgeClass = 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    else if (item.vip_tier.includes('MỚI')) vipBadgeClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';

    const displayName = item.customer_name || item.company_name || 'Khách hàng Eureka';
    const customerCode = item.customer_code || item.code || ('ERK-KH-' + (1000 + item.rank));

    tr.className = rowClass;
    tr.innerHTML = `
      <td class="py-3 sm:py-3.5 px-2 sm:px-3 whitespace-nowrap">${rankBadge}</td>
      <td class="py-3 sm:py-3.5 px-2 sm:px-3">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="font-bold text-white text-xs sm:text-sm leading-snug">${displayName}</span>
          <a href="https://www.erktransport.com/pricing" target="_blank" rel="noopener noreferrer" class="sm:hidden px-1.5 py-0.2 rounded text-[10px] font-bold ${vipBadgeClass} inline-flex items-center gap-0.5" title="Chi tiết gói ${item.vip_tier}">
            <span>${item.vip_tier}</span>
            <span class="text-[8px] opacity-70">↗</span>
          </a>
        </div>
        <div class="flex items-center gap-1.5 mt-1 flex-wrap">
          <span class="font-mono text-[10px] sm:text-[11px] font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/25 px-1.5 sm:px-2 py-0.5 rounded tracking-wider inline-flex items-center gap-1">
            <span class="text-[9px] opacity-75 text-slate-400">MÃ:</span>${customerCode}
          </span>
          <span class="md:hidden text-[10px] text-slate-400 font-medium">
            · ${item.order_count} đơn (${item.volume_weight.split('|')[0].trim()})
          </span>
        </div>
        <div class="sm:hidden mt-1.5">
          ${prizeBadge}
        </div>
      </td>
      <td class="py-3.5 px-3 whitespace-nowrap hidden sm:table-cell">
        <a href="https://www.erktransport.com/pricing" target="_blank" rel="noopener noreferrer" class="px-2 py-0.5 rounded text-[11px] font-bold ${vipBadgeClass} hover:scale-105 transition-transform inline-flex items-center gap-1 cursor-pointer" title="Bấm để xem chi tiết quyền lợi gói ${item.vip_tier} tại bảng giá Eureka Logistics">
          <span>${item.vip_tier}</span>
          <span class="text-[9px] opacity-70">↗</span>
        </a>
      </td>
      <td class="py-3.5 px-3 text-right font-bold text-white whitespace-nowrap hidden md:table-cell">${item.order_count} đơn</td>
      <td class="py-3.5 px-3 text-right text-slate-300 whitespace-nowrap hidden md:table-cell">${item.volume_weight}</td>
      <td class="py-3 sm:py-3.5 px-2 sm:px-3 text-right font-black whitespace-nowrap ${item.rank === 1 ? 'text-amber-400 text-sm sm:text-base' : item.rank === 2 ? 'text-slate-200 text-sm sm:text-base' : item.rank === 3 ? 'text-amber-500 text-sm sm:text-base' : 'text-slate-200 text-xs sm:text-sm'}">
        ${formatCurrency(item.service_fee)}
      </td>
      <td class="py-3.5 px-3 text-center whitespace-nowrap hidden sm:table-cell">${prizeBadge}</td>
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

    if (weekEl) weekEl.textContent = `👑 VINH DANH CHIẾN TƯỚNG: ${winner.week_title || 'TOP TUẦN'}`;
    if (nameEl) nameEl.textContent = maskCustomerName(winner.customer_name);
    if (codeEl) codeEl.textContent = `MÃ: ${winner.customer_code || winner.code || 'ERK-KH-8891'}`;
    if (spendEl) spendEl.textContent = winner.weekly_spending.includes('đ') ? winner.weekly_spending : new Intl.NumberFormat('vi-VN').format(winner.weekly_spending) + ' đ';
    if (prizeEl) prizeEl.textContent = winner.prize_name || 'Voucher Tiền Mặt 2.000.000 đ + Huy Hiệu Chiến Tướng';
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
    if (prizeTopSpending) prizeTopSpending.textContent = winner.weekly_spending.includes('đ') ? winner.weekly_spending : new Intl.NumberFormat('vi-VN').format(winner.weekly_spending) + ' đ';
    if (prizeTopPrize) prizeTopPrize.textContent = '🎁 ' + (winner.prize_name || 'Voucher Tiền Mặt 2.000.000 đ + Cúp Chiến Tướng');
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
        renderLeaderboard(parsed);
        updateSearchCounter(parsed.length, parsed.length);
        return;
      }
    } catch (e) {}
  }

  // 2. Fetch file if no custom data exists
  fetch('data/leaderboard-data.json')
    .then(res => res.json())
    .then(data => {
      leaderboardData = data;
      renderLeaderboard(data);
      updateSearchCounter(data.length, data.length);
    })
    .catch(() => {
      leaderboardData = fallbackLeaderboardData;
      renderLeaderboard(fallbackLeaderboardData);
      updateSearchCounter(fallbackLeaderboardData.length, fallbackLeaderboardData.length);
    });
}

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

  const filtered = leaderboardData.filter(item => {
    const name = (item.customer_name || item.company_name || '').toLowerCase();
    const code = (item.customer_code || item.code || '').toLowerCase();
    const originalName = (item.original_name || '').toLowerCase();
    return name.includes(query) || code.includes(query) || originalName.includes(query);
  });

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
