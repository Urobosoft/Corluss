const conexion = require('../database/db');
const { decrypt } = require('./authController');

exports.publicar = async (req, res) => {
  const { contenido } = req.body;
  const imagen = req.files['imagen'] ? `/uploads/${req.files['imagen'][0].filename}` : null;
  const video = req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : null;
  const usuarioId = req.user.ID_usuario;

  conexion.query('INSERT INTO publicaciones (usuario_id, contenido, imagen, video) VALUES (?, ?, ?, ?)', [usuarioId, contenido, imagen, video], (error, results) => {
      if (error) {
          console.error('Error al guardar la publicación:', error);
          return res.status(500).send('Error al guardar la publicación');
      }

      const publicacionId = results.insertId;
      conexion.query('SELECT u.nombre, u.foto, p.fecha_publicacion, p.contenido, p.imagen, p.video FROM publicaciones p JOIN usuario u ON p.usuario_id = u.ID_usuario WHERE p.ID_publicacion = ?', [publicacionId], (error, publicaciones) => {
          if (error) {
              console.error('Error al obtener la publicación:', error);
              return res.status(500).send('Error al obtener la publicación');
          }
          res.json({ message: 'Publicación guardada con éxito', publicacion: publicaciones[0] });
      });
  });
};



exports.obtenerPublicaciones = (req, res) => {
  conexion.query('SELECT u.nombre, u.foto, p.fecha_publicacion, p.contenido, p.imagen, p.video FROM publicaciones p JOIN usuario u ON p.usuario_id = u.ID_usuario ORDER BY p.fecha_publicacion DESC', (error, resultados) => {
      if (error) {
          console.error('Error al obtener las publicaciones:', error);
          return res.status(500).send('Error al obtener las publicaciones');
      }

      const publicacionesDesencriptadas = resultados.map((publicacion) => {
        // Verifica si la columna 'foto' está presente en la publicación
        if (publicacion.foto) {
          // Desencripta la columna 'foto' (suponiendo que 'foto' contiene la foto de perfil del usuario)
          publicacion.foto = decrypt(publicacion.foto);
        }
        return publicacion;
      });
  
      res.json(publicacionesDesencriptadas);
    });
};


// exports.obtenerComentarios = (req, res) => {
//   const publicacionId = req.query.publicacionId;

//   conexion.query('SELECT * FROM comentarios WHERE publicacion_id = ?', [publicacionId], (error, resultados) => {
//       if (error) {
//           console.error('Error al obtener los comentarios:', error);
//           return res.status(500).send('Error al obtener los comentarios');
//       }
//       res.json(resultados);
//   });
// };

// exports.agregarComentario = async (req, res) => {
//   const { texto, publicacionId } = req.body;
//   const usuarioId = req.user.ID_usuario; // Obtiene el ID del usuario autenticado

//   try {
//       // Aquí insertarías el comentario en la base de datos
//       await conexion.query('INSERT INTO comentarios (publicacion_id, usuario_id, texto) VALUES (?, ?, ?)', [publicacionId, usuarioId, texto]);
//       res.json({ success: true, message: 'Comentario agregado con éxito' });
//   } catch (error) {
//       console.error('Error al agregar el comentario:', error);
//       res.status(500).send('Error al agregar el comentario');
//   }
// };



