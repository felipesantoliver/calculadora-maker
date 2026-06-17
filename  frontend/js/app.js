// Variáveis globais (acessíveis via window)
let materiais = [];
let historico = [];
let configEngine = {
  energia_hora: 0.85,
  capex_base: 0.50,
  manutencao_porcentagem: 0.05,
  mao_obra_hora: 12.50,
  multiplicador_n2: 1.5,
  multiplicador_n3: 2.2,
  preco_minimo: 10.00,
  proj_hora_base: 50.00,
  proj_multiplicador_n3: 2.0
};
let currentServiceMode = '3d';
let syncTimeout;

async function init() {
  // Inicializar tema
  if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark');

  // Carregar senha
  let password = localStorage.getItem('app_password');
  if (!password) {
    password = '12345678';
    localStorage.setItem('app_password', password);
  }
  API.setPassword(password);

  // Carregar configurações da engine do localStorage (se houver)
  const local = Storage.getLocal();
  if (local.configEngine) {
    Object.assign(configEngine, local.configEngine);
  }

  try {
    const cloud = await API.loadData();
    if (cloud) {
      materiais.splice(0, materiais.length, ...cloud.materiais);
      historico.splice(0, historico.length, ...cloud.historico);
      Storage.setLocal(materiais, historico, configEngine, password);
    } else if (local.materiais && local.historico) {
      materiais.splice(0, materiais.length, ...local.materiais);
      historico.splice(0, historico.length, ...local.historico);
      Utils.toast('Modo offline – usando cache local');
    }
  } catch (err) {
    if (local.materiais && local.historico) {
      materiais.splice(0, materiais.length, ...local.materiais);
      historico.splice(0, historico.length, ...local.historico);
      Utils.toast('Sem conexão – usando dados locais');
    } else {
      Utils.toast('Erro ao carregar dados: ' + err.message);
    }
  }

  window.materiais = materiais;
  window.historico = historico;
  window.configEngine = configEngine;

  // Popular interface
  UI.populateMaterialDropdowns();
  UI.fillConfigForm();
  UI.calculatePrice();
  UI.switchTab('dashboard');
  lucide.createIcons();
}

// Sincronização com debounce
function scheduleSync() {
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      await API.saveData(materiais, historico);
      Storage.setLocal(materiais, historico, configEngine, localStorage.getItem('app_password'));
    } catch (err) {
      Utils.toast('Erro ao sincronizar: ' + err.message);
    }
  }, 2000);
}

// Expor funções globais
window.materiais = materiais;
window.historico = historico;
window.configEngine = configEngine;
window.UI = UI;
window.Utils = Utils;
window.API = API;

// Eventos
document.getElementById('confirm-cancel-btn').onclick = () => document.getElementById('confirm-modal').classList.add('hidden');
document.getElementById('confirm-ok-btn').onclick = () => {
  document.getElementById('confirm-modal').classList.add('hidden');
  if (window._confirmCallback) window._confirmCallback();
};

window.addEventListener('DOMContentLoaded', init);