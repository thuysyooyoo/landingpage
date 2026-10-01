
function initGalaLedBulbs() {
  startArcadeChasingBulbs();
}
function toggleGalaLedBulbs(speed) {}
function initM05Segments() {
  if (typeof initM05WheelSegments === 'function') initM05WheelSegments();
}

/**
 * Dual Lucky Wheel Engine for Eureka Customer Awards 2026
 * 1. Wheel 1: Vòng Quay Trải Nghiệm Khách Hàng (100% Popup Modal, lưu SĐT Lead vào Admin)
 * 2. Wheel 2: Vòng Quay Đại Lễ Tri Ân Mùng 05 (Admin quay, bảng công khai chỉ hiện mã booking không che)
 */

// ==================== COMMON UTILITIES & SOUND ====================
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
}

function playWinSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
    });
  } catch (e) {}
}

// ==================== STORAGE FOR LEADS & AFFILIATE CONTEST ====================
const STORAGE_KEY_SPIN_LEADS = 'eureka_spin_leads';
const STORAGE_KEY_REF_CLICKS = 'eureka_ref_clicks';

// Lấy mã nhân viên giới thiệu đang hoạt động (từ URL param -> session/local storage)
function getActiveAffiliateRef() {
  try {
    return sessionStorage.getItem('eureka_active_ref') || localStorage.getItem('eureka_last_ref') || 'direct';
  } catch (e) {
    return 'direct';
  }
}

// Lấy bảng đếm số lượt click theo từng mã ref
function getAffiliateClicks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REF_CLICKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    "nam": 38,
    "lan": 24,
    "thao": 15
  };
}

function recordAffiliateClick(refCode) {
  if (!refCode || refCode === 'direct') return;
  try {
    const clicks = getAffiliateClicks();
    const cleanRef = String(refCode).trim().toLowerCase();
    clicks[cleanRef] = (clicks[cleanRef] || 0) + 1;
    localStorage.setItem(STORAGE_KEY_REF_CLICKS, JSON.stringify(clicks));
    if (typeof syncAdminConfigToCloud === 'function') {
      syncAdminConfigToCloud(STORAGE_KEY_REF_CLICKS, clicks);
    }
  } catch (e) {}
}

// Khởi tạo ghi nhận lượt truy cập từ link tiếp thị (?ref=... / ?nv=... / ?aff=...)
function initAffiliateTracking() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = (urlParams.get('ref') || urlParams.get('nv') || urlParams.get('aff') || urlParams.get('nhanvien') || '').trim().toLowerCase();
    
    if (refParam) {
      sessionStorage.setItem('eureka_active_ref', refParam);
      localStorage.setItem('eureka_last_ref', refParam);

      // Chống spam: Mỗi phiên truy cập của 1 người chỉ đếm 1 lượt click cho nhân viên
      const sessionCountKey = 'eureka_counted_click_' + refParam;
      if (!sessionStorage.getItem(sessionCountKey)) {
        sessionStorage.setItem(sessionCountKey, 'true');
        recordAffiliateClick(refParam);
      }
    }
  } catch (e) {
    console.log('Error initializing affiliate tracking:', e);
  }
}

function getSpinLeads() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SPIN_LEADS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // Default seed leads for demonstration with referrer tracking
  return [
    { id: "L-101", phone: "0984356451", voucherCode: "ERK-908618", prize: "Voucher Chiết Khấu 400.000 đ", createdAt: "17:15 - 30/09/2026", status: "Chờ áp dụng qua Zalo", ref: "nam" },
    { id: "L-102", phone: "0912883421", voucherCode: "ERK-441209", prize: "Voucher Chiết Khấu 300.000 đ", createdAt: "16:42 - 30/09/2026", status: "Đã tư vấn Zalo", ref: "lan" },
    { id: "L-103", phone: "0977651209", voucherCode: "ERK-882315", prize: "Vé Ưu Tiên Xếp Cont Sớm", createdAt: "15:20 - 30/09/2026", status: "Chờ áp dụng qua Zalo", ref: "nam" },
    { id: "L-104", phone: "0903112882", voucherCode: "ERK-331908", prize: "Giảm 50% Phí Lưu Kho Bãi", createdAt: "14:05 - 30/09/2026", status: "Đã tư vấn Zalo", ref: "thao" }
  ];
}

