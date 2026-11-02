/* Calculadora da página inicial: a mesma grade do app. Sem dependências e sem enviar nada. */
(function () {
  var calc = document.querySelector('[data-calc]');
  if (!calc) return;

  var visor = calc.querySelector('output');
  var linha = calc.querySelector('.visor-conta');
  var telaCalc = calc.querySelector('.tela--calc');
  var telaApp = calc.querySelector('.tela--app');
  var legenda = document.querySelector('[data-legenda]');
  var voltar = document.querySelector('[data-voltar]');
  var LEGENDA = legenda.textContent;
  var SINAIS = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  var CAMINHO = ['2', '3', '+', '1', '4', '='];
  var MAX_DIGITOS = 12;
  var a = '', op = '', b = '', pronto = false, passo = 0;

  function legivel(n) { return n.replace('.', ','); }

  function formatar(n) {
    if (!isFinite(n)) return 'Não dá';
    var s = String(Number(n.toFixed(8)));
    if (s.length > MAX_DIGITOS) s = n.toPrecision(7);
    return legivel(s);
  }

  function desenhar() {
    visor.textContent = legivel((op ? b : a) || (op ? '' : '0')) || legivel(a);
    linha.textContent = op ? legivel(a) + ' ' + SINAIS[op] + ' ' + legivel(b) : '';
  }

  function indicar() {
    var atual = calc.querySelector('.proxima');
    if (atual) atual.classList.remove('proxima');
    var alvo = calc.querySelector('[data-k="' + CAMINHO[passo] + '"]');
    if (alvo) alvo.classList.add('proxima');
  }

  function acompanhar(k) {
    passo = k === CAMINHO[passo] ? passo + 1 : k === '2' ? 1 : 0;
    if (passo >= CAMINHO.length) passo = 0;
    indicar();
  }

  function limpar() { a = ''; op = ''; b = ''; pronto = false; desenhar(); }

  function digito(d) {
    if (pronto) limpar();
    var alvo = op ? b : a;
    if (d === '.' && alvo.indexOf('.') !== -1) return;
    if (alvo.replace('.', '').length >= MAX_DIGITOS) return;
    alvo = (alvo === '0' && d !== '.' ? '' : alvo) + (d === '.' && !alvo ? '0.' : d);
    if (op) b = alvo; else a = alvo;
    desenhar();
  }

  function calcular() {
    var x = parseFloat(a), y = parseFloat(b);
    return op === '+' ? x + y : op === '-' ? x - y : op === '*' ? x * y : x / y;
  }

  function operador(o) {
    pronto = false;
    if (!a) a = '0';
    if (op && b) { a = String(calcular()); b = ''; }
    op = o;
    desenhar();
  }

  function trocar(fn) {
    var v = op ? b : a;
    if (!v) return;
    v = String(fn(parseFloat(v)));
    if (op) b = v; else a = v;
    pronto = false;
    desenhar();
  }

  function abrir() {
    calc.setAttribute('data-aberto', '1');
    telaCalc.inert = true;
    telaApp.removeAttribute('aria-hidden');
    legenda.textContent = 'Abriu. No app, quem escolhe a conta é você.';
    voltar.hidden = false;
    voltar.focus();
  }

  function fechar() {
    calc.setAttribute('data-aberto', '0');
    telaCalc.inert = false;
    telaApp.setAttribute('aria-hidden', 'true');
    legenda.textContent = LEGENDA;
    voltar.hidden = true;
    limpar();
    passo = 0;
    indicar();
    calc.querySelector('[data-k="ac"]').focus();
  }

  function igual() {
    if (!op || !b) return;
    var chave = a === '23' && op === '+' && b === '14';
    var r = calcular();
    linha.textContent = legivel(a) + ' ' + SINAIS[op] + ' ' + legivel(b) + ' =';
    visor.textContent = formatar(r);
    a = isFinite(r) ? String(r) : ''; op = ''; b = ''; pronto = true;
    if (chave) setTimeout(abrir, 420);
  }

  function apagar() {
    if (pronto) { limpar(); return; }
    if (op && b) b = b.slice(0, -1);
    else if (op) op = '';
    else a = a.slice(0, -1);
    desenhar();
  }

  telaCalc.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t) return;
    var k = t.getAttribute('data-k');
    acompanhar(k);
    if (k === 'ac') limpar();
    else if (k === 'apagar') apagar();
    else if (k === '%') trocar(function (n) { return n / 100; });
    else if (k === 'sinal') trocar(function (n) { return -n; });
    else if (k === '=') igual();
    else if (SINAIS[k]) operador(k);
    else digito(k);
  });

  voltar.addEventListener('click', fechar);
  desenhar();
  indicar();
})();
