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
            const { nombre, apellido, nomUsuario, contacto, password, genero, dia, mes, ano } = req.body;
            const rol = 'Padre';
            let foto = req.file ? '/uploads/' + req.file.filename : null;
            // Crear un objeto con los valores anteriores incluyendo la foto
           const valoresAnteriores = Object.assign({}, req.body, { foto: foto });

    
            // Primera consulta para verificar si el nombre de usuario o el contacto ya existen en la tabla de usuarios
            conexion.query('SELECT * FROM usuario WHERE nomUsuario = ? OR contacto = ?', [nomUsuario, contacto], async (error, results) => {
                if (error) {
                    console.error('Error al consultar la base de datos:', error);
                    return res.redirect('/registro');
                }

                
                if (results.length > 0) {
                    
                const isNomUsuarioRepeated = results.some(user => user.nomUsuario === nomUsuario);
                const isContactoRepeated = results.some(user => user.contacto === contacto);
                    if (isNomUsuarioRepeated) {
                        errorUsu = 'El nombre de usuario ya está en uso';
                    } 
                    if (isContactoRepeated) {
                        errorCon = 'El contacto ya está en uso';
                    }
                    return res.render('registro', { errorU: errorUsu, errorC: errorCon, valoresAnteriores });

                } else {
                    // Segunda consulta para verificar si el nombre de usuario existe en la tabla de administradores
                    conexion.query('SELECT * FROM administrador WHERE nomUsuario = ?', [nomUsuario], async (error, results) => {
                        if (error) {
                            console.error('Error al consultar la base de datos de administradores:', error);
                            return res.redirect('/registro');
                        }
    
                        if (results.length > 0) {
                            // Si el nombre de usuario ya existe en la tabla de administradores
                            return res.render('registro', {
                                errorU: 'El nombre de usuario ya está en uso',
                                errorC: null,
                                valoresAnteriores
                            });
                        } else {
                            // El nombre de usuario no está en uso, procede con el registro
                            let passHash = await bcryptjs.hash(password, 8);
                            const fechaNacimiento = `${ano}-${mes}-${dia}`;
    
                            // Insertar los datos en la base de datos de usuarios
                            conexion.query('INSERT INTO usuario SET ?', {
                                nombre, apellido, rol, nomUsuario, contacto, genero, fecha_nacimiento: fechaNacimiento, password: passHash, foto
                            }, (error, results) => {
                                if (error) {
                                    console.error('Error al insertar en la base de datos:', error);
                                    return res.redirect('/registro');
                                } else {
                                    console.log('Registro exitoso');
                                    return res.redirect('/inicio');
                                }
                            });
                        }
                    });
                }
            });
        } catch (error) {
            console.log(error);
            return res.redirect('/registro');
        }
    };
    
    
    exports.login = async (req, res)=>{
        try {
            const nomUsuario = req.body.nomUsuario
            const password = req.body.password    
            console.log(nomUsuario)   
            console.log(password)   

            const valoresAnteriores = {
                nombre: '',
                apellido: '',
                nomUsuario: '',
                contacto: '',
                genero: 'M', // Valor predeterminado para el género, puedes cambiarlo según es necesario
                dia: '1', // Valor predeterminado para el día
                mes: '1', // Valor predeterminado para el mes
                ano: '2000', // Valor predeterminado para el año
                password: ''
            };

            if(!nomUsuario || !password ){
                res.render('login',{
                    alert:true,
                    alertTitle: "Advertencia",
                    alertMessage: "Ingrese un usuario y password",
                    alertIcon:'info',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login',
                    valoresAnteriores,
                    errorC: null,
                    errorU: null 
                })
            }else{
                conexion.query('SELECT * FROM usuario WHERE nomUsuario = ?', [nomUsuario], async (error, results) => {
                    if (error) {
                        console.error('Error en la consulta a la base de datos:', error);
                        return res.redirect('/login'); // Redireccionar con un mensaje de error
                    } else if (results.length > 0 && await bcryptjs.compare(password, results[0].password)) {
                        // Usuario encontrado y contraseña correcta
                        const id = results[0].ID_usuario;
                        const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
                            expiresIn: process.env.JWT_TIEMPO_EXPIRA
                        });
    
                        const cookiesOptions = {
                            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                            httpOnly: true
                        };
                        res.cookie('jwt', token, cookiesOptions);
    
                        res.render('inicio', { // Asumiendo que 'inicio' es la vista para usuarios regulares
                            alert: true,
                            alertTitle: "Conexión exitosa",
                            alertMessage: "¡Bienvenido!",
                            alertIcon: 'success',
                            showConfirmButton: false,
                            timer: 800,
                            ruta: 'inicio',
                            user: results[0]
                        });
                    } else {
                        // Si no es usuario regular, verifica en la tabla de administradores
                        conexion.query('SELECT * FROM administrador WHERE nomUsuario = ?', [nomUsuario], async (error, adminResults) => {
                            if (error) {
                                console.error('Error en la consulta a la base de datos:', error);
                                return res.redirect('/login'); // Redireccionar con un mensaje de error
                            } else if (adminResults.length > 0 && await bcryptjs.compare(password, adminResults[0].Password)) {
                                // Administrador encontrado y contraseña correcta
                                const id = adminResults[0].ID_administrador;
                                const token = jwt.sign({ id: id, rol: 'Administrador' }, process.env.JWT_SECRETO, {
                                    expiresIn: process.env.JWT_TIEMPO_EXPIRA
                                });
                            
                                const cookiesOptions = {
                                    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                                    httpOnly: true
                                };
                                res.cookie('jwt', token, cookiesOptions);
                            
                                res.render('administrador/inicio', { // Asumiendo que 'adminDashboard' es la vista para administradores
                                    alert: true,
                                    alertTitle: "Conexión exitosa",
                                    alertMessage: "¡Bienvenido Administrador!",
                                    alertIcon: 'success',
                                    showConfirmButton: false,
                                    timer: 800,
                                    ruta: 'administrador/inicio', // Asegúrate de que esta es la ruta correcta para el dashboard de administrador
                                    admin: {
                                        id: adminResults[0].ID_administrador,
                                        nombre: adminResults[0].nombre,
                                        apellido: adminResults[0].apellido,
                                        correoElectronico: adminResults[0].Correo_Electronico,
                                        foto: adminResults[0].foto,
                                        // Agregar aquí cualquier otro dato relevante que necesites
                                    }
                                });
                            
                            } else {
                                // Ningún usuario ni administrador encontrado, o contraseña incorrecta
                                return res.render('login', {
                                    alert: true,
                                    alertTitle: "Error",
                                    alertMessage: "Usuario y/o Password incorrectas",
                                    alertIcon: 'error',
                                    showConfirmButton: true,
                                    timer: false,
                                    ruta: 'login',
                                    valoresAnteriores,
                                    errorC: null,
                                    errorU: null 
                                    // No es necesario enviar valoresAnteriores, errorC, o errorU si no los usas en tu vista.
                                });
                            }
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error en el proceso de login:', error);
            return res.redirect('/login'); // Redireccionar con un mensaje de error
        }
    };

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
        return res.redirect('/login')
    }