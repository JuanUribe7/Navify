<template>
    <Transition name="modal-fade">
      <div class="modal-overlay" @click="close">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <div class="candado"></div>
            <button class="close-button" @click="close" aria-label="Close">
              <svg viewBox="0 0 24 24">
                <path d="M6.225 4.811a1 1 0 00-1.414 1.414L10.586 12 4.81 17.775a1 1 0 101.414 1.414L12 13.414l5.775 5.775a1 1 0 001.414-1.414L13.414 12l5.775-5.775a1 1 0 00-1.414-1.414L12 10.586 6.225 4.81z"/>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="changePassword">
              <div class="form-group">
                <label for="current-password">Contraseña Actual</label>
                <input type="password" id="current-password" v-model="currentPassword" required />
              </div>
              <div class="form-group">
                <label for="new-password">Nueva Contraseña</label>
                <input type="password" id="new-password" v-model="newPassword" required />
              </div>
              <div class="form-group">
                <label for="confirm-password">Confirmar Nueva Contraseña</label>
                <input type="password" id="confirm-password" v-model="confirmPassword" required />
              </div>
              <button type="submit" class="action-button primary" @click.prevent="changePassword">Cambiar Contraseña</button>
              <button type="button" class="action-button primary" @click="addEmail">Agregar Correo</button>
              
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </template>
  
  <script setup>
  import Swal from 'sweetalert2';
import { defineEmits, ref } from 'vue';
  const emit = defineEmits(['close']);
  
  const currentPassword = ref('');
  const newPassword = ref('');
  const confirmPassword = ref('');
  const email = ref('');

  const changePassword = () => {
    
    if (newPassword.value === confirmPassword.value && !email.value) {
      Swal.fire({
        title: 'Error',
        text: 'Correo no ingresado',
        icon: 'error'
      });
    } else {
      console.log('Contraseña cambiada');
      emit('close');
    }
  };

  const addEmail = () => {
    Swal.fire({
      title: 'Agregar Correo',
      icon: 'info',
      html: ` 
      <input id="email" class="swal2-input" placeholder="Correo" value="${email.value}">
      `,
      confirmButtonText: 'OK',
      preConfirm: () => {
        email.value = document.getElementById('email').value;
        console.log(email.value);
      }
    });
  };

  const close = () => {
    const modalContent = document.querySelector('.modal-content');
    modalContent.classList.add('fade-out');
    setTimeout(() => {
        emit('close');
    }, 300);
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }
  
  .modal-content {
    background: #ffffff;
    border: 2px solid #764ba2;
    box-shadow: 
      0 10px 20px rgba(0, 0, 0, 0.2),
      0 5px 10px rgba(0, 0, 0, 0.1);
    width: 90%;
    max-width: 500px;
    border-radius: 24px;
    position: relative;
    overflow: hidden;
    animation: fadeIn 0.5s;
  }
  
  .modal-header {
    position: relative;
    height: 150px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 24px 24px 0 0;
  }

  .candado{
    background-color: #5a6abf;
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-image: url('../assets/candado.jpg');
    background-size: cover;
  }
  
  .profile-image-container {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 50%);
  }
  
  .profile-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background-image: url('../assets/perfilF.jpg');
    background-size: cover;
    background-position: center;
    border: 4px solid white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .image-upload-label {
    position: absolute;
    right: 0;
    bottom: 8px;
    background: #764ba2;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .image-upload-label:hover {
    transform: scale(1.1);
    background: #667eea;
  }
  
  .hidden-input {
    display: none;
  }
  
  .edit-icon {
    width: 16px;
    height: 16px;
    color: white;
  }
  
  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .close-button:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  .close-button svg {
    width: 20px;
    height: 20px;
    fill: white;
  }
  
  .modal-body {
    padding: 80px;
    text-align: center;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 10px;
  }
  
  h1 {
    color: #1a1a1a;
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px;
  }
  
  .badge {
    display: inline-block;
    background: #764ba2;
    color: white;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 16px;
  }
  
  .bio {
    color: #666;
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 24px;
  }
  
  .stats {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-bottom: 24px;
  }
  
  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
  }
  
  .stat-label {
    font-size: 14px;
    color: #666;
    margin-top: 4px;
  }
  
  .actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
  
  .action-button {
    padding: 8px 24px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    margin-bottom: 10px;
  }
  
  .action-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .action-button.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
  }
  
  .action-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    background-color: #5a6abf;
  }
  
  .action-button.secondary {
    background: white;
    color: #764ba2;
    border: 2px solid #764ba2;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .action-button.secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }
  

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }
  
  .modal-fade-enter-active .modal-content {
    animation: modal-in 0.3s ease-out;
  }
  
  .modal-fade-leave-active .modal-content {
    animation: modal-out 0.3s ease-in;
  }
  
  @keyframes modal-in {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes modal-out {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(20px);
      opacity: 0;
    }
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
  
  .fade-out {
    animation: fadeOut 0.3s ease forwards;
  }
  
  @keyframes fadeOut {
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(20px);
    }
  }
  
  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 4px;
    color: #1a1a1a;
  }

  .form-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  </style>