var btnAbrirPopup = document.getElementById('btn-abrir-popup'),
	overlay = document.getElementById('overlay'),
	popup = document.getElementById('popup'),
	btnCerrarPopup = document.getElementById('btn-cerrar-popup');

btnAbrirPopup.addEventListener('click', function(){
	overlay.classList.add('active');
	popup.classList.add('active');
});

btnCerrarPopup.addEventListener('click', function(e){
	e.preventDefault();
	overlay.classList.remove('active');
	popup.classList.remove('active');
});


document.getElementById('foto').addEventListener('change', function() {
    var file = this.files[0];
    var reader = new FileReader();
    
    reader.onload = function(e) {
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
});


      document.addEventListener('DOMContentLoaded', () => {
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const forgotPasswordPopup = document.getElementById('forgotPasswordPopup');
  const closePopup = document.querySelector('.close-popup');

  forgotPasswordLink.addEventListener('click', function(e) {
    e.preventDefault(); // Evita que el enlace navegue a un URL
    forgotPasswordPopup.style.display = 'flex'; // Muestra el popup
  });

  closePopup.addEventListener('click', function() {
    forgotPasswordPopup.style.display = 'none'; // Oculta el popup
  });

  // Opcional: Cierra el popup al hacer clic fuera de él
  window.addEventListener('click', function(e) {
    if (e.target === forgotPasswordPopup) {
      forgotPasswordPopup.style.display = 'none';
    }
  });
});
