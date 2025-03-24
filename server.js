const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const patientRoutes = require('./routes/patientRoutes');
const authRoutes = require('./routes/authRoutes'); //RUTAS DE AUTENTICACIÓN 

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/patients', patientRoutes);
app.use('/api/auth', authRoutes); // NUEVA RUTA DE AUTENTICACIÓN

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
