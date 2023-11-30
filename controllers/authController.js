const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const conexion = require('../database/db')
const { promisify } = require('util')
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

//Funcion de cifrado 
function encrypt(data) {
    const algorithm = 'aes-256-cbc';

    // Convertir la clave hexadecimal a un Buffer de 32 bytes
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

    const iv = crypto.randomBytes(16); // Initialization vector

    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

//Funcion de decifrado

function decrypt(encryptedData) {
    try {
        const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
        const parts = encryptedData.split(':');
        if (parts.length !== 2) {
            throw new Error('Formato de datos cifrados inválido.');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = Buffer.from(parts[1], 'hex');

        if (iv.length !== 16) {
            throw new Error('Longitud inválida del vector de inicialización.');
        }

        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Error al descifrar:', error);
        // Manejar o reenviar el error según sea necesario
    }
}

module.exports.decrypt = decrypt;

//Funcion para la autenticacion
function pareceCifrado(dato) {
    // Comprobación básica basada en el formato de los datos cifrados
    return dato.includes(':');
}

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
//Validacion de campos
// Asegúrese de que estas funciones de validación estén definidas en su código o importadas correctamente si están en otro archivo.
const regex = /^[a-zA-Z\u00C0-\u00FF\s]*$/;

function validarNombre(nombre) {
    return regex.test(nombre);
}

function validarApellido(apellido) {
    return regex.test(apellido);
}

function validarContacto(contacto) {
    const regex = /^(\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+|(\+?\d{10,15}))$/;
    return regex.test(contacto);
}



exports.register = async (req, res) => {
    try {
        const { nombre, apellido, nomUsuario, contacto, password, genero, dia, mes, ano } = req.body;
        const rol = 'Padre';

        let errorN = null;
        let errorA = null;
        let errorUsu = null;
        let errorCon = null;
        let errorE = null;
        let errorD = null;


        // Verifica todos los campos excepto la foto
        if (!nombre || !apellido || !nomUsuario || !contacto || !password || !genero || !dia || !mes || !ano) {
            return res.render('/registro', {
                alert: true,
                alertTitle: "Advertencia",
                alertMessage: "Todos los campos son obligatorios",
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: '/registro',
                valoresAnteriores: req.body, // Pasa los valores introducidos previamente
                errorC: null,
                errorU: null,
                errorN: null,
                errorA: null,
                errorE: null,
                errorD: null,
            });
        }

        // Validar nombre y apellido
        if (!validarNombre(nombre)) {
            errorN = 'El nombre solo debe contener letras y espacios';
        }

        if (!validarApellido(apellido)) {
            errorA = 'El apellido solo debe contener letras y espacios';
        }

        if (!validarContacto(contacto)) {
            errorD = 'El contacto debe ser un numero o correo ';
        }

        // Si hay errores de validación, envía un mensaje de error y redirige
        if (errorN || errorA || errorD || errorUsu || errorCon) {
            return res.render('registro', {
                errorN,
                errorA,
                errorD,
                errorC: errorCon,
                errorU: errorUsu,
                errorE: "Por favor, vuelve a cargar la imagen.",
                valoresAnteriores: req.body
            });
        }

        // Ahora verifica la foto
        if (!req.file) {
            return res.render('registro', {
                alert: true,
                alertTitle: "Advertencia",
                alertMessage: "La foto es obligatoria",
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'registro',
                valoresAnteriores: req.body,
                errorC: null,
                errorU: null,
                errorN: null,
                errorA: null,
                errorE: null,
                errorD: null,
            });
        }

        let foto = '/uploads/' + req.file.filename;
        let encryptedPhoto = encrypt(foto);

        let encryptedContacto = encrypt(contacto);

        // Proceso de registro
        conexion.query('SELECT * FROM usuario', async (error, results) => {
            if (error) {
                console.error('Error al consultar la base de datos:', error);
                return res.redirect('/registro');
            }

            let isContactoRepeated = false;
            let isNomUsuarioRepeated = false;

            // Verificar si el nombre de usuario ya está en uso
            isNomUsuarioRepeated = results.some(user => user.nomUsuario === nomUsuario);

            for (let user of results) {
                try {
                    let decryptedContacto = decrypt(user.contacto);

                    if (decryptedContacto === contacto) {
                        isContactoRepeated = true;
                        break;
                    }
                } catch (error) {
                    console.error("Error al descifrar el contacto para el usuario:", error);
                }
            }

            if (isNomUsuarioRepeated) {
                errorUsu = 'El nombre de usuario ya está en uso';
            }
            if (isContactoRepeated) {
                errorCon = 'El contacto ya está en uso';
            }

            // Si hay errores de validación, envía un mensaje de error y redirige
            if (isNomUsuarioRepeated || isContactoRepeated) {
                console.log("Error de nombre de usuario o contacto repetido:", { errorUsu, errorCon });
                return res.render('registro', {
                    errorU: errorUsu,
                    errorC: errorCon,
                    errorN: null,
                    errorA: null,
                    errorD: null,
                    errorE: "Por favor, vuelve a cargar la imagen.",
                    valoresAnteriores: req.body
                });


            } else {
                let passHash = await bcryptjs.hash(password, 8);
                const fechaNacimiento = `${ano}-${mes}-${dia}`;

                conexion.query('INSERT INTO usuario SET ?', {
                    nombre, apellido, rol, nomUsuario, contacto: encryptedContacto, genero, fecha_nacimiento: fechaNacimiento, password: passHash, foto: encryptedPhoto
                }, (error, results) => {
                    if (error) {
                        console.error('Error al insertar en la base de datos:', error);
                        return res.redirect('/registro');
                    } else {
                        console.log('Registro exitoso');
                        const id = results.insertId;
                        const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
                            expiresIn: process.env.JWT_TIEMPO_EXPIRA
                        });

                        const cookiesOptions = {
                            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                            httpOnly: true
                        };
                        res.cookie('jwt', token, cookiesOptions);
                        res.render('padre/instructivo', {
                            user: { id, nombre, apellido, nomUsuario, contacto, genero, rol, foto }
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

exports.altaTutor = async (req, res) => {
    try {
        const { nombre, apellido, nomUsuario, contacto, password, genero, dia, mes, ano } = req.body;
        const rol = 'Tutor';

        const decodificado = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
        const usuarioRegistradorId = decodificado.id;

        let errorN = null;
        let errorA = null;
        let errorUsu = null;
        let errorCon = null;
        let errorE = null;
        let errorD = null;


        // Verifica todos los campos excepto la foto
        if (!nombre || !apellido || !nomUsuario || !contacto || !password || !genero || !dia || !mes || !ano) {
            return res.render('padre/alta', {
                autoclickRegister: true,
                alert: true,
                alertTitle: "Advertencia",
                alertMessage: "Todos los campos son obligatorios",
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                // valoresAnteriores: req.body, // Pasa los valores introducidos previamente
                errorC: null,
                errorU: null,
                errorN: null,
                errorA: null,
                errorE: null,
                errorD: null,
                user: req.user || null,
            });
        }

        // Validar nombre y apellido
        if (!validarNombre(nombre)) {
            errorN = 'El nombre solo debe contener letras y espacios';
        }

        if (!validarApellido(apellido)) {
            errorA = 'El apellido solo debe contener letras y espacios';
        }

        if (!validarContacto(contacto)) {
            errorD = 'El contacto debe ser un numero o correo ';
        }

        // Si hay errores de validación, envía un mensaje de error y redirige
        if (errorN || errorA || errorD || errorUsu || errorCon) {
            return res.render('padre/alta', {
                errorN,
                errorA,
                errorD,
                errorC: errorCon,
                errorU: errorUsu,
                autoclickRegister: true,
                // errorE: "Por favor, vuelve a cargar la imagen.",
                user: req.user || null,
                // valoresAnteriores: req.body
            });
        }

        // Ahora verifica la foto
        if (!req.file) {
            return res.render('padre/alta', {
                alert: true,
                alertTitle: "Advertencia",
                alertMessage: "La foto es obligatoria",
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'padre/alta',
                // valoresAnteriores: req.body,
                errorC: null,
                errorU: null,
                errorN: null,
                errorA: null,
                errorE: null,
                errorD: null,
                autoclickRegister: true,
                user: req.user || null,
            });
        }

        let foto = '/uploads/' + req.file.filename;
        let encryptedPhoto = encrypt(foto);

        let encryptedContacto = encrypt(contacto);

        // Verificar si el usuario o contacto ya existen
        conexion.query('SELECT * FROM usuario', async (error, results) => {
            if (error) {
                console.error('Error al consultar la base de datos:', error);
                return res.redirect('/registro');
            }

            let isContactoRepeated = false;
            let isNomUsuarioRepeated = false;

            // Verificar si el nombre de usuario ya está en uso
            isNomUsuarioRepeated = results.some(user => user.nomUsuario === nomUsuario);

            // Verificar si el contacto ya está en uso
            for (let user of results) {
                try {
                    let decryptedContacto = decrypt(user.contacto);

                    if (decryptedContacto === contacto) {
                        isContactoRepeated = true;
                        break;
                    }
                } catch (error) {
                }
            }
            if (isNomUsuarioRepeated) {
                errorUsu = 'El nombre de usuario ya está en uso';
            }
            if (isContactoRepeated) {
                errorCon = 'El contacto ya está en uso';
            }

            // Si hay errores de validación, envía un mensaje de error y redirige
            if (isNomUsuarioRepeated || isContactoRepeated) {
                console.log("Error de nombre de usuario o contacto repetido:", { errorUsu, errorCon });
                return res.render('padre/alta', {
                    errorU: errorUsu,
                    autoclickRegister: true,
                    user: req.user || null,
                    errorC: errorCon,
                    errorN: null,
                    errorA: null,
                    errorD: null,
                    // errorE: "Por favor, vuelve a cargar la imagen.",
                    // valoresAnteriores: req.body
                });

            } else {
                // Insertar el nuevo usuario
                let passHash = await bcryptjs.hash(password, 8);
                const fechaNacimiento = `${ano}-${mes}-${dia}`;

                conexion.query('INSERT INTO usuario SET ?', {
                    nombre, apellido, rol, nomUsuario, contacto: encryptedContacto, genero, fecha_nacimiento: fechaNacimiento, password: passHash, foto: encryptedPhoto
                }, (error, results) => {
                    if (error) {
                        console.error('Error al insertar en la base de datos:', error);
                        return res.redirect('/alta');
                    } else {
                        let nuevoUsuarioId = results.insertId;
                        conexion.query('INSERT INTO ListaTutores SET ?', {
                            usuario_registrador_id: usuarioRegistradorId,
                            tutor_id: nuevoUsuarioId
                        }, (error, results) => {
                            if (error) {
                                // Error al insertar en la tabla ListaTutores
                                console.error('Error al insertar en ListaTutores:', error);
                                return res.redirect('/rutaError');
                            } else {
                                // Tutor registrado con éxito en ambas tablas
                                return res.render('padre/alta', {
                                    alert: true,
                                    alertTitle: "Registro Exitoso",
                                    alertMessage: "El tutor ha sido registrado correctamente",
                                    alertIcon: 'success',
                                    showConfirmButton: true,
                                    timer: 3000,
                                    errorC: null,
                                    errorU: null,
                                    errorN: null,
                                    errorA: null,
                                    errorE: null,
                                    errorD: null,
                                    autoclickRegister: true,
                                    user: req.user || null,
                                });
                            }
                        });
                    }
                });
            }
        });
    } catch (error) {
        console.log("Error en el proceso de registro:", error);
        return res.redirect('/alta');
    }
};

exports.altaAlumno = async (req, res) => {
    try {
        const { nombre, apellido, nomUsuario, contacto, password, genero, dia, mes, ano } = req.body;
        const rol = 'Alumno';

        const decodificado = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
        const usuarioRegistradorId = decodificado.id;

        let errorN = null;
        let errorA = null;
        let errorUsu = null;
        let errorCon = null;
        let errorE = null;
        let errorD = null;


        // Verifica todos los campos excepto la foto
        if (!nombre || !apellido || !nomUsuario || !contacto || !password || !genero || !dia || !mes || !ano) {
            return res.render('padre/alta', {
                autoclickRegister: null,
                alert: true,
                alertTitle: "Advertencia",
                alertMessage: "Todos los campos son obligatorios",
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                // valoresAnteriores: req.body, // Pasa los valores introducidos previamente
                errorC: null,
                errorU: null,
                errorN: null,
                errorA: null,
                errorE: null,
                errorD: null,
                user: req.user || null,
            });
        }

        // Validar nombre y apellido
        if (!validarNombre(nombre)) {
            errorN = 'El nombre solo debe contener letras y espacios';
        }

        if (!validarApellido(apellido)) {
            errorA = 'El apellido solo debe contener letras y espacios';
        }

        if (!validarContacto(contacto)) {
            errorD = 'El contacto debe ser un numero o correo ';
        }

        // Si hay errores de validación, envía un mensaje de error y redirige
        if (errorN || errorA || errorD || errorUsu || errorCon) {
            return res.render('padre/alta', {
                errorN,
                errorA,
                errorD,
                errorC: errorCon,
                errorU: errorUsu,
                autoclickRegister: null,
                errorE: "Por favor, vuelve a cargar la imagen.",
                user: req.user || null,
                // valoresAnteriores: req.body
            });
        }

        // Ahora verifica la foto
        if (!req.file) {
            return res.render('padre/alta', {
                alert: true,
                alertTitle: "Advertencia",
                alertMessage: "La foto es obligatoria",
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'padre/alta',
                // valoresAnteriores: req.body,
                errorC: null,
                errorU: null,
                errorN: null,
                errorA: null,
                errorE: null,
                errorD: null,
                autoclickRegister: null,
                user: req.user || null,
            });
        }

        let foto = '/uploads/' + req.file.filename;
        let encryptedPhoto = encrypt(foto);

        let encryptedContacto = encrypt(contacto);

        // Verificar si el usuario o contacto ya existen
        conexion.query('SELECT * FROM usuario', async (error, results) => {
            if (error) {
                console.error('Error al consultar la base de datos:', error);
                return res.redirect('/alta');
            }

            let isContactoRepeated = false;
            let isNomUsuarioRepeated = false;

            // Verificar si el nombre de usuario ya está en uso
            isNomUsuarioRepeated = results.some(user => user.nomUsuario === nomUsuario);

            // Verificar si el contacto ya está en uso
            for (let user of results) {
                try {
                    let decryptedContacto = decrypt(user.contacto);

                    if (decryptedContacto === contacto) {
                        isContactoRepeated = true;
                        break;
                    }
                } catch (error) {
                    console.error("Error al descifrar el contacto para el usuario:", error);
                }
            }


            if (isNomUsuarioRepeated) {
                errorUsu = 'El nombre de usuario ya está en uso';
            }
            if (isContactoRepeated) {
                errorCon = 'El contacto ya está en uso';
            }

            // Si hay errores de validación, envía un mensaje de error y redirige
            if (isNomUsuarioRepeated || isContactoRepeated) {
                return res.render('padre/alta', {
                    errorU: errorUsu,
                    autoclickRegister: null,
                    user: req.user || null,
                    errorC: errorCon,
                    errorN: null,
                    errorA: null,
                    errorD: null,
                    // errorE: "Por favor, vuelve a cargar la imagen.",
                    // valoresAnteriores: req.body
                });

            } else {
                // Insertar el nuevo usuario
                let passHash = await bcryptjs.hash(password, 8);
                const fechaNacimiento = `${ano}-${mes}-${dia}`;

                conexion.query('INSERT INTO usuario SET ?', {
                    nombre, apellido, rol, nomUsuario, contacto: encryptedContacto, genero, fecha_nacimiento: fechaNacimiento, password: passHash, foto: encryptedPhoto
                }, (error, results) => {
                    if (error) {
                        console.error('Error al insertar en la base de datos:', error);
                        return res.redirect('/alta');
                    } else {
                        console.log('Registro exitoso');

                        let nuevoUsuarioId = results.insertId;
                        conexion.query('INSERT INTO ListaAlumnos SET ?', {
                            usuario_registrador_id: usuarioRegistradorId,
                            alumno_id: nuevoUsuarioId
                        }, (error, results) => {
                            if (error) {
                                // Error al insertar en la tabla ListaAlumnos
                                console.error('Error al insertar en ListaAlumnos:', error);
                                return res.redirect('/alta');
                            } else {
                                return res.render('padre/alta', {
                                    alert: true,
                                    alertTitle: "Registro Exitoso",
                                    alertMessage: "El alumno ha sido registrado correctamente",
                                    alertIcon: 'success',
                                    showConfirmButton: true,
                                    timer: 3000,
                                    errorC: null,
                                    errorU: null,
                                    errorN: null,
                                    errorA: null,
                                    errorE: null,
                                    errorD: null,
                                    autoclickRegister: null,
                                    user: req.user || null,
                                });
                            }
                        });
                    }
                });
            }
        });
    } catch (error) {
        console.log("Error en el proceso de registro:", error);
        return res.redirect('/alta');
    }
};

exports.login = async (req, res) => {
    try {
        const nomUsuario = req.body.nomUsuario;
        const password = req.body.password;
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

        if (!nomUsuario || !password) {
            res.render('login', {
                alert: true,
                alertTitle: "Advertencia",
                alertMessage: "Ingrese un usuario y password",
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'login',
                valoresAnteriores,
                errorC: null,
                errorU: null,
                errorN: null,
                errorE: null,
                errorA: null,
                errorD: null,
            })
        } else
            conexion.query('SELECT * FROM usuario WHERE nomUsuario = ?', [nomUsuario], async (error, results) => {
                if (error) {
                    console.error('Error en la consulta a la base de datos:', error);
                    return res.redirect('/login'); // Redireccionar con un mensaje de error
                } else if (results.length > 0 && await bcryptjs.compare(password, results[0].password)) {
                    const rol = results[0].rol;

                    const id = results[0].ID_usuario;

                    // Crear un token JWT
                    const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
                        expiresIn: process.env.JWT_TIEMPO_EXPIRA
                    });

                    // Configurar las opciones de las cookies
                    const cookiesOptions = {
                        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                        httpOnly: true
                    };

                    // Establecer la cookie con el token JWT
                    res.cookie('jwt', token, cookiesOptions);


                    const usuario = results[0];
                    if (usuario.foto && pareceCifrado(usuario.foto)) {
                        usuario.foto = decrypt(usuario.foto);
                    }

                    if (rol === 'Tutor') {
                        // Redirige al inicio de sesión de tutor
                        res.render('tutor/principal', {
                            alert: true,
                            alertTitle: "Conexión exitosa",
                            alertMessage: "¡Bienvenido Tutor!",
                            alertIcon: 'success',
                            showConfirmButton: false,
                            timer: 800,
                            ruta: 'tutor/principal',
                            tutor: usuario // Puedes pasar los datos del tutor aquí
                        });
                    } else if (rol === 'Alumno') {
                        // Redirige al inicio de sesión de alumno
                        res.render('alumno/inicio', {
                            alert: true,
                            alertTitle: "Conexión exitosa",
                            alertMessage: "¡Bienvenido Alumno!",
                            alertIcon: 'success',
                            showConfirmButton: false,
                            timer: 800,
                            ruta: 'alumno/inicio',
                            alumno: usuario // Puedes pasar los datos del alumno aquí
                        });
                    } else if (rol === 'Padre') {
                        // Redirige al inicio de sesión de padre
                        res.render('padre/inicio', {
                            alert: true,
                            alertTitle: "Conexión exitosa",
                            alertMessage: "¡Bienvenido Padre!",
                            alertIcon: 'success',
                            showConfirmButton: false,
                            timer: 800,
                            ruta: 'padre/inicio',
                            user: usuario
                        });
                    }
                    else if (rol === 'Administrador') {
                        // Redirige al inicio de sesión de padre
                        res.render('administrador/inicio', {
                            alert: true,
                            alertTitle: "Conexión exitosa",
                            alertMessage: "¡Bienvenido Administrador!",
                            alertIcon: 'success',
                            showConfirmButton: false,
                            timer: 800,
                            ruta: 'administrador/inicio',
                            admin: usuario
                        });
                    }
                } else {
                    // Usuario no encontrado o contraseña incorrecta, maneja según tus necesidades
                    console.log('Contraseña incorrecta para el rol de administrador');
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
                        errorU: null,
                        errorN: null,
                        errorA: null,
                        errorE: null,
                        errorD: null,

                        // No es necesario enviar valoresAnteriores, errorC, o errorU si no los usas en tu vista.
                    });

                }
            });
    } catch (error) {
        console.error('Error en el proceso de login:', error);
        return res.redirect('/login');
    }
};

exports.isAuthenticated = async (req, res, next) => {
    if (req.cookies.jwt) {

        try {
            const decodificado = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);

            conexion.query('SELECT * FROM usuario WHERE ID_usuario = ?', [decodificado.id], (error, results) => {
                if (error) {
                    return res.redirect('/login');
                }

                if (results && results.length > 0) {
                    const usuario = results[0];

                    if (usuario.foto && pareceCifrado(usuario.foto)) {
                        usuario.foto = decrypt(usuario.foto);
                    }


                    switch (usuario.rol) {
                        case 'Padre':
                            req.user = usuario;
                            break;

                        case 'Alumno':
                            req.alumno = usuario;
                            break;

                        case 'Tutor':
                            req.tutor = usuario;
                            break;

                        case 'Administrador':
                            req.administrador = usuario;
                            break;

                    }

                    return next();
                } else {
                    return res.redirect('/login');
                }
            });


        } catch (error) {
            return res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
};







exports.cambiarFoto = async (req, res) => {
    try {
        if (!req.cookies.jwt) {
            // Si no hay JWT en las cookies, redireccionar al login
            return res.redirect('/login');
        }

        const decodificado = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
        const usuarioId = decodificado.id; // Obteniendo el ID del usuario del token

        const nuevaFoto = req.file ? '/uploads/' + req.file.filename : null;

        if (nuevaFoto) {
            // Actualizar la base de datos con la nueva foto
            conexion.query('UPDATE usuario SET foto = ? WHERE ID_usuario = ?', [nuevaFoto, usuarioId], (error, results) => {
                if (error) {
                    console.error('Error al actualizar la foto en la base de datos:', error);
                    return res.redirect('/inicio');
                }

                console.log('Foto de perfil actualizada');
                return res.redirect('/perfil');
            });
        } else {
            console.error('No se subió ninguna foto');
            return res.redirect('/perfil');
        }
    } catch (error) {
        console.error('Error en el controlador cambiarFoto:', error);
        return res.redirect('/inicio');
    }
};

exports.logout = (req, res) => {
    res.clearCookie('jwt')
    return res.redirect('/login')
}


