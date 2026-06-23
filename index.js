const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Generar el codigo QR
client.on('qr', function(qr) {
    qrcode.generate(qr, {small: true});
});

// Confirmar conexion
client.on('ready', function() {
    console.log('El bot de Fit Live Elite Gym esta listo y operando.');
});

// Logica de respuestas y menu
client.on('message', function(message) {
    let textoCliente = message.body.toLowerCase();

    // Palabras clave para mostrar el menu principal
    if (textoCliente === 'hola' || textoCliente === 'menu' || textoCliente === 'informacion' || textoCliente === 'info') {
        let saludo = "Hola. Bienvenido a Fit Live Elite Gym.\n\nPara darte la informacion correcta, por favor responde con el numero de la opcion que te interese:\n\n1. Horarios y Ubicacion\n2. Precios y Membresias\n3. Instalaciones y Servicios\n4. Hablar con un asesor";
        message.reply(saludo);
    }

    // Opcion 1: Horarios y Ubicacion
    else if (textoCliente === '1') {
        let horarios = "Nuestros horarios son los siguientes:\n- Lunes a Viernes de 6 am a 11 pm\n- Sabados de 8 am a 3 pm\n- Domingos de 8 am a 2 pm\n\nNuestra direccion es:\nCalle 6 Esquina, Valle de Bravo 42, El Barco, Codigo Postal 57400 Ciudad Nezahualcoyotl, Estado de Mexico, Mexico.\n\nEscribe 'menu' para volver a las opciones principales.";
        message.reply(horarios);
    }

    // Opcion 2: Precios
    else if (textoCliente === '2') {
        let precios = "Tenemos excelentes opciones para ti.\n\nPrecios regulares:\n- Membresia Individual Mensual: $450\n- Bimestre Individual: $690\n- Trimestre: $1,200\n- Semestre: $2,100\n- Anualidad: $3,900\n\nPromociones Especiales:\n- Estudiantes (Solo aplicable en horario de 12 pm a 5 pm): $350 mensual\n- Promocion Nuevo Ingreso: Inscribete junto con otra persona de nuevo ingreso por solo $590 en total.\n\nEscribe 'menu' para volver a las opciones principales.";
        message.reply(precios);
    }

    // Opcion 3: Instalaciones
    else if (textoCliente === '3') {
        let instalaciones = "Contamos con instalaciones de primer nivel divididas en dos pisos:\n- Primer piso: Area dedicada para entrenar pierna.\n- Segundo piso: Area dedicada para el tren superior.\n\nNuestros servicios incluyen:\n- Area de cardio\n- Peso libre integrado\n- Regaderas\n- Lockers\n- Wifi gratis\n- Asesoria nutricional\n\nAdemas, contamos con entrenadores calificados disponibles de lunes a sabado en todos los horarios para guiarte en tu rutina.\n\nEscribe 'menu' para volver a las opciones principales.";
        message.reply(instalaciones);
    }

    // Opcion 4: Contacto humano
    else if (textoCliente === '4') {
        let contacto = "En un momento uno de nuestros asesores leera tu mensaje y te respondera personalmente.";
        message.reply(contacto);
    }
});

client.initialize();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot Activo'));
app.listen(port, () => console.log(`Server listo en puerto ${port}`));