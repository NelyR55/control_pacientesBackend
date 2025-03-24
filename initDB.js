const mysql = require('mysql2/promise');

(async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'shuttle.proxy.rlwy.net',  // 🔥 Usa este host
            user: 'root',  // 🚀 Usuario de MySQL en Railway
            password: 'fSQYFSElcnERuVumVuZFPChEoZMicJsW',  // 🔥 Tu contraseña
            database: 'railway',  // 📌 Nombre de la base de datos
            port: 57464  // 🔥 Puerto correcto de Railway
        });

        // Crear tabla patients
        await connection.query(`
            CREATE TABLE IF NOT EXISTS patients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre_completo VARCHAR(255) NOT NULL,
                fecha_nacimiento DATE NOT NULL,
                edad INT NOT NULL,
                fecha_ingreso DATE NOT NULL,
                diagnostico TEXT,
                riesgo_caidas VARCHAR(100) NOT NULL,
                riesgo_upp VARCHAR(100) NOT NULL,
                ingresa_con_upp ENUM('Sí', 'No') DEFAULT 'No',
                descripcion_upp TEXT,
                dispositivos_invasivos JSON,
                presenta_caida ENUM('Sí', 'No') DEFAULT 'No',
                egreso_caida TEXT DEFAULT NULL,
                presenta_upp ENUM('Sí', 'No') DEFAULT 'No',
                egreso_upp TEXT DEFAULT NULL,
                servicio VARCHAR(100) DEFAULT 'Medicina Interna',
                fecha_egreso DATE DEFAULT NULL,
                motivo_egreso TEXT
            );
        `);

        // Crear tabla users
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            );
        `);

        console.log("✅ Tablas creadas correctamente en Railway");
        connection.end();
    } catch (error) {
        console.error("❌ Error al crear las tablas:", error);
    }
})();
