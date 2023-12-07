//SE TRAEN LAS ID'S DE LOS USUARIOS 
let destinatarioId;
let nombresUsuarios = {};
let usuarioActual = {};
let usuarioId = document.getElementById('userId').textContent.trim();

//SE INICIA EL SOCKET
const socket = io(); 

//SE CAMBIA EL ESTADO 
socket.emit('nuevo usuario', { id: usuarioId }, (esUsuarioNuevo) => {
    if (esUsuarioNuevo) {
        console.log('Usuario conectado y registrado en el servidor');
    } else {
        console.log('El usuario ya estaba conectado');
    }
});


//CIERRE DE SOCKET
document.getElementById('boton-cerrar-sesion').addEventListener('click', (e) => {
    e.preventDefault(); // Prevenir la acción por defecto del enlace

    // Emitir evento de cierre de sesión al servidor
    socket.emit('cerrar sesion', { userId: socket.userId });

    // Desconectar el socket
    socket.disconnect();

    // Redireccionar al usuario a la página de cierre de sesión
    window.location.href = e.target.href;
});


//BUSQUEDA DE USUARIOS
document.getElementById('formulario-busqueda').addEventListener('submit', function (e) {
    e.preventDefault();
    realizarBusqueda();
});

// Realizar la búsqueda de usuarios y mostrar los resultados
function realizarBusqueda() {
    let busqueda = document.getElementById('campo-busqueda').value;

    fetch('/Corluss/api/chat/buscar', {
        method: 'POST',
        body: JSON.stringify({ busqueda: busqueda }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        mostrarResultados(data);
        document.getElementById('resultados-busqueda').style.display = 'block';
        document.getElementById('boton-cerrar').style.display = 'block';
        document.getElementById('boton-busqueda').innerHTML = '<i class="ri-close-line"></i>'; // Cambia el ícono a 'X'
    })
    .catch(error => console.error('Error:', error));
}


//MUESTRO DE LA BUSQUEDA
function mostrarResultados(resultados) {
    const contenedorResultados = document.getElementById('resultados-busqueda');
    contenedorResultados.innerHTML = '';

    resultados.forEach(resultado => {
        const elemento = document.createElement('div');
        elemento.classList.add('user-result');

        // Agregar imagen y nombre del usuario
        const img = document.createElement('img');
        img.src = resultado.foto; // Asegúrate de que 'fotoPerfil' es la propiedad correcta
        img.alt = resultado.nomUsuario;
        img.classList.add('content-message-image');

        const name = document.createElement('div');
        name.textContent = resultado.nomUsuario;
        name.classList.add('content-message-name');

        elemento.appendChild(img);
        elemento.appendChild(name);

        // Añadir evento de clic para abrir el chat
        elemento.addEventListener('click', function () {
            abrirChat(resultado);
        });

        contenedorResultados.appendChild(elemento);
    });
}

// Manejo del evento de clic para cerrar los resultados
document.getElementById('boton-cerrar').addEventListener('click', function() {
    document.getElementById('resultados-busqueda').style.display = 'none';
    this.style.display = 'none';
    document.getElementById('boton-busqueda').innerHTML = '<i class="ri-search-line"></i>'; // Revierte el ícono a la lupa
});


function abrirChat(usuario) {
    const userImage = document.querySelector('.conversation-user-image');
    const userName = document.querySelector('.conversation-user-name');
    const userStatus = document.querySelector('.conversation-user-status');

    userImage.src = usuario.foto;
    userName.textContent = usuario.nomUsuario;
    userStatus.textContent = usuario.estado_conexion; // Actualizar con el estado real del usuario

    obtenerMensajesDelServidor(usuario.ID_usuario);
  

    // Muestra la conversación y oculta la vista por defecto
    document.querySelector('.conversation-default').classList.remove('active');
    document.querySelector('#conversation-1').classList.add('active');
    document.getElementById('destinatarioId').value = usuario.ID_usuario;

     // Actualizar el caché de nombres de usuario
     nombresUsuarios[usuario.ID_usuario] = usuario.nomUsuario;
    document.getElementById('boton-cerrar').click();
    
    const userStatusIndicator = document.getElementById('user-status-indicator');
    if (usuario.estado_conexion === 'En linea') {
        userStatusIndicator.classList.remove('offline'); // Asegúrate de que el indicador sea visible
        userStatus.textContent = 'En línea';
    } else {
        userStatusIndicator.classList.add('offline'); // Oculta el indicador
        userStatus.textContent = 'Desconectado';
    }
    

    usuarioActual = {
        id: usuario.ID_usuario,
        nombre: usuario.nomUsuario,
        foto: usuario.foto
    };
     
}



function actualizarEstadoUsuario(estaEnLinea) {
    const estadoIndicador = document.querySelector('.status-indicator');
    
    if(estaEnLinea) {
        estadoIndicador.classList.remove('offline');
        estadoIndicador.style.backgroundColor = 'green'; // O el color que elijas
    } else {
        estadoIndicador.classList.add('offline');
        estadoIndicador.style.backgroundColor = 'gray'; // O el color para el estado "offline"
    }
}



async function cargarConversacionesRecientes() {
    try {
        const response = await fetch('/Corluss/api/chat/conversacionesRecientes');
        const conversaciones = await response.json();
        mostrarConversacionesRecientes(conversaciones);
    } catch (error) {
        console.error('Error al cargar conversaciones:', error);
    }
}

function mostrarConversacionesRecientes(conversaciones) {
    const lista = document.querySelector('.content-messages-list');

    conversaciones.forEach(conv => {
        const elemento = document.createElement('li');
        elemento.innerHTML = `
            <a href="#" data-conversation="#conversation-${conv.ID_usuario}" data-id-usuario="${conv.ID_usuario}">
                <img class="content-message-image" src="${conv.foto}" alt="${conv.nomUsuario}">
                <span class="content-message-info">
                    <span class="content-message-name">${conv.nomUsuario}</span>
                    <span class="content-message-text">${conv.ultimoMensaje}</span>
                </span>
                <span class="content-message-more">
                    <span class="content-message-time">${new Date(conv.timestamp).toLocaleTimeString()}</span>
                </span>
            </a>
        `;
        lista.appendChild(elemento);

        elemento.querySelector('a').addEventListener('click', function (e) {
            e.preventDefault();
            const ID_usuario = this.getAttribute('data-id-usuario'); // Asegúrate de obtener correctamente el ID
            console.log('ID_usuario a abrir en el chat:', ID_usuario);
            abrirChatPorID(ID_usuario);
        });
    });
}


function abrirChatPorID(ID_usuario) {
    if (!ID_usuario) {
        console.error('No se proporcionó un ID de usuario válido.');
        return;
    }
    fetch(`/Corluss/api/chat/usuario/${ID_usuario}`)
        .then(response => response.json())
        .then(usuario => {
            abrirChat(usuario); // Llamada a tu función existente
        })
        .catch(error => console.error('Error al obtener información del usuario:', error));
}

// Llamada a cargarConversacionesRecientes al cargar la página
document.addEventListener('DOMContentLoaded', cargarConversacionesRecientes);





async function obtenerMensajesDelServidor(ID_destinatario) {
    usuarioId = document.getElementById('userId').textContent.trim();

    try {
        let respuesta = await fetch('/Corluss/api/chat/obtenerMensajes', {
            method: 'POST',
            body: JSON.stringify({ ID_remitente: usuarioId, ID_destinatario: ID_destinatario }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        let mensajes = await respuesta.json();
        mostrarMensajesEnInterfaz(mensajes);
    } catch (error) {
        console.error('Error al obtener los mensajes:', error);
    }
}

function mostrarMensajesEnInterfaz(mensajes) {
    // Depuración: Asegurarse de que tenemos el usuarioId correcto
    console.log('Usuario ID actual:', usuarioId);

    const contenedorMensajes = document.querySelector('.conversation-wrapper');
    contenedorMensajes.innerHTML = '';

    mensajes.forEach(mensaje => {
        console.log('Procesando mensaje:', mensaje);
        const esMensajeDeRemitente = Number(mensaje.ID_remitente) === Number(usuarioId);


        // Depuración: Verificar si el mensaje es del remitente o no
        console.log('Es mensaje del remitente:', esMensajeDeRemitente);

        const claseMensaje = esMensajeDeRemitente ? 'emisor' : 'receptor';
        const claseContenido = esMensajeDeRemitente ? 'contenido-enviado' : 'contenido-recibido';

        // Depuración: Verificar las clases que se asignarán al mensaje
        console.log('Clases asignadas:', claseMensaje, claseContenido);

        // Crear el elemento de mensaje y asignar clases
        const mensajeElemento = document.createElement('li');
        mensajeElemento.classList.add('mensaje', claseMensaje);

        // Configurar el contenido interno del mensaje
        mensajeElemento.innerHTML = `
            <div class="${claseContenido}">
                <p class="texto-mensaje">${mensaje.contenido}</p>
            </div>
        `;

        // Añadir el mensaje al contenedor
        contenedorMensajes.appendChild(mensajeElemento);
    });

    // Depuración: Verificar el HTML resultante en el contenedor de mensajes
    console.log('HTML del contenedor de mensajes:', contenedorMensajes.innerHTML);
}


//ENVIAR MENSAJE
document.addEventListener('DOMContentLoaded', function () {
    const formMensaje = document.getElementById('form-mensaje');

    if (formMensaje) {
        formMensaje.addEventListener('submit', manejarEnvioMensaje);
    } else {
        console.error('El formulario de mensaje no se encontró en el DOM');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const textareaMensaje = document.querySelector('.conversation-form-input');
    const formMensaje = document.getElementById('form-mensaje');

    if (formMensaje) {
        formMensaje.addEventListener('submit', manejarEnvioMensaje);

        // Detector de eventos para la tecla Enter en el campo de texto
        textareaMensaje.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevenir salto de línea en caso de presionar Enter
                formMensaje.dispatchEvent(new Event('submit')); // Disparar el evento de envío
            }
        });
    } else {
        console.error('El formulario de mensaje no se encontró en el DOM');
    }
});


function manejarEnvioMensaje(e) {
    e.preventDefault();

    const mensajeInput = document.querySelector('.conversation-form-input');
    const mensaje = mensajeInput.value;
    const ID_destinatario = document.getElementById('destinatarioId').value;
    const nombreDestinatario = nombresUsuarios[ID_destinatario];
    document.querySelector('.conversation-form-input').value = '';

    if (mensaje) {
        socket.emit('enviar mensaje', {
            ID_remitente: usuarioId,
            ID_destinatario: ID_destinatario,
            contenido: mensaje,
            nombreDestinatario: nombreDestinatario, // Reemplaza con el nombre real
            vistaPreviaMensaje: mensaje.substring(0, 30) // Vista previa del mensaje
        });
        agregarMensajeAlContenedor({ ID_remitente: usuarioId, contenido: mensaje });
        
        mensajeInput.value = '';
    }
    actualizarVistaPreviaConversacion(ID_destinatario, {
        contenido: mensaje,
        timestamp: Date.now(),
        foto: usuarioActual.foto, // Usar la foto almacenada
        nomUsuario: usuarioActual.nombre
    });

    mensajeInput.value = '';
}

function agregarMensajeAlContenedor(mensaje) {
    const contenedorMensajes = document.querySelector('.conversation-wrapper');
    const esMensajeDeRemitente = Number(mensaje.ID_remitente) === Number(usuarioId);
    const claseMensaje = esMensajeDeRemitente ? 'emisor' : 'receptor';
    const claseContenido = esMensajeDeRemitente ? 'contenido-enviado' : 'contenido-recibido';

    const mensajeElemento = document.createElement('li');
    mensajeElemento.classList.add('mensaje', claseMensaje);

    mensajeElemento.innerHTML = `
        <div class="${claseContenido}">
            <p class="texto-mensaje">${mensaje.contenido}</p>
        </div>
    `;

    contenedorMensajes.appendChild(mensajeElemento);
}

socket.on('mensaje recibido', (mensaje) => {
    if (mensaje.ID_destinatario === usuarioId) {
        agregarMensajeAlContenedor(mensaje);
    }
});


function actualizarVistaPreviaConversacion(ID_usuario, ultimoMensaje) {
    const lista = document.querySelector('.content-messages-list');
    const conversacionExistente = document.querySelector(`a[data-id-usuario="${ID_usuario}"]`);

    if (conversacionExistente) {
        // Actualizar la vista previa del mensaje y la hora
        conversacionExistente.querySelector('.content-message-text').textContent = ultimoMensaje.contenido;
        conversacionExistente.querySelector('.content-message-time').textContent = new Date(ultimoMensaje.timestamp).toLocaleTimeString();
    } else {
        // Crear una nueva entrada en la lista si la conversación no existe
        const elemento = document.createElement('li');
        elemento.innerHTML = `
            <a href="#" data-conversation="#conversation-${ID_usuario}" data-id-usuario="${ID_usuario}">
                <img class="content-message-image" src="${ultimoMensaje.foto}" alt="${ultimoMensaje.nomUsuario}">
                <span class="content-message-info">
                    <span class="content-message-name">${ultimoMensaje.nomUsuario}</span>
                    <span class="content-message-text">${ultimoMensaje.contenido}</span>
                </span>
                <span class="content-message-more">
                    <span class="content-message-time">${new Date(ultimoMensaje.timestamp).toLocaleTimeString()}</span>
                </span>
            </a>
        `;
        lista.appendChild(elemento);

        // Agregar evento de clic para abrir la conversación
        elemento.querySelector('a').addEventListener('click', function (e) {
            e.preventDefault();
            abrirChatPorID(ID_usuario);
        });
    }
}
