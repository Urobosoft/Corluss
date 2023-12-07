const db = require('../database/db');
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const { decrypt } = require('./authController');

async function obtenerMensajes(req, res) {
    try {
        const ID_remitente = req.body.ID_remitente; // Asegúrate de que estés enviando estos datos en el body de la solicitud
        const ID_destinatario = req.body.ID_destinatario;

        console.log(ID_remitente)
        console.log(ID_destinatario)

        // Usa la función que has definido para obtener los mensajes
        const mensajes = await getMensajesFromDB(ID_remitente, ID_destinatario);
        res.json(mensajes);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los mensajes');
    }
}

async function getMensajesFromDB(ID_remitente, ID_destinatario) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT mensajes.*,
                   usuario_remitente.foto AS foto_remitente,
                   usuario_destinatario.foto AS foto_destinatario
            FROM mensajes
            INNER JOIN usuario AS usuario_remitente ON mensajes.ID_remitente = usuario_remitente.ID_usuario
            INNER JOIN usuario AS usuario_destinatario ON mensajes.ID_destinatario = usuario_destinatario.ID_usuario
            WHERE (mensajes.ID_remitente = ? AND mensajes.ID_destinatario = ?) 
               OR (mensajes.ID_remitente = ? AND mensajes.ID_destinatario = ?) 
            ORDER BY mensajes.timestamp`;

        db.query(query, [ID_remitente, ID_destinatario, ID_destinatario, ID_remitente], (err, results) => {
            if (err) {
                console.error(`Error en la consulta de la base de datos: ${err.message}`);
                reject(err);
            } else {
                // Asumimos que 'contenido' es el campo que contiene el mensaje cifrado
                const mensajesDescifrados = results.map(mensaje => {
                    return {
                        ...mensaje,
                        contenido: decrypt(mensaje.contenido), 
                        foto_remitente: mensaje.foto_remitente,
                        foto_destinatario: mensaje.foto_destinatario
                    };
                });
                resolve(mensajesDescifrados);
            }
        });
    });
}

async function obtenerConversacionesRecientes(req, res) {
    try {

        const decodificado = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
        const idUsuarioActual = decodificado.id// Asegúrate de obtener el ID del usuario actual de la sesión

        const query = `
        SELECT 
        u.ID_usuario, 
        u.nomUsuario, 
        u.rol, 
        u.foto, 
        MAX(m.contenido) AS ultimoMensaje, 
        MAX(m.timestamp) AS timestamp
    FROM 
        mensajes m
    JOIN 
        usuario u ON u.ID_usuario = CASE 
                                        WHEN m.ID_remitente = ? THEN m.ID_destinatario 
                                        ELSE m.ID_remitente 
                                     END
    WHERE 
        m.ID_remitente = ? OR m.ID_destinatario = ?
    GROUP BY 
        u.ID_usuario
    ORDER BY 
        MAX(m.timestamp) DESC;
    
        `;

        db.query(query, [idUsuarioActual, idUsuarioActual, idUsuarioActual], (err, results) => {
            if (err) {
                console.error(`Error en la consulta de la base de datos: ${err.message}`);
                res.status(500).send('Error al obtener las conversaciones recientes');
            } else {
                const conversaciones = results.map(conversacion => {
                    return {
                        ...conversacion,
                        ultimoMensaje: conversacion.ultimoMensaje ? decrypt(conversacion.ultimoMensaje) : null,
                        foto: decrypt(conversacion.foto) 
                    };
                });
                res.json(conversaciones);
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al procesar la solicitud');
    }
}

async function obtenerInformacionUsuario(req, res) {
    try {
        const ID_usuario = req.params.id; 

        const query = 'SELECT * FROM usuario WHERE ID_usuario = ?';
        db.query(query, [ID_usuario], (err, results) => {
            if (err) {
                console.error(`Error en la consulta de la base de datos: ${err.message}`);
                res.status(500).send('Error al obtener información del usuario');
            } else {
                if (results.length > 0) {
                    const usuario = results[0];
                    // Aplicar 'decrypt' al campo de la foto si está presente y encriptado
                    if (usuario.foto && typeof decrypt === 'function') {
                        usuario.foto = decrypt(usuario.foto);
                    }
                    res.json(usuario);
                } else {
                    res.status(404).send('Usuario no encontrado');
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al procesar la solicitud');
    }
}

module.exports = {
    obtenerMensajes,
    obtenerConversacionesRecientes,
    obtenerInformacionUsuario
};
