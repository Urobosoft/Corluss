const express = require('express');
const router = express.Router();
const mensajesController = require('../controllers/mensajesController');
const mensajes = require('../controllers/mensajes');
const authController = require('../controllers/authController');

router.post('/buscar', authController.isAuthenticated, mensajesController.buscarUsuariosYAmigos);
router.post('/obtenerMensajes', authController.isAuthenticated, mensajes.obtenerMensajes);
router.get('/conversacionesRecientes', authController.isAuthenticated, mensajes.obtenerConversacionesRecientes);
router.get('/usuario/:id', authController.isAuthenticated, mensajes.obtenerInformacionUsuario);

module.exports = router;