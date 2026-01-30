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
    user: 'root',
    password: '', 
    database: 'consultoria_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado a la Base de Datos MySQL');
});

// 2. NUEVA Configuración del Correo (GMAIL)
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true para puerto 465, false para otros puertos
    auth: {
        user: 'martintellezfalcon70@gmail.com', // <--- TU CORREO GMAIL
        pass: 'jifl djvw uwob uytl'           // <--- AQUÍ PEGAS LA CONTRASEÑA DE APLICACIÓN (NO la normal)
    }
});

// 3. Ruta para recibir el formulario
app.post('/api/contacto', (req, res) => {
    const { nombre, email, notas } = req.body;

    const sql = 'INSERT INTO contactos (nombre, email, notas) VALUES (?, ?, ?)';
    db.query(sql, [nombre, email, notas], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al guardar en BD');
        }

        // Configuración del mensaje
        const mailOptions = {
            from: '"M.V. Consultoría" <martintellezfalcon@gmail.com>', // Debe ser el mismo correo de arriba
            to: email, // Se envía al correo que puso el cliente en el formulario
            subject: 'Recibimos tu solicitud - M.V. Consultoría',
            text: `Hola ${nombre},\n\nHemos recibido tu solicitud correctamente.\nNuestro equipo revisará tus notas: "${notas}" y te contactará pronto.\n\nSaludos,\nEquipo M.V.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error al enviar correo:', error);
                return res.status(200).send('Guardado en BD, pero falló el correo.');
            } else {
                console.log('Correo enviado: ' + info.response);
                return res.status(200).send('¡Éxito! Guardado y correo enviado.');
            }
        });
    });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});