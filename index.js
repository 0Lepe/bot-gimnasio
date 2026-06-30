const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const express = require('express');
const qrcode = require('qrcode');
const pino = require('pino');

// 1. Configurar servidor web para mostrar el QR
const app = express();
const port = process.env.PORT || 3000;
let qrHtml = '<p style="font-size: 20px;">Generando QR... Espera unos segundos y recarga la página.</p>';

app.get('/', (req, res) => {
    res.send(`
        <div style="text-align: center; font-family: Arial, sans-serif; margin-top: 50px;">
            <h2>QR para el Bot de Fit Live Elite Gym</h2>
            ${qrHtml}
        </div>
    `);
});

app.listen(port, () => console.log(`Servidor web listo en el puerto ${port}`));

// 2. Función principal del bot
async function iniciarBot() {
    // Creamos una sesión nueva limpia
    const { state, saveCreds } = await useMultiFileAuthState('sesion_gym_definitiva');
    
    // Obtenemos la última versión de WhatsApp para evitar el error 405
    const { version } = await fetchLatestBaileysVersion();
    console.log(`Iniciando conexión con WhatsApp versión v${version.join('.')}...`);

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false, // Apagamos el QR de la terminal de Render
        logger: pino({ level: 'error' }),
        browser: ['FitLive Elite', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    // 3. Controlar la conexión y mandar el QR a la web
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('QR nuevo listo. Entra a la página web para escanearlo.');
            try {
                const urlImagen = await qrcode.toDataURL(qr);
                qrHtml = `
                    <img src="${urlImagen}" style="width: 300px; height: 300px; border: 15px solid white; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0,0,0,0.2);" />
                    <p style="font-size: 18px; margin-top: 20px;">Apunta con el celular del gimnasio a esta imagen.</p>
                `;
            } catch (err) {
                console.error('Error generando la imagen del QR', err);
            }
        }

        if (connection === 'close') {
            console.log('🛑 ERROR REAL DEL CIERRE:', lastDisconnect.error);
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                iniciarBot();
            }
        } else if (connection === 'open') {
            console.log('¡ÉXITO! El bot está listo y operando sin consumir tanta RAM.');
            qrHtml = '<h3 style="color: green;">¡Bot conectado exitosamente! Ya está operando.</h3>';
        }
    });

    // 4. Lógica de respuestas (Menú del Gym)
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const textoCliente = (m.message.conversation || m.message.extendedTextMessage?.text || '').toLowerCase();
        const numeroCliente = m.key.remoteJid;

        if (textoCliente === 'hola' || textoCliente === 'menu' || textoCliente === 'informacion' || textoCliente === 'info') {
            await sock.sendMessage(numeroCliente, { text: "Hola. Bienvenido a Fit Live Elite Gym.\n\nPara darte la informacion correcta, por favor responde con el numero de la opcion que te interese:\n\n1. Horarios y Ubicacion\n2. Precios y Membresias\n3. Instalaciones y Servicios\n4. Hablar con un asesor" });
        }
        else if (textoCliente === '1') {
            await sock.sendMessage(numeroCliente, { text: "Nuestros horarios son los siguientes:\n- Lunes a Viernes de 6 am a 11 pm\n- Sabados de 8 am a 3 pm\n- Domingos de 8 am a 2 pm\n\nNuestra direccion es:\nCalle 6 Esquina, Valle de Bravo 42, El Barco, Codigo Postal 57400 Ciudad Nezahualcoyotl, Estado de Mexico, Mexico.\n\nEscribe 'menu' para volver a las opciones principales." });
        }
        else if (textoCliente === '2') {
            await sock.sendMessage(numeroCliente, { text: "Tenemos excelentes opciones para ti.\n\nPrecios regulares:\n- Membresia Individual Mensual: $450\n- Bimestre Individual: $690\n- Trimestre: $1,200\n- Semestre: $2,100\n- Anualidad: $3,900\n\nPromociones Especiales:\n- Estudiantes (Solo aplicable en horario de 12 pm a 5 pm): $350 mensual\n- Promocion Nuevo Ingreso: Inscribete junto con otra persona de nuevo ingreso por solo $590 en total.\n\nEscribe 'menu' para volver a las opciones principales." });
        }
        else if (textoCliente === '3') {
            await sock.sendMessage(numeroCliente, { text: "Contamos con instalaciones de primer nivel divididas en dos pisos:\n- Primer piso: Area dedicada para entrenar pierna.\n- Segundo piso: Area dedicada para el tren superior.\n\nNuestros servicios incluyen:\n- Area de cardio\n- Peso libre integrado\n- Regaderas\n- Lockers\n- Wifi gratis\n- Asesoria nutricional\n\nAdemas, contamos con entrenadores calificados disponibles de lunes a sabado en todos los horarios para guiarte en tu rutina.\n\nEscribe 'menu' para volver a las opciones principales." });
        }
        else if (textoCliente === '4') {
            await sock.sendMessage(numeroCliente, { text: "En un momento uno de nuestros asesores leera tu mensaje y te respondera personalmente." });
        }
    });
}

iniciarBot();