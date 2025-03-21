// Backend: Express - auth routes
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, role } = req.body; // Agregar el rol
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  User.create({ email, password: hashedPassword, role }, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Usuario registrado correctamente' });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  User.findByEmail(email, async (err, results) => {
    if (err) return res.status(500).send(err);
    
    if (results.length === 0) return res.status(400).json({ message: 'Usuario no encontrado' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

    res.json({ message: 'Login exitoso', role: user.role });
  });
});

module.exports = router;