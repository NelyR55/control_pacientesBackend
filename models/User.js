const db = require('../config/database');

const User = {
  findByEmail: (email, callback) => {
    db.query('SELECT * FROM users WHERE email = ?', [email], callback);
  },
  create: (data, callback) => {
    const sql = 'INSERT INTO users SET ?';
    db.query(sql, data, callback);
  }
};

module.exports = User;
