/**
 * Dual Lucky Wheel Engine for Eureka Customer Awards 2026
 * 1. Wheel 1: Vòng Quay Trải Nghiệm Khách Hàng (Tự do quay, áp dụng Tỉ lệ & Kho quà do Admin setup)
 * 2. Wheel 2: Vòng Quay Tri Ân Mùng 05 Hàng Tháng (Admin quay chính thức, Khách xem cơ cấu & danh sách trúng thưởng)
 */

// ==================== AUDIO SYNTHESIZER (Web Audio API) ====================
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let audioContext = null;

function playTickSound() {
  try {
    if (!audioContext) audioContext = new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(460, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 0.04);
    gain.gain.setValueAtTime(0.12, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.04);
  } catch (e) {}
}

function playWinSound() {
  try {
    if (!audioContext) audioContext = new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, audioContext.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + idx * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(audioContext.currentTime + idx * 0.1);
      osc.stop(audioContext.currentTime + idx * 0.1 + 0.45);
    });
  } catch (e) {}
}


// ==================== WHEEL 1: VÒNG QUAY TRẢI NGHIỆM KHÁCH HÀNG ====================
const wheelCanvas = document.getElementById('lucky-wheel-canvas');
let wheelCtx = wheelCanvas ? wheelCanvas.getContext('2d') : null;

let welcomeSegments = [];
let currentAngle1 = 0;
let isSpinning1 = false;

function initWelcomeWheelData() {
  if (typeof getActiveWheelSegments === 'function') {
    welcomeSegments = getActiveWheelSegments();
  } else {
    welcomeSegments = [
      { text: 'VOUCHER 400K', color: '#ea580c', textColor: '#FFFFFF', prize: 'Voucher 400.000 đ', probability_weight: 10, stock_quantity: 8 },
      { text: 'VOUCHER 300K', color: '#1e293b', textColor: '#FBBF24', prize: 'Voucher 300.000 đ', probability_weight: 20, stock_quantity: 25 },
      { text: 'ƯU TIÊN XẾP CONT', color: '#f59e0b', textColor: '#0F172A', prize: 'Vé Ưu Tiên Xếp Cont Sớm', probability_weight: 15, stock_quantity: 18 },
      { text: 'GIẢM 50% LƯU KHO', color: '#0f172a', textColor: '#FFFFFF', prize: 'Giảm 50% Phí Lưu Kho Bãi', probability_weight: 15, stock_quantity: 15 },
      { text: 'VOUCHER 300K', color: '#ea580c', textColor: '#FFFFFF', prize: 'Voucher 300.000 đ', probability_weight: 15, stock_quantity: 20 },
      { text: 'GÓI SQUAD 2-IN-1', color: '#1e293b', textColor: '#38BDF8', prize: 'Gói Hỗ Trợ Squad 2-in-1', probability_weight: 10, stock_quantity: 12 },
      { text: 'VOUCHER 400K', color: '#f59e0b', textColor: '#0F172A', prize: 'Voucher 400.000 đ Lộc Xuân', probability_weight: 10, stock_quantity: 10 },
      { text: 'MAY MẮN LẦN SAU', color: '#0f172a', textColor: '#94A3B8', prize: 'Vé Tích Lũy Quay Mùng 05', probability_weight: 5, stock_quantity: 999 }
    ];
  }
}

function updateWheelSegments(newSegments) {
  welcomeSegments = [...newSegments];
  drawWheel();
}

