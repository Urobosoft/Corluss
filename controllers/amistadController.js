const db = require('../database/db');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');


//PROCEDIMIENTO PARA ENVIAR SOLICITUDES
const enviarSolicitud = (req, res) => {
  const solicitante_id = parseInt(req.body.solicitante_id, 10);
  const receptor_id = parseInt(req.body.receptor_id, 10);


  // Consulta para verificar si ya existe una solicitud entre ambos usuarios, en cualquier dirección
  const consultaExistente = `
    SELECT * FROM SolicitudesAmistad 
    WHERE (solicitante_id = ? AND receptor_id = ?) 
    OR (solicitante_id = ? AND receptor_id = ?) 
    AND estado = 'pendiente'
  `;

  db.query(consultaExistente, [solicitante_id, receptor_id, receptor_id, solicitante_id], (error, results) => {
    if (error) {
      res.status(500).send({ message: 'Error al verificar solicitud existente', error });
      return;
    }

    // Si ya existe una solicitud pendiente en cualquier dirección, no permitas una nueva
    if (results.length > 0) {
      const esEmisor = results[0].solicitante_id === solicitante_id;
      res.status(409).send({
        message: 'Ya existe una solicitud pendiente entre ambos usuarios',
        esEmisor: esEmisor // Indica si el usuario actual es el emisor de la solicitud
      });
    } else {
      // Inserta la nueva solicitud
      const insertarSolicitud = `
        INSERT INTO SolicitudesAmistad (solicitante_id, receptor_id, estado) 
        VALUES (?, ?, 'pendiente')
      `;
      db.query(insertarSolicitud, [solicitante_id, receptor_id], (error, insertResults) => {
        if (error) {
          res.status(500).send({ message: 'Error al enviar solicitud de amistad', error });
          return;
        }
        res.status(200).send({ message: 'Solicitud de amistad enviada', data: insertResults });
      });
    }
  });
};

//PROCEDIMIENTO PARA DESPLEGAR EN LA BARRA DE BUSQUEDA
const buscarTutoresPorNombreUsuario = async (req, res) => {
  try {
    const terminoBusqueda = req.query.q; // El término de búsqueda, que es parte del nombre de usuario

    // Obtener el ID del usuario actual de la sesión
    const decodificado = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
    const usuarioIdActual = decodificado.id;

    // Modificar la consulta para excluir al usuario actual de los resultados
    const query = 'SELECT ID_usuario, nomUsuario FROM usuario WHERE rol = "Padre" AND nomUsuario LIKE ? AND ID_usuario != ?';

    db.query(query, [`%${terminoBusqueda}%`, usuarioIdActual], (error, results) => {
      if (error) {
        res.status(500).send({ message: 'Error en la búsqueda', error });
        return;
      }
      res.status(200).send({ data: results });
    });
  } catch (error) {
    // Manejar el error en caso de que la verificación JWT falle
    res.status(500).send({ message: 'Error al verificar la identidad del usuario', error });
  }
};


//PROCEDIMIENTO PARA DESPLEGAR TODOS LOS TUTORES DE LA BASE DE DATOS 
const obtenerTodosLosTutores = async (req, res) => {
  const decodificado = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
  const usuarioId = decodificado.id;
  const query = 'SELECT ID_usuario, nomUsuario FROM usuario WHERE rol = "Padre" AND ID_usuario != ?';

  db.query(query, [usuarioId], (error, results) => {
    if (error) {
      res.status(500).send({ message: 'Error al obtener tutores', error });
      return;
    }
    res.status(200).send({ data: results });
  });
};


