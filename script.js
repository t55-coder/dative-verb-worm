/**
 * 수여동사 냠냠 지렁이 게임 (Dative Verb Worm Game)
 * GitHub Pages 정적 배포용 바닐라 자바스크립트 전체 코드
 */

// ========================================================
// 1. 중학교 1학년 수준 수여동사 데이터베이스
// ========================================================
const VERB_DATABASE = {
  to: [
    { verb: "give", meaning: "주다", example: "give a present to him" },
    { verb: "send", meaning: "보내다", example: "send a letter to her" },
    { verb: "show", meaning: "보여주다", example: "show a picture to me" },
    { verb: "teach", meaning: "가르치다", example: "teach English to us" },
    { verb: "tell", meaning: "말해주다", example: "tell a story to them" },
    { verb: "lend", meaning: "빌려주다", example: "lend an umbrella to him" },
    { verb: "write", meaning: "써주다", example: "write a message to me" },
    { verb: "pass", meaning: "건네주다", example: "pass the salt to her" },
    { verb: "bring", meaning: "가져다주다", example: "bring some water to me" },
    { verb: "read", meaning: "읽어주다", example: "read a book to him" },
    { verb: "hand", meaning: "건네다", example: "hand the note to teacher" },
    { verb: "promise", meaning: "약속하다", example: "promise a gift to you" }
  ],
  for: [
    { verb: "make", meaning: "만들어주다", example: "make cookies for us" },
    { verb: "buy", meaning: "사주다", example: "buy a toy for brother" },
    { verb: "cook", meaning: "요리해주다", example: "cook dinner for family" },
    { verb: "get", meaning: "구해주다", example: "get a ticket for me" },
    { verb: "find", meaning: "찾아주다", example: "find a key for mom" },
    { verb: "build", meaning: "지어주다", example: "build a doghouse for dog" },
    { verb: "bake", meaning: "구워주다", example: "bake bread for friends" },
    { verb: "choose", meaning: "골라주다", example: "choose a gift for her" },
    { verb: "order", meaning: "주문해주다", example: "order pizza for us" },
    { verb: "sing", meaning: "노래해주다", example: "sing a song for baby" }
  ],
  of: [
    { verb: "ask", meaning: "부탁하다/묻다", example: "ask a favor of you" },
    { verb: "beg", meaning: "간청하다", example: "beg help of someone" },
    { verb: "inquire", meaning: "문의하다", example: "inquire info of staff" },
    { verb: "question", meaning: "질문하다", example: "question answers of students" }
  ]
};