function drawWheel() {
  if (!wheelCanvas || !wheelCtx) return;

  const numSegments = welcomeSegments.length || 8;
  const arcSize = (2 * Math.PI) / numSegments;
  const centerX = wheelCanvas.width / 2;
  const centerY = wheelCanvas.height / 2;
  const radius = centerX - 10;

  wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

  // Outer Rim Glow
  wheelCtx.save();
  wheelCtx.beginPath();
  wheelCtx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
  wheelCtx.fillStyle = '#1e293b';
  wheelCtx.fill();
  wheelCtx.lineWidth = 6;
  wheelCtx.strokeStyle = '#F59E0B';
  wheelCtx.stroke();
  wheelCtx.restore();

  // Outer lights/dots
  for (let i = 0; i < 24; i++) {
    const dotAngle = (i * 2 * Math.PI) / 24;
    const dotX = centerX + (radius + 4) * Math.cos(dotAngle);
    const dotY = centerY + (radius + 4) * Math.sin(dotAngle);
    wheelCtx.beginPath();
    wheelCtx.arc(dotX, dotY, 3, 0, 2 * Math.PI);
    wheelCtx.fillStyle = i % 2 === 0 ? '#FDE047' : '#FFFFFF';
    wheelCtx.fill();
  }

  // Draw Segments
  for (let i = 0; i < numSegments; i++) {
    const angle = currentAngle1 + i * arcSize;
    wheelCtx.save();
    wheelCtx.beginPath();
    wheelCtx.moveTo(centerX, centerY);
    wheelCtx.arc(centerX, centerY, radius, angle, angle + arcSize);
    wheelCtx.fillStyle = welcomeSegments[i].color || (i % 2 === 0 ? '#ea580c' : '#1e293b');
    wheelCtx.fill();
    wheelCtx.lineWidth = 1.5;
    wheelCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    wheelCtx.stroke();

    // Segment Text
    wheelCtx.translate(centerX, centerY);
    wheelCtx.rotate(angle + arcSize / 2);
    wheelCtx.textAlign = 'right';
    wheelCtx.fillStyle = welcomeSegments[i].textColor || '#FFFFFF';
    wheelCtx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
    wheelCtx.shadowColor = 'rgba(0,0,0,0.6)';
    wheelCtx.shadowBlur = 4;
    wheelCtx.fillText(welcomeSegments[i].text, radius - 25, 5);
    wheelCtx.restore();
  }

  // Center ring
  wheelCtx.save();
  wheelCtx.beginPath();
  wheelCtx.arc(centerX, centerY, 52, 0, 2 * Math.PI);
  wheelCtx.fillStyle = '#0b1120';
  wheelCtx.fill();
  wheelCtx.lineWidth = 3;
  wheelCtx.strokeStyle = '#F59E0B';
  wheelCtx.stroke();
  wheelCtx.restore();
}

// Spin Wheel 1 with Weighted Probability & Stock decrement
function spinWheel() {
  if (isSpinning1) return;

  const phoneInput = document.getElementById('user-phone-input');
  let phone = (phoneInput && phoneInput.value.trim()) || '';
  if (!phone) {
    phone = '098' + Math.floor(1000000 + Math.random() * 9000000);
    if (phoneInput) phoneInput.value = phone;
  }

  // Mask Phone for privacy: 098***6789
  const maskedPhone = phone.length >= 7 
    ? phone.substring(0, 3) + '***' + phone.substring(phone.length - 4) 
    : '098***' + Math.floor(1000 + Math.random() * 9000);

  // Pick target segment based on Admin-configured probability weights & stock
  let availableWeights = [];
  welcomeSegments.forEach((seg, idx) => {
    // If stock > 0, include weight; otherwise 0
    const stock = seg.stock_quantity !== undefined ? seg.stock_quantity : 1;
    const weight = stock > 0 ? (seg.probability_weight || 10) : 0;
    availableWeights.push(weight);
  });

  const totalWeight = availableWeights.reduce((a, b) => a + b, 0);
  let targetIndex = 0;

  if (totalWeight > 0) {
    let rand = Math.random() * totalWeight;
    for (let i = 0; i < availableWeights.length; i++) {
      if (rand < availableWeights[i]) {
        targetIndex = i;
        break;
      }
      rand -= availableWeights[i];
    }
  } else {
    // All items out of stock -> fallback to segment 7 (May Mắn Lần Sau)
    targetIndex = welcomeSegments.length - 1;
  }

  const numSegments = welcomeSegments.length;
  const arcSize = (2 * Math.PI) / numSegments;
  const spins = 5 + Math.floor(Math.random() * 3);
  const targetSegmentAngle = (3 * Math.PI / 2) - (targetIndex * arcSize + arcSize / 2);
  const totalRotation = spins * 2 * Math.PI + targetSegmentAngle;

  const startAngle = currentAngle1 % (2 * Math.PI);
  const finalAngle = startAngle + totalRotation;
  const duration = 4800;
  const startTime = performance.now();
  let lastTickAngle = startAngle;

  isSpinning1 = true;

  function animateSpin1(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3.5);
    currentAngle1 = startAngle + (finalAngle - startAngle) * easeOut;

    if (Math.abs(currentAngle1 - lastTickAngle) >= arcSize) {
      playTickSound();
      lastTickAngle = currentAngle1;
    }

    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animateSpin1);
    } else {
      isSpinning1 = false;
      playWinSound();

      // Decrement stock if item has stock
      const winningSeg = welcomeSegments[targetIndex];
      if (winningSeg.stock_quantity && winningSeg.stock_quantity > 0) {
        winningSeg.stock_quantity -= 1;
        // Persist back to localStorage
        localStorage.setItem('eureka_welcome_wheel_config', JSON.stringify(welcomeSegments));
      }

      if (typeof showWinningResult === 'function') {
        showWinningResult(winningSeg, maskedPhone);
      }
    }
  }

  requestAnimationFrame(animateSpin1);
}

