//Validaciones
document.addEventListener("DOMContentLoaded", function () {
    var imageInput = document.getElementById('image');
    var videoInput = document.getElementById('video');

    imageInput.addEventListener('change', function () {
        if (this.files.length > 0) {
            videoInput.disabled = true;
        } else {
            videoInput.disabled = false;
        }
    });

    videoInput.addEventListener('change', function () {
        if (this.files.length > 0) {
            imageInput.disabled = true;
        } else {
            imageInput.disabled = false;
        }
    });
});

//Registrar y mostrar  
 
document.getElementById("formPublicacion").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    fetch('/Corluss/publicar', {
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.publicacion) {
                agregarPublicacionAlDOM(data.publicacion);
                limpiarFormulario();
            }
        })
        .catch((error) => console.error('Error:', error));
});

function agregarPublicacionAlDOM(publicacion) {
    const contenedor = document.getElementById('contenedorPublicaciones');
    const divPublicacion = document.createElement('div');
    divPublicacion.classList.add('publicacion');

    const htmlPublicacion = `
<div class="profile-container">
    <img src="/Corluss${publicacion.foto}" alt="Foto de perfil" class="profile-picture">
        <span>${publicacion.nombre}</span>
        <span class="date">${new Date(publicacion.fecha_publicacion).toLocaleDateString()}</span>
</div>
<br>
<br>
    <p>${publicacion.contenido}</p>
    <br>
    ${publicacion.imagen ? `<img src="/Corluss${publicacion.imagen}" alt="Imagen publicación" style="display: block; max-width: 50%; height: auto; margin: auto; border-radius: 10px;">` : ''}
    ${publicacion.video ? `<video src="/Corluss${publicacion.video}" controls style="display: block; width: 50%; height: auto; margin: auto; border-radius: 10px;"></video>` : ''}
    <button type="button" class="comment-button" onclick="abrirComentariosPopup(${publicacion.ID_publicacion})">Comentar</button>


`;
    divPublicacion.innerHTML = htmlPublicacion;
    contenedor.prepend(divPublicacion);
}

function limpiarFormulario() {
    document.getElementById("formPublicacion").reset();
    // Si necesitas resetear algo más, como vistas previas de imágenes, etc., lo haces aquí
}

//Mostrar publicaciones
document.addEventListener("DOMContentLoaded", function () {
    fetch('/Corluss/obtener-publicaciones')
        .then(response => response.json())
        .then(publicaciones => mostrarPublicaciones(publicaciones))
        .catch(error => console.error('Error:', error));
});

function mostrarPublicaciones(publicaciones) {
    const contenedor = document.getElementById('contenedorPublicaciones');

    publicaciones.forEach(publicacion => {
        const divPublicacion = document.createElement('div');
        divPublicacion.classList.add('publicacion');

        const htmlPublicacion = `
<div class="profile-container">
    <img src="/Corluss${publicacion.foto}" alt="Foto de perfil" class="profile-picture">
    <span>${publicacion.nombre}</span>
    <span class="date">${new Date(publicacion.fecha_publicacion).toLocaleDateString()}</span>
</div>
<br><br>
<p>${publicacion.contenido}</p>
<br>
${publicacion.imagen ? `<img src="/Corluss${publicacion.imagen}" alt="Imagen publicación" style="display: block; max-width: 50%; height: auto; margin: auto; border-radius: 10px;">` : ''}
${publicacion.video ? `<video src="/Corluss${publicacion.video}" controls style="display: block; width: 50%; height: auto; margin: auto; border-radius: 10px;"></video>` : ''}
<button type="button" class="comment-button">Comentar</button>
`;

        divPublicacion.innerHTML = htmlPublicacion;
        contenedor.appendChild(divPublicacion);

        const botonComentar = divPublicacion.querySelector('.comment-button');
        botonComentar.addEventListener('click', function () {
            abrirComentariosPopup(publicacion.ID_publicacion);
        });
    });
}


let idPublicacionActual; // Variable global para almacenar el ID de la publicación actual

// function abrirComentariosPopup(publicacionId) {
//     idPublicacionActual = publicacionId; // Asignar el valor cuando se abre el pop-up
//     cargarComentarios(publicacionId);
//     document.getElementById("comentariosPopup").style.display = "block";

//     // Agregar manejador de eventos para el botón de cierre
//     document.querySelector(".comentarios-popup .close").onclick = function () {
//         document.getElementById("comentariosPopup").style.display = "none";
//     };
// }

// function cargarComentarios(publicacionId) {
//     fetch(`/obtener-comentarios?publicacionId=${publicacionId}`)
//         .then(response => response.json())
//         .then(comentarios => {
//             const listaComentarios = document.getElementById('listaComentarios');
//             listaComentarios.innerHTML = ''; // Limpiar comentarios anteriores
//             comentarios.forEach(comentario => {
//                 const div = document.createElement('div');
//                 div.textContent = comentario.texto; // Asumiendo que el comentario tiene un campo 'texto'
//                 listaComentarios.appendChild(div);
//             });
//             mostrarComentariosPopup();
//         })
//         .catch(error => console.error('Error:', error));
// }

// function agregarComentario(publicacionId) {

//     const comentarioTexto = document.getElementById('nuevoComentario').value;

//     alert('La función se está llamando correctamente.');
//     console.log(idPublicacionActual); // Debería mostrar el ID correcto

//     if (!idPublicacionActual) {
//         console.error('No hay un idPublicacionActual definido.');
//         return;
//     }

//     fetch('/agregar-comentario', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ texto: comentarioTexto, publicacionId: idPublicacionActual }),
//         credentials: 'include'
//     })
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 const listaComentarios = document.getElementById('listaComentarios');
//                 const div = document.createElement('div');
//                 div.textContent = comentarioTexto;
//                 listaComentarios.appendChild(div);
//                 document.getElementById('nuevoComentario').value = ''; // Limpiar el campo de texto
//             }
//         })
//         .catch(error => console.error('Error:', error));
// }
