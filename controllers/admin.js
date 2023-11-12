const bcryptjs = require('bcryptjs');
const conexion = require('../database/db'); // Asegúrate de que esta ruta sea correcta


  const hashPassword = async (password) => {
    try {
      const salt = await bcryptjs.genSalt(10);
      return await bcryptjs.hash(password, salt);
    } catch (error) {
      console.error('Error al hashear la contraseña:', error);
      throw error; // Es importante lanzar el error para poder manejarlo en la función de inserción
    }
  };
  
  // Función para insertar el administrador de prueba
  exports.insertAdmin = async (adminData) => {
    try {
      // Hashear la contraseña antes de insertarla
      adminData.Password = await hashPassword(adminData.Password);
  
      // Inserción del administrador en la base de datos
      conexion.query('INSERT INTO administrador SET ?', adminData, (error, results) => {
        if (error) {
          console.error('Error al insertar el administrador de prueba:', error);
          throw error; // Lanzar el error para que pueda ser manejado en index.js
        }
        console.log('Administrador de prueba insertado con éxito:', results.insertId);
      });
    } catch (error) {
      console.error('Error al insertar el administrador de prueba:', error);
      throw error; // Lanzar el error para que pueda ser manejado en index.js
    }
  };

  