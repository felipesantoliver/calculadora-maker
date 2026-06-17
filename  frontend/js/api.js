const API = {
  _password: null,

  setPassword(pwd) {
    this._password = pwd;
  },

  async loadData() {
    const headers = { 'Content-Type': 'application/json' };
    if (this._password) headers['x-password'] = this._password;
    const res = await fetch('/api/data', { headers });
    if (!res.ok) {
      if (res.status === 401) throw new Error('Senha inválida');
      throw new Error('Falha ao carregar dados');
    }
    const data = await res.json();
    return {
      materiais: data.materials_json || [],
      historico: data.history_json || []
    };
  },

  async saveData(materiais, historico) {
    const headers = { 'Content-Type': 'application/json' };
    if (this._password) headers['x-password'] = this._password;
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers,
      body: JSON.stringify({ materials_json: materiais, history_json: historico })
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error('Senha inválida');
      throw new Error('Falha ao salvar dados');
    }
  }
};