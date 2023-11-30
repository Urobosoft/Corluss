const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const insertarAdministrador  = require('../controllers/administrador');
const publicacionesController = require('../controllers/publicacionesController');
const upload = authController.upload;


// Ruta para la página index

router.get('/', (req, res) => {
    res.render('index');
});


// router.get('/', (req, res) => {
//     res.render('alta');
// });

router.post('/altaTutor', authController.isAuthenticated, upload.single('image'), authController.altaTutor);
router.post('/altaAlumno', authController.isAuthenticated, upload.single('image'), authController.altaAlumno);



// Ruta para usuario: invitado
router.get('/invitado', (req, res) => {
    res.render('invitado/invitado');
});


// Ruta para registro
router.get('/login', (req, res) => {
    res.render('login', {
        valoresAnteriores: {
            nombre: '',
            apellido: '',
            nomUsuario: '',
            contacto: '',
            genero: 'M',
            dia: '1',
            mes: '1',
            ano: '2000',
        },
        errorC: null,
        errorN: null,
        errorA: null,
        errorU: null,
        errorE: null,
        errorD: null,
    });
});

// Rutas para login
router.get('/registro', (req, res) => {
    res.render('registro', {
        valoresAnteriores: {
            nombre: '',
            apellido: '',
            nomUsuario: '',
            contacto: '',
            genero: 'M',
            dia: '1',
            mes: '1',
            ano: '2000',
        },
        errorC: null,
        errorN: null,
        errorA: null,
        errorU: null,
        errorE: null,
        errorD: null,
    });
});


//Rutas para usuario: Padre
router.get('/inicio', authController.isAuthenticated, (req, res) => {
    if (req.user) {
        res.render('padre/inicio', { user: req.user }); // Pasa los datos del usuario a la vista "home"
    } else {
        res.redirect('/login');
    }
});

router.get('/instructivo', authController.isAuthenticated, (req, res) => {
    if (req.user) {
        res.render('padre/instructivo', { user: req.user });
    } else {
        res.redirect('/login');
    }
});

router.get('/mensajesP', authController.isAuthenticated, (req, res) => {
    if (req.user) {
        res.render('padre/mensajes', { user: req.user });
    } else {
        res.redirect('/login');
    }
});

router.get('/reportar', authController.isAuthenticated, (req, res) => {
    if (req.user) {
        res.render('padre/reportar', { user: req.user });
    } else {
        res.redirect('/login');
    }
});

router.get('/perfil', authController.isAuthenticated, (req, res) => {
    if (req.user) {
        res.render('padre/perfil', { user: req.user });
    } else {
        res.redirect('/login');
    }
});

router.get('/alta', authController.isAuthenticated, (req, res) => {
    if (req.user) {
        res.render('padre/alta', {
            user: req.user,
            errorC: null,
            errorN: null,
            errorA: null,
            errorU: null,
            errorE: null,
            errorD: null,
            autoclickRegister: null,
        });
    } else {
        res.redirect('/login');
    }
});

//Rutas para usuario: Tutor
router.get('/principalT', authController.isAuthenticated, (req, res) => {
    if (req.tutor) {
        res.render('tutor/principal', { tutor: req.tutor }); 
    } else {
        res.redirect('/login');
    }
});

router.get('/seguimiento', authController.isAuthenticated, (req, res) => {
    if (req.tutor) {
        res.render('tutor/seguimiento', { tutor: req.tutor }); 
    } else {
        res.redirect('/login');
    }
});

router.get('/estadisticas', authController.isAuthenticated, (req, res) => {
    if (req.tutor) {
        res.render('tutor/estadisticas', { tutor: req.tutor }); 
    } else {
        res.redirect('/login');
    }
});

router.get('/reporte', authController.isAuthenticated, (req, res) => {
    if (req.tutor) {
        res.render('tutor/reporte', { tutor: req.tutor }); 
    } else {
        res.redirect('/login');
    }
});

router.get('/instructivoT', authController.isAuthenticated, (req, res) => {
    if (req.tutor) {
        res.render('tutor/instructivo', { tutor: req.tutor }); 
    } else {
        res.redirect('/login');
    }
});

