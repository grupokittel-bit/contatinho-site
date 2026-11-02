/* Calculadora da página inicial. Sem dependências e sem enviar nada: tudo acontece nesta tela. */
(function () {
  var calc = document.querySelector('[data-calc]');
  if (!calc) return;
  document.documentElement.classList.add('com-js');

  var visor = calc.querySelector('output');
  var linha = calc.querySelector('.calc-conta');
  var aberta = calc.querySelector('.calc-aberta');
  var voltar = calc.querySelector('[data-voltar]');
  var SINAIS = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  var MAX_DIGITOS = 12;
  var a = '', op = '', b = '', pronto = false;

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
    if (pronto) pronto = false;
    if (!a) a = '0';
    if (op && b) { a = String(calcular()); b = ''; }
    op = o;
    desenhar();
  }

  function abrir() {
    aberta.hidden = false;
    voltar.focus();
  }

  function igual() {
    if (!op || !b) return;
    var chave = a === '23' && op === '+' && b === '14';
    var r = calcular();
    linha.textContent = legivel(a) + ' ' + SINAIS[op] + ' ' + legivel(b) + ' =';
    visor.textContent = formatar(r);
    a = isFinite(r) ? String(r) : ''; op = ''; b = ''; pronto = true;
    if (chave) abrir();
  }

  function apagar() {
    if (pronto) { limpar(); return; }
    if (op && b) b = b.slice(0, -1);
    else if (op) op = '';
    else a = a.slice(0, -1);
    desenhar();
  }

  calc.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t) return;
    var k = t.getAttribute('data-k');
    if (t === voltar) { aberta.hidden = true; limpar(); calc.querySelector('[data-k="c"]').focus(); return; }
    if (k === 'c') limpar();
    else if (k === 'apagar') apagar();
    else if (k === '=') igual();
    else if (SINAIS[k]) operador(k);
    else if (k) digito(k);
  });

  desenhar();
})();
