const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
};