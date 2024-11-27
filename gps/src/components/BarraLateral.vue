<template>
  <!-- Importando los estilos de los iconos -->
  <link href='https://unpkg.com/boxicons@2.1.1/css/boxicons.min.css' rel='stylesheet'>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  
 
  <!-- Barra lateral de navegación -->
  <nav class="sidebar" :class="{ close: isSidebarClosed }">
    <header>
      <!-- Encabezado de la barra lateral -->
      <div class="image-text">
        <span class="image">
          <img :src="require('../assets/LP2.png')" alt="" class="logo-claro">
          <img :src="require('../assets/LP.png')" alt="" class="logo-oscuro">
        </span>
        <span class="beta" v-if="isBetaVisible">
          <h2>beta</h2>
        </span>

        <div class="logo-text">
          <span class="name"></span>
        </div>
      </div>

      <!-- Icono para alternar la barra lateral -->
      <i class='bx bx-chevron-right toggle' @click="toggleSidebar"></i>
    </header>

    <!-- Menú de la barra lateral -->
    <div class="menu-bar">
      <div class="menu">
        <ul class="menu-links">
          <!-- Enlaces del menú -->
          <li class="nav-link">
            <router-link to="/home">
              <i class='bx bx-home-alt icon'></i>
              <span class="text nav-text">Inicio</span>
            </router-link>
          </li>


          <li class="nav-link">
            <router-link to="/dispositivo">
              <i class='bx bx-car icon'></i>
              <span class="text nav-text">Dispositivo</span>
            </router-link>
          </li>


          <li class="nav-link">
            <router-link to="/tiempo_real">
              <i class='bx bx-navigation icon'></i>
              <span class="text nav-text">Tiempo real</span>
            </router-link>
          </li>

          <li class="nav-link">
            <router-link to="/geozona">
              <i class='bx bx-map-alt icon'></i>
              <span class="text nav-text">Geozonas</span>
            </router-link>
          </li>

          <li class="nav-link">
            <router-link to="/historial">
              <i class='bx bx-history icon'></i>
              <span class="text nav-text">Historial</span>
            </router-link>
          </li>
          <li class="nav-link">
            <router-link to="/rutas">
              <i class='bx bx-trending-up icon'></i>
              <span class="text nav-text">Rutas</span>
            </router-link>
          </li>
          <li class="nav-link" @click="toggleReportDropdown">
            <i class='bx bxs-user-account icon'></i>
            <span class="text nav-text">Reporte</span>
            <i class='bx bx-chevron-down icon' :class="{ 'rotate': isReportDropdownOpen }"></i>
          </li>
          <ul v-if="isReportDropdownOpen" class="dropdown2">
      
            <li>
              <router-link to="/reporte2">
                <i class='bx bx-file-blank icon'></i>
                <span>Dispositivo</span>
              </router-link>
            </li>
          </ul>
        </ul>
      </div>

      <!-- Contenido inferior de la barra lateral -->
      <div class="bottom-content">
        <!-- Enlace para cerrar sesión -->
        <li>
          <router-link to="/cerrar-sesion">
            <i @click="logout" class='bx bx-log-out icon'></i>
            <span class="text nav-text" @click="logout" >Cerrar Sesión</span>
          </router-link>
        </li>

        <!-- Modo claro/oscuro -->
        <li class="mode">
          <div class="sun-moon">
            <i class='bx bx-moon icon moon'></i>
            <i class='bx bx-sun icon sun'></i>
          </div>
          <span class="mode-text text">{{ modeText }}</span>

          <!-- Interruptor para alternar entre modos -->
          <div class="toggle-switch" @click="toggleDarkMode">
            <span class="switch"></span>
          </div>
        </li>
      </div>
    </div>
  </nav>

  <!-- Vista de enrutamiento -->
  <router-view/>
</template>

<script setup>
import '../styles_App/App.css';
import { ref } from 'vue';

// Variables reactivas
const isSidebarClosed = ref(true);
const isDarkMode = ref(false);
let modeText = ref("Dark mode");
const isReportDropdownOpen = ref(false);
const isBetaVisible = ref(false);


// Función para alternar el estado de la barra lateral
function toggleSidebar() {
  isSidebarClosed.value = !isSidebarClosed.value;
  
  // Cerrar el submenú de reporte al cerrar la barra lateral
  if (isSidebarClosed.value) {
    isReportDropdownOpen.value = false;
  }

  if (isSidebarClosed.value) {
    isBetaVisible.value = false;
  }else{
    isBetaVisible.value = true;
  }
}

// Función para alternar el modo claro/oscuro
function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
  modeText.value = isDarkMode.value ? "Light mode" : "Dark mode";
  document.body.classList.toggle("dark", isDarkMode.value);
}

// Función para cerrar la barra lateral al hacer clic fuera de ella
function closeSidebarOnClickOutside(event) {
  const sidebar = document.querySelector(".sidebar");
  const toggle = document.querySelector(".toggle");
  const dropdown = document.querySelector(".dropdown2");

  if (!sidebar.contains(event.target) && !toggle.contains(event.target) && (!dropdown || !dropdown.contains(event.target))) {
    isSidebarClosed.value = true;
    isReportDropdownOpen.value = false;
    isBetaVisible.value = false;
  }
}

// Evento para cerrar la barra lateral al hacer clic fuera de ella
document.addEventListener("click", closeSidebarOnClickOutside);

const logout = () => {
  // Cambia sessionStorage por localStorage
  localStorage.removeItem('isAuthenticated');
  window.location.reload();
};

function toggleReportDropdown() {
  isReportDropdownOpen.value = !isReportDropdownOpen.value;
}
</script>