function fillDemoPhone() {
  const prefixes = ['098', '091', '090', '097', '088'];
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomPhone = p + Math.floor(1000000 + Math.random() * 9000000);
  const input = document.getElementById('user-phone-input');
  if (input) input.value = randomPhone;
}

// Modal open/close controls for Welcome Wheel Popup
function openWelcomeWheelModal() {
  const modal = document.getElementById('welcome-wheel-modal');
  if (modal) {
    modal.classList.remove('hidden');
    setTimeout(() => {
      drawWheel();
    }, 60);
  }
}

function closeWelcomeWheelModal() {
  const modal = document.getElementById('welcome-wheel-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}


// ==================== WHEEL 2: VÒNG QUAY TRI ÂN MÙNG 05 HÀNG THÁNG ====================
const m05Canvas = document.getElementById('m05-wheel-canvas');
let m05Ctx = m05Canvas ? m05Canvas.getContext('2d') : null;

const m05Segments = [
  { text: 'VOUCHER 300K', color: '#ea580c', textColor: '#FFFFFF', prize: 'Giải Voucher 300.000 đ' },
  { text: 'ƯU TIÊN XẾP CONT', color: '#1e293b', textColor: '#FBBF24', prize: 'Vé Ưu Tiên Xếp Cont Sớm' },
  { text: 'VOUCHER 400K', color: '#f59e0b', textColor: '#0F172A', prize: 'Giải Voucher 400.000 đ Lộc Xuân' },
  { text: 'GIẢM 50% LƯU KHO', color: '#0f172a', textColor: '#FFFFFF', prize: 'Giảm 50% Phí Lưu Kho Bãi' },
  { text: 'VOUCHER 300K', color: '#ea580c', textColor: '#FFFFFF', prize: 'Giải Voucher 300.000 đ' },
  { text: 'GÓI SQUAD 2-IN-1', color: '#1e293b', textColor: '#38BDF8', prize: 'Gói Chuyên Viên Squad 2-in-1' },
  { text: 'TRI ÂN ĐỐI TÁC', color: '#f59e0b', textColor: '#0F172A', prize: 'Bộ Quà Tri Ân Khách Hàng Eureka' },
  { text: 'MAY MẮN LẦN SAU', color: '#0f172a', textColor: '#94A3B8', prize: 'Tích Lũy Vào Kỳ Quay Tới' }
];

let currentAngle2 = 0;
let isSpinning2 = false;

function drawM05Wheel() {
  if (!m05Canvas || !m05Ctx) return;

  const numSegments = m05Segments.length;
  const arcSize = (2 * Math.PI) / numSegments;
  const centerX = m05Canvas.width / 2;
  const centerY = m05Canvas.height / 2;
  const radius = centerX - 10;

  m05Ctx.clearRect(0, 0, m05Canvas.width, m05Canvas.height);

  // Outer Rim Glow
  m05Ctx.save();
  m05Ctx.beginPath();
  m05Ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
  m05Ctx.fillStyle = '#0f172a';
  m05Ctx.fill();
  m05Ctx.lineWidth = 6;
  m05Ctx.strokeStyle = '#38BDF8';
  m05Ctx.stroke();
  m05Ctx.restore();

  // Dots
  for (let i = 0; i < 24; i++) {
    const dotAngle = (i * 2 * Math.PI) / 24;
    const dotX = centerX + (radius + 4) * Math.cos(dotAngle);
    const dotY = centerY + (radius + 4) * Math.sin(dotAngle);
    m05Ctx.beginPath();
    m05Ctx.arc(dotX, dotY, 3, 0, 2 * Math.PI);
    m05Ctx.fillStyle = i % 2 === 0 ? '#38BDF8' : '#FDE047';
    m05Ctx.fill();
  }

  // Draw Segments
  for (let i = 0; i < numSegments; i++) {
    const angle = currentAngle2 + i * arcSize;
    m05Ctx.save();
    m05Ctx.beginPath();
    m05Ctx.moveTo(centerX, centerY);
    m05Ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
    m05Ctx.fillStyle = m05Segments[i].color;
    m05Ctx.fill();
    m05Ctx.lineWidth = 1.5;
    m05Ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    m05Ctx.stroke();

    m05Ctx.translate(centerX, centerY);
    m05Ctx.rotate(angle + arcSize / 2);
    m05Ctx.textAlign = 'right';
    m05Ctx.fillStyle = m05Segments[i].textColor;
    m05Ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    m05Ctx.fillText(m05Segments[i].text, radius - 20, 5);
    m05Ctx.restore();
  }

  // Center ring
  m05Ctx.save();
  m05Ctx.beginPath();
  m05Ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
  m05Ctx.fillStyle = '#0b1120';
  m05Ctx.fill();
  m05Ctx.lineWidth = 3;
  m05Ctx.strokeStyle = '#38BDF8';
  m05Ctx.stroke();
  m05Ctx.restore();
}

// User clicks Mùng 05 Spin -> Show Information/Lock Notice
function triggerM05UserClick() {
  if (typeof isAdminLoggedIn === 'function' && isAdminLoggedIn()) {
    spinM05Admin();
  } else {
    showM05NoticeModal();
  }
}

function showM05NoticeModal() {
  const modal = document.getElementById('m05-notice-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeM05NoticeModal() {
  const modal = document.getElementById('m05-notice-modal');
  if (modal) modal.classList.add('hidden');
}

// Admin official spin for Mùng 05
function spinM05Admin() {
  if (isSpinning2) return;
  isSpinning2 = true;

  const periodSelect = document.getElementById('m05-period-select');
  const period = (periodSelect && periodSelect.value) || 'Tháng 10 (Kỳ 1)';

  // Pick random winner from sample pool or inputs
  const sampleCompanies = [
    { company: 'Công Ty CP Thương Mại *** Minh', phone: '091***4321', order: 'ERK-***88' },
    { company: 'Tập Đoàn XNK *** Á Châu', phone: '098***6789', order: 'ERK-***92' },
    { company: 'TNHH SX & PP Gia Dụng *** An', phone: '090***8827', order: 'ERK-***27' },
    { company: 'Hộ KD Phụ Kiện Điện Tử *** Việt', phone: '096***0774', order: 'ERK-***74' },
    { company: 'Cty XNK Vật Tư Y Tế *** Long', phone: '093***1052', order: 'ERK-***52' }
  ];
  const luckyPick = sampleCompanies[Math.floor(Math.random() * sampleCompanies.length)];

  // Choose target segment (weight towards Voucher)
  const targetIndex = Math.floor(Math.random() * (m05Segments.length - 1));
  const numSegments = m05Segments.length;
  const arcSize = (2 * Math.PI) / numSegments;
  const spins = 6 + Math.floor(Math.random() * 2);
  const targetSegmentAngle = (3 * Math.PI / 2) - (targetIndex * arcSize + arcSize / 2);
  const totalRotation = spins * 2 * Math.PI + targetSegmentAngle;

  const startAngle = currentAngle2 % (2 * Math.PI);
  const finalAngle = startAngle + totalRotation;
  const duration = 5000;
  const startTime = performance.now();
  let lastTickAngle = startAngle;

  function animateSpin2(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3.5);
    currentAngle2 = startAngle + (finalAngle - startAngle) * easeOut;

    if (Math.abs(currentAngle2 - lastTickAngle) >= arcSize) {
      playTickSound();
      lastTickAngle = currentAngle2;
    }

    drawM05Wheel();

    if (progress < 1) {
      requestAnimationFrame(animateSpin2);
    } else {
      isSpinning2 = false;
      playWinSound();

      const prizeObj = m05Segments[targetIndex];

      // Save winner into monthly list
      if (typeof getMonthlyWinners === 'function') {
        const winners = getMonthlyWinners();
        winners.unshift({
          period: period,
          phone_masked: luckyPick.phone,
          company_masked: luckyPick.company,
          order_masked: luckyPick.order,
          prize: prizeObj.prize,
          status: 'Vừa quay trúng'
        });
        localStorage.setItem('eureka_monthly_winners', JSON.stringify(winners));
        renderPublicMonthlyWinners();
      }

      alert(`🎉 [ADMIN QUAY THƯỞNG MÙNG 05 THÀNH CÔNG]\nKỳ quay: ${period}\nĐơn vị trúng: ${luckyPick.company} (${luckyPick.phone})\nGiải thưởng: ${prizeObj.prize}`);
    }
  }

  requestAnimationFrame(animateSpin2);
}

// Render Public Monthly Winners Table (Masked for privacy)
function renderPublicMonthlyWinners() {
  const container = document.getElementById('public-m05-winners-body');
  if (!container) return;

  let winners = [];
  if (typeof getMonthlyWinners === 'function') {
    winners = getMonthlyWinners();
  } else {
    winners = [
      { period: "Tháng 10 (Kỳ 1)", phone_masked: "098***6789", company_masked: "Tập Đoàn XNK *** Á Châu", order_masked: "ERK-***89", prize: "Voucher 300.000 đ", status: "Đã trừ cước đơn mới" },
      { period: "Tháng 10 (Kỳ 1)", phone_masked: "091***4321", company_masked: "Công Ty CP Thương Mại *** Minh", order_masked: "ERK-***45", prize: "Voucher 300.000 đ", status: "Đã trừ cước đơn mới" },
      { period: "Tháng 10 (Kỳ 1)", phone_masked: "090***8827", company_masked: "TNHH SX & PP Gia Dụng *** An", order_masked: "ERK-***12", prize: "Voucher 300.000 đ", status: "Đang chờ xuất kho" }
    ];
  }

  container.innerHTML = '';
  winners.forEach(w => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-800 hover:bg-slate-800/40 text-xs text-slate-300 transition-colors';
    tr.innerHTML = `
      <td class="py-3 px-3">
        <span class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-bold border border-blue-500/20 text-[11px]">${w.period}</span>
      </td>
      <td class="py-3 px-3 font-mono font-bold text-amber-400">${w.phone_masked}</td>
      <td class="py-3 px-3 font-semibold text-white">${w.company_masked}</td>
      <td class="py-3 px-3 font-mono text-slate-400">${w.order_masked}</td>
      <td class="py-3 px-3 font-bold text-emerald-400">${w.prize}</td>
      <td class="py-3 px-3">
        <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          ${w.status}
        </span>
      </td>
    `;
    container.appendChild(tr);
  });
}

// Initialize on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  initWelcomeWheelData();
  drawWheel();
  drawM05Wheel();
  renderPublicMonthlyWinners();

  // Auto-pop up welcome wheel modal on page load after 600ms
  setTimeout(() => {
    openWelcomeWheelModal();
  }, 600);
});
