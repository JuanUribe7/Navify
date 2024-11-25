<template>
  <section class="home">
    <div class="overlay"></div>
    <NavBar />
    <div class="hone2">
      <h1>Geozona</h1>
    </div>
    <div class="tituloo">
      <div class="hone">
        <h1>Crear Geozonas</h1>
        <div class="group">
          <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
            <g>
              <path
                d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z">
              </path>
            </g>
          </svg>
          <input placeholder="Buscar" type="search" class="input" v-model="searchQuery" @input="filterResults">
        </div>
        <div class="device-list-container">
          <ul class="device-list">
            <li @click="selectDevice(item)" v-for="item in filteredResults" :key="item._id">
              <i class='bx bxs-car'></i>
              {{ item.deviceName }}
            </li>
          </ul>
        </div>
      </div>

      <div id="map" class="map-container"></div>
    </div>

    <!-- Modal para seleccionar dispositivo -->
    <div v-if="showDeviceModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h2>Seleccionar Dispositivo</h2>
        <ul class="device-list-modal">
          <li v-for="device in devices" :key="device.id" @click="toggleDeviceSelection(device)" class="device-item">
            <input type="checkbox" :checked="selectedDevices.includes(device)" />
            {{ device.deviceName }}
          </li>
        </ul>
        <button @click="confirmCreateGeozona" class="create-button">Crear Geozona</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import NavBar from '../components/NavBar.vue';
import * as L from 'leaflet';
import Swal from 'sweetalert2';
import 'leaflet/dist/leaflet.css';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const map = ref(null);
const drawnItems = ref(new L.FeatureGroup());
const searchQuery = ref('');
const devices = ref([]);
const filteredResults = ref([]);
const selectedDevice = ref(null);
const deviceShapes = ref({});
const dropdownOpen = ref(false);

const fullText = "Navify";
const displayedText = ref("");
let currentIndex = 0;
let isDeleting = false;
let typingInterval;
let routingControl = null;
let deviceMarker = null;
let coordinates = null;

const showDeviceModal = ref(false);
const selectedDevices = ref([]);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
});

const typeEffect = () => {
  const current = currentIndex;

  if (!isDeleting && current < fullText.length) {
    displayedText.value = fullText.slice(0, current + 1);
    currentIndex++;
    if (currentIndex === fullText.length) {
      typingInterval = setTimeout(() => {
        isDeleting = true;
        typeEffect();
      }, 5000);
      return;
    }
  } else if (isDeleting && current > 0) {
    displayedText.value = fullText.slice(0, current - 1);
    currentIndex--;
  } else {
    isDeleting = false;
    currentIndex = 0;
  }

  const typingSpeed = isDeleting ? 100 : 200;
  typingInterval = setTimeout(typeEffect, typingSpeed);
};

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const initMap = () => {
  if (!map.value) {
    map.value = L.map('map').setView([10.96854, -74.78132], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map.value);

    drawnItems.value.addTo(map.value);

    map.value.pm.addControls({
      position: 'topright',
      drawPolygon: true,
      drawPolyline: true,
      drawRectangle: true,
      drawCircle: true,
      drawCircleMarker: false,
      drawMarker: false,
      editMode: true,
      deleteMode: true,
      createZone: true,
    });

    map.value.on('pm:create', (e) => {
      const layer = e.layer;
      drawnItems.value.addLayer(layer);

      console.log('Dispositivos disponibles:', devices.value);

      const inputOptions = devices.value.reduce((options, device) => {
        if (device.id && device.deviceName) {
          options[device.id] = device.deviceName;
        }
        return options;
      }, {});
      openModal();

     
      if (layer instanceof L.Circle) {
        coordinates = {
          center: layer.getLatLng(),
          radius: layer.getRadius()
        };
        console.log('Circunferencia creada - Centro:', coordinates.center, 'Radio:', coordinates.radius);
      } else {
        coordinates = layer.getLatLngs();
        console.log('Coordenadas de la geozona creada:', coordinates);
      }
    });

    map.value.on('pm:remove', (e) => {
      console.log('Forma eliminada:', e.layer);
    });
  }
};

