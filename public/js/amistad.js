
let usuarioId;


//MOSTRAR TODOS LOS TUTORES 
window.onload = function () {
    fetch('/Corluss/api/amistad/tutores')
        .then(response => response.json())
        .then(data => {
            const listaTutores = document.getElementById('listaTutores');
            listaTutores.innerHTML = '<h2>Padres Disponibles</h2>';
            data.data.forEach(tutor => {
                listaTutores.innerHTML += `<p>${tutor.nomUsuario}</p>`;
            });
        })
        .catch(error => console.error('Error:', error));
};

//MOSTRAR LOS TUTORES POR BARRA DE BUSQUEDA
document.getElementById('botonBuscar').addEventListener('click', function () {
    usuarioId = document.getElementById('userId').textContent; // Asegúrate de que este elemento exista y tenga el ID del usuario actual
    const terminoBusqueda = document.getElementById('busquedaTutor').value;
    fetch(`/Corluss/api/amistad/buscar/tutores?q=${encodeURIComponent(terminoBusqueda)}`)
        .then(response => response.json())
        .then(data => {
            const listaResultados = document.getElementById('resultadosBusqueda');
            listaResultados.innerHTML = '';
            data.data.forEach(padre => {
                const li = document.createElement('li');
                li.classList.add('resultado-tutor'); // Añadir una clase para poder estilizarlo si es necesario

                const nombreUsuario = document.createElement('span');
                nombreUsuario.textContent = padre.nomUsuario;
                li.appendChild(nombreUsuario);

                const botonSolicitud = document.createElement('button');
                botonSolicitud.textContent = 'Enviar Solicitud';
                botonSolicitud.classList.add('boton-enviar-solicitud'); // Añade la clase al botón
                botonSolicitud.onclick = () => enviarSolicitud(padre.ID_usuario, botonSolicitud);

                li.appendChild(botonSolicitud);

                // Agregar un span para el mensaje de estado de la solicitud
                const estadoSolicitud = document.createElement('span');
                estadoSolicitud.classList.add('estado-solicitud');
                estadoSolicitud.id = `estado-solicitud-${padre.ID_usuario}`; // Un ID único para cada mensaje de estado
                li.appendChild(estadoSolicitud);

                listaResultados.appendChild(li);
            });
        })
        .catch(error => console.error('Error:', error));
});

//FUNCION PARA ENVIAR LAS SOLICITUDES DE AMISTAD
function enviarSolicitud(receptorId, boton) {
    const estadoSolicitud = document.getElementById(`estado-solicitud-${receptorId}`);

    fetch('/Corluss/api/amistad/enviar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ solicitante_id: usuarioId, receptor_id: receptorId })
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 409) {
                    // Analizar la respuesta para determinar el mensaje a mostrar
                    response.json().then(data => {
                        if (data.esEmisor) {
                            estadoSolicitud.textContent = 'Ya has enviado una solicitud a este usuario';
                        } else {
                            estadoSolicitud.textContent = 'Este usuario ya te ha enviado una solicitud. Por favor, responde la solicitud pendiente.';
                        }
                        estadoSolicitud.style.color = 'red';
                        boton.disabled = true;
                    });
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } else {
                return response.json();
            }
        })
        .then(data => {
            // Si la solicitud fue exitosa y se recibió una respuesta, actualiza el mensaje de estado
            estadoSolicitud.textContent = 'Solicitud enviada';
            estadoSolicitud.style.color = 'green';
            boton.disabled = true; // Opcional: deshabilitar el botón
        })
        .catch(error => {
            // Si hubo un error en la red o en la respuesta, muestra el mensaje en la consola y en la interfaz de usuario
            console.error('Error al enviar la solicitud de amistad:', error);
            estadoSolicitud.textContent = 'Error al enviar solicitud';
            estadoSolicitud.style.color = 'red';
        });
}

//MOSTRAR SOLICITUDES PENDIENTES

