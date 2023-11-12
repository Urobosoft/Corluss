const sign_in_btn = document.querySelector("#sign-in-btn");
  const sign_up_btn = document.querySelector("#sign-up-btn");
  const container = document.querySelector(".container");

  sign_up_btn.addEventListener("click", () => {
    container.classList.add("sign-up-mode");
  });

  sign_in_btn.addEventListener("click", () => {
    container.classList.remove("sign-up-mode");
  });

  // Simular un clic en el botón "Regístrate" al cargar la página
  sign_up_btn.click();

// Contenido de fecha-nacimiento.js
window.onload = function() {
  // Rellena los días
  if (typeof valoresAnteriores !== 'undefined') {
  var selectDia = document.getElementById("dia");
  for (var i = 1; i <= 31; i++) {
    var option = document.createElement("option");
    option.value = i;
    option.text = i;
    selectDia.appendChild(option);
  }

  // Rellena los meses
  var selectMes = document.getElementById("mes");
  var meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
               "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  meses.forEach(function(mes, index) {
    var option = document.createElement("option");
    option.value = index + 1;
    option.text = mes;
    selectMes.appendChild(option);
  });

  // Rellena los años
  var selectAño = document.getElementById("año");
  var añoActual = new Date().getFullYear();
  for (var i = añoActual; i >= 1900; i--) {
    var option = document.createElement("option");
    option.value = i;
    option.text = i;
    selectAño.appendChild(option);
  }

  // Establece los valores seleccionados previamente, si existen
  if (valoresAnteriores) {
    selectDia.value = valoresAnteriores.dia;
    selectMes.value = valoresAnteriores.mes;
    selectAño.value = valoresAnteriores.ano;
  }
}
};


document.getElementById('togglePassword').addEventListener('click', function (e) {
  // El icono que el usuario puede clickear para mostrar/ocultar la contraseña
  var password = document.getElementById('password');
  if (password.type === 'password') {
    password.type = 'text';
    this.classList.remove('fa-eye');
    this.classList.add('fa-eye-slash');
  } else {
    password.type = 'password';
    this.classList.remove('fa-eye-slash');
    this.classList.add('fa-eye');
  }
});

document.getElementById('togglePasswor').addEventListener('click', function (e) {
  // El icono que el usuario puede clickear para mostrar/ocultar la contraseña
  var password = document.getElementById('password2');
  if (password.type === 'password') {
    password.type = 'text';
    this.classList.remove('fa-eye');
    this.classList.add('fa-eye-slash');
  } else {
    password.type = 'password';
    this.classList.remove('fa-eye-slash');
    this.classList.add('fa-eye');
  }
});


function validatePassword() {
  var password = document.getElementById('password').value;
  var passwordError = document.getElementById('passwordError');
  var regex = {
    lower: /[a-z]/,
    upper: /[A-Z]/,
    number: /[0-9]/,
    special: /[!@#$%^&*(),.?":{}|<>_]/
  };

  // Oculta el mensaje de error si la contraseña está vacía
  if (password === '') {
    passwordError.style.display = 'none';
    return true;
  }

  // Resetear el mensaje de error y ocultarlo
  passwordError.textContent = '';
  passwordError.style.display = 'none';

  // Chequear la validación de la contraseña
  if (password.length < 8) {
    passwordError.textContent = 'La contraseña debe tener al menos 8 caracteres.';
    passwordError.style.display = 'block';
    return false;
  } else if (password.length > 50) {
    passwordError.textContent = 'La contraseña no debe exceder los 50 caracteres.';
    passwordError.style.display = 'block';
    return false;
  }
  if (!regex.lower.test(password)) {
    passwordError.textContent = 'La contraseña debe tener al menos una letra minúscula.';
    passwordError.style.display = 'block';
    return false;
  }
  if (!regex.upper.test(password)) {
    passwordError.textContent = 'La contraseña debe tener al menos una letra mayúscula.';
    passwordError.style.display = 'block';
    return false;
  }
  if (!regex.number.test(password)) {
    passwordError.textContent = 'La contraseña debe tener al menos un número.';
    passwordError.style.display = 'block';
    return false;
  }
  if (!regex.special.test(password)) {
    passwordError.textContent = 'La contraseña debe tener al menos un caracter especial como !@#$%^&*(),.?":{}|<>';
    passwordError.style.display = 'block';
    return false;
  }

  // Si la contraseña es válida, asegúrate de que el mensaje de error esté oculto
  passwordError.style.display = 'none';
  return true;
}

// Añadir evento al campo de contraseña
document.getElementById('password').addEventListener('input', validatePassword);

