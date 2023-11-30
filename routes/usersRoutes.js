const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const user = require('../controllers/usersController');

router.get('/verificarAlumnos', authController.isAuthenticated, user.verificarAlumnos);

module.exports = router;