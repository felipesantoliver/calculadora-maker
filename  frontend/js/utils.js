const Storage = {
  getLocal() {
    const mat = localStorage.getItem('materiais');
    const hist = localStorage.getItem('historico');
    const cfg = localStorage.getItem('configEngine');
    const pwd = localStorage.getItem('app_password');
    return {
      materiais: mat ? JSON.parse(mat) : null,
      historico: hist ? JSON.parse(hist) : null,
      configEngine: cfg ? JSON.parse(cfg) : null,
      password: pwd || '12345678'
    };
  },

  setLocal(materiais, historico, configEngine, password) {
    localStorage.setItem('materiais', JSON.stringify(materiais));
    localStorage.setItem('historico', JSON.stringify(historico));
    localStorage.setItem('configEngine', JSON.stringify(configEngine));
    if (password) localStorage.setItem('app_password', password);
  },

  exportBackup() {
    const backup = { 
      materiais, 
      historico, 
      configEngine,
      password: localStorage.getItem('app_password'),
      exportadoEm: new Date().toISOString() 
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'precificador_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  async importBackup(file) {
    const text = await file.text();
    const backup = JSON.parse(text);
    if (backup.materiais && backup.historico) {
      materiais = backup.materiais;
      historico = backup.historico;
      if (backup.configEngine) {
        Object.assign(configEngine, backup.configEngine);
        window.configEngine = configEngine;
      }
      if (backup.password) {
        localStorage.setItem('app_password', backup.password);
        API.setPassword(backup.password);
      }
      Storage.setLocal(materiais, historico, configEngine, backup.password || localStorage.getItem('app_password'));
      Utils.toast('Backup restaurado com sucesso!');
      return true;
    } else {
      Utils.toast('Arquivo de backup inválido!');
      return false;
    }
  }
};