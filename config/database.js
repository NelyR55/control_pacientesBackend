const mysql = require('mysql2/promise');
require('dotenv').config();  // Carga variables de entorno desde .env

const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("✅ Conectado a MySQL en Railway");
        connection.release();  // Liberar la conexión
    } catch (err) {
        console.error("❌ Error conectando a MySQL:", err);
    }
})();

module.exports = pool;
