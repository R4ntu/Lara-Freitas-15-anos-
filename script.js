/* ================================================
   CONVITE DIGITAL — 15 ANOS
   script.js — Lógica Principal
   ================================================ */

'use strict';

/* ================================================
   CONFIGURAÇÕES (EDITE AQUI)
   ================================================ */

const CONFIG = {
  // URL do Google Apps Script após publicar como Web App
  // Substitua pela URL gerada na implantação
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyPrUlAykuA_aPq8ZSR55tm4do2nvXeC4YtouRv5HFdg1puNpAhGYZTuRkm2QgJ7PGe/exec',

  // Data e hora da festa (ano, mês-1, dia, hora, minuto)
  // Mês: 0=Jan, 1=Feb, ..., 7=Agosto
  EVENT_DATE: new Date(2026, 7, 8, 21, 0, 0),

  // Nome da debutante
  DEBUTANTE_NAME: 'Lara Freitas',

  // Dados do evento
  EVENT: {
    local: 'Fazendo a Festa Teens',
    endereco: 'R. Prof. Augusto Lins e Silva, 123',
    bairro: 'Boa Viagem, Recife - PE',
    cep: 'CEP: 51130-030',
    mapsUrl: 'https://maps.google.com/?q=R.+Prof.+Augusto+Lins+e+Silva,+123,+Boa+Viagem,+Recife,+PE,+51130-030'
  },

  // Mensagem WhatsApp pós-confirmação
  WHATSAPP_MSG: 'Olá! Confirmo minha presença na festa de 15 anos da Lara Freitas ✨',

  // Duração da tela de intro (ms)
  INTRO_DURATION: 4200,
};

/* ================================================
   SISTEMA DE PARTÍCULAS
   ================================================ */

class ParticleSystem {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animFrame = null;

    this.options = {
      count: options.count || 60,
      colors: options.colors || ['#60a5fa', '#93c5fd', '#c0c8d8', '#e2e8f0', '#bfdbfe'],
      maxSize: options.maxSize || 3,
      minSize: options.minSize || 0.5,
      speed: options.speed || 0.4,
      glowColors: options.glowColors || ['rgba(96, 165, 250, 0.6)', 'rgba(192, 200, 216, 0.4)'],
      ...options
    };

    this.resize();
    this.init();

    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.options.count; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  createParticle(randomY = false) {
    const size = Math.random() * (this.options.maxSize - this.options.minSize) + this.options.minSize;
    const colorIdx = Math.floor(Math.random() * this.options.colors.length);
    const glowIdx = Math.floor(Math.random() * this.options.glowColors.length);

    return {
      x: Math.random() * this.canvas.width,
      y: randomY ? Math.random() * this.canvas.height : this.canvas.height + 10,
      size,
      color: this.options.colors[colorIdx],
      glow: this.options.glowColors[glowIdx],
      speedX: (Math.random() - 0.5) * this.options.speed,
      speedY: -(Math.random() * this.options.speed + 0.2),
      opacity: Math.random() * 0.7 + 0.1,
      opacityDelta: (Math.random() * 0.01 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.005,
      twinkle: Math.random() > 0.7,
    };
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Movimento
      p.wobble += p.wobbleSpeed;
      p.x += p.speedX + Math.sin(p.wobble) * 0.3;
      p.y += p.speedY;

      // Opacidade oscilante
      p.opacity += p.opacityDelta;
      if (p.opacity <= 0.05 || p.opacity >= 0.85) {
        p.opacityDelta *= -1;
      }

      // Reciclar partícula que saiu da tela
      if (p.y < -20 || p.x < -20 || p.x > this.canvas.width + 20) {
        this.particles[i] = this.createParticle(false);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;

      // Brilho externo
      if (p.twinkle) {
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = p.size * 6;
      }

      // Partícula
      if (p.size > 1.5) {
        // Forma de cristal/diamante para partículas maiores
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y - p.size);
        this.ctx.lineTo(p.x + p.size * 0.6, p.y);
        this.ctx.lineTo(p.x, p.y + p.size);
        this.ctx.lineTo(p.x - p.size * 0.6, p.y);
        this.ctx.closePath();
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      } else {
        // Círculo para partículas menores
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      }

      this.ctx.restore();
    }
  }

  animate() {
    this.update();
    this.draw();
    this.animFrame = requestAnimationFrame(() => this.animate());
  }

  start() {
    if (!this.animFrame) this.animate();
  }

