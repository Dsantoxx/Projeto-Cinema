// ingressos.js — Lógica da página de Ingressos

function getSessoes()   { return JSON.parse(localStorage.getItem('sessoes')   || '[]'); }
function getIngressos() { return JSON.parse(localStorage.getItem('ingressos') || '[]'); }

/* ── Popula o select de sessões, pré-selecionando via query string ── */
function popularSelect() {
  const sessoes = getSessoes();
  const sel = document.getElementById('sessao');

  const params = new URLSearchParams(window.location.search);
  const sessaoParam = params.get('sessao');

  sel.innerHTML = '<option value="">Selecione uma sessão</option>' +
    sessoes.map(s => {
      const dt = new Date(s.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
      return `<option value="${s.id}" ${s.id == sessaoParam ? 'selected' : ''}>${s.filmeNome} — ${s.salaNome} — ${dt}</option>`;
    }).join('');

  if (sessaoParam) atualizarPreco();
}

function atualizarPreco() {
  const id   = document.getElementById('sessao').value;
  const info  = document.getElementById('info-sessao');
  const texto = document.getElementById('info-texto');

  if (!id) { info.style.display = 'none'; return; }

  const s = getSessoes().find(s => s.id == id);
  if (!s) { info.style.display = 'none'; return; }

  const dt = new Date(s.dataHora).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' });
  texto.innerHTML = `🎬 <strong style="color:var(--text)">${s.filmeNome}</strong> &nbsp;|&nbsp; 🏛️ ${s.salaNome} &nbsp;|&nbsp; 🕐 ${dt} &nbsp;|&nbsp; 💰 <strong style="color:var(--accent)">R$ ${Number(s.preco).toFixed(2)}</strong> &nbsp;|&nbsp; ${s.formato} / ${s.idioma}`;
  info.style.display = 'block';
}

function confirmarVenda() {
  const sessaoId  = document.getElementById('sessao').value;
  const cliente   = document.getElementById('cliente').value.trim();
  const cpf       = document.getElementById('cpf').value.trim();
  const assento   = document.getElementById('assento').value.trim();
  const pagamento = document.getElementById('pagamento').value;

  if (!sessaoId || !cliente || !cpf || !assento || !pagamento) {
    mostrarAlerta('Preencha todos os campos!', 'error');
    return;
  }

  const sessoes  = getSessoes();
  const sessao   = sessoes.find(s => s.id == sessaoId);
  const ingressos = getIngressos();

  if (ingressos.some(i => i.sessaoId == sessaoId && i.assento.toUpperCase() === assento.toUpperCase())) {
    mostrarAlerta(`Assento ${assento} já vendido para esta sessão!`, 'error');
    return;
  }

  ingressos.push({
    id: Date.now(),
    sessaoId: Number(sessaoId),
    sessaoNome: sessao ? `${sessao.filmeNome} — ${sessao.salaNome}` : 'Desconhecida',
    valor: sessao ? sessao.preco : 0,
    cliente, cpf, assento, pagamento
  });

  try {
    localStorage.setItem('ingressos', JSON.stringify(ingressos));
    mostrarAlerta('Ingresso vendido com sucesso! 🎟️', 'success');
    limparForm();
    renderTabela();
  } catch (e) {
    mostrarAlerta('Erro ao salvar: armazenamento cheio.', 'error');
  }
}

/* ── Modal ── */
let idParaExcluir = null;

function excluirIngresso(id) {
  idParaExcluir = id;
  abrirModal();
}

function abrirModal() {
  document.getElementById('modal-overlay').classList.add('show');
}

function fecharModal() {
  document.getElementById('modal-overlay').classList.remove('show');
  idParaExcluir = null;
}

document.getElementById('modal-confirmar').addEventListener('click', function () {
  if (idParaExcluir === null) return;
  const ingressos = getIngressos().filter(i => i.id !== idParaExcluir);
  localStorage.setItem('ingressos', JSON.stringify(ingressos));
  renderTabela();
  fecharModal();
  mostrarAlerta('Ingresso cancelado.', 'error');
});

document.getElementById('modal-overlay').addEventListener('click', function (e) {
  if (e.target === this) fecharModal();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') fecharModal();
});

/* ── Tabela ── */
function renderTabela() {
  const ingressos = getIngressos();
  const tbody     = document.getElementById('tabela-ingressos');
  const empty     = document.getElementById('empty-ingressos');

  if (ingressos.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const payIcon = { Cartão: '💳', Pix: '📱', Dinheiro: '💵' };

  tbody.innerHTML = ingressos.map(i => `
    <tr>
      <td style="max-width:200px;font-size:0.85rem">${i.sessaoNome}</td>
      <td><strong>${i.cliente}</strong></td>
      <td style="font-size:0.85rem;color:var(--muted)">${i.cpf}</td>
      <td><span class="badge badge-yellow">${i.assento.toUpperCase()}</span></td>
      <td>${payIcon[i.pagamento] || ''} ${i.pagamento}</td>
      <td style="color:var(--accent);font-weight:600">R$ ${Number(i.valor).toFixed(2)}</td>
      <td><button class="btn btn-danger" onclick="excluirIngresso(${i.id})">Cancelar</button></td>
    </tr>
  `).join('');
}

function limparForm() {
  ['sessao', 'cliente', 'cpf', 'assento', 'pagamento']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('info-sessao').style.display = 'none';
}

function mostrarAlerta(msg, tipo) {
  const el = document.getElementById('alert');
  el.textContent = msg;
  el.className = `alert alert-${tipo} show`;
  setTimeout(() => el.className = 'alert', 3500);
}

/* ── Máscara de CPF ── */
document.getElementById('cpf').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
  v = v.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  this.value = v;
});

popularSelect();
renderTabela();