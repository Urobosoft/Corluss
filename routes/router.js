const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const upload = authController.upload;

// Ruta para la página "home" (mostrada antes de "index")
router.get('/', (req, res) => {
    res.render('index');
});

// Ruta para la página "index"
router.get('/home', authController.isAuthenticated, (req, res) => {
    if (req.user) {
        res.render('home', { user: req.user }); // Pasa los datos del usuario a la vista "home"
    } else {
        res.redirect('/login');
    }
});
// Rutas para el login y registro
router.get('/login', (req, res) => {
    res.render('login', { alert: false });
});

router.get('/registro', (req, res) => {
    res.render('registro', { alert: false });
});


// Rutas para los métodos del controlador
// Ruta para el registro
router.post('/register', upload.single('image'), authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;
