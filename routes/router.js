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


// Ruta para la interfaz de usuario

router.get('/principal', (req, res) => {
    res.render('home/principal', { user: req.user });
});


router.get('/perfil', (req, res) => {
    res.render('home/perfil', { user: req.user });
});

router.get('/lista', (req, res) => {
    res.render('home/lista', { user: req.user });
});

router.get('/estadisticas', (req, res) => {
    res.render('home/estadisticas', { user: req.user });
});

router.get('/reportar', (req, res) => {
    res.render('home/reportar', { user: req.user });
});

router.get('/configuracion', (req, res) => {
    res.render('home/configuracion', { user: req.user });
});

router.get('/crear', (req, res) => {
    res.render('home/crear', { user: req.user });
});


// Ruta para la interfaz de administradores

router.get('/principalA', (req, res) => {
    res.render('administrador/inicio', { user: req.user });
});

router.get('/regristrar', (req, res) => {
    res.render('administrador/registrar', { user: req.user });
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
// const adminData = {
//     nombre: 'Kevin Saúl',
//     apellido: 'Olarte Tomás',
//     nomUsuario: 'Well',
//     Correo_Electronico: 'olarte.tomas.kevinsaul@gamil.com',
//     Password: 'A', 
//     Rol: 'Administrador',
//     foto: 'uploads/administrador.jpg'
//   };
  
// insertAdmin(adminData).catch(error => {
//     console.error('No se pudo insertar el administrador de prueba:', error);
//   });

module.exports = router;
