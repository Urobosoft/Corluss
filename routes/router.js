const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { insertAdmin } = require('../controllers/admin'); 
const upload = authController.upload;


// Ruta para la página "home" (mostrada antes de "index")
router.get('/', (req, res) => {
    res.render('index');
});

router.get('/invitado', (req, res) => {
    res.render('invitado');
});

// Ruta para la página "index"
router.get('/inicio', authController.isAuthenticated, (req, res) => {
    if (req.user) {
        res.render('inicio', { user: req.user }); // Pasa los datos del usuario a la vista "home"
    } else {
        res.redirect('/inicio');
    }
});

router.get('/inicio', (req, res) => {
    res.render('inicio');
});


router.get('/administrador', authController.isAuthenticated, (req, res) => {
    res.render('administrador/inicio', {
        admin: req.session.admin // Pasar los datos de la sesión del administrador a la vista
    });
});



// Rutas para el login y registro
router.get('/login', (req, res) => {
    res.render('login', {
        valoresAnteriores: {
            nombre: '',
            apellido: '',
            nomUsuario: '',
            contacto: '',
            genero: 'M', // Valor predeterminado para el género, puedes cambiarlo según es necesario
            dia: '1', // Valor predeterminado para el día
            mes: '1', // Valor predeterminado para el mes
            ano: '2000', // Valor predeterminado para el año
            // No incluir la contraseña
        },
        errorC: null,
        errorU: null 
    });
});


router.get('/registro', (req, res) => {
    res.render('registro', {
        valoresAnteriores: {
            nombre: '',
            apellido: '',
            nomUsuario: '',
            contacto: '',
            genero: 'M', // Valor predeterminado para el género, puedes cambiarlo según es necesario
            dia: '1', // Valor predeterminado para el día
            mes: '1', // Valor predeterminado para el mes
            ano: '2000', // Valor predeterminado para el año
            // No incluir la contraseña
        },
        errorC: null,
        errorU: null // Asegúrate de que 'error' también se inicialice, aunque sea null
    });
});


// Rutas para los métodos del controlador
// Ruta para el registro
router.post('/register', upload.single('image'), authController.register);

router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Administradores por defecto
// // const adminData = {
// //     nombre: 'Kevin Saúl',
// //     apellido: 'Olarte Tomás',
// //     nomUsuario: 'Well',
// //     Correo_Electronico: 'olarte.tomas.kevinsaul@gamil.com',
// //     Password: 'A', 
// //     Rol: 'Administrador',
// //     foto: 'uploads/administrador.jpg'
// //   };
  
// // insertAdmin(adminData).catch(error => {
// //     console.error('No se pudo insertar el administrador de prueba:', error);
// //   });

module.exports = router;