const storeShape = (layer, deviceId) => {
  if (!deviceShapes.value[deviceId]) {
    deviceShapes.value[deviceId] = [];
  }
  deviceShapes.value[deviceId].push(layer);
};

const showDeviceOnMap = (device) => {
  if (!map.value) {
    console.error('El mapa no está inicializado');
    return;
  }

  if (deviceMarker) {
    map.value.removeLayer(deviceMarker);
  }

  map.value.setView([device.coordenadas.latitud, device.coordenadas.longitud], 15);

  deviceMarker = L.marker([device.coordenadas.latitud, device.coordenadas.longitud]).addTo(map.value);
  deviceMarker.bindPopup(`
    <b>${device.deviceName}</b><br>
    Latitud: ${device.coordenadas.latitud}<br>
    Longitud: ${device.coordenadas.longitud}<br>
  `).openPopup();

  map.value.invalidateSize();
};

const selectDevice = (device) => {
  if (!coordinates) {
    Swal.fire({
      icon: 'warning',
      title: 'Geozona no creada',
      text: 'Primero debes crear la geozona antes de seleccionar un dispositivo.',
    });
    return;
  }

  selectedDevice.value = device;

  if (deviceShapes.value[device.id]) {
    deviceShapes.value[device.id].forEach(layer => {
      drawnItems.value.addLayer(layer);
    });
  } else {
    showDeviceOnMap(device);
  }
};

const deleteLastShape = () => {
  if (!selectedDevice.value || !deviceShapes.value[selectedDevice.value.id]) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No hay formas asociadas a este dispositivo.',
    });
    return;
  }

  const shapesForDevice = deviceShapes.value[selectedDevice.value.id];
  if (shapesForDevice.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Sin Geozonas',
      text: 'Este dispositivo no tiene geozonas creadas.',
    });
    return;
  }

  const lastShape = shapesForDevice.pop();
  if (lastShape) {
    map.value.removeLayer(lastShape);
    Swal.fire({
      icon: 'success',
      title: 'Geozona Eliminada',
      text: 'La última geozona creada ha sido eliminada.',
    });
  }
};

const filterResults = () => {
  const query = searchQuery.value.toLowerCase();
  filteredResults.value = devices.value.filter(item => {
    const hasGeozona = deviceShapes.value[item.id] && deviceShapes.value[item.id].length > 0;
    return !hasGeozona && item.deviceName.toLowerCase().includes(query);
  });
};

const cargarDispositivos = async () => {
  try {
    const response = await fetch('http://3.12.147.103/devices');
    if (!response.ok) {
      throw new Error('Error en la respuesta de la API');
    }
    const data = await response.json();
    devices.value = data;
    console.log('Dispositivos cargados:', devices.value);
    filteredResults.value = devices.value;
  } catch (error) {
    console.error('Error al cargar dispositivos:', error);
  }
};

import PuntoA from '../assets/puntoA.png';

