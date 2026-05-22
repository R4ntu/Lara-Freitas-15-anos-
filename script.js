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
  WHATSAPP_MSG: 'Olá! Confirmo minha presença na festa de 15 anos da Lara ✨',

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
    this.audioSrc = 'https://pixabay.com/music/modern-classical-royal-majestic-waltz-music-529580/'; // Deixe vazio ou coloque URL da música

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

      // Fallback: se erro de rede, verificar se é CORS e tentar URL alternativa
      if (error.name === 'TypeError') {
        this.showError('Erro de conexão. Verifique sua internet e tente novamente.');
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
   GERADOR DE CONVITE (html2canvas)
   ================================================ */

class InviteGenerator {
  constructor() {
    this.btnGenerate = document.getElementById('btn-generate-invite');
    this.btnDownload = document.getElementById('btn-download-invite');
    this.btnShareWA = document.getElementById('btn-share-invite-wa');
    this.preview = document.getElementById('invite-preview');
    this.canvas = null;

    this.init();
  }

  init() {
    this.btnGenerate?.addEventListener('click', () => this.generate());
    this.btnDownload?.addEventListener('click', () => this.download());
    this.btnShareWA?.addEventListener('click', () => this.shareWA());
  }

  async generate() {
    if (this.btnGenerate) {
      this.btnGenerate.disabled = true;
      this.btnGenerate.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
    }

    // Verificar se html2canvas está disponível
    if (typeof html2canvas === 'undefined') {
      alert('html2canvas não está disponível. Verifique a conexão.');
      this.resetButton();
      return;
    }

    // Criar elemento temporário para captura
    const inviteEl = this.createInviteElement();
    document.body.appendChild(inviteEl);

    try {
      this.canvas = await html2canvas(inviteEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a1628',
        logging: false,
        width: 380,
        height: 680,
      });

      document.body.removeChild(inviteEl);

      // Mostrar preview
      if (this.preview) {
        this.preview.src = this.canvas.toDataURL('image/png');
        this.preview.style.display = 'block';
      }

      // Mostrar botões de download/compartilhar
      if (this.btnDownload) this.btnDownload.style.display = 'inline-flex';
      if (this.btnShareWA) this.btnShareWA.style.display = 'inline-flex';

    } catch (error) {
      console.error('Erro ao gerar convite:', error);
      alert('Erro ao gerar o convite. Tente novamente.');
      if (document.body.contains(inviteEl)) {
        document.body.removeChild(inviteEl);
      }
    }

    this.resetButton();
  }

  createInviteElement() {
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed;
      left: -9999px;
      top: -9999px;
      width: 380px;
      height: 680px;
      background: linear-gradient(180deg, #040d1a 0%, #0a1628 50%, #0d2150 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px 30px;
      font-family: Georgia, serif;
      color: #e2e8f0;
    `;

    el.innerHTML = `
      <div style="color: #c9a96e; font-size: 36px; margin-bottom: 16px;">♛</div>
      <div style="font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #60a5fa; opacity: 0.7; margin-bottom: 8px; font-family: Arial, sans-serif;">CONVIDA PARA OS SEUS</div>
      <div style="font-size: 16px; letter-spacing: 2px; text-transform: uppercase; color: #c0c8d8; font-family: Arial, sans-serif; margin-bottom: 4px;">15 ANOS</div>
      <div style="width: 80px; height: 1px; background: linear-gradient(90deg, transparent, #c0c8d8, transparent); margin: 16px auto;"></div>
      <div style="font-size: 42px; font-weight: 300; color: #f1f5f9; letter-spacing: 2px; margin-bottom: 4px; font-family: Georgia, serif;">${CONFIG.DEBUTANTE_NAME}</div>
      <div style="font-size: 11px; letter-spacing: 4px; color: #60a5fa; opacity: 0.7; font-family: Arial, sans-serif; margin-bottom: 24px;">✦ DEBUTANTE ✦</div>

      <div style="width: 60px; height: 1px; background: linear-gradient(90deg, transparent, #60a5fa, transparent); margin: 0 auto 24px;"></div>

      <div style="font-size: 11px; letter-spacing: 2px; color: #c0c8d8; opacity: 0.7; font-family: Arial, sans-serif; margin-bottom: 6px;">08 DE AGOSTO DE 2026</div>
      <div style="font-size: 14px; letter-spacing: 3px; color: #f1f5f9; font-family: Arial, sans-serif; margin-bottom: 20px;">Às 21h00</div>

      <div style="font-size: 11px; color: #c0c8d8; opacity: 0.65; font-family: Arial, sans-serif; line-height: 1.7; margin-bottom: 20px;">
        Fazendo a Festa Teens<br>
        R. Prof. Augusto Lins e Silva, 123<br>
        Boa Viagem · Recife - PE
      </div>

      <div style="font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #60a5fa; font-family: Arial, sans-serif; border: 1px solid rgba(96,165,250,0.3); padding: 6px 16px; border-radius: 20px;">Social Esporte Fino</div>

      <div style="width: 80px; height: 1px; background: linear-gradient(90deg, transparent, #c0c8d8, transparent); margin: 24px auto;"></div>

      <div style="font-size: 9px; letter-spacing: 2px; color: #60a5fa; opacity: 0.5; font-family: Arial, sans-serif;">✦ ✦ ✦</div>
    `;

    return el;
  }

  download() {
    if (!this.canvas) return;
    const link = document.createElement('a');
    link.download = `convite-15-anos-${CONFIG.DEBUTANTE_NAME.toLowerCase()}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  shareWA() {
    if (!this.canvas) return;
    // Tentar Web Share API primeiro
    if (navigator.share && navigator.canShare) {
      this.canvas.toBlob(async (blob) => {
        const file = new File([blob], 'convite-15-anos.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `Convite — 15 Anos ${CONFIG.DEBUTANTE_NAME}`,
              text: `Você está convidado! ✨ Festa de 15 Anos de ${CONFIG.DEBUTANTE_NAME} — 08/08/2026`,
              files: [file],
            });
            return;
          } catch (e) { /* fallback */ }
        }
      });
    }

    // Fallback: abrir WhatsApp com mensagem
    const msg = encodeURIComponent(
      `Você está convidado! ✨\n\nFesta de 15 Anos de ${CONFIG.DEBUTANTE_NAME}\n📅 08 de Agosto de 2026\n🕘 21h00\n📍 Fazendo a Festa Teens - Boa Viagem, Recife`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
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
