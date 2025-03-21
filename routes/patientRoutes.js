const express = require("express");
const db = require("../config/database");

const router = express.Router();

// Registrar un nuevo paciente
router.post("/", (req, res) => {
  const {
    nombre_completo,
    fecha_nacimiento,
    edad,
    fecha_ingreso,
    diagnostico,
    riesgo_caidas = "bajo",
    riesgo_upp = "bajo",
    ingresa_con_upp = false,
    descripcion_upp = "",
    dispositivos_invasivos = [],
    dispositivo_otro = "",
    presenta_caida = false,
    presenta_upp = false,
    servicio = "Medicina Interna",
  } = req.body;

  if (!nombre_completo || !fecha_nacimiento || !fecha_ingreso) {
    return res.status(400).json({ error: "⚠️ Los campos obligatorios no pueden estar vacíos" });
  }

  let dispositivosFinales = [...dispositivos_invasivos];
  if (dispositivosFinales.includes("Otro") && dispositivo_otro) {
    dispositivosFinales.push(dispositivo_otro);
  }

  const dispositivosInvasivosStr = Array.isArray(dispositivos_invasivos)
    ? JSON.stringify(dispositivos_invasivos)
    : "[]"; 

  const query = 
    `INSERT INTO patients 
    (nombre_completo, fecha_nacimiento, edad, fecha_ingreso, diagnostico, riesgo_caidas, 
    riesgo_upp, ingresa_con_upp, descripcion_upp, dispositivos_invasivos, fecha_egreso, 
    presenta_caida, presenta_upp, servicio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)`;

  db.query(
    query,
    [
      nombre_completo,
      fecha_nacimiento,
      edad,
      fecha_ingreso,
      diagnostico,
      riesgo_caidas,
      riesgo_upp,
      ingresa_con_upp ? "Sí" : "No",
      descripcion_upp,
      dispositivosInvasivosStr, 
      presenta_caida ? "Sí" : "No",
      presenta_upp ? "Sí" : "No",
      servicio,
    ],
    (err, results) => {
      if (err) {
        console.error("❌ Error al insertar paciente: ", err);
        return res.status(500).json({ error: "Error al registrar paciente" });
      }
      res.status(201).json({ id: results.insertId });
    }
  );
});

// Obtener pacientes activos (no egresados)
router.get("/", (req, res) => {
  const query = "SELECT * FROM patients WHERE fecha_egreso IS NULL";

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener pacientes: ", err);
      return res.status(500).json({ error: "Error al obtener pacientes" });
    }

    const patients = results.map((patient) => ({
      id: patient.id,
      nombre_completo: patient.nombre_completo,
      fecha_ingreso: patient.fecha_ingreso,
    }));

    res.json(patients);
  });
});

router.get("/all", (req, res) => {
  const query = "SELECT * FROM patients";

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener todos los pacientes: ", err);
      return res.status(500).json({ error: "Error al obtener pacientes" });
    }

    res.json(results);
  });
});

// Marcar paciente como egresado con detalles adicionales
router.put("/update-egreso/:id", (req, res) => {
  const { id } = req.params;
  const { 
    motivo, 
    presenta_upp, 
    presenta_caida, 
    egreso_upp = "", 
    egreso_caida = "",
    fecha_egreso
  } = req.body;
  
  // Usar la fecha proporcionada o la fecha actual
  const fechaEgresoFinal = fecha_egreso || new Date().toISOString().split("T")[0];

  console.log("Datos de egreso:", {
    id,
    fechaEgresoFinal,
    motivo,
    presenta_upp,
    presenta_caida,
    egreso_upp,
    egreso_caida
  });

  const query = `
    UPDATE patients 
    SET fecha_egreso = ?, 
        motivo_egreso = ?, 
        presenta_upp = ?, 
        presenta_caida = ?,
        egreso_upp = ?,
        egreso_caida = ?
    WHERE id = ?
  `;

  db.query(
    query, 
    [
      fechaEgresoFinal, 
      motivo, 
      presenta_upp ? "Sí" : "No", 
      presenta_caida ? "Sí" : "No",
      egreso_upp,
      egreso_caida, 
      id
    ], 
    (err, result) => {
      if (err) {
        console.error("❌ Error al actualizar paciente: ", err);
        return res.status(500).json({ 
          error: "Error al actualizar paciente",
          details: err.message 
        });
      }
      res.json({ message: "✅ Paciente marcado como egresado" });
    }
  );
});

