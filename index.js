const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode'); // <--- Usaremos esta librería ahora

const app = express();
const port = process.env.PORT || 3000;

// Variable para guardar el QR en la memoria y mostrarlo en la web
let qrHtml = '<p style="font-size: 20px;">Generando QR... Espera unos segundos y recarga la página.</p>';

// 1. Mostrar el QR en la página web principal
app.get('/', (req, res) => {
    res.send(`
        <div style="text-align: center; font-family: Arial, sans-serif; margin-top: 50px;">
            <h2>QR para el Bot de Fit Live Elite Gym</h2>
            ${qrHtml}
        </div>
    `);
});

app.listen(port, () => console.log(`Servidor web listo. Abre la URL de tu app en Render para ver el QR.`));

// 2. Configurar el cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process'
        ]
    }
});

// 3. Generar el QR y convertirlo a imagen para la web
client.on('qr', async function(qr) {
    console.log('QR generado en código. Ve a la URL de tu app en Render para escanear la imagen.');
    try {
        const urlImagen = await qrcode.toDataURL(qr);
        qrHtml = `
            <img src="${urlImagen}" alt="QR de WhatsApp" style="width: 300px; height: 300px; border: 15px solid white; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0,0,0,0.2);" />
            <p style="font-size: 18px; margin-top: 20px;">Apunta con tu celular a esta imagen.</p>
        `;
    } catch (err) {
        console.error('Error creando la imagen del QR', err);
    }
});

// 4. Confirmar conexión exitosa y limpiar la pantalla
client.on('ready', function() {
    console.log('El bot está listo y operando.');
    qrHtml = '<h3 style="color: green;">¡Bot conectado exitosamente! Ya está operando.</h3>';
});

// 5. Lógica del Menú
client.on('message', function(message) {
    console.log('Mensaje detectado:', message.body); // <-- Agrega esta línea
    
    let textoCliente = message.body.toLowerCase();
    if (textoCliente === 'hola' || textoCliente === 'menu' || textoCliente === 'informacion' || textoCliente === 'info') {
        let saludo = "Hola. Bienvenido a Fit Live Elite Gym.\n\nPara darte la informacion correcta, por favor responde con el numero de la opcion que te interese:\n\n1. Horarios y Ubicacion\n2. Precios y Membresias\n3. Instalaciones y Servicios\n4. Hablar con un asesor";
        message.reply(saludo);
    }
    else if (textoCliente === '1') {
        let horarios = "Nuestros horarios son los siguientes:\n- Lunes a Viernes de 6 am a 11 pm\n- Sabados de 8 am a 3 pm\n- Domingos de 8 am a 2 pm\n\nNuestra direccion es:\nCalle 6 Esquina, Valle de Bravo 42, El Barco, Codigo Postal 57400 Ciudad Nezahualcoyotl, Estado de Mexico, Mexico.\n\nEscribe 'menu' para volver a las opciones principales.";
        message.reply(horarios);
    }
    else if (textoCliente === '2') {
        let precios = "Tenemos excelentes opciones para ti.\n\nPrecios regulares:\n- Membresia Individual Mensual: $450\n- Bimestre Individual: $690\n- Trimestre: $1,200\n- Semestre: $2,100\n- Anualidad: $3,900\n\nPromociones Especiales:\n- Estudiantes (Solo aplicable en horario de 12 pm a 5 pm): $350 mensual\n- Promocion Nuevo Ingreso: Inscribete junto con otra persona de nuevo ingreso por solo $590 en total.\n\nEscribe 'menu' para volver a las opciones principales.";
        message.reply(precios);
    }
    else if (textoCliente === '3') {
        let instalaciones = "Contamos con instalaciones de primer nivel divididas en dos pisos:\n- Primer piso: Area dedicada para entrenar pierna.\n- Segundo piso: Area dedicada para el tren superior.\n\nNuestros servicios incluyen:\n- Area de cardio\n- Peso libre integrado\n- Regaderas\n- Lockers\n- Wifi gratis\n- Asesoria nutricional\n\nAdemas, contamos con entrenadores calificados disponibles de lunes a sabado en todos los horarios para guiarte en tu rutina.\n\nEscribe 'menu' para volver a las opciones principales.";
        message.reply(instalaciones);
    }
    else if (textoCliente === '4') {
        let contacto = "En un momento uno de nuestros asesores leera tu mensaje y te respondera personalmente.";
        message.reply(contacto);
    }
});

client.initialize();