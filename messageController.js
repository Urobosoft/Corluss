const db = require('./database/db');

// Función para guardar mensajes en la base de datos
async function guardarMensaje(datos) {
    const query = 'INSERT INTO mensajes (ID_remitente, ID_destinatario, contenido) VALUES (?, ?, ?)';
    const valores = [datos.ID_remitente, datos.ID_destinatario, datos.contenido];

    return new Promise((resolve, reject) => {
        db.query(query, valores, (error, resultados) => {
            if (error) {
                reject(error);
            } else {
                resolve(resultados);
            }
        });
    });
}

async function actualizarEstadoConexion(userId, estado) {
    try {
        await db.query('UPDATE usuario SET estado_conexion = ? WHERE ID_usuario = ?', [estado, userId]);
    } catch (error) {
        console.error('Error al actualizar el estado de conexión:', error);
    }
}
module.exports = {
    guardarMensaje,
    actualizarEstadoConexion
};
