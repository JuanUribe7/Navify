import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

// Configurar WebSocket
const ws = new WebSocket('ws://3.12.147.103');
ws.onmessage = (event) => {
    const notificacion = JSON.parse(event.data);
    iziToast.info({
        title: 'Notificación',
        message: notificacion.notificationName || 'Nueva notificación',
        position: 'bottomRight',
        timeout: 5000 // Mostrar la alerta durante 5 segundos
    });
};
ws.onclose = () => {
    console.log('WebSocket cerrado. Reintentando...');
    setTimeout(() => {
        const newWs = new WebSocket('ws://3.12.147.103');
        window.ws = newWs;
    }, 5000);
};
ws.onerror = (error) => {
    console.error('Error en WebSocket:', error);
};

window.ws = ws;

const app = createApp(App);
app.config.globalProperties.$ws = ws;

app.use(store).use(router).mount('#app');