document.addEventListener("DOMContentLoaded", function () {
    const usuarioId = document.getElementById("userId").textContent.trim();
    mostrarSolicitudesPendientes(usuarioId);
});


function mostrarSolicitudesPendientes(usuarioId) {
    console.log("HOLA")
    fetch(`/Corluss/api/amistad/solicitudes/${usuarioId.trim()}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
    })
        .then(data => {
            const contenedorSolicitudes = document.getElementById('contenedor-solicitudes'); // Asegúrate de tener este elemento en tu HTML
            contenedorSolicitudes.innerHTML = ''; // Limpia el contenedor antes de mostrar nuevas solicitudes

            data.solicitudes.forEach(solicitud => {
                const solicitudElemento = document.createElement('div');
                solicitudElemento.classList.add('solicitud');

                const textoSolicitud = document.createElement('p');
                textoSolicitud.textContent = `Solicitud de ${solicitud.nombre_solicitante}`; // Asume que 'nombre_solicitante' es parte de la respuesta de la API

                const botonAceptar = document.createElement('button');
                botonAceptar.textContent = 'Aceptar';
                botonAceptar.onclick = () => aceptarSolicitud(solicitud.id, usuarioId); // Asegúrate de definir esta función

                const botonRechazar = document.createElement('button');
                botonRechazar.textContent = 'Rechazar';
                botonRechazar.onclick = () => rechazarSolicitud(solicitud.id, usuarioId); // Asegúrate de definir esta función

                solicitudElemento.appendChild(textoSolicitud);
                solicitudElemento.appendChild(botonAceptar);
                solicitudElemento.appendChild(botonRechazar);

                contenedorSolicitudes.appendChild(solicitudElemento);
            });
        })
        .catch(error => {
            console.error('Error al obtener solicitudes pendientes:', error);
        });
}

//ACEPTAR SOLICITUDES
function aceptarSolicitud(solicitudId, usuarioId) {
    fetch('/Corluss/api/amistad/aceptar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ solicitudId: solicitudId, usuarioId: usuarioId })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al procesar la solicitud');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById(`solicitud-${solicitudId}`).innerHTML = `
            <span class="success-message">Solicitud aceptada con éxito</span>
        `;
    })
    .catch(error => {
        document.getElementById(`error-${solicitudId}`).textContent = error.message;
    });
}


//RECHAZAR SOLICITUDES
function rechazarSolicitud(solicitudId, usuarioId) {
    fetch('/api/amistad/rechazar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ solicitudId: solicitudId, usuarioId: usuarioId })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al procesar la solicitud');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById(`solicitud-${solicitudId}`).innerHTML = `
            <span class="error-message">Solicitud rechazada</span>
        `;
    })
    .catch(error => {
        document.getElementById(`error-${solicitudId}`).textContent = error.message;
    });
}



function actualizarEstadoSolicitud(solicitudId, mensaje, esAceptada) {
    const contenedorSolicitudes = document.getElementById('contenedor-solicitudes');
    const elementoSolicitud = document.getElementById(`solicitud-${solicitudId}`);
    
    // Si el elemento específico de la solicitud no existe, crea uno nuevo.
    if (!elementoSolicitud) {
        const nuevoElementoSolicitud = document.createElement('div');
        nuevoElementoSolicitud.id = `solicitud-${solicitudId}`;
        contenedorSolicitudes.appendChild(nuevoElementoSolicitud);
    }
    
    // Actualiza el mensaje del elemento específico de la solicitud.
    document.getElementById(`solicitud-${solicitudId}`).textContent = mensaje;
    
    // Si la solicitud fue aceptada o rechazada, elimina los botones.
    if (esAceptada !== undefined) {
        const botonAceptar = document.getElementById(`aceptar-${solicitudId}`);
        const botonRechazar = document.getElementById(`rechazar-${solicitudId}`);
        botonAceptar && botonAceptar.remove();
        botonRechazar && botonRechazar.remove();
    }
}





