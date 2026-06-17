const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname))); // serve arquivos estáticos (HTML, CSS, JS)

// Rotas API (copiadas de data.js e sync.js)
app.get('/api/data', async (req, res) => {
  const password = req.headers['x-password'];
  const validPassword = process.env.APP_PASSWORD || '12345678';
  if (!password || password !== validPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data, error } = await supabase
    .from('user_data')
    .select('materials_json, history_json')
    .eq('id', 1)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});

app.post('/api/sync', async (req, res) => {
  const password = req.headers['x-password'];
  const validPassword = process.env.APP_PASSWORD || '12345678';
  if (!password || password !== validPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { materials_json, history_json } = req.body;
  if (!materials_json || !history_json) {
    return res.status(400).json({ error: 'Missing JSON fields' });
  }

  const { error } = await supabase
    .from('user_data')
    .update({ materials_json, history_json, updated_at: new Date() })
    .eq('id', 1);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true });
});

// Rota fallback para SPA (caso necessário)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});