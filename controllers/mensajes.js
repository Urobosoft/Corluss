const db = require('../database/db');


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
            SELECT * FROM mensajes 
            WHERE (ID_remitente = ? AND ID_destinatario = ?) 
               OR (ID_remitente = ? AND ID_destinatario = ?) 
            ORDER BY timestamp`;

        db.query(query, [ID_remitente, ID_destinatario, ID_destinatario, ID_remitente], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

module.exports = {
    obtenerMensajes
};
