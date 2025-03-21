const db = require('../config/database');

const Patient = {
  getAll: (callback) => {
    db.query('SELECT * FROM patients', callback);
  },
  create: (data, callback) => {
    const sql = 'INSERT INTO patients SET ?';
    db.query(sql, data, callback);
  }
};

module.exports = Patient;
