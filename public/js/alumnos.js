document.getElementById("toggle-register").addEventListener("click", async () => {
    // Hacer una solicitud al servidor para verificar los alumnos registrados
    const response = await fetch("/Corluss/api/user/verificarAlumnos");
    const data = await response.json();

    if (data.tieneAlumnos) {
        // Solo si hay alumnos registrados, añadir la clase 'active' al contenedor
        document.getElementById('container').classList.add("active");

        // Opcionalmente, mostrar una ventana emergente con la lista de alumnos
        let alumnoList = "<ul>";
        for (const alumno of data.alumnos) {
            alumnoList += `<li>${alumno.nombre} ${alumno.apellido}</li>`;
        }
        alumnoList += "</ul>";

        Swal.fire({
            title: 'Alumnos Registrados',
            html: alumnoList,
            icon: 'info',
            showConfirmButton: true,
        });

    } else {
        // Mostrar una alerta indicando que no hay alumnos registrados
        Swal.fire({
            title: 'No tienes usuarios registrados',
            text: 'Registra a un alumno primero.',
            icon: 'warning',
            showConfirmButton: true,
        });
    }
});


const loginToggleBtn = document.getElementById('toggle-login');
loginToggleBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

