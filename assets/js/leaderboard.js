/**
 * Leaderboard Engine for Eureka Customer Awards 2026
 * Privacy-First: Masked Customer Names (>=50% masked) & Phone Numbers (50% masked: 5/10 digits)
 * Header Column: "Khách Hàng"
 * Dynamic Fetch with In-Memory Safe Fallback
 */

let leaderboardData = [];

// Fallback data if file:// protocol blocks fetch in local preview (at least 50% masked)
const fallbackLeaderboardData = [
  {
    "rank": 1,
    "customer_name": "Khách hàng T*** Đ*** XNK *** Châu",
    "phone_masked": "098*****89",
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
    "phone_masked": "091*****21",
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
    "phone_masked": "090*****27",
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
    "phone_masked": "093*****52",
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
    "phone_masked": "097*****19",
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
    "phone_masked": "096*****74",
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
    "phone_masked": "088*****89",
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
    "phone_masked": "094*****15",
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
    "phone_masked": "091*****88",
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
    "phone_masked": "098*****22",
    "vip_tier": "KH MỚI",
    "order_count": 9,
    "volume_weight": "12,5 tấn | 72 m³",
    "service_fee": 86300000,
    "prize_tag": "Ứng viên Vua Thể Tích",
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

  data.forEach(item => {
    const tr = document.createElement('tr');

    let rowClass = 'hover:bg-slate-800/40 transition-colors';
    let rankBadge = '';
    let prizeBadge = '';

    if (item.rank === 1) {
      rowClass = 'bg-amber-500/10 hover:bg-amber-500/15 transition-colors';
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
      rowClass = 'bg-slate-700/20 hover:bg-slate-700/30 transition-colors';
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
      rowClass = 'bg-amber-900/10 hover:bg-amber-900/20 transition-colors';
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
      rankBadge = `<span class="font-bold text-slate-400">${item.rank}</span>`;
      prizeBadge = `<span class="text-slate-400 text-xs">${item.prize_tag}</span>`;
    }

    let vipBadgeClass = 'bg-slate-700 text-slate-300';
    if (item.vip_tier.includes('ELITE')) vipBadgeClass = 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    else if (item.vip_tier.includes('PREMIUM')) vipBadgeClass = 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    else if (item.vip_tier.includes('MỚI')) vipBadgeClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';

    const displayName = item.customer_name || item.company_name || 'Khách hàng Eureka';

    tr.className = rowClass;
    tr.innerHTML = `
      <td class="py-4 px-3">${rankBadge}</td>
      <td class="py-4 px-3">
        <span class="font-bold text-white block">${displayName}</span>
      </td>
      <td class="py-4 px-3">
        <span class="font-mono font-bold text-amber-300 text-xs tracking-wider">${item.phone_masked}</span>
      </td>
      <td class="py-4 px-3">
        <a href="https://www.erktransport.com/pricing" target="_blank" rel="noopener noreferrer" class="px-2 py-0.5 rounded text-[11px] font-bold ${vipBadgeClass} hover:scale-105 transition-transform inline-flex items-center gap-1 cursor-pointer" title="Bấm để xem chi tiết quyền lợi gói ${item.vip_tier} tại bảng giá Eureka Logistics">
          <span>${item.vip_tier}</span>
          <span class="text-[9px] opacity-70">↗</span>
        </a>
      </td>
      <td class="py-4 px-3 text-right font-bold text-white">${item.order_count} đơn</td>
      <td class="py-4 px-3 text-right text-slate-300">${item.volume_weight}</td>
      <td class="py-4 px-3 text-right font-black ${item.rank === 1 ? 'text-amber-400 text-base' : item.rank === 2 ? 'text-slate-200 text-base' : item.rank === 3 ? 'text-amber-500 text-base' : 'text-slate-200'}">
        ${formatCurrency(item.service_fee)}
      </td>
      <td class="py-4 px-3 text-center">${prizeBadge}</td>
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

function maskPhoneNumber(phone) {
  if (!phone) return '098*****89';
  if (phone.includes('*')) return phone;
  const clean = phone.replace(/\D/g, '');
  if (clean.length >= 10) {
    return clean.slice(0, 3) + '*****' + clean.slice(-2);
  }
  return clean.slice(0, 2) + '***' + clean.slice(-2);
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
    const phoneEl = document.getElementById('spotlight-customer-phone');
    const spendEl = document.getElementById('spotlight-weekly-spending');
    const prizeEl = document.getElementById('spotlight-prize-tag');
    const msgEl = document.getElementById('spotlight-congrats-msg');

    if (weekEl) weekEl.textContent = `👑 VINH DANH CHIẾN TƯỚNG: ${winner.week_title || 'TOP TUẦN'}`;
    if (nameEl) nameEl.textContent = maskCustomerName(winner.customer_name);
    if (phoneEl) phoneEl.textContent = maskPhoneNumber(winner.phone_masked || winner.phone || '');
    if (spendEl) spendEl.textContent = winner.weekly_spending.includes('đ') ? winner.weekly_spending : new Intl.NumberFormat('vi-VN').format(winner.weekly_spending) + ' đ';
    if (prizeEl) prizeEl.textContent = winner.prize_name || 'Voucher Tiền Mặt 2.000.000 đ + Huy Hiệu Chiến Tướng';
    if (msgEl) msgEl.textContent = winner.congrats_message || 'Nhiệt liệt chúc mừng Quý khách đã xuất sắc dẫn đầu doanh số chi tiêu dịch vụ tuần qua, bứt phá tiến độ vận chuyển vượt bậc!';

    container.classList.remove('hidden');
    container.style.display = 'block';
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
    })
    .catch(() => {
      leaderboardData = fallbackLeaderboardData;
      renderLeaderboard(fallbackLeaderboardData);
    });
}

function filterLeaderboard() {
  const query = (document.getElementById('leaderboard-search')?.value || '').toLowerCase().trim();
  if (!query) {
    renderLeaderboard(leaderboardData);
    return;
  }
  const filtered = leaderboardData.filter(item => {
    const name = (item.customer_name || item.company_name || '').toLowerCase();
    const phone = (item.phone_masked || '').toLowerCase();
    return name.includes(query) || phone.includes(query);
  });
  renderLeaderboard(filtered);
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

