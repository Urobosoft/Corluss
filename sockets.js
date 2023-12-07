const io = require('./index.js'); 
const messageController = require('./messageController'); 

module.exports = (io) => {

    let usersOnline = {}; // Mantener un registro de usuarios online

    io.on('connection', socket => {
        // Evento para manejar un nuevo usuario
        socket.on('nuevo usuario', async (usuario, callback) => {
            if (usersOnline[usuario.id]) {
                callback(false);
            } else {
                callback(true);
                socket.userId = usuario.id;
                usersOnline[socket.userId] = socket;
                await messageController.actualizarEstadoConexion(usuario.id, 'En linea');
            }
        });

      
        socket.on('enviar mensaje', async (datos) => {
            try {
                
                await messageController.guardarMensaje(datos);
                console.log('Mensaje guardado en la base de datos');

                socket.emit('mensaje enviado', {
                    ID_destinatario: datos.ID_destinatario,
                    nombreDestinatario: datos.nombreDestinatario,
                    vistaPreviaMensaje: datos.contenido.substring(0, 30) 
                });

                if (usersOnline[datos.ID_destinatario]) {
                    usersOnline[datos.ID_destinatario].emit('mensaje recibido', datos);
                }
                
            } catch (error) {
                console.error('Error al guardar el mensaje:', error);
            }
        });

        socket.on('mensaje recibido', mensaje => {
            const destinatarioId = mensaje.ID_destinatario;
            
            if (usuariosEnLinea[destinatarioId]) {
                io.to(usuariosEnLinea[destinatarioId].socketId).emit('nuevo mensaje', mensaje);
            }
        });

        // Manejo de la desconexión del socket
        socket.on('disconnect', async () => {
            if (socket.userId && usersOnline[socket.userId]) {
                await messageController.actualizarEstadoConexion(socket.userId, 'Desconectado');
                delete usersOnline[socket.userId];
            }
        });
    });
}