const generateRoute = () => {
  if (!map.value) {
    console.error('El mapa no está inicializado');
    return;
  }

  const pointA = L.latLng(10.950751, -74.771095);
  const pointB = L.latLng(10.942815, -74.781778);

  if (routingControl) {
    map.value.removeControl(routingControl);
  }

  routingControl = L.Routing.control({
    waypoints: [pointA, pointB],
    routeWhileDragging: true,
    lineOptions: {
      styles: [{ color: 'rgb(133, 76, 214)', opacity: 1, weight: 5 }]
    },
    createMarker: function (i, waypoint, n) {
      return L.marker(waypoint.latLng, {
        draggable: true,
        icon: L.icon({
          iconUrl: PuntoA,
          iconSize: [35, 35],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).bindPopup(`Punto ${i + 1}`);
    },
    formatter: new L.Routing.Formatter({
      language: 'es',
      units: 'metric',
      roundingSensitivity: 1000
    }),
    show: false
  }).addTo(map.value);

  routingControl.on('routesfound', function() {
    const container = document.querySelector('.leaflet-routing-container');
    if (container) {
      container.classList.add('custom-routing-container');
      container.style.maxHeight = '400px';
      container.style.overflowY = 'auto';
      container.style.scrollbarColor = 'var(--text-color) var(--sidebar-color)';
    }
  });
};

const openModal = () => {
  showDeviceModal.value = true;
};

const closeModal = () => {
  showDeviceModal.value = false;
};

const toggleDeviceSelection = (device) => {
  const index = selectedDevices.value.indexOf(device);
  if (index > -1) {
    // Si el dispositivo ya está seleccionado, lo eliminamos
    selectedDevices.value.splice(index, 1);
  } else {
    // Si no está seleccionado, lo agregamos
    selectedDevices.value.push(device);
  }
};

const confirmCreateGeozona = () => {
  if (selectedDevices.value.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Sin selección',
      text: 'Por favor, selecciona al menos un dispositivo para crear la geozona.',
    });
    return;
  }

  Swal.fire({
    title: '¿Estás seguro?',
    text: "¿Deseas crear la geozona para los dispositivos seleccionados?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, crear',
    cancelButtonText: 'No, cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      console.log('Creando geozona para los dispositivos:', selectedDevices.value);
      
      Swal.fire({
        title: 'Geozona creada',
        icon: 'success'
      }).then(() => {
        closeModal();
      });
    } else {
      console.log('Creación de geozona cancelada.');
      drawnItems.value.clearLayers();
      coordinates = null;
    }
  });
};

onMounted(() => {
  cargarDispositivos();
  initMap();
  typeEffect();
});

onUnmounted(() => {
  clearTimeout(typingInterval);
  if (routingControl) {
    map.value.removeControl(routingControl);
  }
});
</script>


<style scoped>
.home {
  height: 100vh;
  overflow: hidden;
}

.actions {
  align-items: center;
  display: flex;
}

.dropdown {
  display: inline-block;
  position: relative;
}

.dropdown-content {
  background-color: var(--sidebar-color);
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  display: none;
  margin-right: 30px;
  min-width: 200px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 3;
}

.dropdown-content.show {
  display: block;
  opacity: 1;
  transform: translateY(0);
}

.dropdown-item {
  align-items: center;
  color: var(--text-colar);
  display: flex;
  padding: 12px 16px;
  text-decoration: none;
  transition: background-color 0.2s, transform 0.2s;
}

.dropdown-item:hover {
  background-color: var(--body-color);
  color: var(--text-colar);
  transform: translateX(5px);
}

.dropdown-item i {
  font-size: 1.2em;
  margin-right: 12px;
  text-align: center;
  width: 20px;
}

.dropdown-item span {
  font-weight: 500;
}

.dropdown-item:not(:last-child) {
  border-bottom: 1px solid rgba(var(--text-colar-rgb), 0.1);
}

