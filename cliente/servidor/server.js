const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'consultoria_db'
});

db.connect(err => {
  if (err) {
    console.error('Error al conectar a MySQL:', err);
    process.exit(1);
  }
  console.log('Conectado a la Base de Datos MySQL');
});

// 
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: 'gamboadavid1005@gmail.com',
    pass: 'kcqf dvdt ypoy hcls'
  }
});

app.get('/', (req, res) => {
  res.send('Servidor OK');
});

app.post('/api/contacto', (req, res) => {
  const { nombre, email, notas } = req.body;

  if (!nombre || !email) {
    return res.status(400).send('Faltan datos (nombre o email)');
  }

  const mensaje = notas || '';
  const sql = 'INSERT INTO contactos (nombre, correo, mensaje) VALUES (?, ?, ?)';

  db.query(sql, [nombre, email, mensaje], (err) => {
    if (err) {
      console.error('Error al guardar en BD:', err);
      return res.status(500).send('Error al guardar en BD');
    }

    const mailOptions = {
      from: '"M.V. Consultoría" <martintellezfalcon70@gmail.com>',
      to: email,
      subject: 'Recibimos tu solicitud - M.V. Consultoría',
      text:
        `Hola ${nombre},\n\n` +
        `Hemos recibido tu solicitud correctamente.\n` +
        `Nuestro equipo revisará tu mensaje y te contactará pronto.\n\n` +
        `Mensaje recibido:\n"${mensaje}"\n\n` +
        `Saludos,\nEquipo M.V.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error al enviar correo:', error);
        return res.status(200).send('Guardado en BD, pero falló el correo.');
      }
      console.log('Correo enviado:', info.response);
      return res.status(200).send('¡Éxito! Guardado y correo enviado.');
    });
  });
});

app.post('/api/login', (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).send('Faltan credenciales');
  }

  const user = String(usuario).trim();
  const pass = String(password).trim();

  // ✅ SOLO password (porque tu tabla no tiene password_hash)
  const sql = "SELECT id, usuario, password FROM administradores WHERE usuario = ? LIMIT 1";

  db.query(sql, [user], (err, rows) => {
    if (err) {
      console.error('Error en login:', err);
      return res.status(500).send('Error interno del servidor');
    }

    if (!rows || rows.length === 0) {
      return res.status(401).send('Usuario o contraseña incorrectos');
    }

    const admin = rows[0];

    // ✅ comparación directa
    if (String(admin.password).trim() !== pass) {
      return res.status(401).send('Usuario o contraseña incorrectos');
    }

    // Token simple para el panel admin
    const token = `admin-${admin.id}-${Date.now()}`;
    return res.json({ token, usuario: admin.usuario });
  });
});

app.get('/api/contactos', (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).send('No autorizado');
  }

  const sql = 'SELECT nombre, correo, mensaje, fecha FROM contactos ORDER BY fecha DESC';
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error al traer contactos:', err);
      return res.status(500).send('Error al obtener contactos');
    }
    return res.json(rows);
  });
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
