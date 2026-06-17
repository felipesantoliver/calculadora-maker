// Variáveis globais (acessíveis via window)
let configEngine = { /* mesma configuração inicial */ };
let materiais = [ /* dados iniciais */ ];
let historico = [];
let currentServiceMode = '3d';
let syncTimeout;

async function init() {
  // Inicializar tema
  if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark');
  // Carregar dados
  const local = Storage.getLocal();
  try {
    const cloud = await API.loadData();
    if (cloud) {
      materiais = cloud.materiais;
      historico = cloud.historico;
      Storage.setLocal(materiais, historico);
    } else if (local.materiais && local.historico) {
      materiais = local.materiais;
      historico = local.historico;
      Utils.toast('Modo offline – usando cache local');
    }
  } catch {
    if (local.materiais && local.historico) {
      materiais = local.materiais;
      historico = local.historico;
      Utils.toast('Sem conexão – usando dados locais');
    }
  }
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
      Storage.setLocal(materiais, historico);
    } catch { /* offline */ }
  }, 2000);
}

// Toda vez que alterar materiais ou historico, chame scheduleSync()
// Expor funções globais necessárias
window.materiais = materiais;
window.historico = historico;
window.configEngine = configEngine;
window.UI = UI;
window.Utils = Utils;

// Eventos
document.getElementById('confirm-cancel-btn').onclick = () => document.getElementById('confirm-modal').classList.add('hidden');
document.getElementById('confirm-ok-btn').onclick = () => {
  document.getElementById('confirm-modal').classList.add('hidden');
  if (window._confirmCallback) window._confirmCallback();
};

window.addEventListener('DOMContentLoaded', init);