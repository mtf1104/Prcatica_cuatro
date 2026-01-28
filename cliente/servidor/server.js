const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 1. Configuración de la Base de Datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Tu usuario de MySQL
    password: '',      // Tu contraseña de MySQL
    database: 'consultoria_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado a la Base de Datos MySQL');
});

// 2. Configuración del Correo (Outlook)
const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", // Servidor SMTP de Outlook
    port: 587,
    secure: false, // false para puerto 587 (STARTTLS)
    auth: {
        user: 'conaultoriahadweretellez@outlook.com',
        pass: 'martf1104' // <--- PON AQUÍ TU CONTRASEÑA REAL
    },
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
    }
});

// 3. Ruta para recibir el formulario
app.post('/api/contacto', (req, res) => {
    const { nombre, email, notas } = req.body;

    // A) Guardar en Base de Datos
    const sql = 'INSERT INTO contactos (nombre, email, notas) VALUES (?, ?, ?)';
    db.query(sql, [nombre, email, notas], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al guardar en BD');
        }

        // B) Enviar Correo Automático
        const mailOptions = {
            from: '"M.V. Consultoría" <conaultoriahadweretellez@outlook.com>',
            to: email, // Se envía al correo que escribió el cliente
            subject: 'Recibimos tu solicitud - M.V. Consultoría',
            text: `Hola ${nombre},\n\nHemos recibido tu solicitud correctamente.\nNuestro equipo revisará tus notas: "${notas}" y te contactará pronto.\n\nSaludos,\nEquipo M.V.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error al enviar correo:', error);
                // Aún así respondemos éxito porque ya se guardó en BD
                return res.status(200).send('Guardado en BD, pero falló el correo.');
            } else {
                console.log('Correo enviado: ' + info.response);
                return res.status(200).send('¡Éxito! Guardado y correo enviado.');
            }
        });
    });
});

// Iniciar servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});