// ========================================================
// 2. Web Audio API 신디사이저 효과음
// ========================================================
class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
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
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (경쾌한 도-미-솔-도)
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.18, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.2);
    });
  }

  playFail() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  playMissionChange() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [440, 554.37, 659.25, 880]; // A major fan-fare
    chords.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);

      gain.gain.setValueAtTime(0.15, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.36);
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
    this.vy = -1.8;
  }

  update(dt) {
    this.y += this.vy * (dt * 60);
    this.life -= 0.016 * (dt * 60);
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.life));
    ctx.font = 'bold 22px Fredoka, Jua, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 텍스트 외곽선
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeText(this.text, this.x, this.y);

    // 텍스트 본문 채우기
    ctx.fillStyle = this.isSuccess ? '#16a34a' : '#dc2626';
    ctx.fillText(this.text, this.x, this.y);

    // 부가 설명 (예: "give to me")
    if (this.subText) {
      ctx.font = 'bold 14px Nunito, sans-serif';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeText(this.subText, this.x, this.y + 22);

      ctx.fillStyle = '#334155';
      ctx.fillText(this.subText, this.x, this.y + 22);
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
    const speed = Math.random() * 4 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = Math.random() * 5 + 3;
    this.life = 1.0;
    this.decay = Math.random() * 0.02 + 0.015;
  }

  update(dt) {
    this.x += this.vx * (dt * 60);
    this.y += this.vy * (dt * 60);
    this.vx *= 0.95;
    this.vy *= 0.95;
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
// ========================================================
class WordItem {
  constructor(data, width, height) {
    this.verb = data.verb;
    this.meaning = data.meaning;
    this.prep = data.prep;
    this.example = data.example;

    this.x = Math.random() * (width - 160) + 80;
    this.y = Math.random() * (height - 200) + 120;

    // 약간의 유영 속도 (부드럽게 둥둥 떠다님)
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.6 + 0.3;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.floatOffset = Math.random() * Math.PI * 2;
    this.scale = 1.0;
    this.radius = 32; // 충돌 판정용 기본 반경
  }

  update(dt, width, height) {
    this.floatOffset += 0.04 * (dt * 60);
    this.x += this.vx * (dt * 60);
    this.y += this.vy * (dt * 60);

    // 화면 벽 충돌 반사 (상하좌우 여백 확보)
    const padding = 50;
    if (this.x < padding) {
      this.x = padding;
      this.vx = Math.abs(this.vx);
    } else if (this.x > width - padding) {
      this.x = width - padding;
      this.vx = -Math.abs(this.vx);
    }

    if (this.y < 100) {
      this.y = 100;
      this.vy = Math.abs(this.vy);
    } else if (this.y > height - padding) {
      this.y = height - padding;
      this.vy = -Math.abs(this.vy);
    }
  }

  draw(ctx) {
    ctx.save();
    const floatY = this.y + Math.sin(this.floatOffset) * 5;

    ctx.translate(this.x, floatY);
    ctx.scale(this.scale, this.scale);

    // 알약 뱃지 크기 계산
    const pillWidth = 92;
    const pillHeight = 52;
    const rx = -pillWidth / 2;
    const ry = -pillHeight / 2;

    // 뱃지 그림자
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;

    // 뱃지 배경 (하얗고 맑은 반투명 글래스)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.beginPath();
    ctx.roundRect(rx, ry, pillWidth, pillHeight, 26);
    ctx.fill();

    // 뱃지 테두리
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.stroke();

    // 은은한 컬러 링
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.25)';
    ctx.stroke();

    // 동사 텍스트
    ctx.font = 'bold 20px Fredoka, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.verb, 0, -8);

    // 한국어 의미
    ctx.font = '600 12px Jua, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(this.meaning, 0, 13);

    ctx.restore();
  }
}

// ========================================================
// 5. 지렁이 (Worm) 클래스
// - 색상: 반투명 갈색
// - 표정: 방긋 웃는 표정
// - 몸통, 머리, 꼬리 모두 충돌 판정에 참여
// ========================================================
class Worm {
  constructor(startX, startY) {
    this.x = startX;
    this.y = startY;
    this.targetX = startX;
    this.targetY = startY;

    this.angle = 0;
    this.speed = 4.2;
    this.baseRadius = 22; // 머리 반경

    // 세그먼트 배열 초기화 (초기 15마디)
    this.segments = [];
    this.segmentSpacing = 12; // 마디 간격
    const initialSegments = 15;

    for (let i = 0; i < initialSegments; i++) {
      this.segments.push({
        x: startX - i * this.segmentSpacing,
        y: startY,
        radius: this.calcRadius(i, initialSegments)
      });
    }

    // 표정 상태: 'happy'(기본 웃는얼굴), 'eating'(크게 웃음/입벌림), 'oops'(놀람/어라?)
    this.expression = 'happy';
    this.expressionTimer = 0;
    this.blinkTimer = 0;
  }

  calcRadius(index, total) {
    // 머리(22px)에서 꼬리(10px)로 자연스럽게 얇아지는 곡선
    const progress = index / Math.max(1, total - 1);
    return Math.max(10, this.baseRadius * (1 - progress * 0.52));
  }

  recalculateRadii() {
    const total = this.segments.length;
    for (let i = 0; i < total; i++) {
      this.segments[i].radius = this.calcRadius(i, total);
    }
  }

  addSegments(count = 3) {
    const last = this.segments[this.segments.length - 1];
    for (let i = 0; i < count; i++) {
      this.segments.push({
        x: last.x,
        y: last.y,
        radius: 10
      });
    }
    this.recalculateRadii();
    this.setExpression('eating', 0.45);
  }

