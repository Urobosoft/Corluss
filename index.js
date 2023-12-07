const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const http = require('http');


const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server);
require('./sockets')(io);

// Middleware para añadir prefijo a recursos estáticos
const addPrefixToStaticResources = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function (body) {
    if (typeof body === 'string') {
      // Reemplazar las rutas de recursos estáticos para incluir el prefijo /Corluss/
      body = body.replace(/href="\//g, 'href="/Corluss/');
      body = body.replace(/src="\//g, 'src="/Corluss/');
      // Y así con cada tipo de recurso que necesites ajustar
    }
    originalSend.call(this, body);
  };
  
  next();
};

// Utiliza el middleware personalizado antes de tus rutas
app.use(addPrefixToStaticResources);

// Seteamos la carpeta public para archivos estáticos
app.use('/Corluss', express.static('public'));


// Seteamos el motor de plantillas
app.set('view engine', 'ejs')

// Seteamos la carpeta public para archivos estáticos
app.use(express.static('public'))

// Para procesar datos enviados desde forms
app.use(express.urlencoded({extended:true}))
app.use(express.json())

// Seteamos las variables de entorno
dotenv.config({path: './env/.env'})

// Para poder trabajar con las cookies
app.use(cookieParser())

// Llamar al router principal con el prefijo
app.use('/', require('./routes/router'));

// Aquí importas e integras tus rutas de amistad con el prefijo
app.use('/Corluss/api/amistad', require('./routes/amistadRoutes'));

// Aquí importas e integras tus rutas de chat con el prefijo
app.use('/Corluss/api/chat', require('./routes/mensajesRoutes'));

// Aquí importas e integras tus rutas de usuario con el prefijo
app.use('/Corluss/api/user', require('./routes/usersRoutes'));


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
