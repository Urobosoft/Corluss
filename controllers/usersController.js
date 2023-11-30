const jwt = require('jsonwebtoken')
const conexion = require('../database/db')
const { promisify } = require('util')

exports.verificarAlumnos = async (req, res) => {
    try {
        // Decodificar el token JWT presente en las cookies
        const decodificado = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
        const usuarioRegistradorId = decodificado.id;

        // Consultar la tabla de relación para obtener los ID de alumnos asociados con el usuario actual
        conexion.query('SELECT alumno_id FROM ListaAlumnos WHERE usuario_registrador_id = ?', [usuarioRegistradorId], async (error, results) => {
            if (error) {
                // Manejar el error
                console.error(error);
                return res.status(500).send({ error: 'Error al verificar los alumnos' });
            } 
            
            if (results.length === 0) {
                // No hay alumnos registrados
                return res.send({ tieneAlumnos: false });
            }
            
            // Hay alumnos registrados, así que ahora vamos a obtener sus detalles completos de la tabla de usuarios
            const alumnosIds = results.map(result => result.alumno_id);
            conexion.query('SELECT * FROM usuario WHERE ID_usuario IN (?)', [alumnosIds], (error, alumnosDetails) => {
                if (error) {
                    // Manejar el error de la segunda consulta
                    console.error(error);
                    return res.status(500).send({ error: 'Error al obtener detalles de los alumnos' });
                } 
                // Enviar los detalles de los alumnos registrados
                res.send({ tieneAlumnos: true, alumnos: alumnosDetails });
            });
        });
    } catch (error) {
        // Manejar errores de decodificación de JWT o cualquier otro error
        console.error(error);
        res.status(500).send({ error: 'Error al verificar los alumnos' });
    }
};

