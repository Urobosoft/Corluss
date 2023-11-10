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

  // Agregar opciones de día
  var selectDia = document.getElementById("dia");
  for (var i = 1; i <= 31; i++) {
    var option = document.createElement("option");
    option.value = i;
    option.text = i;
    selectDia.appendChild(option);
  }

  // Agregar opciones de mes
  var selectMes = document.getElementById("mes");
  var meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  for (var i = 0; i < meses.length; i++) {
    var option = document.createElement("option");
    option.value = i + 1;
    option.text = meses[i];
    selectMes.appendChild(option);
  }

  // Agregar opciones de año (por ejemplo, desde 1900 hasta 2023)
  var selectAño = document.getElementById("año");
  for (var i = 1900; i <= 2023; i++) {
    var option = document.createElement("option");
    option.value = i;
    option.text = i;
    selectAño.appendChild(option);
  }

  // Establecer las opciones preseleccionadas
  selectDia.value = 1; // Día 1
  selectMes.value = 1; // Enero
  selectAño.value = 2000; // Año 2000