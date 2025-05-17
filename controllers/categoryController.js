const pool = require('../db');

exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении категорий:', err);
    res.status(500).json({ message: 'Ошибка сервера при получении категорий' });
  }
};