//Para el historial
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM patients WHERE id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener el historial del paciente: ", err);
      return res.status(500).json({ error: "Error al obtener historial médico" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    const patient = results[0];
    
    try {
      // Procesar dispositivos invasivos
      let dispositivosArray = [];
      if (patient.dispositivos_invasivos) {
        dispositivosArray = typeof patient.dispositivos_invasivos === 'string' 
          ? JSON.parse(patient.dispositivos_invasivos) 
          : patient.dispositivos_invasivos;
      }

      // Asegurarse de que sea un array
      if (!Array.isArray(dispositivosArray)) {
        dispositivosArray = [dispositivosArray];
      }

      // Buscar y procesar el dispositivo "Otro"
      const otroItem = dispositivosArray.find(item => 
        typeof item === 'string' && item.startsWith("Otro:")
      );

      if (otroItem) {
        // Agregar un campo específico para el valor de "Otro"
        patient.dispositivo_otro = otroItem.replace("Otro:", "").trim();
        // Filtrar el "Otro: valor" y agregar solo "Otro" al array
        dispositivosArray = dispositivosArray
          .filter(item => !item.startsWith("Otro:"))
          .concat(["Otro"]);
      }

      patient.dispositivos_invasivos = dispositivosArray;
      console.log("Datos procesados:", patient);
      res.json(patient);
    } catch (e) {
      console.error("Error al procesar dispositivos invasivos:", e);
      patient.dispositivos_invasivos = [];
      res.json(patient);
    }
  });
});

//ACTUALIZAR
// Actualizar paciente (incluyendo dispositivos invasivos)
router.put("/:id", (req, res) => {
  const { id } = req.params;
  console.log("\n--- INICIO DE ACTUALIZACIÓN ---");
  console.log("ID del paciente:", id);
  console.log("Datos recibidos:", JSON.stringify(req.body, null, 2));

  let updates = { ...req.body };

  try {
    if (!updates || Object.keys(updates).length === 0) {
      console.log("Error: No hay datos para actualizar");
      return res.status(400).json({ error: "No se enviaron datos para actualizar" });
    }

    // Procesar booleanos
    if (updates.ingresa_con_upp !== undefined) {
      updates.ingresa_con_upp = updates.ingresa_con_upp ? "Sí" : "No";
    }
    if (updates.presenta_caida !== undefined) {
      updates.presenta_caida = updates.presenta_caida ? "Sí" : "No";
    }
    if (updates.presenta_upp !== undefined) {
      updates.presenta_upp = updates.presenta_upp ? "Sí" : "No";
    }

    // Procesar dispositivos invasivos
    if (updates.dispositivos_invasivos) {
      console.log("Dispositivos invasivos original:", updates.dispositivos_invasivos);
      let dispositivosFinales = [...updates.dispositivos_invasivos];
      if (dispositivosFinales.includes("Otro") && updates.dispositivo_otro) {
        dispositivosFinales.push(updates.dispositivo_otro);
      }
      updates.dispositivos_invasivos = JSON.stringify(dispositivosFinales);
      console.log("Dispositivos invasivos procesados:", updates.dispositivos_invasivos);
    }

    if (updates.fecha_egreso === '') {
      updates.fecha_egreso = null;
    }

    // Construir la consulta
    const updateFields = Object.keys(updates)
      .filter(key => updates[key] !== undefined)
      .map(key => `${key} = ?`);

    const query = `UPDATE patients SET ${updateFields.join(', ')} WHERE id = ?`;
    const values = [
      ...Object.keys(updates)
        .filter(key => updates[key] !== undefined)
        .map(key => updates[key]),
      id
    ];

    console.log("\nConsulta SQL:", query);
    console.log("Valores:", values);

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("\nError en la actualización SQL:", err);
        return res.status(500).json({ 
          error: "Error al actualizar paciente",
          details: err.message,
          sqlMessage: err.sqlMessage
        });
      }

      console.log("\nResultado de la actualización:", result);
      res.json({ 
        message: "Paciente actualizado correctamente",
        affectedRows: result.affectedRows 
      });
    });
  } catch (err) {
    console.error("\nError en el procesamiento:", err);
    res.status(400).json({ 
      error: "Error al procesar los datos",
      details: err.message 
    });
  }
  console.log("--- FIN DE ACTUALIZACIÓN ---\n");
});

module.exports = router;