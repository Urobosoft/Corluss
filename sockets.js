const io = require('./index.js'); 
const messageController = require('./messageController'); 

module.exports = (io) => {

    let usersOnline = {}; // Mantener un registro de usuarios online

    io.on('connection', socket => {
        socket.on('nuevo usuario', async (usuario, callback) => {
            if (usersOnline[usuario.id]) {
                callback(false);
            } else {
                callback(true);
                socket.userId = usuario.id;
                usersOnline[socket.userId] = socket;

                await messageController.actualizarEstadoConexion(usuario.id, 'conectado');
            }
        });

        io.on('connection', (socket) => {
            socket.on('enviar mensaje', async (datos) => {
                try {
                    // Guardar el mensaje en la base de datos
                    await messageController.guardarMensaje(datos);
                    console.log('Mensaje guardado en la base de datos');
        
                    // Emitir confirmación de mensaje enviado al remitente
                    socket.emit('mensaje enviado', {
                        ID_destinatario: datos.ID_destinatario,
                        nombreDestinatario: datos.nombreDestinatario,
                        vistaPreviaMensaje: datos.contenido.substring(0, 30) 
                    });
        
                    // Notificar al destinatario si está en línea
                    if (usersOnline[datos.ID_destinatario]) {
                        usersOnline[datos.ID_destinatario].emit('mensaje recibido', datos);
                    }
                } catch (error) {
                    console.error('Error al guardar el mensaje:', error);
                }
            });
        });
        

        socket.on('mensaje recibido', mensaje => {
            agregarMensajeAConversacion(mensaje);
        });
        

        socket.on('disconnect', async () => {
            if (socket.userId && usersOnline[socket.userId]) {
                await messageController.actualizarEstadoConexion(socket.userId, 'desconectado');
                delete usersOnline[socket.userId];
            }
        });

    });
}
