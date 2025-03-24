const mysql = require('mysql2/promise');

(async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'shuttle.proxy.rlwy.net',
            user: 'root',
            password: 'fSQYFSElcnERuVumVuZFPChEoZMicJsW',
            database: 'railway',
            port: 57464
        });

        console.log("🔄 Modificando la columna 'role'...");

        await connection.query(`
            ALTER TABLE users 
            MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user'
        `);

        console.log("✅ Columna 'role' modificada correctamente.");
        connection.end();
    } catch (error) {
        console.error("❌ Error al modificar la columna 'role':", error);
    }
})();
console.log("🔄 Modificando la columna 'role'...");
console.log("✅ Columna 'role' modificada correctamente.");
console.error("❌ Error al modificar la columna 'role':", error);