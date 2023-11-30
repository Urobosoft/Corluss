const bcryptjs = require('bcryptjs');
const conexion = require('../database/db');



const hashPassword = async (password) => {
    try {
        const salt = await bcryptjs.genSalt(10);
        return await bcryptjs.hash(password, salt);
    } catch (error) {
        console.error('Error al hashear la contraseña:', error);
        throw error;
    }
};

// Función para insertar el administrador
exports.insertAdmin = async (adminData) => {
    try {
        // Asegúrate de que 'Password' está correctamente nombrado según tu objeto adminData
        adminData.password = await hashPassword(adminData.Password);

        // Ajusta las claves del objeto adminData para que coincidan con las columnas de la tabla 'usuario'
        const usuarioData = {
            nombre: adminData.nombre,
            apellido: adminData.apellido,
            nomUsuario: adminData.nomUsuario,
            contacto: adminData.Correo_Electronico,
            genero: adminData.genero, // Asegúrate de añadir esta propiedad si es necesaria
            fecha_nacimiento: adminData.fecha_nacimiento, // Añade esta propiedad
            password: adminData.password,
            foto: adminData.foto,
            rol: 'Administrador'
        };

        conexion.query('INSERT INTO usuario SET ?', usuarioData, (error, results) => {
            if (error) {
                console.error('Error al insertar el usuario:', error);
                throw error;
            }
            console.log('Usuario insertado con éxito:', results.insertId);
        });
    } catch (error) {
        console.error('Error al insertar el usuario:', error);
        throw error;
    }
};