.dropbtn {
  align-items: center;
  background-color: var(--sidebar-color);
  border: none;
  border-radius: 5px;
  color: var(--text-colar);
  cursor: pointer;
  display: flex;
  font-size: 16px;
  gap: 5px;
  padding: 10px 15px;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.dropbtn:hover {
  background-color: var(--body-color);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.home .actions {
  align-items: center;
  display: flex;
}

.home .navar {
  background-color: var(--sidebar-color);
  border-bottom: 3px solid var(--body-color);
}

.home .text {
  position: relative;
  z-index: 2;
}

.notification-btn {
  background: none;
  border: none;
  color: var(--text-colar);
  cursor: pointer;
  font-size: 1.7rem;
  margin-right: 15px;
  margin-top: 10px;
  position: relative;
}

.notification-indicator {
  background-color: var(--text-colar);
  border-radius: 50%;
  height: 15px;
  position: absolute;
  right: -1px;
  width: 15px;
}

.titulo {
  display: inline-block;
  min-width: 100px;
}

#map {
  height: calc(100vh - 60px);
  width: 100%;
  z-index: 0;
}

.coordinates-table {
  border-collapse: collapse;
  width: 100%;
}

.coordinates-table,
.coordinates-table th,
.coordinates-table td {
  border: 1px solid black;
  font-size: 10px;
  padding: 8px;
  text-align: center;
}

.iframe-container {
  align-items: center;
  display: flex;
  height: 650px;
  justify-content: center;
  position: relative;
  width: 100%;
}

.iframe-container iframe {
  position: relative;
  z-index: 0;
}

.tituloo {
  display: flex;
  justify-content: flex-start;
  position: relative;
  z-index: 1;
}

.hone2 {
  margin-left: 30px;
  background-color: var(--sidebar-color);
  height: 50px;
  position: absolute;
  top: 25%;
  z-index: 2;
  border-radius: 10px;
  padding: 5px 15px;
  border: 1px solid;
}

.hone2 h1 {
  text-align: center;
  margin-top: 10px;
  font-size: 15px;
  color: var(--text-color);
}

.hone {
  margin-left: 30px;
  width: 17%;
  background-color: var(--sidebar-color);
  height: 280px;
  position: absolute;
  top: 30%;
  z-index: 2;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  border: 1px solid;
}

.hone h1 {
  margin-top: 10px;
  font-size: 16px;
  text-align: center;
  color: var(--text-color);
}

.group {
  align-items: center;
  display: flex;
  justify-content: center;
  line-height: 28px;
  margin-top: 10px;
  max-width: 250px;
  position: relative;
}

.input {
  background-color: var(--body-color);
  border: 2px solid;
  border-radius: 8px;
  color: var(--text-color);
  height: 40px;
  line-height: 28px;
  outline: none;
  padding: 0 1rem;
  padding-left: 2.5rem;
  transition: .3s ease;
  width: 100%;
}

.input::placeholder {
  color: var(--text-color);
}

.icon {
  fill: #9e9ea7;
  font-size: 21px;
  height: 1rem;
  left: 1rem;
  position: absolute;
  width: 1rem;
}

.icoon {
  fill: #9e9ea7;
  font-size: 21px;
  height: 1rem;
  right: 4rem;
  position: relative;
  width: 1rem;
  font-size: 21px;
}

.device-list-container {
  flex-grow: 1;
  overflow-y: auto;
  margin-top: 10px;
}

.device-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.device-list li {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  color: var(--text-color);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.device-list li:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.device-list li i {
  margin-right: 10px;
  font-size: 21px;
  flex-shrink: 0;
}

.device-list-container::-webkit-scrollbar {
  width: 6px;
}

.device-list-container::-webkit-scrollbar-track {
  background: var(--sidebar-color);
}

.device-list-container::-webkit-scrollbar-thumb {
  background-color: var(--body-color);
  border-radius: 3px;
}

.generate-route-btn{
  padding: 4px;
  border-radius: 5px;
  border: 1px solid var(--text-color);
  margin-right: 5px;
  color: var(--text-color);
  background-color: var(--sidebar-color);
  font-weight: 600;
  cursor: pointer;
}

.dark-mode-table {
  background-color: #333;
  color: #fff;
  border: 1px solid #444;
}

.dark-mode-table th,
.dark-mode-table td {
  border: 1px solid #444;
}

.dark-mode-table th {
  background-color: #444;
}

.dark-mode-table tr:nth-child(even) {
  background-color: #555;
}

.dark-mode-table tr:nth-child(odd) {
  background-color: #666;
}

.modal {
  display: flex;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  margin: 15% auto;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 80%;
  max-width: 500px;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
}

.device-list-modal {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}

.device-item {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin: 5px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.device-item:hover {
  background-color: #f0f0f0;
}

.create-button {
  background-color: #4CAF50; /* Verde */
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.create-button:hover {
  background-color: #45a049; /* Verde más oscuro */
}

</style>
