const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
};