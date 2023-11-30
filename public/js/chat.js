//SE TRAEN LAS ID'S DE LOS USUARIOS 
let destinatarioId;
let nombresUsuarios = {};
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





document.getElementById('formulario-busqueda').addEventListener('submit', function (e) {
    e.preventDefault();
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
        })
        .catch(error => console.error('Error:', error));
});


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
}

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
    const contenedorMensajes = document.querySelector('.conversation-wrapper');
    contenedorMensajes.innerHTML = '';

    mensajes.forEach(mensaje => {
        const mensajeElemento = document.createElement('li');
        mensajeElemento.classList.add('mensaje');
        mensajeElemento.textContent = mensaje.contenido; // Asegúrate de ajustar según la estructura de tus datos
        contenedorMensajes.appendChild(mensajeElemento);
    });
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

// function manejarEnvioMensaje(e) {
//     e.preventDefault();

//     usuarioId = document.getElementById('userId').textContent;
//     usuarioId = usuarioId.trim();
//     usuarioId = parseInt(usuarioId, 10);

//     const ID_destinatario = document.getElementById('destinatarioId').value; 

//     const mensajeInput = document.querySelector('.conversation-form-input');
//     const mensaje = mensajeInput.value;

//     if (mensaje) {
//         socket.emit('enviar mensaje', {
//             ID_remitente: usuarioId,
//             ID_destinatario: ID_destinatario,
//             contenido: mensaje
//         });

//         mensajeInput.value = '';
//     }
// }


function manejarEnvioMensaje(e) {
    e.preventDefault();

    // Obtener los detalles necesarios
    const mensajeInput = document.querySelector('.conversation-form-input');
    const mensaje = mensajeInput.value;
    const ID_destinatario = document.getElementById('destinatarioId').value;
    const nombreDestinatario = nombresUsuarios[ID_destinatario];

    if (mensaje) {
        socket.emit('enviar mensaje', {
            ID_remitente: usuarioId,
            ID_destinatario: ID_destinatario,
            contenido: mensaje,
            nombreDestinatario: nombreDestinatario, // Reemplaza con el nombre real
            vistaPreviaMensaje: mensaje.substring(0, 30) // Vista previa del mensaje
        });
        mensajeInput.value = '';
    }
}

function actualizarVistaPreviaChat(ID_destinatario, nombre, vistaPreviaMensaje) {
    // Encuentra o crea un elemento en la lista de chats recientes
    // Actualiza la vista previa del mensaje, el nombre del destinatario y la hora
    // Ejemplo:
    let chatExistente = document.querySelector(`#chat_${ID_destinatario}`);
    if (!chatExistente) {
        // Crear un nuevo elemento de lista si no existe
        chatExistente = document.createElement('li');
        chatExistente.id = `chat_${ID_destinatario}`;
        // Agregar el elemento a la lista de chats recientes
        document.querySelector('.content-messages-list').appendChild(chatExistente);
    }

    // Actualizar el contenido del chatExistente
    chatExistente.innerHTML = `
        <a href="#" data-conversation="#conversation_${ID_destinatario}">
            <span class="content-message-name">${nombre}</span>
            <span class="content-message-text">${vistaPreviaMensaje}</span>
            <span class="content-message-time">${new Date().toLocaleTimeString()}</span>
        </a>
    `;
}