function forwardLeadToBotWebhook(newLead) {
  try {
    const rawConfig = localStorage.getItem('eureka_bot_config');
    if (!rawConfig) return;
    const config = JSON.parse(rawConfig);

    const rawDigits = (newLead.phone || '').replace(/\D/g, '');
    const zaloPhone = rawDigits.startsWith('0') ? '84' + rawDigits.slice(1) : (rawDigits.startsWith('84') ? rawDigits : ('84' + rawDigits));
    const zaloChatLink = `https://zalo.me/${zaloPhone}`;

    const leadRef = (newLead.ref && newLead.ref !== 'direct') ? newLead.ref.toUpperCase() : 'Nguồn Tự Nhiên';
    const refBadgeTg = (newLead.ref && newLead.ref !== 'direct') 
      ? `👤 *Người Giới Thiệu (Ref):* \`${leadRef}\` 🌟 *(+1 Điểm Thi Đua)*` 
      : `🌐 *Nguồn:* \`Trực tiếp (Website)\``;

    // 1. Forward to Telegram Bot if configured and active
    if (config.telegram_enabled && config.telegram_token && config.telegram_chat_id) {
      const tgText = `🔔 *[EUREKA 2026] CÓ KHÁCH QUAY TRÚNG THƯỞNG MỚI!*
━━━━━━━━━━━━━━━━━━
📱 *Số Điện Thoại:* \`${newLead.phone}\`
🎁 *Phần Quà:* *${newLead.prize}*
🎟 *Mã Voucher:* \`${newLead.voucherCode}\`
${refBadgeTg}
⏰ *Thời Gian:* ${newLead.createdAt}
━━━━━━━━━━━━━━━━━━
👉 *[BẤM ĐÂY CHAT ZALO VỚI KHÁCH](${zaloChatLink})*
📞 *Gọi điện ngay:* tel:${newLead.phone}`;

      let tgChatId = config.telegram_chat_id ? String(config.telegram_chat_id).trim() : '';
      if (tgChatId && /^[0-9]{10,}$/.test(tgChatId)) {
        tgChatId = '-' + tgChatId;
      }

      fetch(`https://api.telegram.org/bot${config.telegram_token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId,
          text: tgText,
          parse_mode: 'Markdown',
          disable_web_page_preview: false
        })
      }).catch(err => console.log('Telegram forward error:', err));
    }

    // 2. Forward to Custom Webhook URL (Google Sheets / Zalo Bot / CRM / Lark)
    if (config.webhook_enabled && config.webhook_url) {
      fetch(config.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'new_wheel_spin',
          phone: newLead.phone,
          voucher_code: newLead.voucherCode,
          prize: newLead.prize,
          referrer: newLead.ref || 'direct',
          created_at: newLead.createdAt,
          zalo_link: zaloChatLink,
          hotline: '84898586622'
        }),
        mode: 'no-cors'
      }).catch(err => console.log('Custom webhook error:', err));
    }
  } catch (e) {
    console.log('Error forwarding lead to bot:', e);
  }
}

function saveSpinLead(newLead) {
  if (!newLead.ref) {
    newLead.ref = getActiveAffiliateRef();
  }
  const leads = getSpinLeads();
  leads.unshift(newLead);
  localStorage.setItem(STORAGE_KEY_SPIN_LEADS, JSON.stringify(leads));
  if (typeof renderAdminSpinLeadsTable === 'function') {
    renderAdminSpinLeadsTable();
  }
  if (typeof renderAdminAffiliateContest === 'function') {
    renderAdminAffiliateContest();
  }
  // Tự động đẩy dữ liệu sang Telegram Bot / Webhook nếu có cấu hình
  forwardLeadToBotWebhook(newLead);

  // Tự động đồng bộ lên Google Sheets Cloud Database
  if (typeof syncSpinLeadToCloud === 'function') {
    syncSpinLeadToCloud(newLead);
  }
}

// ==================== WHEEL 1: VÒNG QUAY TRẢI NGHIỆM KHÁCH HÀNG ====================
function getWheelCanvas1() {
  return document.getElementById('wheel-canvas') || document.getElementById('lucky-wheel-canvas');
}

let galaLedInterval = null;


function initArcadeBulbs(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const numBulbs = 10; // Exactly 10 large 3D glowing pearl bulbs as in reference arcade wheel
  const rect = container.getBoundingClientRect();
  const size = rect.width > 0 ? rect.width : 300;
  const center = size / 2;
  const radius = center - 4;

  for (let i = 0; i < numBulbs; i++) {
    const angle = (i * 2 * Math.PI) / numBulbs - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);

    const bulb = document.createElement('div');
    bulb.className = 'arcade-bulb';
    bulb.style.left = `${x}px`;
    bulb.style.top = `${y}px`;
    container.appendChild(bulb);
  }
}

let arcadeBulbInterval1 = null;
let arcadeBulbInterval2 = null;

function startArcadeChasingBulbs() {
  initArcadeBulbs('led-bulbs-container');
  initArcadeBulbs('m05-led-bulbs-container');

  const bulbs1 = document.querySelectorAll('#led-bulbs-container .arcade-bulb');
  const bulbs2 = document.querySelectorAll('#m05-led-bulbs-container .arcade-bulb');
  let step = 0;

  if (arcadeBulbInterval1) clearInterval(arcadeBulbInterval1);
  arcadeBulbInterval1 = setInterval(() => {
    bulbs1.forEach((b, idx) => {
      if ((idx + step) % 2 === 0) {
        b.classList.add('bulb-on');
      } else {
        b.classList.remove('bulb-on');
      }
    });
    bulbs2.forEach((b, idx) => {
      if ((idx + step) % 2 === 0) {
        b.classList.add('bulb-on');
      } else {
        b.classList.remove('bulb-on');
      }
    });
    step++;
  }, 280);
}


// ==================== LUXURY 3D PASTEL PALETTE & ENGINE ====================
// ==================== UNIFIED 3D ARCADE LUCKY WHEEL ENGINE (REF MATCH) ====================
// Alternating Luxury Lilac Pastel & Cream White (Exact Match to Reference Arcade Wheel)
const ARCADE_PASTEL_PALETTE = [
  { baseColor: '#EDE9FE', apexColor: '#F5F3FF', textColor: '#4C1D95' }, // Soft Lilac
  { baseColor: '#FFFFFF', apexColor: '#F8FAFC', textColor: '#0F172A' }, // Pure Cream White
  { baseColor: '#FCE7F3', apexColor: '#FDF2F8', textColor: '#831843' }, // Soft Rose Macaron
  { baseColor: '#FFFFFF', apexColor: '#F8FAFC', textColor: '#0F172A' }, // Pure Cream White
  { baseColor: '#E0F2FE', apexColor: '#F0F9FF', textColor: '#0369A1' }, // Soft Ice Cyan
  { baseColor: '#FFFFFF', apexColor: '#F8FAFC', textColor: '#0F172A' }, // Pure Cream White
  { baseColor: '#FEF9C3', apexColor: '#FEFCE8', textColor: '#713F12' }, // Soft Butter Vanilla
  { baseColor: '#FFFFFF', apexColor: '#F8FAFC', textColor: '#0F172A' }  // Pure Cream White
];

// Presets for Welcome Wheel (Modal)
const ARCADE_WELCOME_PRESETS = [
  { id: 1, text: 'VOUCHER 400K', sub: 'LỘC XUÂN', baseColor: '#EDE9FE', apexColor: '#F5F3FF', textColor: '#4C1D95', prize: 'Voucher 400.000 đ Lộc Xuân', probability_weight: 10, stock_quantity: 8 },
  { id: 2, text: 'VOUCHER 300K', sub: 'CHIẾT KHẤU', baseColor: '#FFFFFF', apexColor: '#F8FAFC', textColor: '#0F172A', prize: 'Voucher Chiết Khấu 300.000 đ', probability_weight: 20, stock_quantity: 25 },
  { id: 3, text: 'XẾP CONT VIP', sub: 'ƯU TIÊN SỚM', baseColor: '#FCE7F3', apexColor: '#FDF2F8', textColor: '#831843', prize: 'Vé Ưu Tiên Xếp Cont Sớm', probability_weight: 15, stock_quantity: 18 },
  { id: 4, text: 'GIẢM 50% PHÍ', sub: 'LƯU KHO BÃI', baseColor: '#FFFFFF', apexColor: '#F8FAFC', textColor: '#0F172A', prize: 'Giảm 50% Phí Lưu Kho Bãi', probability_weight: 15, stock_quantity: 15 },
  { id: 5, text: 'VOUCHER 300K', sub: 'LỘC XUÂN', baseColor: '#E0F2FE', apexColor: '#F0F9FF', textColor: '#0369A1', prize: 'Voucher Chiết Khấu 300.000 đ', probability_weight: 15, stock_quantity: 20 },
  { id: 6, text: 'SQUAD 2-IN-1', sub: 'HỖ TRỢ VIP', baseColor: '#FFFFFF', apexColor: '#F8FAFC', textColor: '#0F172A', prize: 'Gói Hỗ Trợ Squad 2-in-1', probability_weight: 10, stock_quantity: 12 },
  { id: 7, text: 'VOUCHER 400K', sub: 'LỘC XUÂN', baseColor: '#FEF9C3', apexColor: '#FEFCE8', textColor: '#713F12', prize: 'Voucher 400.000 đ Lộc Xuân', probability_weight: 10, stock_quantity: 10 },
  { id: 8, text: 'VÉ MAY MẮN', sub: 'QUAY MÙNG 05', baseColor: '#FFFFFF', apexColor: '#F8FAFC', textColor: '#0F172A', prize: 'Vé Tích Lũy Quay Mùng 05', probability_weight: 5, stock_quantity: 999 }
];

let welcomeSegments = [];

function initWelcomeWheelData() {
  welcomeSegments = JSON.parse(JSON.stringify(ARCADE_WELCOME_PRESETS));
  try {
    localStorage.setItem('eureka_welcome_wheel_config', JSON.stringify(welcomeSegments));
  } catch (e) {}
}

let currentAngle1 = 0;
let isSpinning1 = false;

// Unified 3D Render Engine shared 100% by both wheels
function render3DLuckyWheel(ctx, canvas, segments, currentAngle, isM05 = false) {
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = (width / 2) - 8;
  const numSegments = segments.length;
  const arcSize = (2 * Math.PI) / numSegments;

  ctx.clearRect(0, 0, width, height);

  // 1. CHROME & MAGENTA 3D BEVEL (Khung kim loại chém cạnh sáng loáng)
  ctx.save();
  // Outer Ambient Shadow
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius + 4, 0, 2 * Math.PI);
  ctx.lineWidth = 8;
  const chassisShadow = ctx.createLinearGradient(0, 0, width, height);
  chassisShadow.addColorStop(0, '#E879F9');
  chassisShadow.addColorStop(0.5, '#A855F7');
  chassisShadow.addColorStop(1, '#6B21A8');
  ctx.strokeStyle = chassisShadow;
  ctx.stroke();

  // Polished Chrome Mirror Ring
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius + 1, 0, 2 * Math.PI);
  ctx.lineWidth = 5;
  const chromeRing = ctx.createLinearGradient(0, 0, width, height);
  chromeRing.addColorStop(0, '#FFFFFF');
  chromeRing.addColorStop(0.25, '#E2E8F0');
  chromeRing.addColorStop(0.5, '#94A3B8');
  chromeRing.addColorStop(0.75, '#FFFFFF');
  chromeRing.addColorStop(1, '#64748B');
  ctx.strokeStyle = chromeRing;
  ctx.stroke();

  // Inner Beveled Lip
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius - 3, 0, 2 * Math.PI);
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.stroke();
  ctx.restore();

  // 2. CONVEX PASTEL ROTOR SEGMENTS
  const rotorRadius = outerRadius - 5;

  segments.forEach((seg, i) => {
    const angle = currentAngle + i * arcSize;
    const midAngle = angle + arcSize / 2;
    const baseCol = seg.baseColor || (i % 2 === 0 ? '#EDE9FE' : '#FFFFFF');
    const apexCol = seg.apexColor || (i % 2 === 0 ? '#F5F3FF' : '#F8FAFC');
    const textCol = seg.textColor || (i % 2 === 0 ? '#4C1D95' : '#0F172A');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, rotorRadius, angle, angle + arcSize);
    ctx.closePath();

    // A. Radial Gradient
    const radGrad = ctx.createRadialGradient(
      centerX + (rotorRadius * 0.4) * Math.cos(midAngle),
      centerY + (rotorRadius * 0.4) * Math.sin(midAngle),
      5,
      centerX, centerY, rotorRadius
    );
    radGrad.addColorStop(0, apexCol);
    radGrad.addColorStop(0.7, baseCol);
    radGrad.addColorStop(1, baseCol);
    ctx.fillStyle = radGrad;
    ctx.fill();

    // B. Pillowed Convex Spine Highlight (Sống lưng múi cong 3D)
    const perpAngle = midAngle + Math.PI / 2;
    const ribWidth = rotorRadius * Math.sin(arcSize / 2);
    const p1X = centerX + Math.cos(midAngle) * (rotorRadius * 0.55) - Math.cos(perpAngle) * ribWidth;
    const p1Y = centerY + Math.sin(midAngle) * (rotorRadius * 0.55) - Math.sin(perpAngle) * ribWidth;
    const p2X = centerX + Math.cos(midAngle) * (rotorRadius * 0.55) + Math.cos(perpAngle) * ribWidth;
    const p2Y = centerY + Math.sin(midAngle) * (rotorRadius * 0.55) + Math.sin(perpAngle) * ribWidth;

    const spineGrad = ctx.createLinearGradient(p1X, p1Y, p2X, p2Y);
    spineGrad.addColorStop(0, 'rgba(15, 23, 42, 0.08)');
    spineGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.05)');
    spineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)'); // Highlight spine
    spineGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.05)');
    spineGrad.addColorStop(1, 'rgba(15, 23, 42, 0.08)');
    ctx.fillStyle = spineGrad;
    ctx.fill();

    // C. Metallic Spoke Dividers
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + rotorRadius * Math.cos(angle), centerY + rotorRadius * Math.sin(angle));
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowColor = 'rgba(15, 23, 42, 0.2)';
    ctx.shadowBlur = 3;
    ctx.stroke();
    ctx.restore();

    // D. Outer Terminus Pearl Rivet
    const beadX = centerX + (rotorRadius - 6) * Math.cos(angle);
    const beadY = centerY + (rotorRadius - 6) * Math.sin(angle);
    ctx.save();
    ctx.beginPath();
    ctx.arc(beadX, beadY, 3, 0, 2 * Math.PI);
    const beadGrad = ctx.createRadialGradient(beadX - 1, beadY - 1, 0.5, beadX, beadY, 3);
    beadGrad.addColorStop(0, '#FFFFFF');
    beadGrad.addColorStop(0.5, '#FEF08A');
    beadGrad.addColorStop(1, '#D97706');
    ctx.fillStyle = beadGrad;
    ctx.fill();
    ctx.restore();

    // E. Segment Typography (High-Contrast, WCAG AAA Sharp)
    const normAngle = ((midAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
    const isFlipped = normAngle > Math.PI / 2 && normAngle < 3 * Math.PI / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(midAngle);

    ctx.fillStyle = textCol;
    ctx.font = isM05 
      ? '900 11px monospace, "Plus Jakarta Sans", sans-serif'
      : '900 11px "Plus Jakarta Sans", sans-serif';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 2;

    if (isFlipped) {
      ctx.rotate(Math.PI);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(seg.text, -(rotorRadius - 18), isM05 ? 0 : -3);
      if (!isM05 && seg.sub) {
        ctx.font = '800 8.5px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = textCol;
        ctx.fillText(seg.sub, -(rotorRadius - 18), 9);
      }
    } else {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(seg.text, rotorRadius - 18, isM05 ? 0 : -3);
      if (!isM05 && seg.sub) {
        ctx.font = '800 8.5px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = textCol;
        ctx.fillText(seg.sub, rotorRadius - 18, 9);
      }
    }
    ctx.restore();
    ctx.restore();
  });

  // 3. CURVED SAPPHIRE CRYSTAL DOME GLARE
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, rotorRadius, 0, 2 * Math.PI);
  ctx.clip();
  const domeGlare = ctx.createLinearGradient(centerX * 0.2, 0, centerX * 1.8, centerY * 1.6);
  domeGlare.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
  domeGlare.addColorStop(0.3, 'rgba(255, 255, 255, 0.15)');
  domeGlare.addColorStop(0.55, 'rgba(255, 255, 255, 0)');
  domeGlare.addColorStop(0.85, 'rgba(255, 255, 255, 0.08)');
  domeGlare.addColorStop(1, 'rgba(255, 255, 255, 0.25)');
  ctx.fillStyle = domeGlare;
  ctx.fill();
  ctx.restore();

  // 4. MAGNIFICENT 3D MAGENTA/GOLD CENTER HUB (Khớp 100% Ảnh Tham Chiếu)
  ctx.save();
  const hubRadius = isM05 ? 38 : 34;

  // Recessed Cavity Shadow
  ctx.beginPath();
  ctx.arc(centerX, centerY, hubRadius + 5, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
  ctx.shadowColor = 'rgba(15, 23, 42, 0.65)';
  ctx.shadowBlur = 14;
  ctx.fill();

  // Tier 1: Polished Chrome Ring
  ctx.beginPath();
  ctx.arc(centerX, centerY, hubRadius, 0, 2 * Math.PI);
  const hubChrome = ctx.createLinearGradient(centerX - hubRadius, centerY - hubRadius, centerX + hubRadius, centerY + hubRadius);
  hubChrome.addColorStop(0, '#FFFFFF');
  hubChrome.addColorStop(0.4, '#E2E8F0');
  hubChrome.addColorStop(0.8, '#94A3B8');
  hubChrome.addColorStop(1, '#64748B');
  ctx.fillStyle = hubChrome;
  ctx.fill();

  // Tier 2: Magenta Glow Outer Collar
  ctx.beginPath();
  ctx.arc(centerX, centerY, hubRadius - 3.5, 0, 2 * Math.PI);
  const hubMagenta = ctx.createLinearGradient(centerX - hubRadius, centerY - hubRadius, centerX + hubRadius, centerY + hubRadius);
  hubMagenta.addColorStop(0, '#F472B6');
  hubMagenta.addColorStop(0.5, '#D946EF');
  hubMagenta.addColorStop(1, '#A855F7');
  ctx.fillStyle = hubMagenta;
  ctx.shadowColor = 'rgba(217, 70, 239, 0.6)';
  ctx.shadowBlur = 8;
  ctx.fill();

  // Tier 3: 3D Spherical Push Dome
  ctx.beginPath();
  ctx.arc(centerX, centerY, hubRadius - 7, 0, 2 * Math.PI);
  const hubDome = ctx.createRadialGradient(
    centerX - (hubRadius * 0.35),
    centerY - (hubRadius * 0.35),
    2,
    centerX, centerY, hubRadius - 7
  );
  hubDome.addColorStop(0, '#FFFFFF');
  hubDome.addColorStop(0.3, '#F472B6');
  hubDome.addColorStop(0.7, '#C026D3');
  hubDome.addColorStop(1, '#86198F');
  ctx.fillStyle = hubDome;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 6;
  ctx.fill();

  // Integrated Pointer Arrow (Mũi chỉ 3D chém cạnh chỉ lên cung trúng thưởng)
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - hubRadius - 8);
  ctx.lineTo(centerX - 9, centerY - hubRadius + 3);
  ctx.lineTo(centerX + 9, centerY - hubRadius + 3);
  ctx.closePath();
  const arrowGrad = ctx.createLinearGradient(centerX - 9, 0, centerX + 9, 0);
  arrowGrad.addColorStop(0, '#F472B6');
  arrowGrad.addColorStop(0.5, '#FFFFFF');
  arrowGrad.addColorStop(1, '#D946EF');
  ctx.fillStyle = arrowGrad;
  ctx.shadowColor = 'rgba(217, 70, 239, 0.8)';
  ctx.shadowBlur = 6;
  ctx.fill();
  ctx.restore();
}

function drawWheel() {
  const canvas1 = getWheelCanvas1();
  if (!canvas1) return;
  const ctx1 = canvas1.getContext('2d');
  if (!ctx1) return;

  if (!welcomeSegments || welcomeSegments.length === 0) {
    initWelcomeWheelData();
  }

  render3DLuckyWheel(ctx1, canvas1, welcomeSegments, currentAngle1, false);
}

function pickWinningIndexByWeight(segments) {
  const eligible = segments.map((seg, idx) => {
    let w = Number(seg.probability_weight);
    if (isNaN(w) || w < 0) w = 0;
    if (seg.stock_quantity !== undefined && seg.stock_quantity <= 0) {
      w = 0;
    }
    return {
      index: idx,
      weight: w
    };
  });

  const totalWeight = eligible.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) {
    const firstAvailable = eligible.find(e => (segments[e.index].stock_quantity === undefined || segments[e.index].stock_quantity > 0));
    return firstAvailable ? firstAvailable.index : 0;
  }

  let randomVal = Math.random() * totalWeight;
  for (let i = 0; i < eligible.length; i++) {
    if (eligible[i].weight > 0) {
      if (randomVal < eligible[i].weight) {
        return eligible[i].index;
      }
      randomVal -= eligible[i].weight;
    }
  }
  return eligible.find(e => e.weight > 0)?.index ?? 0;
}

// ==================== PHONE VALIDATION & DUPLICATE LOCK ====================
const VALID_VN_PHONE_PREFIXES = [
  // Viettel
  '086', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039',
  // Mobifone
  '089', '090', '093', '070', '076', '077', '078', '079',
  // Vinaphone
  '088', '091', '094', '081', '082', '083', '084', '085',
  // Vietnamobile & các mạng ảo (Wintel, Itelecom...)
  '092', '056', '058', '052', '059', '099', '087', '055'
];

function validateRealVietnamesePhone(phoneStr) {
  if (!phoneStr || typeof phoneStr !== 'string') {
    return { valid: false, message: 'Vui lòng nhập số điện thoại để tham gia quay thưởng!' };
  }

  // Bỏ khoảng trắng, dấu gạch nối, dấu chấm
  let clean = phoneStr.replace(/[\s\.\-_]/g, '').trim();

  // Chuẩn hóa +84 hoặc 84 về 0
  if (clean.startsWith('+84')) clean = '0' + clean.slice(3);
  else if (clean.startsWith('84') && clean.length === 11) clean = '0' + clean.slice(2);

  // Phải đúng 10 chữ số
  if (!/^[0-9]{10}$/.test(clean)) {
    return { valid: false, message: 'Số điện thoại không đúng định dạng! Vui lòng nhập đúng 10 chữ số (Ví dụ: 0981234567).' };
  }

  // Kiểm tra đầu số di động thực tế tại Việt Nam
  const prefix3 = clean.substring(0, 3);
  if (!VALID_VN_PHONE_PREFIXES.includes(prefix3)) {
    return { valid: false, message: `Đầu số "${prefix3}" không phải đầu số di động hợp lệ tại Việt Nam!` };
  }

  // Chống số ảo/số rác (dãy số trùng lặp 7 số cuối liên tiếp)
  const last7 = clean.slice(3);
  if (/^(\d)\1{6,}$/.test(last7) || /^(\d)\1+$/.test(clean)) {
    return { valid: false, message: 'Số điện thoại không hợp lệ (trùng lặp liên tiếp)! Vui lòng nhập số điện thoại có thật.' };
  }

  // Chống số mẫu giả lập lộ liễu
  if (clean === '0123456789' || clean === '0987654321' || clean === '0901234567') {
    return { valid: false, message: 'Vui lòng nhập số điện thoại thực của bạn, không nhập dãy số mẫu thử nghiệm.' };
  }

  return { valid: true, normalizedPhone: clean };
}

function hasPhoneAlreadySpun(phone) {
  const norm = phone.replace(/[\s\.\-_]/g, '').replace(/^\+?84/, '0');
  
  // 1. Kiểm tra trong danh sách Leads đã lưu
  const leads = getSpinLeads();
  const matchedLead = leads.find(l => {
    const lNorm = (l.phone || '').replace(/[\s\.\-_]/g, '').replace(/^\+?84/, '0');
    return lNorm === norm;
  });
  if (matchedLead) return matchedLead;

  // 2. Kiểm tra trong danh sách khóa riêng biệt
  try {
    const lockedMap = JSON.parse(localStorage.getItem('eureka_locked_spun_phones') || '{}');
    if (lockedMap[norm]) return lockedMap[norm];
  } catch (e) {}

  return null;
}

function markPhoneAsSpun(phone, prizeName, voucherCode) {
  const norm = phone.replace(/[\s\.\-_]/g, '').replace(/^\+?84/, '0');
  try {
    const lockedMap = JSON.parse(localStorage.getItem('eureka_locked_spun_phones') || '{}');
    lockedMap[norm] = {
      phone: norm,
      prize: prizeName,
      voucherCode: voucherCode,
      createdAt: new Date().toLocaleString('vi-VN')
    };
    localStorage.setItem('eureka_locked_spun_phones', JSON.stringify(lockedMap));
  } catch (e) {}
}

function viewExistingVoucher(phone) {
  const prev = hasPhoneAlreadySpun(phone);
  if (!prev) return;

  const maskedPhone = prev.phone.length >= 8 
    ? prev.phone.slice(0, 3) + '*****' + prev.phone.slice(-2) 
    : prev.phone.slice(0, 2) + '****' + prev.phone.slice(-2);

  const fakeSeg = {
    prize: prev.prize || 'Voucher Tri Ân',
    text: prev.prize || 'VOUCHER'
  };

  if (typeof showWinningResult === 'function') {
    showWinningResult(fakeSeg, maskedPhone, prev.phone, prev.voucherCode || 'ERK-VOUCHER');
  }
}

function spinWheel() {
  if (isSpinning1) return;

  const input = document.getElementById('user-phone-input');
  const errorEl = document.getElementById('phone-error');
  const rawPhone = input ? input.value.trim() : '';

  // 1. Kiểm tra định dạng số điện thoại thực tế tại Việt Nam
  const check = validateRealVietnamesePhone(rawPhone);
  if (!check.valid) {
    if (errorEl) {
      errorEl.innerHTML = `⚠️ ${check.message}`;
      errorEl.classList.remove('hidden');
    }
    if (input) input.focus();
    return;
  }

  const validPhone = check.normalizedPhone;

  // 2. KHÓA CHỐNG TRÙNG LẶP: Mỗi SĐT chỉ được tham gia 1 lần duy nhất
  const prevSpin = hasPhoneAlreadySpun(validPhone);
  if (prevSpin) {
    if (errorEl) {
      errorEl.innerHTML = `
        <div class="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs text-left space-y-1.5 mt-2">
          <div class="font-bold flex items-center gap-1.5 text-amber-300">
            <span>🔒</span> SĐT [${validPhone}] ĐÃ THAM GIA QUAY THƯỞNG!
          </div>
          <div class="text-[11px] leading-relaxed text-slate-300">
            Mỗi số điện thoại chỉ được quay <strong>01 lần duy nhất</strong> trong chương trình.<br>
            • Phần quà đã nhận: <strong class="text-emerald-300">${prevSpin.prize || 'Voucher chiết khấu'}</strong><br>
            • Mã voucher: <code class="px-1.5 py-0.5 rounded bg-slate-900 font-mono text-amber-300 font-bold border border-slate-700">${prevSpin.voucherCode || 'ERK-VOUCHER'}</code>
          </div>
          <div class="pt-1">
            <button type="button" onclick="viewExistingVoucher('${validPhone}')" class="text-[11px] text-sky-400 hover:text-sky-300 font-bold underline cursor-pointer">
              👉 Bấm để xem lại & lấy lại mã Voucher đã trúng
            </button>
          </div>
        </div>
      `;
      errorEl.classList.remove('hidden');
    }
    if (input) input.focus();
    return;
  }

  if (errorEl) errorEl.classList.add('hidden');

  // Privacy 50% mask for ticker: e.g. 098*****89
  const maskedPhone = validPhone.slice(0, 3) + '*****' + validPhone.slice(-2);

  const targetIndex = pickWinningIndexByWeight(welcomeSegments);
  const numSegments = welcomeSegments.length;
  const arcSize = (2 * Math.PI) / numSegments;
  const spins = 5 + Math.floor(Math.random() * 2);
  const targetSegmentAngle = (3 * Math.PI / 2) - (targetIndex * arcSize + arcSize / 2);
  const totalRotation = spins * 2 * Math.PI + targetSegmentAngle;

  const startAngle = currentAngle1 % (2 * Math.PI);
  const finalAngle = startAngle + totalRotation;
  const duration = 4800;
  const startTime = performance.now();
  let lastTickAngle = startAngle;

  isSpinning1 = true;
  toggleGalaLedBulbs(90);
  const needle = document.getElementById('wheel-needle');
  if (needle) needle.classList.add('needle-vibrating');

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
      toggleGalaLedBulbs(400);
      if (needle) needle.classList.remove('needle-vibrating');
      playWinSound();

      const winningSeg = welcomeSegments[targetIndex];
      if (winningSeg.stock_quantity && winningSeg.stock_quantity > 0) {
        winningSeg.stock_quantity -= 1;
        localStorage.setItem('eureka_welcome_wheel_config', JSON.stringify(welcomeSegments));
        if (typeof syncAdminConfigToCloud === 'function') {
          syncAdminConfigToCloud('eureka_welcome_wheel_config', welcomeSegments);
        }
      }

      // Generate Voucher Code
      const voucherCode = 'ERK-' + Math.floor(100000 + Math.random() * 900000);
      const prizeName = winningSeg.prize || winningSeg.text;

      // SAVE LEAD SĐT VÀO ADMIN DATABASE
      const newLead = {
        id: 'LEAD-' + Date.now(),
        phone: validPhone, // SĐT thật không che dành cho Admin liên hệ
        voucherCode: voucherCode,
        prize: prizeName,
        createdAt: new Date().toLocaleString('vi-VN', {
          hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
        }),
        status: 'Chờ áp dụng qua Zalo'
      };
      saveSpinLead(newLead);

      // KHÓA SĐT KHÔNG CHO QUAY LẠI
      markPhoneAsSpun(validPhone, prizeName, voucherCode);

      if (typeof showWinningResult === 'function') {
        showWinningResult(winningSeg, maskedPhone, validPhone, voucherCode);
      }
    }
  }

  requestAnimationFrame(animateSpin1);
}

function fillDemoPhone() {
  const demoPrefixes = ['098', '097', '096', '090', '093', '091', '088', '086', '038', '079'];
  let candidate = '';
  for (let i = 0; i < 50; i++) {
    const p = demoPrefixes[Math.floor(Math.random() * demoPrefixes.length)];
    candidate = p + Math.floor(1000000 + Math.random() * 9000000);
    if (!hasPhoneAlreadySpun(candidate)) break;
  }

  const input = document.getElementById('user-phone-input');
  const errorEl = document.getElementById('phone-error');
  if (input) input.value = candidate;
  if (errorEl) errorEl.classList.add('hidden');
}

// Modal open/close controls for Welcome Wheel Popup
function openWelcomeWheelModal() {
  const modal = document.getElementById('welcome-wheel-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('show-modal');
    modal.style.display = 'flex';
    initGalaLedBulbs();
    toggleGalaLedBulbs(400);
    setTimeout(() => {
      drawWheel();
    }, 60);
  }
}

function closeWelcomeWheelModal() {
  const modal = document.getElementById('welcome-wheel-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('show-modal');
    modal.style.display = 'none';
    if (galaLedInterval) clearInterval(galaLedInterval);
  }
}


// ==================== STORAGE & CONFIG FOR WHEEL 2 (MÙNG 05) ====================
const STORAGE_KEY_M05_BOOKINGS = 'eureka_m05_booking_pool';
const STORAGE_KEY_M05_PRIZE = 'eureka_m05_current_prize';
const DEFAULT_M05_PRIZE = 'Voucher Chiết Khấu 300.000 đ';

const DEFAULT_M05_BOOKING_POOL = [
  "ERK-BK-2026-8891", "ERK-BK-2026-4432", "ERK-BK-2026-1205", "ERK-BK-2026-9012",
  "ERK-BK-2026-7731", "ERK-BK-2026-5524", "ERK-BK-2026-3198", "ERK-BK-2026-6640",
  "ERK-BK-2026-2287", "ERK-BK-2026-9914", "ERK-BK-2026-1043", "ERK-BK-2026-8320",
  "ERK-BK-2026-4176", "ERK-BK-2026-5902", "ERK-BK-2026-7241", "ERK-BK-2026-3819",
  "ERK-BK-2026-6055", "ERK-BK-2026-2790", "ERK-BK-2026-8411", "ERK-BK-2026-9533"
];

function getM05BookingPool() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_M05_BOOKINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return [...DEFAULT_M05_BOOKING_POOL];
}

function getM05CurrentPrize() {
  return localStorage.getItem(STORAGE_KEY_M05_PRIZE) || DEFAULT_M05_PRIZE;
}

function setM05CurrentPrize(prize) {
  if (!prize) return;
  localStorage.setItem(STORAGE_KEY_M05_PRIZE, prize.trim());
  updateM05PublicInfo();
}

function updateM05PublicInfo() {
  const currentPrize = getM05CurrentPrize();
  const pool = getM05BookingPool();

  const publicPrizeBadge = document.getElementById('m05-public-prize-badge');
  if (publicPrizeBadge) publicPrizeBadge.textContent = currentPrize;

  const publicCountBadge = document.getElementById('m05-public-count-badge');
  if (publicCountBadge) publicCountBadge.textContent = `${pool.length} mã hợp lệ`;

  const adminSpinPrize = document.getElementById('m05-admin-spin-prize');
  if (adminSpinPrize) adminSpinPrize.textContent = currentPrize;
}

// ==================== WHEEL 2: VÒNG QUAY TRI ÂN ====================
const m05Canvas = document.getElementById('m05-wheel-canvas');
let m05Ctx = m05Canvas ? m05Canvas.getContext('2d') : null;

const M05_PALETTE = [
  { bg: '#0284C7', text: '#FFFFFF' },
  { bg: '#0F172A', text: '#38BDF8' },
  { bg: '#EA580C', text: '#FFFFFF' },
  { bg: '#1E293B', text: '#FBBF24' },
  { bg: '#0369A1', text: '#FFFFFF' },
  { bg: '#F59E0B', text: '#0F172A' },
  { bg: '#0F172A', text: '#34D399' },
  { bg: '#0284C7', text: '#FFFFFF' },
  { bg: '#1E293B', text: '#38BDF8' },
  { bg: '#D97706', text: '#0F172A' },
  { bg: '#0369A1', text: '#FFFFFF' },
  { bg: '#0F172A', text: '#F87171' }
];

let m05Segments = [];

function initM05WheelSegments() {
  const pool = getM05BookingPool();
  // Display between 8 and 12 slices for visual clarity and readability
  const sliceCount = Math.min(Math.max(pool.length, 6), 12);
  m05Segments = [];
  for (let i = 0; i < sliceCount; i++) {
    const code = pool[i % pool.length];
    const colorScheme = M05_PALETTE[i % M05_PALETTE.length];
    m05Segments.push({
      text: code,
      color: colorScheme.bg,
      textColor: colorScheme.text
    });
  }
}

let currentAngle2 = 0;
let isSpinning2 = false;

function drawM05Wheel() {
  const m05Canvas = document.getElementById('m05-wheel-canvas');
  if (!m05Canvas) return;
  const m05Ctx = m05Canvas.getContext('2d');
  if (!m05Ctx) return;

  if (!m05Segments || m05Segments.length === 0) {
    initM05WheelSegments();
  }

  render3DLuckyWheel(m05Ctx, m05Canvas, m05Segments, currentAngle2, true);
}


function spinM05Admin() {
  if (isSpinning2) return;

  const pool = getM05BookingPool();
  if (!pool || pool.length === 0) {
    alert('⚠️ Danh sách mã booking dự thưởng đang trống!\nVui lòng vào Admin để tải hoặc nạp danh sách mã booking trước khi quay.');
    return;
  }

  const periodSelect = document.getElementById('m05-period-select');
  const period = periodSelect ? periodSelect.value : 'Kỳ Tháng 10/2026 (Quay Mùng 05/11)';
  const currentPrize = getM05CurrentPrize();

  // Extract customer code prefix from booking code (e.g., 'A114-10' -> 'A114', 'ERK-BK-2026-8891' -> '8891')
  function extractCustomerCode(bookingCode) {
    if (!bookingCode) return bookingCode;
    // Format: PREFIX-NUMBER (e.g., A114-10) -> take PREFIX
    const parts = bookingCode.split('-');
    if (parts.length >= 2 && /^[A-Z]+\d+$/i.test(parts[0])) return parts[0].toUpperCase();
    // Format: ERK-BK-2026-XXXX -> take last segment
    return parts[parts.length - 1];
  }

  // Get already-won customer codes in this period to ensure deduplication
  const existingWinners = (typeof getMonthlyWinners === 'function') ? getMonthlyWinners() : [];
  const wonCustomerCodes = existingWinners
    .filter(w => w.period === period)
    .map(w => extractCustomerCode(w.booking_code));

  // Filter pool to exclude already-won customer codes
  let eligiblePool = pool.filter(code => !wonCustomerCodes.includes(extractCustomerCode(code)));
  if (eligiblePool.length === 0) {
    alert('⚠️ Tất cả mã khách hàng trong kỳ "' + period + '" đã trúng thưởng!\nVui lòng chọn kỳ quay khác hoặc nạp thêm mã booking.');
    return;
  }

  // 1. Pick the winning booking code ensuring unique customer code per spin
  const winningBooking = eligiblePool[Math.floor(Math.random() * eligiblePool.length)];

  // 2. Select target segment and ensure its text displays the winning booking code
  const targetIndex = Math.floor(Math.random() * m05Segments.length);
  m05Segments[targetIndex].text = winningBooking;
  drawM05Wheel();

  // 3. Calculation for pointer stopping angle
  const numSegments = m05Segments.length;
  const arcSize = (2 * Math.PI) / numSegments;
  const spins = 6 + Math.floor(Math.random() * 2);
  const targetSegmentAngle = (3 * Math.PI / 2) - (targetIndex * arcSize + arcSize / 2);
  const startAngle = currentAngle2 % (2 * Math.PI);
  let totalRotation = spins * 2 * Math.PI + (targetSegmentAngle - startAngle);
  while (totalRotation < spins * 2 * Math.PI) {
    totalRotation += 2 * Math.PI;
  }
  const finalAngle = currentAngle2 + totalRotation;
  const duration = 5200;
  const startTime = performance.now();
  let lastTickAngle = currentAngle2;

  isSpinning2 = true;

  function animateSpin2(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3.5);
    currentAngle2 = startAngle + (finalAngle - startAngle) * easeOut;

    if (Math.abs(currentAngle2 - lastTickAngle) >= arcSize * 0.8) {
      playTickSound();
      lastTickAngle = currentAngle2;
    }

    drawM05Wheel();

    if (progress < 1) {
      requestAnimationFrame(animateSpin2);
    } else {
      isSpinning2 = false;
      playWinSound();
      if (typeof triggerConfetti === 'function') triggerConfetti();

      // Record winning booking into monthly list
      if (typeof getMonthlyWinners === 'function') {
        const winners = getMonthlyWinners();
        winners.unshift({
          id: 'W-' + Date.now(),
          period: period,
          booking_code: winningBooking,
          prize: currentPrize,
          draw_time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString('vi-VN'),
          status: '✅ Vừa quay trúng'
        });
        localStorage.setItem('eureka_monthly_winners', JSON.stringify(winners));
        renderPublicMonthlyWinners();
        if (typeof renderAdminWinnersTable === 'function') {
          renderAdminWinnersTable();
        }
        // Tự động đẩy kết quả M05 lên Google Sheets Cloud
        if (typeof syncM05WinnerToCloud === 'function' && winners.length > 0) {
          syncM05WinnerToCloud(winners[0]);
        }
      }

      setTimeout(() => {
        alert(`🎉 [CHÚC MỪNG MÃ BOOKING TRÚNG THƯỞNG]\n═════════════════════════════════════\n🎯 Kỳ Quay: ${period}\n🎫 Mã Booking Trúng Thưởng: ${winningBooking}\n🎁 Giải Thưởng Tri Ân: ${currentPrize}\n═════════════════════════════════════\nKết quả đã được ghi nhận tự động vào Bảng Vinh Danh Công Khai!`);
      }, 250);
    }
  }

  requestAnimationFrame(animateSpin2);
}

// Render Public Monthly Winners Table (CHỈ ĐỂ MÃ BOOKING TRÚNG THƯỞNG, KHÔNG CẦN CHE)
function renderPublicMonthlyWinners() {
  const container = document.getElementById('public-m05-winners-body');
  if (!container) return;

  let winners = [];
  if (typeof getMonthlyWinners === 'function') {
    winners = getMonthlyWinners();
  } else {
    winners = [
      { period: "Kỳ 10/2026 (Mùng 05/11)", booking_code: "ERK-BK-2026-8891", prize: "Voucher Chiết Khấu 300.000 đ", draw_time: "10h05 - 05/11/2026", status: "✅ Đã đối soát & trừ cước" },
      { period: "Kỳ 10/2026 (Mùng 05/11)", booking_code: "ERK-BK-2026-4432", prize: "Vé Ưu Tiên Xếp Cont Sớm", draw_time: "10h10 - 05/11/2026", status: "✅ Đã cấp vé ưu tiên" },
      { period: "Kỳ 10/2026 (Mùng 05/11)", booking_code: "ERK-BK-2026-1205", prize: "Voucher Chiết Khấu 300.000 đ", draw_time: "10h15 - 05/11/2026", status: "✅ Đã đối soát & trừ cước" },
      { period: "Kỳ 09/2026 (Mùng 05/10)", booking_code: "ERK-BK-2026-7731", prize: "Giảm 50% Phí Lưu Kho Bãi", draw_time: "10h08 - 05/10/2026", status: "✅ Đã hoàn tất trừ phí" }
    ];
  }

  container.innerHTML = '';
  winners.forEach(w => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-800 hover:bg-slate-800/40 text-xs text-slate-300 transition-colors';
    tr.innerHTML = `
      <td class="py-3 px-3 hidden sm:table-cell">
        <span class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-bold border border-blue-500/20 text-[11px]">${w.period}</span>
      </td>
      <td class="py-2.5 sm:py-3 px-2 sm:px-3">
        <span class="font-mono font-black text-amber-300 tracking-wider text-xs sm:text-sm bg-slate-800/80 px-2 py-0.5 sm:py-1 rounded border border-amber-400/30 inline-block">
          ${w.booking_code || w.order_masked || 'ERK-BK-' + Math.floor(1000 + Math.random() * 9000)}
        </span>
        <div class="sm:hidden text-[10px] text-sky-400 mt-1 font-semibold">
          Kỳ: ${w.period}
        </div>
      </td>
      <td class="py-2.5 sm:py-3 px-2 sm:px-3 font-bold text-white text-xs">${w.prize}</td>
      <td class="py-3 px-3 text-slate-400 font-mono text-[11px] hidden md:table-cell">${w.draw_time || '10h00 - Mùng 05'}</td>
      <td class="py-2.5 sm:py-3 px-2 sm:px-3 text-center">
        <span class="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>${w.status || 'Đã ghi nhận'}</span>
        </span>
      </td>
    `;
    container.appendChild(tr);
  });
}

function initAllWheelEngines() {
  initAffiliateTracking();
  initWelcomeWheelData();
  drawWheel();
  initM05WheelSegments();
  drawM05Wheel();
  updateM05PublicInfo();
  renderPublicMonthlyWinners();

  // Auto-pop up welcome wheel modal on page load after 500ms
  setTimeout(() => {
    openWelcomeWheelModal();
  }, 500);
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initAllWheelEngines);
} else {
  initAllWheelEngines();
}


document.addEventListener('DOMContentLoaded', () => {
  startArcadeChasingBulbs();
  if (typeof drawWheel === 'function') drawWheel();
  if (typeof drawM05Wheel === 'function') drawM05Wheel();
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  startArcadeChasingBulbs();
  if (typeof drawWheel === 'function') drawWheel();
  if (typeof drawM05Wheel === 'function') drawM05Wheel();
}
