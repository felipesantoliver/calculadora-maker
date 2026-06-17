const API = {
  async loadData() {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Falha ao carregar dados');
    const data = await res.json();
    return {
      materiais: data.materials_json || [],
      historico: data.history_json || []
    };
  },

  async saveData(materiais, historico) {
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materials_json: materiais, history_json: historico })
    });
  }
};