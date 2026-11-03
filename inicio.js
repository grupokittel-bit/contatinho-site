/* Celular do Contatinho: o app rodando sozinho. Desenvolvido por VEX CODE: https://vexcode.com.br */
(() => {
  'use strict';
  const PARA = Symbol('para');
  const parado = matchMedia('(prefers-reduced-motion: reduce)');
  const TEXTO = 'Tá sim. Ninguém desconfia.';
  const SENHA = ['4', '0', '7', '1', '9', '2'];

  /* Espera que só conta o tempo com o celular na tela e a aba aberta. Trocou de vez = para. */
  function espera(c, ms) {
    const id = c.vez;
    return (async () => {
      let resta = ms;
      while (resta > 0) {
        if (id !== c.vez) throw PARA;
        const passo = Math.min(resta, 60);
        await new Promise(ok => setTimeout(ok, passo));
        if (id !== c.vez) throw PARA;
        if (c.visivel && !document.hidden) resta -= passo;
      }
    })();
  }
  const $ = (c, s) => c.raiz.querySelector(s);
  const liga = (c, s, cls, sim) => { const e = $(c, s); if (e) e.classList.toggle(cls, sim); };
  const tecla = (c, k) => $(c, `[data-k="${k}"]`);
  const largura = (el, f) => { if (el) el.style.width = f; };

  function cena(c, nome) { c.raiz.dataset.cena = nome; }
  function mostrar(c, nome) {
    c.raiz.querySelectorAll('.k-c').forEach(t => t.classList.toggle('on', t.dataset.t === nome));
  }
  function mensagem(c, n, ver) { liga(c, `[data-m="${n}"]`, 'oculta', !ver); }
  function sub(c, digitando) {
    const s = $(c, '[data-sub]');
    if (!s) return;
    s.textContent = digitando ? 'digitando…' : 'online agora';
    s.classList.toggle('dig', digitando);
  }

  function zerar(c) {
    ['[data-acoes]', '[data-folha]', '[data-senha]', '[data-aviso]', '[data-push]'].forEach(s => liga(c, s, 'on', false));
    liga(c, '[data-senha]', 'ok', false);
    const visu = $(c, '[data-visu]'); if (visu) visu.classList.remove('on', 'foto', 'video');
    for (let n = 2; n <= 6; n++) mensagem(c, n, false);
    mensagem(c, 1, true);
    liga(c, '[data-jhu]', 'fora', false);
    const jp = $(c, '[data-jhu-prev]'); if (jp) jp.textContent = 'A surpresa ainda tá de pé?';
    const jh = $(c, '[data-jhu-hora]'); if (jh) jh.textContent = '19:40';
        const nl = $(c, '[data-naolidas]'); if (nl) nl.hidden = false;
    c.raiz.querySelectorAll('[data-pontos] i').forEach(i => i.classList.remove('c'));
    const expr = $(c, '[data-expr]'); if (expr) expr.textContent = '\u00a0';
    const num = $(c, '[data-num]'); if (num) num.textContent = '0';
    liga(c, '[data-campo]', 'cheio', false); liga(c, '[data-campo]', 'grav', false);
    const tx = $(c, '[data-texto]'); if (tx) tx.textContent = 'Mensagem';
    liga(c, '[data-env]', 'env', false); liga(c, '[data-env]', 'grav', false);
    sub(c, false);
    largura($(c, '[data-onda]'), '0');
    largura($(c, '[data-barra]'), '0');
    liga(c, '[data-dedo]', 'on', false); liga(c, '[data-dedo]', 'baixo', false);
    mostrar(c, 'calc');
  }

  /* Leva o dedo até o alvo e aperta. segura = ms com o dedo embaixo (0 = toque rápido). */
  async function tocar(c, alvo, ida = 230, segura = 0, aoApertar) {
    const d = $(c, '[data-dedo]');
    const t = c.tela.getBoundingClientRect();
    const r = alvo.getBoundingClientRect();
    const k = t.width / c.tela.offsetWidth || 1;
    d.style.left = (r.left - t.left + r.width / 2) / k + 'px';
    d.style.top = (r.top - t.top + r.height / 2) / k + 'px';
    d.classList.add('on');
    await espera(c, ida);
    d.classList.add('baixo');
    alvo.classList.add('ativa');
    if (aoApertar) aoApertar(true);
    await espera(c, segura || 100);
    if (aoApertar) aoApertar(false);
    d.classList.remove('baixo');
    alvo.classList.remove('ativa');
  }
  const soltar = c => liga(c, '[data-dedo]', 'on', false);

  async function teclar(c, seq) {
    const num = $(c, '[data-num]');
    let linha = '';
    for (const k of seq) {
      await tocar(c, tecla(c, k), 130);
      linha += /[+×÷−]/.test(k) ? ` ${k} ` : k;
      num.textContent = linha;
      await espera(c, 40);
    }
    return linha;
  }
  function contaDe(l) {
    const [a, op, b] = l.split(' ');
    const x = Number(a), y = Number(b);
    const r = op === '+' ? x + y : op === '×' ? x * y : op === '÷' ? x / y : x - y;
    return String(Math.round(r * 1000) / 1000).replace('.', ',');
  }
  async function conta(c, seq, pausa) {
    const expr = $(c, '[data-expr]');
    const num = $(c, '[data-num]');
    const linha = await teclar(c, seq);
    await tocar(c, tecla(c, '='), 170);
    expr.textContent = linha;
    num.textContent = contaDe(linha);
    await espera(c, pausa);
    await tocar(c, tecla(c, 'AC'), 200);
    expr.textContent = '\u00a0';
    num.textContent = '0';
  }

  /* O celular dos outros: só contas comuns. */
  async function calculadora(c) {
    const contas = [['1', '2', '×', '3'], ['8', '5', '+', '4', '7'], ['9', '6', '÷', '8'], ['2', '4', '×', '1', '5']];
    zerar(c);
    for (;;) {
      await conta(c, contas[c.giro++ % contas.length], 1500);
      soltar(c);
      await espera(c, 900);
    }
  }

  async function filme(c) {
    const campo = $(c, '[data-campo]');
    const texto = $(c, '[data-texto]');
    const env = $(c, '[data-env]');
    const visu = $(c, '[data-visu]');
    zerar(c);
    cena(c, 'calc');
    await espera(c, 500);
    // O aviso: o nome no celular é "Calculadora" e o texto não diz de quem é nem o que diz.
    liga(c, '[data-push]', 'on', true); cena(c, 'aviso');
    await espera(c, 2000);
    liga(c, '[data-push]', 'on', false); cena(c, 'calc');
    await espera(c, 400);
    await conta(c, ['1', '2', '×', '3'], 900);
    cena(c, 'senha');
    await espera(c, 260);
    await teclar(c, ['2', '7', '+', '1', '5']);
    await espera(c, 220);
    await tocar(c, tecla(c, '='), 200);
    mostrar(c, 'lista'); soltar(c); cena(c, 'lista');
    await espera(c, 1200);
    await tocar(c, $(c, '[data-jhu]'), 320);
    $(c, '[data-naolidas]').hidden = true;
    mostrar(c, 'conv'); soltar(c); cena(c, 'conversa');
    await espera(c, 800);
    await tocar(c, campo, 300);
    campo.classList.add('cheio'); texto.textContent = ''; env.classList.add('env');
    soltar(c);
    for (let i = 1; i <= TEXTO.length; i++) { texto.textContent = TEXTO.slice(0, i); await espera(c, 34); }
    await espera(c, 200);
    await tocar(c, env, 240);
    mensagem(c, 2, true);
    campo.classList.remove('cheio'); texto.textContent = 'Mensagem'; env.classList.remove('env');
    soltar(c);
    await espera(c, 650);
    sub(c, true); await espera(c, 850); sub(c, false);
    // A foto chega coberta, sem miniatura, e só aparece quando você toca (como no app).
    mensagem(c, 3, true); cena(c, 'foto');
    await espera(c, 1100);
    await tocar(c, $(c, '[data-foto]'), 320);
    visu.classList.add('on', 'foto');
    soltar(c);
    await espera(c, 2600);
    await tocar(c, $(c, '.k-visu-x'), 260);
    visu.classList.remove('on', 'foto');
    soltar(c);
    await espera(c, 420);
    cena(c, 'audio');
    await tocar(c, env, 280);
    env.classList.add('grav'); campo.classList.add('grav');
    soltar(c);
    for (let s = 0; s <= 3; s++) { texto.textContent = `Gravando 0:0${s}`; await espera(c, 430); }
    await tocar(c, env, 120);
    env.classList.remove('grav'); campo.classList.remove('grav'); texto.textContent = 'Mensagem';
    mensagem(c, 4, true);
    await espera(c, 420);
    await tocar(c, $(c, '[data-play]'), 260);
    soltar(c);
    const onda = $(c, '[data-onda]');
    for (let p = 0; p <= 100; p += 4) { largura(onda, p + '%'); await espera(c, 52); }
    await espera(c, 240);
    sub(c, true); await espera(c, 760); sub(c, false);
    mensagem(c, 5, true); cena(c, 'video');
    await espera(c, 900);
    await tocar(c, $(c, '[data-video]'), 300);
    visu.classList.add('on', 'video');
    soltar(c);
    const barra = $(c, '[data-barra]');
    for (let p = 0; p <= 100; p += 3) { largura(barra, p + '%'); await espera(c, 70); }
    visu.classList.remove('on', 'video');
    largura(barra, '0');
    await espera(c, 320);
    mensagem(c, 6, true);
    await espera(c, 1000);
    // Esconder a conversa (como no app): volta para a lista, segura a conversa, Esconder, confirma.
    cena(c, 'voltar');
    await tocar(c, $(c, '[data-volta]'), 300);
    $(c, '[data-jhu-prev]').textContent = 'Fechado. Sábado, 19h.';
    $(c, '[data-jhu-hora]').textContent = '19:42';
    mostrar(c, 'lista');
    soltar(c);
    await espera(c, 800);
    cena(c, 'esconder');
    await tocar(c, $(c, '[data-jhu]'), 320, 650);
    liga(c, '[data-acoes]', 'on', true);
    soltar(c);
    await espera(c, 1100);
    await tocar(c, $(c, '[data-esconder]'), 300);
    liga(c, '[data-acoes]', 'on', false);
    liga(c, '[data-folha]', 'on', true);
    soltar(c);
    await espera(c, 1300);
    await tocar(c, $(c, '[data-confirma]'), 280);
    liga(c, '[data-folha]', 'on', false);
    soltar(c);
    await espera(c, 320);
    liga(c, '[data-jhu]', 'fora', true);
    liga(c, '[data-aviso]', 'on', true);
    await espera(c, 1500);
    liga(c, '[data-aviso]', 'on', false);
    // O Arquivo só abre com a senha.
    cena(c, 'arquivo');
    await tocar(c, $(c, '[data-arq-linha]'), 320);
    liga(c, '[data-senha]', 'on', true);
    soltar(c);
    await espera(c, 450);
    const pontos = c.raiz.querySelectorAll('[data-pontos] i');
    for (let i = 0; i < SENHA.length; i++) {
      await tocar(c, $(c, `[data-s="${SENHA[i]}"]`), 140);
      pontos[i].classList.add('c');
    }
    await tocar(c, $(c, '[data-abrir]'), 220);
    liga(c, '[data-senha]', 'ok', true);
    soltar(c);
    await espera(c, 750);
    mostrar(c, 'arq');
    liga(c, '[data-senha]', 'on', false);
    liga(c, '[data-senha]', 'ok', false);
    await espera(c, 2200);
    // Dois toques no topo: volta para a calculadora.
    cena(c, 'trava');
    const topo = $(c, '[data-topo]');
    await tocar(c, topo, 300);
    await tocar(c, topo, 40);
    mostrar(c, 'calc');
    soltar(c);
    await espera(c, 1700);
  }

  async function rodar(c) {
    const id = ++c.vez;
    try {
      if (c.modo === 'calc') return await calculadora(c);
      while (id === c.vez) await filme(c);
    } catch (e) {
      if (e !== PARA) throw e;
    }
  }

  const celulares = [];
  function montar(raiz) {
    const c = { raiz, tela: raiz.querySelector('[data-tela]'), modo: raiz.dataset.celular, vez: 0, visivel: false, giro: 0 };
    celulares.push(c);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => { c.visivel = es[es.length - 1].isIntersecting; }, { threshold: 0.05 }).observe(raiz);
    } else c.visivel = true;
  }
  document.querySelectorAll('[data-celular]').forEach(montar);

  /* Roda só os celulares do layout que está na tela; o outro (celular x computador) fica parado. */
  function atualizar() {
    celulares.forEach(c => {
      const aparece = c.raiz.getClientRects().length > 0;
      if (parado.matches) { c.vez++; c.rodando = false; return; }
      if (aparece && !c.rodando) { c.rodando = true; rodar(c); }
      if (!aparece && c.rodando) { c.vez++; c.rodando = false; }
    });
  }
  window.kAtualizar = atualizar;
  atualizar();
  const largo = matchMedia('(min-width: 980px)');
  const ouvir = (mq, fn) => { if (mq.addEventListener) mq.addEventListener('change', fn); else mq.addListener(fn); };
  ouvir(largo, atualizar);
  ouvir(parado, () => {
    if (parado.matches) celulares.forEach(c => { c.vez++; c.rodando = false; });
    atualizar();
  });
})();

/* Segurar o dedo (ou o clique) em cima de uma foto desfocada mostra nítido enquanto segura.
   Vale para a foto do presente no texto e, na prévia, para as fotos de perfil do celular. */
(() => {
  'use strict';
  const SELETOR = '.seg, .k img[data-desf]';
  let alvo = null;
  const soltar = () => { if (alvo) alvo.classList.remove('nitido'); alvo = null; };
  document.addEventListener('pointerdown', e => {
    const el = e.target && e.target.closest ? e.target.closest(SELETOR) : null;
    if (!el) return;
    soltar();
    alvo = el;
    el.classList.add('nitido');
  }, { passive: true });
  ['pointerup', 'pointercancel', 'blur'].forEach(ev => window.addEventListener(ev, soltar, { passive: true }));
  document.addEventListener('pointerleave', soltar, { passive: true });
  document.addEventListener('contextmenu', e => { if (e.target && e.target.closest && e.target.closest(SELETOR)) e.preventDefault(); });
})();