router.get('/mensajesT', authController.isAuthenticated, (req, res) => {
    if (req.tutor) {
        res.render('tutor/mensajes', { tutor: req.tutor }); 
    } else {
        res.redirect('/login');
    }
});


//Rutas para usuario: Alumno
router.get('/principalA', authController.isAuthenticated, (req, res) => {
    if (req.alumno) {
        res.render('alumno/inicio', { alumno: req.alumno }); 
    } else {
        res.redirect('/login');
    }
});

router.get('/perfilH', authController.isAuthenticated, (req, res) => {
    if (req.alumno) {
        res.render('alumno/perfil', { alumno: req.alumno }); 
    } else {
        res.redirect('/login');
    }
});

router.get('/leccion', authController.isAuthenticated, (req, res) => {
    if (req.alumno) {
        res.render('alumno/leccion', { alumno: req.alumno }); 
    } else {
        res.redirect('/login');
    }
});

router.get('/configuracion', authController.isAuthenticated, (req, res) => {
    if (req.alumno) {
        res.render('alumno/configuracion', { alumno: req.alumno }); 
    } else {
        res.redirect('/login');
    }
});

router.get('/pendientes', authController.isAuthenticated, (req, res) => {
    if (req.alumno) {
        res.render('alumno/pendientes', { alumno: req.alumno }); 
    } else {
        res.redirect('/login');
    }
});

router.get('/instructivoH', authController.isAuthenticated, (req, res) => {
    if (req.alumno) {
        res.render('alumno/instructivo', { alumno: req.alumno }); 
    } else {
        res.redirect('/login');
    }
});
router.get('/mensajesH', authController.isAuthenticated, (req, res) => {
    if (req.alumno) {
        res.render('alumno/mensajes', { alumno: req.alumno }); 
    } else {
        res.redirect('/login');
    }
});

//Rutas para home administrador

router.get('/administrador', authController.isAuthenticated, (req, res) => {
    if (req.administrador) {
        res.render('administrador/inicio', { admin: req.administrador }); 
    } else {
        res.redirect('/login');
    }
});

router.get('/registrar', authController.isAuthenticated, (req, res) => {
    if (req.administrador) {
        res.render('administrador/registrar', { admin: req.administrador }); 
    } else {
        res.redirect('/login');
    }
});

router.get('/contenido', authController.isAuthenticated, (req, res) => {
    if (req.administrador) {
        res.render('administrador/contenido', { admin: req.administrador }); 
    } else {
        res.redirect('/login');
    }
});

router.get('/estadisticasA', authController.isAuthenticated, (req, res) => {
    if (req.administrador) {
        res.render('administrador/estadisticas', { admin: req.administrador }); 
    } else {
        res.redirect('/login');
    }
});


router.get('/mensajes', authController.isAuthenticated, (req, res) => {
    if (req.administrador) {
        res.render('administrador/mensajes', { admin: req.administrador }); 
    } else {
        res.redirect('/login');
    }
});

router.get('/configuracionA', authController.isAuthenticated, (req, res) => {
    if (req.administrador) {
        res.render('administrador/configuracion', { admin: req.administrador }); 
    } else {
        res.redirect('/login');
    }
});


// Rutas para los métodos del controlador
// Ruta para el registro
router.post('/register', upload.single('image'), authController.register);

router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/cambiarFoto', upload.single('foto'), authController.cambiarFoto);

router.post('/publicar', authController.isAuthenticated, upload.fields([{ name: 'imagen', maxCount: 1 }, 
{ name: 'video', maxCount: 1 }]), publicacionesController.publicar);
router.get('/obtener-publicaciones', publicacionesController.obtenerPublicaciones);



// Administradores por defecto
// const adminData = {
//     nombre: 'Kevin Saúl',
//     apellido: 'Olarte Tomás',
//     nomUsuario: 'Kv',
//     Correo_Electronico: 'olarte.tomas.kevinsaul@gmail.com',
//     genero: 'M', 
//     fecha_nacimiento: '2000-01-01',// Asegúrate de que el correo electrónico esté bien escrito
//     Password: 'Hola_1938', 
//     Rol: 'Administrador',
//     foto: 'uploads/administrador.jpg'
// };

// insertarAdministrador.insertAdmin(adminData)
//     .catch(error => {
//         console.error('No se pudo insertar el administrador:', error);
//     });


module.exports = router;    
