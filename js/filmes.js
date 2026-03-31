// filmes.js — Lógica da página de Filmes

function getFilmes() {
  return JSON.parse(localStorage.getItem('filmes') || '[]');
}

function salvarFilme() {
  const titulo        = document.getElementById('titulo').value.trim();
  const genero        = document.getElementById('genero').value.trim();
  const classificacao = document.getElementById('classificacao').value;
  const duracao       = document.getElementById('duracao').value;
  const estreia       = document.getElementById('estreia').value;
  const descricao     = document.getElementById('descricao').value.trim();

  if (!titulo || !genero || !classificacao || !duracao || !estreia) {
    mostrarAlerta('Preencha todos os campos obrigatórios!', 'error');
    return;
  }

  const filmes = getFilmes();
  const novoFilme = {
    id: Date.now(),
    titulo, genero, classificacao,
    duracao: Number(duracao),
    estreia, descricao
  };

  filmes.push(novoFilme);

  try {
    localStorage.setItem('filmes', JSON.stringify(filmes));
    mostrarAlerta('Filme salvo com sucesso! ✔', 'success');
    limparForm();
    renderTabela();
  } catch (e) {
    mostrarAlerta('Erro ao salvar: armazenamento cheio.', 'error');
  }
}

function excluirFilme(id) {
  if (!confirm('Excluir este filme?')) return;
  const filmes = getFilmes().filter(f => f.id !== id);
  localStorage.setItem('filmes', JSON.stringify(filmes));
  renderTabela();
}

function renderTabela() {
  const filmes = getFilmes();
  const tbody  = document.getElementById('tabela-filmes');
  const empty  = document.getElementById('empty-filmes');

  if (filmes.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = filmes.map(f => `
    <tr>
      <td><strong>${f.titulo}</strong></td>
      <td>${f.genero}</td>
      <td><span class="badge badge-yellow">${f.classificacao}</span></td>
      <td>${f.duracao} min</td>
      <td>${f.estreia ? new Date(f.estreia + 'T00:00').toLocaleDateString('pt-BR') : '—'}</td>
      <td><button class="btn btn-danger" onclick="excluirFilme(${f.id})">Excluir</button></td>
    </tr>
  `).join('');
}

function limparForm() {
  ['titulo', 'genero', 'classificacao', 'duracao', 'estreia', 'descricao']
    .forEach(id => document.getElementById(id).value = '');
}

function mostrarAlerta(msg, tipo) {
  const el = document.getElementById('alert');
  el.textContent = msg;
  el.className = `alert alert-${tipo} show`;
  setTimeout(() => el.className = 'alert', 3500);
}

renderTabela();