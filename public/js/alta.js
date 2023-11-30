
//Mostrar fechas
function llenarFechas() {
    // Llenar los días (1-31)
    for (let i = 1; i <= 31; i++) {
        let opcionDia = document.createElement('option');
        opcionDia.value = i;
        opcionDia.text = i;
        document.querySelectorAll('#dia').forEach(select => select.appendChild(opcionDia.cloneNode(true)));
    }

    // Nombres de los meses
    const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    // Llenar los meses con nombres
    nombresMeses.forEach((mes, index) => {
        let opcionMes = document.createElement('option');
        opcionMes.value = index + 1; // Los meses empiezan en 1, no en 0
        opcionMes.text = mes;
        document.querySelectorAll('#mes').forEach(select => select.appendChild(opcionMes.cloneNode(true)));
    });

    // Llenar los años (por ejemplo, 1900-2023)
    const anioActual = new Date().getFullYear();
    for (let i = anioActual; i >= 1900; i--) {
        let opcionAno = document.createElement('option');
        opcionAno.value = i;
        opcionAno.text = i;
        document.querySelectorAll('#año').forEach(select => select.appendChild(opcionAno.cloneNode(true)));
    }
}

// Llamar a la función al cargar la página
window.onload = llenarFechas;


document.addEventListener('DOMContentLoaded', function () {
    // Obtener los elementos del DOM por clase
    var btnsAbrirPopup = document.querySelectorAll('.btn-abrir-popup'),
        overlays = document.querySelectorAll('.overlay'),
        popups = document.querySelectorAll('.popup'),
        btnsCerrarPopup = document.querySelectorAll('.btn-cerrar-popup');

    // Función para abrir el pop-up
    btnsAbrirPopup.forEach(function(btn, index) {
        btn.addEventListener('click', function () {
            overlays[index].classList.add('active');
            popups[index].classList.add('active');
        });
    });

    // Función para cerrar el pop-up
    btnsCerrarPopup.forEach(function(btn, index) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            overlays[index].classList.remove('active');
            popups[index].classList.remove('active');
        });
    });

    // Función para cerrar el pop-up al hacer clic fuera de él (en el overlay)
    overlays.forEach(function(overlay, index) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                overlays[index].classList.remove('active');
                popups[index].classList.remove('active');
            }
        });
    });


});


document.getElementById('foto1').addEventListener('change', function () {
    var file = this.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('imgAlumno').src = e.target.result;
    };
    reader.readAsDataURL(file);
});


document.getElementById('foto2').addEventListener('change', function () {
    var file = this.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('imgTutor').src = e.target.result;
    };
    reader.readAsDataURL(file);
});