  stop() {
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', () => this.resize());
  }
}

/* ================================================
   CONTAGEM REGRESSIVA
   ================================================ */

class Countdown {
  constructor(targetDate) {
    this.targetDate = targetDate;
    this.elements = {
      days: document.getElementById('cd-days'),
      hours: document.getElementById('cd-hours'),
      minutes: document.getElementById('cd-minutes'),
      seconds: document.getElementById('cd-seconds'),
    };
    this.prevValues = { days: -1, hours: -1, minutes: -1, seconds: -1 };
    this.interval = null;
  }

  getTimeLeft() {
    const now = new Date();
    const diff = this.targetDate - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      expired: false,
    };
  }

  pad(num) {
    return String(num).padStart(2, '0');
  }

  animateFlip(el) {
    el.classList.add('flip');
    setTimeout(() => el.classList.remove('flip'), 400);
  }

  update() {
    const time = this.getTimeLeft();

    if (time.expired) {
      // Festa começou!
      Object.values(this.elements).forEach(el => {
        if (el) el.textContent = '00';
      });
      this.stop();
      return;
    }

    const keys = ['days', 'hours', 'minutes', 'seconds'];
    keys.forEach(key => {
      const el = this.elements[key];
      if (!el) return;
      const val = this.pad(time[key]);
      if (val !== this.prevValues[key]) {
        el.textContent = val;
        if (this.prevValues[key] !== -1) this.animateFlip(el);
        this.prevValues[key] = val;
      }
    });
  }

  start() {
    this.update();
    this.interval = setInterval(() => this.update(), 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

/* ================================================
   AOS — ANIMATE ON SCROLL (CUSTOM LEVE)
   ================================================ */

class AOS {
  constructor() {
    this.elements = document.querySelectorAll('[data-aos]');
    this.delays = {
      '100': '0.1s', '200': '0.2s', '300': '0.3s',
      '400': '0.4s', '500': '0.5s', '600': '0.6s',
      '700': '0.7s', '800': '0.8s',
    };
    this.observer = null;
    this.init();
  }

  init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: mostra tudo imediatamente
      this.elements.forEach(el => el.classList.add('aos-animate'));
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.aosDelay || '0';
            const duration = el.dataset.aosDuration || '800';

            el.style.transitionDuration = duration + 'ms';
            el.style.transitionDelay = delay + 'ms';

            requestAnimationFrame(() => {
              el.classList.add('aos-animate');
            });

            this.observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    this.elements.forEach(el => this.observer.observe(el));
  }
}

/* ================================================
   CONTROLE DE MÚSICA
   ================================================ */

class MusicPlayer {
  constructor() {
    this.audio = null;
    this.playing = false;
    this.btn = document.querySelector('.music-float');
    this.icon = this.btn?.querySelector('.music-icon');
    this.fadeDuration = 2000;
    this.maxVolume = 0.35;

    // URL de música royalty-free — substitua por uma URL de áudio real
    // Sugestões de fontes gratuitas: Pixabay, Free Music Archive, ccMixter
    // Exemplo: 'https://www.bensound.com/bensound-music/bensound-romantic.mp3'
    this.audioSrc = 'musica.mp3';

    this.init();
  }

  init() {
    if (!this.btn) return;

    if (this.audioSrc) {
      this.audio = new Audio(this.audioSrc);
      this.audio.loop = true;
      this.audio.volume = 0;

      // Tentar autoplay
      this.tryAutoplay();
    } else {
      // Sem música configurada
      this.btn.title = 'Música não configurada';
    }

    this.btn.addEventListener('click', () => this.toggle());
  }

  tryAutoplay() {
    if (!this.audio) return;

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.playing = true;
          this.fadeIn();
          this.updateUI();
        })
        .catch(() => {
          // Autoplay bloqueado — aguardar interação do usuário
          this.playing = false;
          this.updateUI();
        });
    }
  }

  fadeIn() {
    if (!this.audio) return;
    const steps = 20;
    const stepVol = this.maxVolume / steps;
    const stepTime = this.fadeDuration / steps;
    let step = 0;

    const fade = setInterval(() => {
      if (step >= steps || !this.playing) {
        clearInterval(fade);
        return;
      }
      this.audio.volume = Math.min(stepVol * (++step), this.maxVolume);
    }, stepTime);
  }

  fadeOut(callback) {
    if (!this.audio) return callback?.();
    const steps = 10;
    const stepVol = this.audio.volume / steps;
    const stepTime = 500 / steps;
    let step = 0;

    const fade = setInterval(() => {
      if (step >= steps) {
        clearInterval(fade);
        this.audio.pause();
        this.audio.volume = 0;
        callback?.();
        return;
      }
      this.audio.volume = Math.max(this.audio.volume - stepVol, 0);
      step++;
    }, stepTime);
  }

  toggle() {
    if (!this.audio) return;

    if (this.playing) {
      this.fadeOut(() => {
        this.playing = false;
        this.updateUI();
      });
    } else {
      this.audio.play()
        .then(() => {
          this.playing = true;
          this.fadeIn();
          this.updateUI();
        })
        .catch(console.error);
    }
  }

  updateUI() {
    if (!this.btn || !this.icon) return;

    if (this.playing) {
      this.btn.classList.add('playing');
      this.icon.className = 'fas fa-music music-icon';
      this.btn.title = 'Pausar música';
    } else {
      this.btn.classList.remove('playing');
      this.icon.className = 'fas fa-music music-icon';
      this.btn.title = 'Tocar música';
    }
  }
}

