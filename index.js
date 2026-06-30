const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const express = require('express');
const pino = require('pino');

// 1. Iniciar servidor Express (Para que Render no lo apague)
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('El servidor del Bot Ligero está Activo'));
app.listen(port, () => console.log(`Servidor web listo en el puerto ${port}`));

// 2. Función principal del bot
async function iniciarBot() {
    // Esto guarda tu sesión en una carpeta para que no te pida escanear a cada rato
    const { state, saveCreds } = await useMultiFileAuthState('sesion_gym_limpia');

const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, 
        logger: pino({ level: 'error' }), // <--- Cambia esto
        browser: ['FitLive Elite', 'Chrome', '1.0.0']
    });
    // Guardar credenciales automáticamente
    sock.ev.on('creds.update', saveCreds);

    // 3. Controlar la conexión y el QR
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Si hay un QR nuevo, lo generamos en formato compacto
        if (qr) {
            console.log('Escanea este código QR desde tu celular:');
            qrcode.generate(qr, { small: true });
        }

        // Si se desconecta, intentamos reconectar
if (connection === 'close') {
            // Agrega esta línea para ver al culpable:
            console.log('🛑 ERROR REAL DEL CIERRE:', lastDisconnect.error); 
            
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexión cerrada. Reconectando...', shouldReconnect);
            if (shouldReconnect) {
                iniciarBot();
            }
        }
    });

    // 4. Lógica de los mensajes y el menú
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        
        const m = messages[0];
        if (!m.message) return; // Si no hay mensaje, ignorar
        if (m.key.fromMe) return; // Ignorar nuestros propios mensajes (para que tú puedas contestar a mano sin que el bot estorbe)

        // Extraer el texto del mensaje que nos mandó el cliente
        const textoCliente = (m.message.conversation || m.message.extendedTextMessage?.text || '').toLowerCase();
        const numeroCliente = m.key.remoteJid; // El número de quien nos escribe

        console.log('Mensaje recibido:', textoCliente);

        // -- MENÚ PRINCIPAL --
        if (textoCliente === 'hola' || textoCliente === 'menu' || textoCliente === 'informacion' || textoCliente === 'info') {
            const saludo = "Hola. Bienvenido a Fit Live Elite Gym.\n\nPara darte la informacion correcta, por favor responde con el numero de la opcion que te interese:\n\n1. Horarios y Ubicacion\n2. Precios y Membresias\n3. Instalaciones y Servicios\n4. Hablar con un asesor";
            await sock.sendMessage(numeroCliente, { text: saludo });
        }
        
        // Opción 1: Horarios
        else if (textoCliente === '1') {
            const horarios = "Nuestros horarios son los siguientes:\n- Lunes a Viernes de 6 am a 11 pm\n- Sabados de 8 am a 3 pm\n- Domingos de 8 am a 2 pm\n\nNuestra direccion es:\nCalle 6 Esquina, Valle de Bravo 42, El Barco, Codigo Postal 57400 Ciudad Nezahualcoyotl, Estado de Mexico, Mexico.\n\nEscribe 'menu' para volver a las opciones principales.";
            await sock.sendMessage(numeroCliente, { text: horarios });
        }
        
        // Opción 2: Precios
        else if (textoCliente === '2') {
            const precios = "Tenemos excelentes opciones para ti.\n\nPrecios regulares:\n- Membresia Individual Mensual: $450\n- Bimestre Individual: $690\n- Trimestre: $1,200\n- Semestre: $2,100\n- Anualidad: $3,900\n\nPromociones Especiales:\n- Estudiantes (Solo aplicable en horario de 12 pm a 5 pm): $350 mensual\n- Promocion Nuevo Ingreso: Inscribete junto con otra persona de nuevo ingreso por solo $590 en total.\n\nEscribe 'menu' para volver a las opciones principales.";
            await sock.sendMessage(numeroCliente, { text: precios });
        }
        
        // Opción 3: Instalaciones
        else if (textoCliente === '3') {
            const instalaciones = "Contamos con instalaciones de primer nivel divididas en dos pisos:\n- Primer piso: Area dedicada para entrenar pierna.\n- Segundo piso: Area dedicada para el tren superior.\n\nNuestros servicios incluyen:\n- Area de cardio\n- Peso libre integrado\n- Regaderas\n- Lockers\n- Wifi gratis\n- Asesoria nutricional\n\nAdemas, contamos con entrenadores calificados disponibles de lunes a sabado en todos los horarios para guiarte en tu rutina.\n\nEscribe 'menu' para volver a las opciones principales.";
            await sock.sendMessage(numeroCliente, { text: instalaciones });
        }
        
        // Opción 4: Asesor
        else if (textoCliente === '4') {
            const contacto = "En un momento uno de nuestros asesores leera tu mensaje y te respondera personalmente.";
            await sock.sendMessage(numeroCliente, { text: contacto });
        }
    });
}

// Arrancar el bot
iniciarBot();