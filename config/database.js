const mysql = require('mysql2');
require('dotenv').config(); // Cargar las variables de entorno

const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database in Railway 🚀');
});

module.exports = connection;
