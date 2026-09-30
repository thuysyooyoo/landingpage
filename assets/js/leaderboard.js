/**
 * Leaderboard Engine
 * Data-driven from data/leaderboard-data.json with Instant Search & Filtering
 */

let leaderboardData = [];

// Fallback data if file:// protocol blocks fetch in local preview
const fallbackLeaderboardData = [
  {
    "rank": 1,
    "company_name": "Tập Đoàn XNK Thiết Bị Công Nghiệp Á Châu",
    "customer_code": "ERK-00912",
    "vip_tier": "VIP ELITE",
    "order_count": 48,
    "volume_weight": "142,5 tấn | 190 m³",
    "service_fee": 428650000,
    "prize_tag": "💻 Laptop Surface 35Tr",
    "prize_type": "top1"
  },
  {
    "rank": 2,
    "company_name": "Công Ty Cổ Phần Thương Mại Tân Phát Minh",
    "customer_code": "ERK-00431",
    "vip_tier": "VIP ELITE",
    "order_count": 35,
    "volume_weight": "98,2 tấn | 135 m³",
    "service_fee": 312400000,
    "prize_tag": "📱 iPad Air M3 20Tr",
    "prize_type": "top2"
  },
  {
    "rank": 3,
    "company_name": "TNHH Sản Xuất & Phân Phối Đồ Gia Dụng Bảo An",
    "customer_code": "ERK-00827",
    "vip_tier": "VIP PREMIUM",
    "order_count": 29,
    "volume_weight": "76,0 tấn | 110 m³",
    "service_fee": 245900000,
    "prize_tag": "🌪️ Máy Lọc Dyson 10Tr",
    "prize_type": "top3"
  },
  {
    "rank": 4,
    "company_name": "Cty XNK Vật Tư Y Tế Thăng Long",
    "customer_code": "ERK-01052",
    "vip_tier": "VIP PREMIUM",
    "order_count": 22,
    "volume_weight": "54,1 tấn | 68 m³",
    "service_fee": 188300000,
    "prize_tag": "Bám đuổi Top 3",
    "prize_type": "regular"
  },
  {
    "rank": 5,
    "company_name": "Thương Mại & Dịch Vụ Vĩnh Hưng",
    "customer_code": "ERK-00219",
    "vip_tier": "VIP PRO",
    "order_count": 19,
    "volume_weight": "42,8 tấn | 55 m³",
    "service_fee": 154200000,
    "prize_tag": "Cột mốc VIP+1",
    "prize_type": "regular"
  },
  {
    "rank": 6,
    "company_name": "TNHH Phụ Kiện Điện Tử SmartViet",
    "customer_code": "ERK-00774",
    "vip_tier": "VIP PRO",
    "order_count": 26,
    "volume_weight": "31,5 tấn | 45 m³",
    "service_fee": 141050000,
    "prize_tag": "Ứng viên Vua Số Đơn",
    "prize_type": "regular"
  },
  {
    "rank": 7,
    "company_name": "Công Ty Cổ Phần Đồ Chơi Thông Minh KidTech",
    "customer_code": "ERK-01289",
    "vip_tier": "KH MỚI",
    "order_count": 14,
    "volume_weight": "18,2 tấn | 88 m³",
    "service_fee": 128900000,
    "prize_tag": "Dẫn đầu Tân Binh",
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

    tr.className = rowClass;
    tr.innerHTML = `
      <td class="py-4 px-3">${rankBadge}</td>
      <td class="py-4 px-3">
        <span class="font-bold text-white block">${item.company_name}</span>
        <span class="text-[11px] font-mono text-slate-400">Mã KH: ${item.customer_code}</span>
      </td>
      <td class="py-4 px-3">
        <span class="px-2 py-0.5 rounded text-[11px] font-bold ${vipBadgeClass}">
          ${item.vip_tier}
        </span>
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

function loadLeaderboardData() {
  fetch('data/leaderboard-data.json')
    .then(res => res.json())
    .then(data => {
      leaderboardData = data;
      renderLeaderboard(data);
    })
    .catch(() => {
      // Fallback for local file:// previews
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
  const filtered = leaderboardData.filter(item => 
    item.company_name.toLowerCase().includes(query) ||
    item.customer_code.toLowerCase().includes(query)
  );
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

window.addEventListener('DOMContentLoaded', () => {
  loadLeaderboardData();
});