/* ================================================
   RSVP — CONFIRMAÇÃO DE PRESENÇA
   ================================================ */

class RSVPForm {
  constructor() {
    this.form = document.getElementById('rsvp-form');
    this.nameInput = document.getElementById('rsvp-name');
    this.submitBtn = document.getElementById('rsvp-submit');
    this.feedback = document.getElementById('rsvp-feedback');
    this.errorMsg = document.getElementById('rsvp-error-msg');

    this.isSubmitting = false;

    this.init();
  }

  init() {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!this.isSubmitting) this.submit();
    });

    // Limpar erro ao digitar
    this.nameInput?.addEventListener('input', () => {
      this.clearError();
    });
  }

  validate() {
    const name = this.nameInput?.value?.trim() || '';

    if (!name) {
      this.showError('Por favor, informe seu nome completo.');
      return false;
    }

    if (name.length < 2) {
      this.showError('Nome muito curto.');
      return false;
    }

    if (name.length > 100) {
      this.showError('Nome muito longo.');
      return false;
    }

    const hasLetter = /[a-zA-ZÀ-ÿ]/.test(name);
    if (!hasLetter) {
      this.showError('Digite um nome válido.');
      return false;
    }

    return true;
  }

  showError(msg) {
    if (this.errorMsg) {
      this.errorMsg.textContent = msg;
      this.errorMsg.classList.add('visible');
    }

    if (this.nameInput) {
      this.nameInput.style.borderColor = 'rgba(248, 113, 113, 0.5)';
      // Shake animation
      this.nameInput.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' },
      ], { duration: 400, easing: 'ease-out' });
    }
  }

  clearError() {
    if (this.errorMsg) this.errorMsg.classList.remove('visible');
    if (this.nameInput) this.nameInput.style.borderColor = '';
  }

  setLoading(loading) {
    this.isSubmitting = loading;
    if (this.submitBtn) {
      this.submitBtn.disabled = loading;
      this.submitBtn.classList.toggle('loading', loading);
    }
  }

  async submit() {
    if (!this.validate()) return;

    const name = this.nameInput.value.trim();
    this.setLoading(true);
    this.clearError();

    // Verificar se URL está configurada
    if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes('SEU_ID_AQUI')) {
      // Modo demo — simular envio bem-sucedido
      await this.simulateDelay(1500);
      this.setLoading(false);
      this.showSuccess(name, true);
      return;
    }

    try {
      const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: name }),
      });

      const data = await response.json();

      if (data.success) {
        this.showSuccess(name, false);
      } else {
        throw new Error(data.message || 'Erro ao confirmar presença.');
      }
    } catch (error) {
      console.error('Erro RSVP:', error);

      // Se erro de CORS/rede (Apps Script não configurado),
      // confirma em modo demonstração para não bloquear o convidado.
      if (error.name === 'TypeError' || error.name === 'SyntaxError') {
        await this.simulateDelay(500);
        this.setLoading(false);
        this.showSuccess(name, true);
        return;
      } else {
        this.showError(error.message || 'Ocorreu um erro. Tente novamente.');
      }
    } finally {
      this.setLoading(false);
    }
  }

  showSuccess(name, isDemo) {
    // Esconder formulário
    if (this.form) {
      this.form.style.display = 'none';
    }

    // Mostrar feedback
    if (this.feedback) {
      this.feedback.className = 'rsvp-feedback success';
      this.feedback.style.display = 'block';
      this.feedback.innerHTML = `
        <span class="feedback-icon">✨</span>
        <div class="feedback-title">Presença Confirmada!</div>
        <p class="feedback-text">
          Que alegria, <strong>${this.escapeHtml(name)}</strong>!<br>
          Aguardamos você com muito carinho nesta noite especial.
        </p>
        ${isDemo ? '<p class="feedback-text" style="font-size:0.75rem;opacity:0.5;margin-top:0.5rem;">[Modo demonstração — configure o Apps Script para salvar no Google Sheets]</p>' : ''}
      `;
    }

    // Abrir WhatsApp
    setTimeout(() => {
      this.openWhatsApp(name);
    }, 1800);

    // Efeito de partículas comemorativo
    this.celebrateEffect();
  }

  openWhatsApp(name) {
    const msg = encodeURIComponent(CONFIG.WHATSAPP_MSG);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }

  celebrateEffect() {
    // Criar mini-partículas comemorativas
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed; inset: 0; pointer-events: none; z-index: 9000;
    `;
    document.body.appendChild(container);

    const colors = ['#60a5fa', '#c0c8d8', '#c9a96e', '#bfdbfe', '#e2e8f0'];

    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const dot = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const x = Math.random() * 100;
        const size = Math.random() * 8 + 4;

        dot.style.cssText = `
          position: absolute;
          left: ${x}%;
          top: 100%;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
          opacity: 1;
          transform: rotate(${Math.random() * 360}deg);
          animation: celebrate ${Math.random() * 1.5 + 1}s ease-out forwards;
        `;

        container.appendChild(dot);
      }, i * 30);
    }

    // Injetar keyframes da animação
    if (!document.getElementById('celebrate-keyframes')) {
      const style = document.createElement('style');
      style.id = 'celebrate-keyframes';
      style.textContent = `
        @keyframes celebrate {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% {
            transform: translateY(-${window.innerHeight * 1.2}px) translateX(${(Math.random()-0.5)*200}px) rotate(${Math.random()*720}deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => container.remove(), 4000);
  }

  simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
}

/* ================================================
   GERADOR DE CONVITE (Canvas API puro — sem dependências)
   ================================================ */

class InviteGenerator {
  constructor() {
    this.btnGenerate = document.getElementById('btn-generate-invite');
    this.btnDownload = document.getElementById('btn-download-invite');
    this.btnShareWA  = document.getElementById('btn-share-invite-wa');
    this.preview     = document.getElementById('invite-preview');
    this.canvas      = null;
    this.init();
  }

  init() {
    this.btnGenerate?.addEventListener('click', () => this.generate());
    this.btnDownload?.addEventListener('click', () => this.download());
    this.btnShareWA?.addEventListener('click',  () => this.shareWA());
  }

  /* Desenha o convite direto no Canvas 2D — sem html2canvas */
  generate() {
    if (this.btnGenerate) {
      this.btnGenerate.disabled = true;
      this.btnGenerate.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
    }

    try {
      const W = 540, H = 960;
      const cv = document.createElement('canvas');
      cv.width  = W;
      cv.height = H;
      const ctx = cv.getContext('2d');

      /* --- Fundo gradiente --- */
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0,    '#040d1a');
      bgGrad.addColorStop(0.45, '#0a1628');
      bgGrad.addColorStop(1,    '#0d2150');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      /* --- Orbe de luz superior --- */
      const orb = ctx.createRadialGradient(W/2, 0, 0, W/2, 0, W * 0.9);
      orb.addColorStop(0,   'rgba(27,78,183,0.55)');
      orb.addColorStop(0.6, 'rgba(27,78,183,0.12)');
      orb.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = orb;
      ctx.fillRect(0, 0, W, H);

      /* --- Orbe inferior --- */
      const orb2 = ctx.createRadialGradient(W/2, H, 0, W/2, H, W * 0.7);
      orb2.addColorStop(0,   'rgba(37,99,235,0.3)');
      orb2.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = orb2;
      ctx.fillRect(0, 0, W, H);

      /* --- Partículas decorativas --- */
      const pts = [
        {x:60,  y:120, r:2},  {x:480, y:180, r:1.5},
        {x:100, y:400, r:1},  {x:440, y:350, r:2},
        {x:30,  y:600, r:1.5},{x:510, y:580, r:1},
        {x:200, y:80,  r:1},  {x:360, y:90,  r:1.5},
        {x:70,  y:820, r:2},  {x:470, y:800, r:1},
      ];
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(96,165,250,0.6)';
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      /* --- Borda interna elegante --- */
      const margin = 28;
      ctx.strokeStyle = 'rgba(192,200,216,0.15)';
      ctx.lineWidth = 1;
      this._roundRect(ctx, margin, margin, W - margin*2, H - margin*2, 18);
      ctx.stroke();

      /* Borda interna fina */
      ctx.strokeStyle = 'rgba(96,165,250,0.08)';
      ctx.lineWidth = 1;
      this._roundRect(ctx, margin+6, margin+6, W - (margin+6)*2, H - (margin+6)*2, 14);
      ctx.stroke();

      /* Linha de brilho no topo da borda */
      const topGlow = ctx.createLinearGradient(margin, margin, W-margin, margin);
      topGlow.addColorStop(0,   'rgba(255,255,255,0)');
      topGlow.addColorStop(0.3, 'rgba(255,255,255,0.18)');
      topGlow.addColorStop(0.5, 'rgba(255,255,255,0.28)');
      topGlow.addColorStop(0.7, 'rgba(255,255,255,0.18)');
      topGlow.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.strokeStyle = topGlow;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(margin + 18, margin);
      ctx.lineTo(W - margin - 18, margin);
      ctx.stroke();

      /* --- Coroa emoji --- */
      ctx.font = '48px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#c9a96e';
      ctx.shadowColor = 'rgba(201,169,110,0.7)';
      ctx.shadowBlur = 20;
      ctx.fillText('♛', W/2, 140);
      ctx.shadowBlur = 0;

      /* --- "CONVIDA PARA OS SEUS" --- */
      ctx.font = '400 11px Arial';
      ctx.fillStyle = 'rgba(96,165,250,0.75)';
      ctx.letterSpacing = '4px';
      ctx.fillText('CONVIDA PARA OS SEUS', W/2, 195);

      /* --- "15 ANOS" --- */
      ctx.font = '300 18px Arial';
      ctx.fillStyle = 'rgba(192,200,216,0.85)';
      ctx.fillText('15 ANOS', W/2, 225);

      /* --- Linha divisória --- */
      this._hLine(ctx, W/2 - 60, W/2 + 60, 252, 'rgba(192,200,216,0.3)');

      /* --- NOME DA DEBUTANTE --- */
      const name = CONFIG.DEBUTANTE_NAME.toUpperCase();
      const nameFontSize = name.length > 12 ? 38 : name.length > 8 ? 44 : 52;
      ctx.font = `300 \${nameFontSize}px Georgia`;
      ctx.textAlign = 'center';
      // Gradiente no nome
      const nameGrad = ctx.createLinearGradient(W/2 - 180, 0, W/2 + 180, 0);
      nameGrad.addColorStop(0,    '#f1f5f9');
      nameGrad.addColorStop(0.3,  '#93c5fd');
      nameGrad.addColorStop(0.5,  '#f1f5f9');
      nameGrad.addColorStop(0.7,  '#60a5fa');
      nameGrad.addColorStop(1,    '#e2e8f0');
      ctx.fillStyle = nameGrad;
      ctx.shadowColor = 'rgba(96,165,250,0.5)';
      ctx.shadowBlur = 25;
      ctx.fillText(name, W/2, 318);
      ctx.shadowBlur = 0;

      /* --- "✦ DEBUTANTE ✦" --- */
      ctx.font = '11px Arial';
      ctx.fillStyle = 'rgba(96,165,250,0.65)';
      ctx.fillText('✦  DEBUTANTE  ✦', W/2, 355);

      /* --- Linha dupla ornamental --- */
      this._hLine(ctx, W/2 - 100, W/2 + 100, 386, 'rgba(96,165,250,0.25)');
      this._hLine(ctx, W/2 - 80,  W/2 + 80,  390, 'rgba(96,165,250,0.12)');

      /* --- Diamante central --- */
      this._diamond(ctx, W/2, 388, 6, '#60a5fa');

      /* --- DATA --- */
      ctx.font = '300 13px Arial';
      ctx.fillStyle = 'rgba(192,200,216,0.75)';
      ctx.fillText('08 DE AGOSTO DE 2026', W/2, 430);

      /* --- HORÁRIO --- */
      ctx.font = '400 20px Arial';
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText('Às 21h00', W/2, 462);

      /* --- Linha --- */
      this._hLine(ctx, W/2 - 50, W/2 + 50, 488, 'rgba(192,200,216,0.2)');

      /* --- LOCAL --- */
      ctx.font = '500 15px Arial';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('Fazendo a Festa Teens', W/2, 524);

      ctx.font = '300 12px Arial';
      ctx.fillStyle = 'rgba(192,200,216,0.65)';
      ctx.fillText('R. Prof. Augusto Lins e Silva, 123', W/2, 548);
      ctx.fillText('Boa Viagem  ·  Recife - PE', W/2, 570);

      /* --- Linha --- */
      this._hLine(ctx, W/2 - 80, W/2 + 80, 598, 'rgba(192,200,216,0.18)');

      /* --- TRAJE badge --- */
      ctx.font = '11px Arial';
      ctx.fillStyle = 'rgba(96,165,250,0.8)';
      ctx.fillText('SOCIAL ESPORTE FINO', W/2, 630);
      /* Badge border */
      const bW = 190, bH = 28, bX = W/2 - bW/2, bY = 610;
      ctx.strokeStyle = 'rgba(96,165,250,0.25)';
      ctx.lineWidth = 1;
      this._roundRect(ctx, bX, bY, bW, bH, 14);
      ctx.stroke();

      /* --- OBS azul --- */
      ctx.font = 'italic 11px Georgia';
      ctx.fillStyle = 'rgba(192,200,216,0.5)';
      this._wrapText(ctx, 'Pedimos evitar tons de azul no traje,', W/2, 672, 380, 18);
      this._wrapText(ctx, 'pois esta será a cor da debutante.', W/2, 690, 380, 18);

      /* --- Linha final --- */
      this._hLine(ctx, W/2 - 80, W/2 + 80, 730, 'rgba(192,200,216,0.15)');

      /* --- ✦ ✦ ✦ rodapé --- */
      ctx.font = '12px Arial';
      ctx.fillStyle = 'rgba(96,165,250,0.35)';
      ctx.fillText('✦   ✦   ✦', W/2, 760);

      /* --- Ano rodapé --- */
      ctx.font = '10px Arial';
      ctx.fillStyle = 'rgba(192,200,216,0.2)';
      ctx.fillText('2026  ·  RECIFE  ·  PERNAMBUCO', W/2, 800);

      /* --- Salvar canvas --- */
      this.canvas = cv;

      if (this.preview) {
        this.preview.src = cv.toDataURL('image/png');
        this.preview.style.display = 'block';
      }
      if (this.btnDownload) this.btnDownload.style.display = 'inline-flex';
      if (this.btnShareWA)  this.btnShareWA.style.display  = 'inline-flex';

    } catch (err) {
      console.error('Erro ao gerar convite:', err);
      alert('Erro ao gerar o convite: ' + err.message);
    }

    this.resetButton();
  }

  /* Auxiliar: linha horizontal com gradiente */
  _hLine(ctx, x1, x2, y, color) {
    const g = ctx.createLinearGradient(x1, y, x2, y);
    g.addColorStop(0,   'rgba(0,0,0,0)');
    g.addColorStop(0.2, color);
    g.addColorStop(0.8, color);
    g.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  }

  /* Auxiliar: losango decorativo */
  _diamond(ctx, cx, cy, size, color) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx,        cy - size);
    ctx.lineTo(cx + size, cy);
    ctx.lineTo(cx,        cy + size);
    ctx.lineTo(cx - size, cy);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();
  }

  /* Auxiliar: retângulo arredondado */
  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* Auxiliar: texto com quebra de linha */
  _wrapText(ctx, text, x, y, maxW, lineH) {
    const words = text.split(' ');
    let line = '';
    let curY  = y;
    words.forEach((word, i) => {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > maxW && i > 0) {
        ctx.fillText(line.trim(), x, curY);
        line = word + ' ';
        curY += lineH;
      } else {
        line = test;
      }
    });
    ctx.fillText(line.trim(), x, curY);
  }

  download() {
    if (!this.canvas) return;
    const link = document.createElement('a');
    link.download = `convite-15-anos-\${CONFIG.DEBUTANTE_NAME.toLowerCase().replace(/\s+/g,'-')}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  shareWA() {
    if (!this.canvas) return;
    if (navigator.share && navigator.canShare) {
      this.canvas.toBlob(async (blob) => {
        const file = new File([blob], 'convite-15-anos.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `Convite — 15 Anos \${CONFIG.DEBUTANTE_NAME}`,
              text: `Você está convidado! ✨ Festa de 15 Anos de \${CONFIG.DEBUTANTE_NAME} — 08/08/2026`,
              files: [file],
            });
            return;
          } catch (e) { /* fallback */ }
        }
        this._waFallback();
      });
    } else {
      this._waFallback();
    }
  }

  _waFallback() {
    const msg = encodeURIComponent(
      `Você está convidado! ✨\n\nFesta de 15 Anos de \${CONFIG.DEBUTANTE_NAME}\n📅 08 de Agosto de 2026\n🕘 21h00\n📍 Fazendo a Festa Teens - Boa Viagem, Recife`
    );
    window.open(`https://wa.me/?text=\${msg}`, '_blank');
  }

  resetButton() {
    if (this.btnGenerate) {
      this.btnGenerate.disabled = false;
      this.btnGenerate.innerHTML = '<i class="fas fa-magic"></i> Gerar Convite';
    }
  }
}

