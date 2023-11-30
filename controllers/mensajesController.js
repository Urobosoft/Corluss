const db = require('../database/db');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { decrypt } = require('./authController');

//EXPORTA LOS RESULTADOS DE LA BUSQUEDA
exports.buscarUsuariosYAmigos = async (req, res) => {
    const busqueda = req.body.busqueda;
    const decodificado = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
    const usuarioIdActual = decodificado.id;

    try {
        let usuarios = await buscarUsuarios(busqueda,usuarioIdActual);
        let amigos = await buscarAmigos(busqueda, usuarioIdActual);

        // Crea un nuevo Set con los IDs de los usuarios únicos
        let idsUnicos = new Set();
        let resultadosUnicos = [];

        // Agrega los usuarios y verifica si el ID ya existe en el set
        usuarios.forEach(usuario => {
            if (!idsUnicos.has(usuario.ID_usuario)) {
                idsUnicos.add(usuario.ID_usuario);
                resultadosUnicos.push(usuario);
            }
        });

        // // Agrega los amigos y verifica si el ID ya existe en el set
        amigos.forEach(amigo => {
            if (!idsUnicos.has(amigo.ID_usuario)) {
                idsUnicos.add(amigo.ID_usuario);
                resultadosUnicos.push(amigo);
            }
        });

        res.json(resultadosUnicos);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
};


//BUSCA USUARIOS DISPONIBLES 
async function buscarUsuarios(busqueda, usuarioIdActual) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM usuario WHERE (nombre LIKE ? OR apellido LIKE ? OR nomUsuario LIKE ?) AND (rol = "Padre" OR rol = "Tutor") AND ID_usuario != ?';
        db.query(query, [`%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`, usuarioIdActual], (err, results) => {
            if (err) {
                reject(err);
            } else {
                // Decrypt the image path here before resolving
                results.forEach(user => {
                    if (user.foto) {
                        user.foto = decrypt(user.foto);
                    }
                });
                resolve(results);
            }
        });
    });
}

//BUSCA AMIGOS 
async function buscarAmigos(busqueda, usuarioIdActual) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT u.* FROM Amigos a
            JOIN usuario u ON u.ID_usuario = IF(a.usuario_id1 = ?, a.usuario_id2, a.usuario_id1)
            WHERE (a.usuario_id1 = ? OR a.usuario_id2 = ?)
            AND (u.nombre LIKE ? OR u.apellido LIKE ? OR u.nomUsuario LIKE ?)`;

        db.query(query, [usuarioIdActual, usuarioIdActual, usuarioIdActual, `%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`], (err, results) => {
            if (err) {
                reject(err);
            } else {
                results.forEach(friend => {
                    if (friend.foto) {
                        friend.foto = decrypt(friend.foto);
                    }
                });
                resolve(results);
            }
        });
    });
}


