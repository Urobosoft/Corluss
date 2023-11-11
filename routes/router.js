const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const upload = authController.upload;

// Asumiendo que tu aplicación se sirve bajo el prefijo '/Corluss'

// Ruta para la página "home" (mostrada antes de "index")
router.get('/Corluss/', (req, res) => {
    res.render('index');
});

// Ruta para la página "home"
router.get('/Corluss/home', authController.isAuthenticated, (req, res) => {
    if (req.user) {
        res.render('home', { user: req.user }); // Pasa los datos del usuario a la vista "home"
    } else {
        res.redirect('/Corluss/login');
    }
});

// Rutas para el login y registro
router.get('/Corluss/login', (req, res) => {
    res.render('login', { alert: false });
});

router.get('/Corluss/registro', (req, res) => {
    res.render('registro', { alert: false });
});

// Rutas para los métodos del controlador
// Ruta para el registro
router.post('/Corluss/register', upload.single('image'), authController.register);
router.post('/Corluss/login', authController.login);
router.get('/Corluss/logout', authController.logout);

module.exports = router;