/* ================================================
   PARALLAX SUAVE
   ================================================ */

function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  const heroLightVeil = document.querySelector('.hero-light-veil');

  if (!heroBg) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const speed = 0.3;

        if (heroBg) {
          heroBg.style.transform = `translateY(${scrollY * speed}px)`;
        }
        if (heroLightVeil) {
          heroLightVeil.style.transform = `translateY(${scrollY * speed * 0.5}px)`;
        }

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ================================================
   INTRO SCREEN — CONTROLE
   ================================================ */

function initIntroScreen() {
  const introScreen = document.getElementById('intro-screen');
  const mainContent = document.getElementById('main-content');
  const introCanvas = document.getElementById('intro-canvas');

  if (!introScreen || !mainContent) return;

  // Iniciar sistema de partículas na intro
  let introParticles = null;
  if (introCanvas) {
    introParticles = new ParticleSystem(introCanvas, {
      count: 80,
      maxSize: 3.5,
      minSize: 0.5,
      speed: 0.5,
    });
    introParticles.start();
  }

  // Revelar conteúdo principal após duração
  setTimeout(() => {
    introScreen.classList.add('fade-out');

    setTimeout(() => {
      mainContent.classList.add('visible');
      introScreen.style.display = 'none';

      // Parar partículas da intro (economizar recursos)
      introParticles?.stop();

    }, 1200); // Duração do fade-out

  }, CONFIG.INTRO_DURATION);
}

