// salas.js — Lógica da página de Salas

function getSalas() {
  return JSON.parse(localStorage.getItem('salas') || '[]');
}

function salvarSala() {
  const nome       = document.getElementById('nome').value.trim();
  const capacidade = document.getElementById('capacidade').value;
  const tipo       = document.getElementById('tipo').value;

  if (!nome || !capacidade || !tipo) {
    mostrarAlerta('Preencha todos os campos!', 'error');
    return;
  }

  const salas = getSalas();
  salas.push({ id: Date.now(), nome, capacidade: Number(capacidade), tipo });

  try {
    localStorage.setItem('salas', JSON.stringify(salas));
    mostrarAlerta('Sala salva com sucesso! ✔', 'success');
    limparForm();
    renderTabela();
  } catch (e) {
    mostrarAlerta('Erro ao salvar: armazenamento cheio.', 'error');
  }
}

/* ── Modal ── */
let idParaExcluir = null;

function excluirSala(id) {
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
  const salas = getSalas().filter(s => s.id !== idParaExcluir);
  localStorage.setItem('salas', JSON.stringify(salas));
  renderTabela();
  fecharModal();
  mostrarAlerta('Sala excluída.', 'error');
});

document.getElementById('modal-overlay').addEventListener('click', function (e) {
  if (e.target === this) fecharModal();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') fecharModal();
});

/* ── Tabela ── */
function tipoBadge(tipo) {
  const cls = { '2D': 'badge-blue', '3D': 'badge-green', 'IMAX': 'badge-red' };
  return `<span class="badge ${cls[tipo] || ''}">${tipo}</span>`;
}

function renderTabela() {
  const salas = getSalas();
  const tbody = document.getElementById('tabela-salas');
  const empty = document.getElementById('empty-salas');

  if (salas.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = salas.map(s => `
    <tr>
      <td><strong>${s.nome}</strong></td>
      <td>${s.capacidade} lugares</td>
      <td>${tipoBadge(s.tipo)}</td>
      <td><button class="btn btn-danger" onclick="excluirSala(${s.id})">Excluir</button></td>
    </tr>
  `).join('');
}

function limparForm() {
  ['nome', 'capacidade', 'tipo'].forEach(id => document.getElementById(id).value = '');
}

function mostrarAlerta(msg, tipo) {
  const el = document.getElementById('alert');
  el.textContent = msg;
  el.className = `alert alert-${tipo} show`;
  setTimeout(() => el.className = 'alert', 3500);
}

renderTabela();
