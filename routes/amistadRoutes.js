// routes/amistadRoutes.js
const express = require('express');
const router = express.Router();
const amistadController = require('../controllers/amistadController');
const authController = require('../controllers/authController');

router.post('/enviar', authController.isAuthenticated, amistadController.enviarSolicitud);
router.get('/buscar/tutores', authController.isAuthenticated, amistadController.buscarTutoresPorNombreUsuario);
router.get('/tutores', authController.isAuthenticated, amistadController.obtenerTodosLosTutores);
router.get('/solicitudes/:usuarioId', amistadController.listarSolicitudes);
router.post('/aceptar', authController.isAuthenticated, amistadController.aceptarSolicitud);
router.post('/rechazar', authController.isAuthenticated, amistadController.rechazarSolicitud);

module.exports = router;
