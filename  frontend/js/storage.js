const Storage = {
  getLocal() {
    const mat = localStorage.getItem('materiais');
    const hist = localStorage.getItem('historico');
    return {
      materiais: mat ? JSON.parse(mat) : null,
      historico: hist ? JSON.parse(hist) : null
    };
  },

  setLocal(materiais, historico) {
    localStorage.setItem('materiais', JSON.stringify(materiais));
    localStorage.setItem('historico', JSON.stringify(historico));
  },

  exportBackup() {
    const backup = { materiais, historico, configEngine, exportadoEm: new Date().toISOString() };
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
      if (backup.configEngine) Object.assign(configEngine, backup.configEngine);
      Storage.setLocal(materiais, historico);
      Utils.toast('Backup restaurado com sucesso!');
      return true;
    } else {
      Utils.toast('Arquivo de backup inválido!');
      return false;
    }
  }
};