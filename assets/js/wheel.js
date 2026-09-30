/**
 * Eureka Lucky Wheel Engine
 * Canvas 2D + Web Audio API Synthetic Sounds + Easing Physics
 */

const wheelCanvas = document.getElementById('lucky-wheel-canvas');
let wheelCtx = null;
if (wheelCanvas) {
  wheelCtx = wheelCanvas.getContext('2d');
}

const defaultSegments = [
  { text: 'VOUCHER 400K', color: '#ea580c', textColor: '#FFFFFF', prize: 'Voucher 400.000 đ' },
  { text: 'VOUCHER 300K', color: '#1e293b', textColor: '#FBBF24', prize: 'Voucher 300.000 đ' },
  { text: 'ƯU TIÊN XẾP CONT', color: '#f59e0b', textColor: '#0F172A', prize: 'Vé Ưu Tiên Xếp Cont Sớm' },
  { text: 'GIẢM 50% LƯU KHO', color: '#0f172a', textColor: '#FFFFFF', prize: 'Giảm 50% Phí Lưu Kho Bãi' },
  { text: 'VOUCHER 300K', color: '#ea580c', textColor: '#FFFFFF', prize: 'Voucher 300.000 đ' },
  { text: 'GÓI SQUAD 2-IN-1', color: '#1e293b', textColor: '#38BDF8', prize: 'Gói Chuyên Viên Squad 2-in-1' },
  { text: 'VOUCHER 400K', color: '#f59e0b', textColor: '#0F172A', prize: 'Voucher 400.000 đ Lộc Xuân' },
  { text: 'MAY MẮN LẦN SAU', color: '#0f172a', textColor: '#94A3B8', prize: 'Vé Tích Lũy Quay Mùng 05' }
];

let segments = [...defaultSegments];
const numSegments = segments.length;
const arcSize = (2 * Math.PI) / numSegments;
let currentAngle = 0;
let isSpinning = false;

// Draw Wheel Function
function drawWheel() {
  if (!wheelCanvas || !wheelCtx) return;

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
    const angle = currentAngle + i * arcSize;
    wheelCtx.save();
    wheelCtx.beginPath();
    wheelCtx.moveTo(centerX, centerY);
    wheelCtx.arc(centerX, centerY, radius, angle, angle + arcSize);
    wheelCtx.fillStyle = segments[i].color;
    wheelCtx.fill();
    wheelCtx.lineWidth = 1.5;
    wheelCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    wheelCtx.stroke();

    // Draw Text inside Segment
    wheelCtx.translate(centerX, centerY);
    wheelCtx.rotate(angle + arcSize / 2);
    wheelCtx.textAlign = 'right';
    wheelCtx.fillStyle = segments[i].textColor;
    wheelCtx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
    wheelCtx.shadowColor = 'rgba(0,0,0,0.6)';
    wheelCtx.shadowBlur = 4;
    wheelCtx.fillText(segments[i].text, radius - 25, 5);
    wheelCtx.restore();
  }

  // Center decorative ring
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

// Synthetic Audio Effects
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let audioContext = null;

function playTickSound() {
  try {
    if (!audioContext) audioContext = new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, audioContext.currentTime);
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

// Spin Wheel Function
function spinWheel() {
  if (isSpinning) return;
  isSpinning = true;

  const input = document.getElementById('order-code-input');
  const orderCode = (input && input.value.trim()) || 'ERK-DEMO-' + Math.floor(1000 + Math.random() * 9000);

  // Random target segment
  const targetIndex = Math.floor(Math.random() * numSegments);
  const spins = 5 + Math.floor(Math.random() * 3); // 5 to 7 full revolutions

  // Calculate target angle to point directly at top needle (-PI/2)
  const targetSegmentAngle = (3 * Math.PI / 2) - (targetIndex * arcSize + arcSize / 2);
  const totalRotation = spins * 2 * Math.PI + targetSegmentAngle;

  const startAngle = currentAngle % (2 * Math.PI);
  const finalAngle = startAngle + totalRotation;
  const duration = 5000; // 5 seconds
  const startTime = performance.now();
  let lastTickAngle = startAngle;

  function animateSpin(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Cubic Ease-Out
    const easeOut = 1 - Math.pow(1 - progress, 3.5);
    currentAngle = startAngle + (finalAngle - startAngle) * easeOut;

    // Trigger tick sound per segment pass
    if (Math.abs(currentAngle - lastTickAngle) >= arcSize) {
      playTickSound();
      lastTickAngle = currentAngle;
    }

    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      isSpinning = false;
      playWinSound();
      if (typeof showWinningResult === 'function') {
        showWinningResult(segments[targetIndex], orderCode);
      }
    }
  }

  requestAnimationFrame(animateSpin);
}

function fillDemoCode() {
  const randomCode = 'ERK-2026-' + Math.floor(10000 + Math.random() * 90000);
  const input = document.getElementById('order-code-input');
  if (input) input.value = randomCode;
}

// Initialize on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  drawWheel();
});
