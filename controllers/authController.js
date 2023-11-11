    const jwt = require('jsonwebtoken')
    const bcryptjs = require('bcryptjs')
    const conexion = require('../database/db')
    const {promisify} = require('util')
    const multer = require('multer');
    const path = require('path');

    // Configuración de Multer para la carga de imágenes
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/uploads'); // Directorio donde se almacenarán las fotos
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname); // Nombre del archivo en el servidor
        },
    });

    const upload = multer({ storage: storage });
    module.exports.upload = upload;

    //procedimiento para registrarnos
    exports.register = async (req, res) => {
        try {
            const nombre = req.body.nombre;
            const apellido = req.body.apellido;
            const nomUsuario = req.body.nomUsuario;
            const contacto = req.body.contacto;
            const password = req.body.password;
            const genero = req.body.genero;
            const dia = req.body.dia;
            const mes = req.body.mes;
            const ano = req.body.ano;

            let passHash = await bcryptjs.hash(password, 8);

            const fechaNacimiento = `${ano}-${mes}-${dia}`;
            const foto = req.file ? req.file.filename : null;

            // Insertar los datos en la base de datos
            conexion.query(
                'INSERT INTO usuario (nombre, apellido, nomUsuario, contacto, genero, fecha_nacimiento, password, foto) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [nombre, apellido, nomUsuario, contacto, genero, fechaNacimiento, passHash, foto],
                (error, results) => {
                    if (error) {
                        console.error('Error al insertar en la base de datos:', error);
                    } else {
                        console.log('Registro exitoso');
                        res.redirect('/home');
                    }
                }
            );

        } catch (error) {
            console.log(error)
        }       
    }

    exports.login = async (req, res)=>{
        try {
            const nomUsuario = req.body.nomUsuario
            const password = req.body.password    
            console.log(nomUsuario)   
            console.log(password)   

            if(!nomUsuario || !password ){
                res.render('login',{
                    alert:true,
                    alertTitle: "Advertencia",
                    alertMessage: "Ingrese un usuario y password",
                    alertIcon:'info',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                })
            }else{
                conexion.query('SELECT * FROM usuario WHERE nomUsuario = ?', [nomUsuario], async (error, results)=>{
                    if( results.length == 0 || ! (await bcryptjs.compare(password, results[0].password)) ){
                        res.render('login', {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "Usuario y/o Password incorrectas",
                            alertIcon:'error',
                            showConfirmButton: true,
                            timer: false,
                            ruta: 'login'    
                        })
                    }else{
                        //inicio de sesión OK
                        const id = results[0].id
                        const token = jwt.sign({id:id}, process.env.JWT_SECRETO, {
                            expiresIn: process.env.JWT_TIEMPO_EXPIRA
                        })
                        //generamos el token SIN fecha de expiracion
                    //const token = jwt.sign({id: id}, process.env.JWT_SECRETO)
                    console.log("TOKEN: "+token+" para el USUARIO : "+ nomUsuario)

                    const cookiesOptions = {
                            expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                            httpOnly: true
                    }
                    res.cookie('jwt', token, cookiesOptions)
                  

                    res.render('home', {
                            alert: true,
                            alertTitle: "Conexión exitosa",
                            alertMessage: "¡Bienvenido!",
                            alertIcon:'success',
                            showConfirmButton: false,
                            timer: 800,
                            ruta: 'home',
                            user: results[0]
                    })
                    }
                })
            }
        } catch (error) {
            console.log(error)
        }
    }

    exports.isAuthenticated = async (req, res, next)=>{
        if (req.cookies.jwt) {
            try {
                const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
                conexion.query('SELECT * FROM usuario WHERE id = ?', [decodificada.id], (error, results)=>{
                    if(!results){return next()}
                    req.user = results[0]
                    return next()
                })
            } catch (error) {
                console.log(error)
                return next()
            }
        }else{
            res.redirect('/login')        
        }
    }

    exports.logout = (req, res)=>{
        res.clearCookie('jwt')   
        return res.redirect('/')
    }