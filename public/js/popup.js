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