  removeSegments(count = 3) {
    const minLength = 10;
    const removeCount = Math.min(count, Math.max(0, this.segments.length - minLength));
    for (let i = 0; i < removeCount; i++) {
      this.segments.pop();
    }
    this.recalculateRadii();
    this.setExpression('oops', 0.5);
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
    // 표정 타이머
    if (this.expressionTimer > 0) {
      this.expressionTimer -= dt;
      if (this.expressionTimer <= 0) {
        this.expression = 'happy';
      }
    }

    // 깜빡임 타이머
    this.blinkTimer += dt;

    // 마우스 목표 지점 추적 및 각도 계산
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distToTarget = Math.hypot(dx, dy);

    if (distToTarget > 6) {
      const targetAngle = Math.atan2(dy, dx);

      // 각도 보간 (부드러운 회전)
      let diff = targetAngle - this.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.angle += diff * Math.min(1, 0.14 * (dt * 60));

      // 전진 속도 계산 (가까우면 감속)
      const moveSpeed = Math.min(this.speed, distToTarget * 0.15) * (dt * 60);
      this.x += Math.cos(this.angle) * moveSpeed;
      this.y += Math.sin(this.angle) * moveSpeed;
    }

    // 머리 위치 갱신
    this.segments[0].x = this.x;
    this.segments[0].y = this.y;

    // 몸통 마디들 팔로우 (역기구학 기반 고정 간격 유지)
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
    ctx.save();

    // 1. 몸통 그리기 (꼬리부터 머리 방향으로 그려 머리가 가장 위에 오도록)
    for (let i = this.segments.length - 1; i >= 0; i--) {
      const seg = this.segments[i];
      const radius = seg.radius;
      const progress = i / this.segments.length;

      ctx.save();
      ctx.translate(seg.x, seg.y);

      // 은은한 그림자
      ctx.shadowColor = 'rgba(100, 50, 20, 0.18)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;

      // 반투명 갈색 그라데이션 (몸통 입체감)
      // 요구사항: "지렁이 색은 반투명 갈색으로 부탁해"
      const grad = ctx.createRadialGradient(-radius * 0.25, -radius * 0.25, radius * 0.1, 0, 0, radius);
      grad.addColorStop(0, `rgba(215, 140, 85, ${0.85 - progress * 0.15})`);
      grad.addColorStop(0.7, `rgba(165, 92, 45, ${0.75 - progress * 0.15})`);
      grad.addColorStop(1, `rgba(120, 62, 28, ${0.72 - progress * 0.15})`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // 지렁이 마디 링(Ring) 무늬 (반투명 선)
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(255, 230, 200, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
      ctx.stroke();

      // 상단 하이라이트 (말랑말랑한 젤리 윤기)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.ellipse(-radius * 0.35, -radius * 0.35, radius * 0.3, radius * 0.18, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 2. 머리 및 웃는 표정 그리기
    this.drawHead(ctx);

    ctx.restore();
  }

  drawHead(ctx) {
    const head = this.segments[0];
    const r = this.baseRadius;

    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(this.angle);

    // 머리 베이스 구체 (반투명 갈색)
    ctx.shadowColor = 'rgba(80, 35, 10, 0.25)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    const headGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
    headGrad.addColorStop(0, 'rgba(225, 150, 95, 0.88)');
    headGrad.addColorStop(0.75, 'rgba(175, 98, 48, 0.82)');
    headGrad.addColorStop(1, 'rgba(130, 68, 30, 0.80)');

    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // 귀여운 분홍 볼터치 (Blush)
    ctx.fillStyle = 'rgba(251, 113, 133, 0.65)';
    ctx.beginPath();
    ctx.arc(r * 0.3, -r * 0.52, 4.5, 0, Math.PI * 2);
    ctx.arc(r * 0.3, r * 0.52, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 눈 깜빡임 판정
    const isBlinking = (this.blinkTimer % 4.0) > 3.85;

    // --- 눈 그리기 (위아래 2개) ---
    const eyeOffsetX = r * 0.38;
    const eyeOffsetY = r * 0.34;
    const eyeRadius = 6.0;

    if (this.expression === 'oops') {
      // 당황했을 때: > < 모양 눈
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';

      // 위쪽 눈
      ctx.beginPath();
      ctx.moveTo(eyeOffsetX - 3, -eyeOffsetY - 3);
      ctx.lineTo(eyeOffsetX + 3, -eyeOffsetY);
      ctx.lineTo(eyeOffsetX - 3, -eyeOffsetY + 3);
      ctx.stroke();

      // 아래쪽 눈
      ctx.beginPath();
      ctx.moveTo(eyeOffsetX - 3, eyeOffsetY - 3);
      ctx.lineTo(eyeOffsetX + 3, eyeOffsetY);
      ctx.lineTo(eyeOffsetX - 3, eyeOffsetY + 3);
      ctx.stroke();

    } else if (isBlinking || this.expression === 'eating') {
      // 냠냠 먹을 때 or 깜빡일 때: 방긋 웃는 ^ ^ 눈
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.arc(eyeOffsetX, -eyeOffsetY, 4.5, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(eyeOffsetX, eyeOffsetY, 4.5, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();

    } else {
      // 기본 웃는 눈 (초롱초롱한 눈망울)
      [-eyeOffsetY, eyeOffsetY].forEach(yPos => {
        // 흰자
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeOffsetX, yPos, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // 검은 눈동자
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(eyeOffsetX + 1.2, yPos, eyeRadius * 0.65, 0, Math.PI * 2);
        ctx.fill();

        // 초롱초롱 하이라이트
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeOffsetX + 2.2, yPos - 1.5, 2.0, 0, Math.PI * 2);
        ctx.arc(eyeOffsetX, yPos + 1.8, 1.1, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // --- 요구사항: "지렁이 표정은 웃는 표정으로 해 주고" ---
    // 입 (Mouth) 그리기
    const mouthX = r * 0.58;

    if (this.expression === 'eating') {
      // 먹는 순간: 입을 "와앙!" 하고 벌린 행복한 웃음
      ctx.fillStyle = '#be123c';
      ctx.beginPath();
      ctx.ellipse(mouthX, 0, 7.5, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // 귀여운 이빨/혀
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.ellipse(mouthX - 1.5, 1.5, 4.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.expression === 'oops') {
      // 틀렸을 때: 작고 둥근 "O" 모양 입
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.2;
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(mouthX - 1, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

    } else {
      // 기본 방긋 웃는 입 (Happy Smile)
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(mouthX - 3, 0, 6.5, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();

      // 살짝 내민 귀여운 핑크빛 혀 (가끔 보임)
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(mouthX + 1.5, 1.5, 2.8, -Math.PI * 0.3, Math.PI * 0.5);
      ctx.fill();
    }

    ctx.restore();
  }
}

// ========================================================
// 6. 게임 메인 매니저 (Game Engine)
// ========================================================
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.sound = new SoundManager();

    // 상태 관리
    this.score = 0;
    this.isRunning = false;
    this.isPaused = false;

    // 미션 시스템 (15초마다 변경)
    this.prepositions = ['to', 'for', 'of'];
    this.currentPrepIndex = 0;
    this.missionTimer = 15.0; // 15초 카운트다운
    this.missionTotalDuration = 15.0;

    // 객체 목록
    this.worm = null;
    this.words = [];
    this.floatingTexts = [];
    this.particles = [];

    // 시간 관리
    this.lastTime = 0;

    // DOM 엘리먼트 캐싱
    this.dom = {
      missionPanel: document.getElementById('missionPanel'),
      prepBadge: document.getElementById('prepBadge'),
      missionDesc: document.getElementById('missionDesc'),
      missionTimeText: document.getElementById('missionTimeText'),
      missionProgressBar: document.getElementById('missionProgressBar'),
      hintChips: document.getElementById('hintChips'),
      scoreDisplay: document.getElementById('scoreDisplay'),
      wormLengthDisplay: document.getElementById('wormLengthDisplay'),
      wordCountDisplay: document.getElementById('wordCountDisplay'),
      soundBtn: document.getElementById('soundBtn'),
      soundIcon: document.getElementById('soundIcon'),
      pauseBtn: document.getElementById('pauseBtn'),
      pauseIcon: document.getElementById('pauseIcon'),
      guideBtn: document.getElementById('guideBtn'),
      startModal: document.getElementById('startModal'),
      startGameBtn: document.getElementById('startGameBtn'),
      guideModal: document.getElementById('guideModal'),
      closeGuideBtn: document.getElementById('closeGuideBtn'),
      understandBtn: document.getElementById('understandBtn'),
      pauseOverlay: document.getElementById('pauseOverlay'),
      resumeBtn: document.getElementById('resumeBtn'),
      missionAlertBanner: document.getElementById('missionAlertBanner'),
      bannerText: document.getElementById('bannerText')
    };

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // 마우스 및 터치 이벤트
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

    // 키보드 조작 (Space: Pause)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePause();
      }
    });

    // UI 버튼 이벤트 바인딩
    this.bindEvents();

    // 초기 화면 테마 및 미션 설정
    this.updateMissionUI(false);
  }

  bindEvents() {
    this.dom.startGameBtn.addEventListener('click', () => {
      this.sound.init();
      this.dom.startModal.classList.add('hidden');
      this.start();
    });

    this.dom.soundBtn.addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      this.dom.soundIcon.className = isMuted 
        ? "fa-solid fa-volume-xmark text-slate-400" 
        : "fa-solid fa-volume-high text-sky-500";
    });

    this.dom.pauseBtn.addEventListener('click', () => {
      this.togglePause();
    });

    this.dom.resumeBtn.addEventListener('click', () => {
      this.togglePause();
    });

    this.dom.guideBtn.addEventListener('click', () => {
      this.openGuide();
    });

    this.dom.closeGuideBtn.addEventListener('click', () => {
      this.closeGuide();
    });

    this.dom.understandBtn.addEventListener('click', () => {
      this.closeGuide();
    });
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    this.score = 0;
    this.updateScoreUI();
    this.currentPrepIndex = 0;
    this.missionTimer = this.missionTotalDuration;

    // 지렁이 생성
    this.worm = new Worm(this.canvas.width / 2, this.canvas.height / 2);

    // 단어 아이템 생성
    this.words = [];
    this.populateWords();

    this.updateMissionUI(true);

    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();

    requestAnimationFrame((t) => this.loop(t));
  }

  togglePause() {
    if (!this.isRunning) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.dom.pauseOverlay.classList.remove('hidden');
      this.dom.pauseIcon.className = "fa-solid fa-play text-emerald-500";
    } else {
      this.dom.pauseOverlay.classList.add('hidden');
      this.dom.pauseIcon.className = "fa-solid fa-pause text-amber-500";
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  openGuide() {
    this.dom.guideModal.classList.remove('hidden');
    if (this.isRunning && !this.isPaused) {
      this.togglePause();
    }
  }

  closeGuide() {
    this.dom.guideModal.classList.add('hidden');
    if (this.isPaused) {
      this.togglePause();
    }
  }

  getCurrentPrep() {
    return this.prepositions[this.currentPrepIndex];
  }

  // ========================================================
  // 난이도에 따른 단어 수 계산 및 보충
  // "점수가 높아질 수록 화면에 더 많은 단어가 나타나 난이도가 올라가게"
  // ========================================================
  getTargetWordCount() {
    // 0점: 8개, 40점마다 2개씩 증가, 최대 22개
    const base = 8;
    const extra = Math.floor(Math.max(0, this.score) / 40) * 2;
    return Math.min(22, base + extra);
  }

  populateWords() {
    const targetCount = this.getTargetWordCount();
    const currentPrep = this.getCurrentPrep();

    while (this.words.length < targetCount) {
      // 정답 단어가 화면에 최소 40% 이상 유지되도록 제어
      const correctList = VERB_DATABASE[currentPrep];
      const allPreps = ['to', 'for', 'of'];
      
      let selectedData;
      const currentCorrectCount = this.words.filter(w => w.prep === currentPrep).length;
      const needCorrect = currentCorrectCount < Math.ceil(this.words.length * 0.45);

      if (needCorrect || Math.random() < 0.5) {
        // 정답 단어 풀에서 랜덤 선택
        const item = correctList[Math.floor(Math.random() * correctList.length)];
        selectedData = { ...item, prep: currentPrep };
      } else {
        // 다른 전치사 풀에서 오답 단어 선택
        const otherPreps = allPreps.filter(p => p !== currentPrep);
        const randPrep = otherPreps[Math.floor(Math.random() * otherPreps.length)];
        const list = VERB_DATABASE[randPrep];
        const item = list[Math.floor(Math.random() * list.length)];
        selectedData = { ...item, prep: randPrep };
      }

      this.words.push(new WordItem(selectedData, this.canvas.width, this.canvas.height));
    }

    this.dom.wordCountDisplay.textContent = `${this.words.length} 개`;
  }

  // ========================================================
  // 미션 및 배경색 전환 (15초 주기)
  // ========================================================
  switchMission() {
    this.currentPrepIndex = (this.currentPrepIndex + 1) % this.prepositions.length;
    this.missionTimer = this.missionTotalDuration;

    const prep = this.getCurrentPrep();
    this.updateMissionUI(true);

    this.sound.playMissionChange();

    // 화면 상단 미션 변경 알림 배너
    this.showMissionAlert(prep);

    // 단어 풀 재보충 (기존 단어 중 일부를 새 미션에 맞게 갱신)
    this.populateWords();
  }

  updateMissionUI(isNew = false) {
    const prep = this.getCurrentPrep();

    // 1. 바디 배경 테마 변경 (CSS Transition으로 부드럽게 전환)
    document.body.className = `theme-${prep} select-none overflow-hidden m-0 p-0 w-screen h-screen`;

    // 2. 미션 뱃지 및 설명 업데이트
    this.dom.prepBadge.textContent = prep;
    this.dom.prepBadge.className = `badge-${prep} px-4 py-1.5 rounded-xl text-white font-black text-2xl md:text-3xl shadow-md transition-all duration-500 flex items-center justify-center min-w-[76px]`;

    this.dom.missionProgressBar.className = `bar-${prep} h-full transition-all duration-100 rounded-full w-full`;

    if (prep === 'to') {
      this.dom.missionDesc.innerHTML = `목적어 앞에 <span class="text-sky-600 dark:text-sky-400 underline decoration-wavy decoration-sky-400">[to]</span>가 오는 동사를 먹어라!`;
    } else if (prep === 'for') {
      this.dom.missionDesc.innerHTML = `목적어 앞에 <span class="text-orange-600 dark:text-orange-400 underline decoration-wavy decoration-orange-400">[for]</span>가 오는 동사를 먹어라!`;
    } else {
      this.dom.missionDesc.innerHTML = `목적어 앞에 <span class="text-purple-600 dark:text-purple-400 underline decoration-wavy decoration-purple-400">[of]</span>가 오는 동사를 먹어라!`;
    }

    // 3. 힌트 태그 칩 업데이트
    const hintList = VERB_DATABASE[prep].slice(0, 4);
    this.dom.hintChips.innerHTML = hintList.map(h => 
      `<span class="px-1.5 py-0.5 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded font-bold">${h.verb}</span>`
    ).join('');
  }

  showMissionAlert(prep) {
    const banner = this.dom.missionAlertBanner;
    banner.className = `banner-${prep} pointer-events-none fixed top-24 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-lg border scale-100 opacity-100`;
    
    let desc = "";
    if (prep === 'to') desc = "전치사 [ to ]와 짝꿍인 동사들 (give, send, teach...)!";
    else if (prep === 'for') desc = "전치사 [ for ]와 짝꿍인 동사들 (make, buy, cook...)!";
    else desc = "전치사 [ of ]와 짝꿍인 동사 (ask, beg...)!";

    this.dom.bannerText.textContent = desc;

    setTimeout(() => {
      banner.classList.remove('opacity-100', 'scale-100');
      banner.classList.add('opacity-0', 'scale-90');
    }, 2200);
  }

  // ========================================================
  // 점수 UI 업데이트
  // ========================================================
  updateScoreUI(isSuccess = null) {
    this.dom.scoreDisplay.textContent = this.score;

    if (isSuccess === true) {
      this.dom.scoreDisplay.classList.remove('score-bump', 'score-drop');
      void this.dom.scoreDisplay.offsetWidth; // 트리거
      this.dom.scoreDisplay.classList.add('score-bump');
    } else if (isSuccess === false) {
      this.dom.scoreDisplay.classList.remove('score-bump', 'score-drop');
      void this.dom.scoreDisplay.offsetWidth;
      this.dom.scoreDisplay.classList.add('score-drop');
    }

    if (this.worm) {
      this.dom.wormLengthDisplay.textContent = `${this.worm.segments.length} 마디`;
    }
  }

  // ========================================================
  // 충돌 판정 및 먹기 처리
  // "지렁이의 머리, 몸통, 꼬리 모두 단어에 닿으면 먹은 것으로 간주돼"
  // ========================================================
  checkCollisions() {
    if (!this.worm || this.words.length === 0) return;

    const currentPrep = this.getCurrentPrep();

    for (let wIdx = this.words.length - 1; wIdx >= 0; wIdx--) {
      const wordItem = this.words[wIdx];
      let eaten = false;

      // 머리, 몸통, 꼬리 모든 마디와의 충돌 거리 체크
      for (let sIdx = 0; sIdx < this.worm.segments.length; sIdx++) {
        const seg = this.worm.segments[sIdx];
        const dist = Math.hypot(seg.x - wordItem.x, seg.y - wordItem.y);

        if (dist < seg.radius + wordItem.radius) {
          eaten = true;
          this.handleEatWord(wordItem, seg.x, seg.y, currentPrep);
          break;
        }
      }

      if (eaten) {
        this.words.splice(wIdx, 1);
      }
    }

    // 단어 개수 유지/보충
    this.populateWords();
  }

  handleEatWord(item, hitX, hitY, currentPrep) {
    const isCorrect = (item.prep === currentPrep);

    if (isCorrect) {
      // 1. 정답 처리
      this.score += 10;
      this.worm.addSegments(3);
      this.sound.playSuccess();
      this.updateScoreUI(true);

      // 플로팅 텍스트 (+10 및 정답 칭찬)
      this.floatingTexts.push(new FloatingText(
        `+10 Good! 👏`,
        hitX,
        hitY - 20,
        true,
        `${item.verb} → ${item.prep}`
      ));

      // 축하 파티클 효과
      const colors = ['#22c55e', '#38bdf8', '#fbbf24', '#a855f7', '#f43f5e'];
      for (let i = 0; i < 16; i++) {
        this.particles.push(new Particle(hitX, hitY, colors[Math.floor(Math.random() * colors.length)]));
      }

    } else {
      // 2. 오답 처리
      // 단어 하나 먹을 때마다 10점씩 오르고 내림
      this.score = Math.max(0, this.score - 10);
      this.worm.removeSegments(3);
      this.sound.playFail();
      this.updateScoreUI(false);

      // 플로팅 텍스트 (-10 및 오답 피드백)
      this.floatingTexts.push(new FloatingText(
        `-10 Oops! 💦`,
        hitX,
        hitY - 20,
        false,
        `${item.verb}는 ${item.prep}와 어울려요!`
      ));

      // 먼지 파티클
      for (let i = 0; i < 10; i++) {
        this.particles.push(new Particle(hitX, hitY, '#94a3b8'));
      }
    }
  }

  // ========================================================
  // 게임 메인 루프 (Update & Render)
  // ========================================================
  loop(currentTime) {
    if (!this.isRunning || this.isPaused) return;

    const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    // 1. 미션 타이머 업데이트 (15초 카운트다운)
    this.missionTimer -= dt;
    if (this.missionTimer <= 0) {
      this.switchMission();
    } else {
      // UI 프로그레스 바 & 숫자 갱신
      const progressPercent = (this.missionTimer / this.missionTotalDuration) * 100;
      this.dom.missionProgressBar.style.width = `${progressPercent}%`;
      this.dom.missionTimeText.textContent = `${Math.ceil(this.missionTimer)}s`;
    }

    // 2. 지렁이 업데이트
    this.worm.update(dt);

    // 3. 단어 아이템 업데이트
    for (let i = 0; i < this.words.length; i++) {
      this.words[i].update(dt, this.canvas.width, this.canvas.height);
    }

    // 4. 충돌 체크 (머리, 몸통, 꼬리)
    this.checkCollisions();

    // 5. 플로팅 텍스트 및 파티클 업데이트
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      this.floatingTexts[i].update(dt);
      if (this.floatingTexts[i].life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 6. 렌더링
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  render() {
    // 캔버스 클리어 (배경은 body의 CSS 그라데이션이 비쳐 보이도록 깨끗이 투명 클리어)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 단어 아이템들 그리기
    for (let i = 0; i < this.words.length; i++) {
      this.words[i].draw(this.ctx);
    }

    // 지렁이 그리기 (반투명 갈색 몸통 + 웃는 표정 머리)
    this.worm.draw(this.ctx);

    // 파티클 그리기
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(this.ctx);
    }

    // 플로팅 텍스트 그리기 (+10 / -10 알림)
    for (let i = 0; i < this.floatingTexts.length; i++) {
      this.floatingTexts[i].draw(this.ctx);
    }
  }
}

// ========================================================
// 7. 게임 인스턴스 시작
// ========================================================
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
