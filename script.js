/**
 * 수여동사 냠냠 지렁이 게임 (Dative Verb Worm Game) - 3분 챌린지 모드
 * - 기존 단어들은 그대로 유지되고, 먹은 단어만 그 즉시 새로운 단어로 리스폰!
 * - 미션 주기: 30초마다 자동 변경 ([to] -> [for] -> [of])
 * - 전체 경기 시간: 3분 (180초) 타임어택!
 * - 3분 종료 시 팡파레 & 최종 점수 발표 & [다시하기] 버튼
 */

// ========================================================
// 1. 중학교 1학년 수준 수여동사 데이터베이스
// ========================================================
const VERB_DATABASE = {
  to: [
    { verb: "give", meaning: "주다", color: "#0284c7" },
    { verb: "send", meaning: "보내다", color: "#0369a1" },
    { verb: "show", meaning: "보여주다", color: "#0ea5e9" },
    { verb: "teach", meaning: "가르치다", color: "#2563eb" },
    { verb: "tell", meaning: "말해주다", color: "#1d4ed8" },
    { verb: "lend", meaning: "빌려주다", color: "#38bdf8" },
    { verb: "write", meaning: "써주다", color: "#0284c7" },
    { verb: "pass", meaning: "건네주다", color: "#0ea5e9" },
    { verb: "bring", meaning: "가져오다", color: "#2563eb" },
    { verb: "read", meaning: "읽어주다", color: "#0369a1" },
    { verb: "hand", meaning: "건네다", color: "#38bdf8" },
    { verb: "promise", meaning: "약속하다", color: "#1d4ed8" }
  ],
  for: [
    { verb: "make", meaning: "만들어주다", color: "#ea580c" },
    { verb: "buy", meaning: "사주다", color: "#f97316" },
    { verb: "cook", meaning: "요리해주다", color: "#d97706" },
    { verb: "get", meaning: "구해주다", color: "#f59e0b" },
    { verb: "find", meaning: "찾아주다", color: "#c2410c" },
    { verb: "build", meaning: "지어주다", color: "#b45309" },
    { verb: "bake", meaning: "구워주다", color: "#ea580c" },
    { verb: "choose", meaning: "골라주다", color: "#f97316" },
    { verb: "order", meaning: "주문해주다", color: "#d97706" },
    { verb: "sing", meaning: "노래해주다", color: "#f59e0b" }
  ],
  of: [
    { verb: "ask", meaning: "부탁/묻다", color: "#7c3aed" },
    { verb: "beg", meaning: "간청하다", color: "#9333ea" },
    { verb: "inquire", meaning: "문의하다", color: "#6d28d9" },
    { verb: "question", meaning: "질문하다", color: "#a855f7" }
  ]
};

// ========================================================
// 2. Web Audio API 사운드 시스템
// ========================================================
class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSuccess() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.16, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.18);
    });
  }

  playFail() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.22);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  playMissionChange() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.14, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.3);
    });
  }

  playMatchFinish() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.22, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.48);
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

// ========================================================
// 3. 플로팅 텍스트 & 파티클 시스템
// ========================================================
class FloatingText {
  constructor(text, x, y, isSuccess, subText = "") {
    this.text = text;
    this.subText = subText;
    this.x = x;
    this.y = y;
    this.isSuccess = isSuccess;
    this.life = 1.0;
    this.vy = -1.6;
  }