//PROCEDIMIENTO PARA LAS SOLICITUDES PENDIENTES 
const listarSolicitudes = async (req, res) => {
  try {

    const decodificado = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
    const usuarioIdActual = decodificado.id;


    const consulta = `
    SELECT sa.*, u.nomUsuario AS nombre_solicitante
    FROM SolicitudesAmistad sa
    JOIN usuario u ON sa.solicitante_id = u.ID_usuario
    WHERE sa.receptor_id = ? AND sa.estado = 'pendiente'
  `;

    db.query(consulta, [usuarioIdActual], (error, results) => {
      if (error) {
        console.error("Error al realizar la consulta a la base de datos:", error);
        res.status(500).send({ message: 'Error al obtener solicitudes pendientes', error });
      } else {
        res.status(200).send({ solicitudes: results });
      }
    });
  } catch (error) {
    console.error("Error en el proceso de verificación del token JWT o en la consulta:", error);
    res.status(500).send({ message: 'Error al verificar la identidad del usuario', error });
  }
};

 
//PROCEDIMIENTO PARA ACEPTAR SOLICITUDES
const aceptarSolicitud = async (req, res) => {
  try {
    // Decodificar el JWT para obtener el ID del usuario actual
    const decodificado = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
    const usuarioIdActual = decodificado.id;

    // Obtener el ID de la solicitud de la URL o del cuerpo de la solicitud, según tu enfoque de diseño de API
    const { solicitudId } = req.body; // o req.params si el ID viene de la URL

    // Iniciar transacción
    db.beginTransaction(async (err) => {
      if (err) {
        return res.status(500).send({ message: 'Error al iniciar transacción', error: err });
      }

      // Actualizar la solicitud a 'aceptada'
      const actualizarSolicitud = `
        UPDATE SolicitudesAmistad 
        SET estado = 'aceptada' 
        WHERE id = ? AND receptor_id = ?
      `;

      db.query(actualizarSolicitud, [solicitudId, usuarioIdActual], (error, updateResults) => {
        if (error) {
          return db.rollback(() => {
            res.status(500).send({ message: 'Error al actualizar solicitud', error });
          });
        }

        // Insertar registro en la tabla de amigos
        const insertarAmigo = `
          INSERT INTO Amigos (usuario_id1, usuario_id2) 
          VALUES (?, (SELECT solicitante_id FROM SolicitudesAmistad WHERE id = ?))
        `;

        db.query(insertarAmigo, [usuarioIdActual, solicitudId], (error, insertResults) => {
          if (error) {
            return db.rollback(() => {
              res.status(500).send({ message: 'Error al agregar amigo', error });
            });
          }

          // Finalizar transacción
          db.commit(err => {
            if (err) {
              return db.rollback(() => {
                res.status(500).send({ message: 'Error al finalizar transacción', error: err });
              });
            }

            res.status(200).send({ message: 'Solicitud aceptada y amistad creada', data: insertResults });
          });
        });
      });
    });
  } catch (error) {
    // Manejar errores relacionados con la verificación JWT o errores generales
    res.status(500).send({ message: 'Error al procesar la solicitud', error });
  }
};


//PROCEDIMIENTO PARA RECHAZAR SOLICITUDES
const rechazarSolicitud = async (req, res) => {
  try {
    // Decodificar el JWT para obtener el ID del usuario actual
    const decodificado = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
    const usuarioIdActual = decodificado.id;

    // Obtener el ID de la solicitud de la URL o del cuerpo de la solicitud
    const { solicitudId } = req.body; // o req.params si el ID viene de la URL

    // Preparar la consulta para actualizar el estado de la solicitud a 'rechazada'
    const consulta = `
      UPDATE SolicitudesAmistad 
      SET estado = 'rechazada' 
      WHERE id = ? AND receptor_id = ?
    `;

    // Ejecutar la consulta con el ID de la solicitud y el ID del usuario actual
    db.query(consulta, [solicitudId, usuarioIdActual], (error, results) => {
      if (error) {
        res.status(500).send({ message: 'Error al rechazar solicitud', error });
      } else {
        res.status(200).send({ message: 'Solicitud rechazada', data: results });
      }
    });
  } catch (error) {
    // Manejar errores relacionados con la verificación JWT o errores generales
    res.status(500).send({ message: 'Error al procesar la solicitud', error });
  }
};





module.exports = {
  enviarSolicitud,
  listarSolicitudes,
  aceptarSolicitud,
  buscarTutoresPorNombreUsuario,
  obtenerTodosLosTutores,
  rechazarSolicitud
};
