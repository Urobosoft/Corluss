const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const http = require('http');


const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server);
require('./sockets')(io);




// Seteamos el motor de plantillas
app.set('view engine', 'ejs')

// Seteamos la carpeta public para archivos estáticos
app.use('/Corluss', express.static('public'));

// Para procesar datos enviados desde forms
app.use(express.urlencoded({extended:true}))
app.use(express.json())

// Seteamos las variables de entorno
dotenv.config({path: './env/.env'})

// Para poder trabajar con las cookies
app.use(cookieParser())

// Llamar al router principal
app.use('/', require('./routes/router'))

// Aquí importas e integras tus rutas de amistad
app.use('/api/amistad', require('./routes/amistadRoutes'))

// Aquí importas e integras tus rutas de amistad
app.use('/api/chat', require('./routes/mensajesRoutes'))

// Aquí importas e integras tus rutas de amistad
app.use('/api/user', require('./routes/usersRoutes'))

// Para eliminar la cache 
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

server.listen(7777, () => {
  console.log('SERVER UP running in http://localhost:7777');
  module.exports = io;
});
