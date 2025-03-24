const express = require('express');
const bcrypt = require('bcryptjs'); // <-- Cambiar de bcrypt a bcryptjs
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, role } = req.body; // AGREGAR EL ROL 
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  User.create({ email, password: hashedPassword, role }, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Usuario registrado correctamente' });
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    User.findByEmail(email, async (err, results) => {
      if (err) {
        console.error("❌ Error en la base de datos:", err);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }

      console.log("Resultados de búsqueda:", results);

      if (!results || results.length === 0) {
        return res.status(400).json({ message: 'Usuario no encontrado' });
      }

      const user = results[0];
      console.log("Usuario encontrado:", user);

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        console.log("❌ Contraseña incorrecta");
        return res.status(400).json({ message: 'Contraseña incorrecta' });
      }

      console.log("✅ Login exitoso para:", user.email);
      res.json({ message: 'Login exitoso', role: user.role });
    });
  } catch (error) {
    console.error("❌ Error en el login:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