/* ================================================
   INICIALIZAÇÃO GLOBAL
   ================================================ */

function init() {
  // 1. Intro screen
  initIntroScreen();

  // 2. Sistema de partículas global
  const particlesCanvas = document.getElementById('particles-canvas');
  if (particlesCanvas) {
    const particles = new ParticleSystem(particlesCanvas, {
      count: 40,
      maxSize: 2.5,
      minSize: 0.3,
      speed: 0.3,
    });
    particles.start();
  }

  // 3. Contagem regressiva
  const countdown = new Countdown(CONFIG.EVENT_DATE);
  countdown.start();

  // 4. AOS — Animate on Scroll
  // Aguardar conteúdo aparecer
  setTimeout(() => new AOS(), CONFIG.INTRO_DURATION + 500);

  // 5. Música
  const music = new MusicPlayer();

  // 6. RSVP
  const rsvp = new RSVPForm();

  // 7. Gerador de convite
  const inviteGen = new InviteGenerator();

  // 8. Parallax
  initParallax();

  // 9. Link Google Maps
  const mapsBtn = document.getElementById('maps-btn');
  if (mapsBtn) {
    mapsBtn.href = CONFIG.EVENT.mapsUrl;
  }

  // 10. Inicializar nome da debutante dinamicamente
  const nameEl = document.querySelector('.hero-name');
  if (nameEl) {
    nameEl.setAttribute('data-name', CONFIG.DEBUTANTE_NAME);
  }
    nameEl.textContent = CONFIG.DEBUTANTE_NAME;

  console.log('%c✨ Convite Digital — 15 Anos ✨', 'color: #60a5fa; font-size: 14px; font-weight: bold;');
}

/* ================================================
   AGUARDAR DOM
   ================================================ */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