  update(dt) {
    this.y += this.vy * (dt * 60);
    this.life -= 0.022 * (dt * 60);
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.life));
    ctx.font = 'bold 20px Fredoka, Jua, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeText(this.text, this.x, this.y);

    ctx.fillStyle = this.isSuccess ? '#16a34a' : '#dc2626';
    ctx.fillText(this.text, this.x, this.y);

    if (this.subText) {
      ctx.font = 'bold 13px "Noto Sans KR", sans-serif';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeText(this.subText, this.x, this.y + 18);
      ctx.fillStyle = '#334155';
      ctx.fillText(this.subText, this.x, this.y + 18);
    }
    ctx.restore();
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3.5 + 1.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = Math.random() * 4 + 2;
    this.life = 1.0;
    this.decay = Math.random() * 0.025 + 0.02;
  }

  update(dt) {
    this.x += this.vx * (dt * 60);
    this.y += this.vy * (dt * 60);
    this.life -= this.decay * (dt * 60);
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ========================================================
// 4. 단어 아이템 (WordItem) 클래스
// 영상 레퍼런스 스타일: 깔끔한 컬러 도트 + 텍스트 + 한글 뜻
// ========================================================
class WordItem {
  constructor(data, x, y) {
    this.verb = data.verb;
    this.meaning = data.meaning;
    this.prep = data.prep;
    this.color = data.color || '#3b82f6';

    this.x = x;
    this.y = y;

    this.floatOffset = Math.random() * Math.PI * 2;
    this.radius = 24;
  }

  update(dt) {
    this.floatOffset += 0.03 * (dt * 60);
  }

  draw(ctx) {
    ctx.save();
    const floatY = this.y + Math.sin(this.floatOffset) * 3;
    ctx.translate(this.x, floatY);

    // 1. 컬러 도트
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(-22, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    // 도트 안쪽 하이라이트
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(-24, -2, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 2. 단어 텍스트
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 16px Fredoka, sans-serif';
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeText(this.verb, -10, -5);
    ctx.fillStyle = '#0f172a';
    ctx.fillText(this.verb, -10, -5);

    ctx.font = '700 11px "Noto Sans KR", sans-serif';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.strokeText(this.meaning, -10, 10);
    ctx.fillStyle = '#475569';
    ctx.fillText(this.meaning, -10, 10);

    ctx.restore();
  }
}

// ========================================================
// 5. 지렁이 (Worm) 클래스
// ========================================================
class Worm {
  constructor(startX, startY) {
    this.x = startX;
    this.y = startY;
    this.targetX = startX;
    this.targetY = startY;

    this.angle = 0;
    this.speed = 8.5; // 기존 4.8에서 8.5로 대폭 상향하여 빠릿빠릿한 이동!
    this.bodyRadius = 18;

    this.segments = [];
    this.segmentSpacing = 8;
    this.maxSegments = 24; // 최대 꼬리 길이 상한선! (지나치게 길어짐 방지)
    this.minSegments = 10;
    const initialSegments = 14; // 귀엽고 적당한 초기 길이

    for (let i = 0; i < initialSegments; i++) {
      this.segments.push({
        x: startX - i * this.segmentSpacing,
        y: startY,
        radius: this.bodyRadius
      });
    }

    this.expression = 'happy';
    this.expressionTimer = 0;
    this.blinkTimer = 0;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.angle = 0;
    this.segments = [];
    const initialSegments = 14;
    for (let i = 0; i < initialSegments; i++) {
      this.segments.push({
        x: x - i * this.segmentSpacing,
        y: y,
        radius: this.bodyRadius
      });
    }
    this.expression = 'happy';
  }

  // 꼬리가 너무 길어지지 않도록 한 번에 +1마디만 증가 & 최대 24마디 제한!
  addSegments(count = 1) {
    if (this.segments.length < this.maxSegments) {
      const last = this.segments[this.segments.length - 1];
      for (let i = 0; i < count; i++) {
        if (this.segments.length >= this.maxSegments) break;
        this.segments.push({
          x: last.x,
          y: last.y,
          radius: this.bodyRadius
        });
      }
    }
    this.setExpression('eating', 0.35);
  }

  // 오답 시 1마디 감소, 최소 10마디 유지
  removeSegments(count = 1) {
    const removeCount = Math.min(count, Math.max(0, this.segments.length - this.minSegments));
    for (let i = 0; i < removeCount; i++) {
      this.segments.pop();
    }
    this.setExpression('oops', 0.45);
  }

  setExpression(expr, duration) {
    this.expression = expr;
    this.expressionTimer = duration;
  }

  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  update(dt) {
    if (this.expressionTimer > 0) {
      this.expressionTimer -= dt;
      if (this.expressionTimer <= 0) this.expression = 'happy';
    }
    this.blinkTimer += dt;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distToTarget = Math.hypot(dx, dy);

    if (distToTarget > 4) {
      const targetAngle = Math.atan2(dy, dx);
      let diff = targetAngle - this.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      // 회전 반응 속도를 기존 0.16에서 0.34로 2배 이상 민첩하게 향상!
      this.angle += diff * Math.min(1, 0.34 * (dt * 60));

      // 이동 속도: 마우스 방향으로 시원시원하고 빠릿하게 전진!
      const moveSpeed = Math.min(this.speed, Math.max(3.8, distToTarget * 0.28)) * (dt * 60);
      this.x += Math.cos(this.angle) * moveSpeed;
      this.y += Math.sin(this.angle) * moveSpeed;
    }

    this.segments[0].x = this.x;
    this.segments[0].y = this.y;

    for (let i = 1; i < this.segments.length; i++) {
      const prev = this.segments[i - 1];
      const cur = this.segments[i];
      const segDx = cur.x - prev.x;
      const segDy = cur.y - prev.y;
      const segDist = Math.hypot(segDx, segDy);

      if (segDist > this.segmentSpacing) {
        const segAngle = Math.atan2(segDy, segDx);
        cur.x = prev.x + Math.cos(segAngle) * this.segmentSpacing;
        cur.y = prev.y + Math.sin(segAngle) * this.segmentSpacing;
      }
    }
  }

  draw(ctx) {
    if (this.segments.length < 2) return;
    ctx.save();

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 그림자
    ctx.lineWidth = this.bodyRadius * 2 + 4;
    ctx.strokeStyle = 'rgba(90, 45, 15, 0.12)';
    ctx.beginPath();
    ctx.moveTo(this.segments[0].x, this.segments[0].y + 3);
    for (let i = 1; i < this.segments.length; i++) {
      ctx.lineTo(this.segments[i].x, this.segments[i].y + 3);
    }
    ctx.stroke();

    // 반투명 갈색 바디
    ctx.lineWidth = this.bodyRadius * 2;
    ctx.strokeStyle = 'rgba(175, 105, 55, 0.8)';
    ctx.beginPath();
    ctx.moveTo(this.segments[0].x, this.segments[0].y);
    for (let i = 1; i < this.segments.length; i++) {
      ctx.lineTo(this.segments[i].x, this.segments[i].y);
    }
    ctx.stroke();

    // 젤리 하이라이트
    ctx.lineWidth = this.bodyRadius * 0.9;
    ctx.strokeStyle = 'rgba(235, 165, 115, 0.35)';
    ctx.beginPath();
    ctx.moveTo(this.segments[0].x, this.segments[0].y);
    for (let i = 1; i < this.segments.length; i++) {
      ctx.lineTo(this.segments[i].x, this.segments[i].y);
    }
    ctx.stroke();

    // 머리
    this.drawHead(ctx);
    ctx.restore();
  }

  drawHead(ctx) {
    const head = this.segments[0];
    const r = this.bodyRadius;

    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(this.angle);

    ctx.fillStyle = 'rgba(185, 112, 60, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 235, 215, 0.45)';
    ctx.beginPath();
    ctx.arc(r * 0.2, -r * 0.2, r * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(251, 113, 133, 0.7)';
    ctx.beginPath();
    ctx.arc(r * 0.35, -r * 0.55, 4, 0, Math.PI * 2);
    ctx.arc(r * 0.35, r * 0.55, 4, 0, Math.PI * 2);
    ctx.fill();

    const isBlinking = (this.blinkTimer % 4.0) > 3.85;
    const eyeX = r * 0.38;
    const eyeY = r * 0.38;

    if (this.expression === 'oops') {
      ctx.strokeStyle = '#381a08';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      [-eyeY, eyeY].forEach(yPos => {
        ctx.beginPath();
        ctx.moveTo(eyeX - 3, yPos - 3);
        ctx.lineTo(eyeX + 3, yPos);
        ctx.lineTo(eyeX - 3, yPos + 3);
        ctx.stroke();
      });
    } else if (isBlinking || this.expression === 'eating') {
      ctx.strokeStyle = '#381a08';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(eyeX, -eyeY, 4, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 4, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
    } else {
      [-eyeY, eyeY].forEach(yPos => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX, yPos, 5.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(eyeX + 1.2, yPos, 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX + 2, yPos - 1, 1.4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    const mouthX = r * 0.6;
    if (this.expression === 'eating') {
      ctx.fillStyle = '#be123c';
      ctx.beginPath();
      ctx.ellipse(mouthX, 0, 6.5, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.ellipse(mouthX - 1, 1, 3.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.expression === 'oops') {
      ctx.strokeStyle = '#381a08';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(mouthX - 1, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#381a08';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(mouthX - 2, 0, 5.5, -Math.PI * 0.42, Math.PI * 0.42);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ========================================================
// 6. 게임 메인 매니저
// ========================================================
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.sound = new SoundManager();

    this.score = 0;
    this.isRunning = false;
    this.isPaused = false;

    // 미션: 30초마다 변경
    this.prepositions = ['to', 'for', 'of'];
    this.currentPrepIndex = 0;
    this.missionTimer = 30.0;
    this.missionTotalDuration = 30.0;

    // 경기 시간: 3분 (180초)
    this.matchTotalDuration = 180.0;
    this.matchRemaining = 180.0;

    this.worm = null;
    this.words = [];
    this.floatingTexts = [];
    this.particles = [];

    this.lastTime = 0;

    this.dom = {
      missionText: document.getElementById('missionText'),
      prepHighlight: document.getElementById('prepHighlight'),
      missionTimeText: document.getElementById('missionTimeText'),
      missionProgressBar: document.getElementById('missionProgressBar'),
      matchClock: document.getElementById('matchClock'),
      scoreDisplay: document.getElementById('scoreDisplay'),
      lengthDisplay: document.getElementById('lengthDisplay'),
      startBtn: document.getElementById('startBtn'),
      pauseBtn: document.getElementById('pauseBtn'),
      resetBtn: document.getElementById('resetBtn'),
      soundBtn: document.getElementById('soundBtn'),
      soundIcon: document.getElementById('soundIcon'),
      guideBtn: document.getElementById('guideBtn'),
      guideModal: document.getElementById('guideModal'),
      closeGuideBtn: document.getElementById('closeGuideBtn'),
      understandBtn: document.getElementById('understandBtn'),
      pausedOverlay: document.getElementById('pausedOverlay'),
      pauseScoreText: document.getElementById('pauseScoreText'),
      resumeModalBtn: document.getElementById('resumeModalBtn'),
      resetModalBtn: document.getElementById('resetModalBtn'),
      matchEndModal: document.getElementById('matchEndModal'),
      finalScoreDisplay: document.getElementById('finalScoreDisplay'),
      finalLengthDisplay: document.getElementById('finalLengthDisplay'),
      playAgainBtn: document.getElementById('playAgainBtn'),
      missionAlertBanner: document.getElementById('missionAlertBanner'),
      bannerText: document.getElementById('bannerText')
    };

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      if (this.words.length === 0) {
        this.spawnWholeScreenWords();
      }
    });

    const handleMove = (e) => {
      if (!this.worm) return;
      let clientX, clientY;
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      this.worm.setTarget(clientX, clientY);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchstart', (e) => {
      this.sound.init();
      handleMove(e);
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePause();
      }
    });

    this.bindEvents();

    // 초기 상태 세팅 (단어들이 화면에 꽉 찬 상태로 대기)
    this.worm = new Worm(this.canvas.width / 2, this.canvas.height / 2);
    this.spawnWholeScreenWords();
    this.updateMissionUI(false);
    this.updateScoreUI();
    this.updateMatchClockUI();

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  bindEvents() {
    this.dom.startBtn.addEventListener('click', () => {
      this.sound.init();
      this.resumeGame();
    });

    this.dom.pauseBtn.addEventListener('click', () => {
      this.pauseGame();
    });

    this.dom.resetBtn.addEventListener('click', () => {
      this.resetGame();
    });

    this.dom.resumeModalBtn.addEventListener('click', () => {
      this.resumeGame();
    });

    this.dom.resetModalBtn.addEventListener('click', () => {
      this.resetGame();
    });

    this.dom.playAgainBtn.addEventListener('click', () => {
      this.dom.matchEndModal.classList.add('hidden');
      this.resetGame();
      this.resumeGame();
    });

    this.dom.soundBtn.addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      this.dom.soundIcon.className = isMuted 
        ? "fa-solid fa-volume-xmark text-slate-400 text-sm" 
        : "fa-solid fa-volume-high text-sky-500 text-sm";
    });

    this.dom.guideBtn.addEventListener('click', () => {
      this.pauseGame();
      this.dom.guideModal.classList.remove('hidden');
    });

    this.dom.closeGuideBtn.addEventListener('click', () => {
      this.dom.guideModal.classList.add('hidden');
    });

    this.dom.understandBtn.addEventListener('click', () => {
      this.dom.guideModal.classList.add('hidden');
    });
  }

  resizeCanvas() {
    this.canvas.width = Math.max(window.innerWidth, 800);
    this.canvas.height = Math.max(window.innerHeight, 600);
  }

  resumeGame() {
    this.isRunning = true;
    this.isPaused = false;
    this.dom.pausedOverlay.classList.add('hidden');
    this.dom.matchEndModal.classList.add('hidden');

    this.dom.startBtn.classList.add('ring-2', 'ring-emerald-300');
    this.dom.pauseBtn.classList.remove('ring-2', 'ring-amber-300');

    if (!this.words || this.words.length === 0) {
      this.spawnWholeScreenWords();
    }

    this.lastTime = performance.now();
  }

  pauseGame() {
    this.isPaused = true;
    this.dom.pausedOverlay.classList.remove('hidden');
    this.dom.pauseScoreText.textContent = `${this.score}점`;

    this.dom.pauseBtn.classList.add('ring-2', 'ring-amber-300');
    this.dom.startBtn.classList.remove('ring-2', 'ring-emerald-300');
  }

  togglePause() {
    if (this.isPaused || !this.isRunning) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  resetGame() {
    this.score = 0;
    this.updateScoreUI();
    this.currentPrepIndex = 0;
    this.missionTimer = this.missionTotalDuration;
    this.matchRemaining = this.matchTotalDuration;
    this.updateMatchClockUI();

    if (this.worm) {
      this.worm.reset(this.canvas.width / 2, this.canvas.height / 2);
    }

    this.floatingTexts = [];
    this.particles = [];

    this.spawnWholeScreenWords();
    this.updateMissionUI(true);

    this.dom.pausedOverlay.classList.add('hidden');
    this.dom.matchEndModal.classList.add('hidden');

    this.isPaused = true;
    this.isRunning = false;
    this.dom.startBtn.classList.remove('ring-2', 'ring-emerald-300');
    this.dom.pauseBtn.classList.remove('ring-2', 'ring-amber-300');
  }

  getCurrentPrep() {
    return this.prepositions[this.currentPrepIndex];
  }

  // ========================================================
  // 단어 수 대폭 슬림화: 학생들이 쾌적하게 읽고 찾을 수 있는 최적의 개수 (25~32개)
  // ========================================================
  getTargetWordCount() {
    const base = 25; // 기존 60~95개에서 25개로 대폭 축소!
    const extra = Math.floor(Math.max(0, this.score) / 60) * 2;
    return Math.min(32, base + extra);
  }

  createWordData() {
    const currentPrep = this.getCurrentPrep();
    const allPreps = ['to', 'for', 'of'];

    const currentCorrect = this.words.filter(w => w.prep === currentPrep).length;
    const needCorrect = currentCorrect < Math.ceil(this.words.length * 0.45);

    let prep;
    if (needCorrect || Math.random() < 0.45) {
      prep = currentPrep;
    } else {
      const others = allPreps.filter(p => p !== currentPrep);
      prep = others[Math.floor(Math.random() * others.length)];
    }

    const list = VERB_DATABASE[prep];
    const item = list[Math.floor(Math.random() * list.length)];
    return { ...item, prep };
  }

  // ========================================================
  // 초기/리셋 단어 생성: 그리드 기반으로 단어끼리 절대 겹치지 않게(No Overlap) 배치!
  // ========================================================
  spawnWholeScreenWords() {
    const targetCount = this.getTargetWordCount();
    this.words = [];

    const w = Math.max(window.innerWidth, this.canvas.width || 800);
    const h = Math.max(window.innerHeight, this.canvas.height || 600);
    this.canvas.width = w;
    this.canvas.height = h;

    const paddingX = 70;
    const paddingYTop = 100;
    const paddingYBottom = 70;

    const availableW = Math.max(400, w - paddingX * 2);
    const availableH = Math.max(300, h - paddingYTop - paddingYBottom);

    // 25~32개의 단어를 6열 x 5행(총 30개 셀) 또는 7열 x 5행(총 35개 셀)으로 넉넉하게 분할
    const cols = 6;
    const rows = 5;
    const cellW = availableW / cols;
    const cellH = availableH / rows;

    // 셀 인덱스들을 셔플하여 고르게 분포
    const cellSlots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cellSlots.push({ r, c });
      }
    }
    // 무작위 셔플
    for (let i = cellSlots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cellSlots[i], cellSlots[j]] = [cellSlots[j], cellSlots[i]];
    }

    // 각 셀마다 최대 1개의 단어만 배치하여 물리적으로 겹침을 100% 원천 차단!
    for (let i = 0; i < cellSlots.length; i++) {
      if (this.words.length >= targetCount) break;

      const { r, c } = cellSlots[i];
      // 셀 중심에서 약간의 자연스러운 지터 (셀 범위 내에 머물러 이웃 셀 단어와 겹치지 않음)
      const posX = paddingX + c * cellW + cellW * 0.5 + (Math.random() - 0.5) * (cellW * 0.35);
      const posY = paddingYTop + r * cellH + cellH * 0.5 + (Math.random() - 0.5) * (cellH * 0.35);

      // 지렁이 머리 바로 앞 70px은 스폰 회피
      if (this.worm && Math.hypot(posX - this.worm.x, posY - this.worm.y) < 70) {
        continue;
      }

      const data = this.createWordData();
      this.words.push(new WordItem(data, posX, posY));
    }
  }

  // ========================================================
  // 개별 리스폰: 먹은 단어 자리를 채울 때 기존 단어들과 절대 겹치지 않게(거리 100px 이상) 스폰!
  // ========================================================
  spawnSingleReplacementWord(originX, originY) {
    const paddingX = 70;
    const paddingYTop = 100;
    const paddingYBottom = 70;

    const availableW = Math.max(400, this.canvas.width - paddingX * 2);
    const availableH = Math.max(300, this.canvas.height - paddingYTop - paddingYBottom);

    const minDistance = 105; // 단어 사이 최소 안전 거리 (절대 겹치지 않음!)
    let bestPos = null;
    let maxMinDist = -1;

    // 최대 45회 무작위 후보지를 검사하여 기존 단어들로부터 가장 멀리 떨어진 안전한 빈 공간 선택
    for (let i = 0; i < 45; i++) {
      let candX, candY;

      // 절반은 먹힌 위치 주변(반경 80~180px), 절반은 화면 전체 빈 공간 탐색
      if (i < 20) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 100;
        candX = Math.min(this.canvas.width - paddingX, Math.max(paddingX, originX + Math.cos(angle) * dist));
        candY = Math.min(this.canvas.height - paddingYBottom, Math.max(paddingYTop, originY + Math.sin(angle) * dist));
      } else {
        candX = paddingX + Math.random() * availableW;
        candY = paddingYTop + Math.random() * availableH;
      }

      // 지렁이 머리/몸통 앞 70px 피하기
      if (this.worm && Math.hypot(candX - this.worm.x, candY - this.worm.y) < 70) {
        continue;
      }

      // 기존 모든 단어들과의 거리 측정
      let currentMinDist = 99999;
      for (let j = 0; j < this.words.length; j++) {
        const d = Math.hypot(candX - this.words[j].x, candY - this.words[j].y);
        if (d < currentMinDist) {
          currentMinDist = d;
        }
      }

      // 105px 이상 충분히 떨어진 완벽한 빈자리 발견 시 즉시 채택!
      if (currentMinDist >= minDistance) {
        bestPos = { x: candX, y: candY };
        break;
      }

      if (currentMinDist > maxMinDist) {
        maxMinDist = currentMinDist;
        bestPos = { x: candX, y: candY };
      }
    }

    if (bestPos) {
      const data = this.createWordData();
      this.words.push(new WordItem(data, bestPos.x, bestPos.y));
    }
  }

  // 30초 미션 전환
  switchMission() {
    this.currentPrepIndex = (this.currentPrepIndex + 1) % this.prepositions.length;
    this.missionTimer = this.missionTotalDuration;

    const prep = this.getCurrentPrep();
    this.updateMissionUI(true);
    this.sound.playMissionChange();
    this.showMissionAlert(prep);
  }

  updateMissionUI(isNew = false) {
    const prep = this.getCurrentPrep();
    document.body.className = `theme-${prep} select-none overflow-hidden m-0 p-0 w-screen h-screen`;

    const colorMap = {
      to: 'text-sky-600 decoration-sky-400 bg-sky-500',
      for: 'text-orange-600 decoration-orange-400 bg-orange-500',
      of: 'text-purple-600 decoration-purple-400 bg-purple-500'
    };

    this.dom.prepHighlight.className = `${colorMap[prep].split(' ')[0]} underline decoration-4`;
    this.dom.prepHighlight.textContent = `[ ${prep} ]`;
    this.dom.missionProgressBar.className = `h-full ${colorMap[prep].split(' ')[2]} transition-all duration-100 w-full`;
  }

  showMissionAlert(prep) {
    const banner = this.dom.missionAlertBanner;
    banner.className = `banner-${prep} pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 flex items-center gap-3 px-6 py-2.5 rounded-2xl shadow-2xl backdrop-blur-lg border scale-100 opacity-100`;

    let desc = "";
    if (prep === 'to') desc = "전치사 [ to ]와 함께 쓰이는 동사 먹기 (give, send...)";
    else if (prep === 'for') desc = "전치사 [ for ]와 함께 쓰이는 동사 먹기 (make, buy, cook...)";
    else desc = "전치사 [ of ]와 함께 쓰이는 동사 먹기 (ask, beg...)";

    this.dom.bannerText.textContent = desc;

    setTimeout(() => {
      banner.classList.remove('opacity-100', 'scale-100');
      banner.classList.add('opacity-0', 'scale-90');
    }, 2000);
  }

  updateScoreUI(isSuccess = null) {
    this.dom.scoreDisplay.textContent = `${this.score}점`;

    if (isSuccess === true) {
      this.dom.scoreDisplay.classList.remove('score-bump', 'score-drop');
      void this.dom.scoreDisplay.offsetWidth;
      this.dom.scoreDisplay.classList.add('score-bump');
    } else if (isSuccess === false) {
      this.dom.scoreDisplay.classList.remove('score-bump', 'score-drop');
      void this.dom.scoreDisplay.offsetWidth;
      this.dom.scoreDisplay.classList.add('score-drop');
    }

    if (this.worm) {
      this.dom.lengthDisplay.textContent = `${this.worm.segments.length} 마디`;
    }
  }

  updateMatchClockUI() {
    const remainInt = Math.max(0, Math.ceil(this.matchRemaining));
    const m = Math.floor(remainInt / 60);
    const s = remainInt % 60;
    const str = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    this.dom.matchClock.textContent = str;

    if (remainInt <= 30) {
      this.dom.matchClock.className = "font-mono text-lg md:text-xl font-black text-rose-600 animate-pulse leading-tight";
    } else {
      this.dom.matchClock.className = "font-mono text-lg md:text-xl font-black text-indigo-700 leading-tight";
    }
  }

  // ========================================================
  // 충돌 판정 및 개별 단어 즉시 리스폰
  // (있는 단어는 그대로 두고, 먹은 단어만 새로운 단어로 즉시 리스폰!)
  // ========================================================
  checkCollisions() {
    if (!this.worm || this.words.length === 0 || !this.isRunning || this.isPaused) return;

    const currentPrep = this.getCurrentPrep();

    for (let wIdx = this.words.length - 1; wIdx >= 0; wIdx--) {
      const wordItem = this.words[wIdx];

      for (let sIdx = 0; sIdx < this.worm.segments.length; sIdx++) {
        const seg = this.worm.segments[sIdx];
        const dist = Math.hypot(seg.x - wordItem.x, seg.y - wordItem.y);

        if (dist < seg.radius + wordItem.radius) {
          const eatenX = wordItem.x;
          const eatenY = wordItem.y;

          // 1. 점수 및 효과음 처리
          this.handleEat(wordItem, seg.x, seg.y, currentPrep);

          // 2. 먹은 바로 그 단어만 제거 (다른 단어들은 절대 건드리지 않음!)
          this.words.splice(wIdx, 1);

          // 3. 먹은 자리에 새로운 단어를 겹치지 않는 안전한 빈 공간에 즉시 1개 리스폰!
          this.spawnSingleReplacementWord(eatenX, eatenY);

          // 4. 한 프레임에 단어 1개만 깔끔하게 섭취되도록 즉시 종료 (연쇄 동시 섭취 원천 차단!)
          return;
        }
      }
    }
  }

  handleEat(item, hitX, hitY, currentPrep) {
    const isCorrect = (item.prep === currentPrep);

    if (isCorrect) {
      this.score += 10;
      this.worm.addSegments(1); // 꼬리가 과도하게 길어지지 않도록 +1마디만 증가! (최대 24마디 제한)
      this.sound.playSuccess();
      this.updateScoreUI(true);

      this.floatingTexts.push(new FloatingText(
        `+10점! 👏`,
        hitX,
        hitY - 15,
        true,
        `${item.verb} → ${item.prep}`
      ));

      const colors = ['#22c55e', '#38bdf8', '#fbbf24', '#a855f7', '#f43f5e'];
      for (let i = 0; i < 14; i++) {
        this.particles.push(new Particle(hitX, hitY, colors[Math.floor(Math.random() * colors.length)]));
      }

    } else {
      this.score = Math.max(0, this.score - 10);
      this.worm.removeSegments(1); // 오답 시 -1마디 감소 (최소 10마디 보장)
      this.sound.playFail();
      this.updateScoreUI(false);

      this.floatingTexts.push(new FloatingText(
        `-10점! 💦`,
        hitX,
        hitY - 15,
        false,
        `${item.verb}는 [${item.prep}]와 짝꿍!`
      ));

      for (let i = 0; i < 8; i++) {
        this.particles.push(new Particle(hitX, hitY, '#94a3b8'));
      }
    }
  }

  finishMatch() {
    this.isPaused = true;
    this.isRunning = false;
    this.sound.playMatchFinish();
    this.dom.pausedOverlay.classList.add('hidden');
    this.dom.matchEndModal.classList.remove('hidden');
    this.dom.finalScoreDisplay.textContent = `${this.score}점`;
    this.dom.finalLengthDisplay.textContent = `최종 지렁이 길이: ${this.worm ? this.worm.segments.length : 22} 마디`;
  }

  loop(currentTime) {
    const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    if (this.isRunning && !this.isPaused) {
      // 1. 경기 3분 타이머
      this.matchRemaining -= dt;
      this.updateMatchClockUI();

      if (this.matchRemaining <= 0) {
        this.matchRemaining = 0;
        this.updateMatchClockUI();
        this.finishMatch();
        return;
      }

      // 2. 30초 미션 타이머
      this.missionTimer -= dt;
      if (this.missionTimer <= 0) {
        this.switchMission();
      } else {
        const pct = (this.missionTimer / this.missionTotalDuration) * 100;
        this.dom.missionProgressBar.style.width = `${pct}%`;
        this.dom.missionTimeText.textContent = `${Math.ceil(this.missionTimer)}s`;
      }

      // 3. 지렁이
      if (this.worm) {
        this.worm.update(dt);
      }

      // 4. 충돌 체크 (먹은 단어만 쏙 빠지고 즉시 리스폰)
      this.checkCollisions();
    }

    // 단어 부유 애니메이션
    for (let i = 0; i < this.words.length; i++) {
      this.words[i].update(dt);
    }

    // 이펙트 업데이트
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      this.floatingTexts[i].update(dt);
      if (this.floatingTexts[i].life <= 0) this.floatingTexts.splice(i, 1);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].life <= 0) this.particles.splice(i, 1);
    }

    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.words.length; i++) {
      this.words[i].draw(this.ctx);
    }

    if (this.worm) {
      this.worm.draw(this.ctx);
    }

    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(this.ctx);
    }
    for (let i = 0; i < this.floatingTexts.length; i++) {
      this.floatingTexts[i].draw(this.ctx);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
