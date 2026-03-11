<template>
  <div class="login">
    <h1>Регистрация</h1>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label>Фамилия *</label>
        <input v-model="lastname" type="text" required>
      </div>
      <div class="form-group">
        <label>Имя *</label>
        <input v-model="name" type="text" required>
      </div>
      <div class="form-group">
        <label>Отчество</label>
        <input v-model="midname" type="text">
      </div>
      <div class="form-group">
        <label>Email *</label>
        <input v-model="email" type="email" required>
      </div>
      <div class="form-group relative">
        <label>Пароль *</label>
        <div class="relative">
          <input 
            v-model="password" 
            :type="showPassword ? 'text' : 'password'" 
            required
            class="w-full pr-10"
          >
          <button 
            type="button"
            @click="showPassword = !showPassword"
            class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-black focus:outline-none"
          >
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.059 10.059 0 013.999-5.325m2.5-1.428A10.066 10.066 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.059 10.059 0 01-2.072 3.664M9.5 9.5l5 5m-5-5a3 3 0 005 5" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
            </svg>
          </button>
        </div>
      </div>
      <div v-if="error" style="color: red; margin-bottom: 20px;">{{ error }}</div>
      <button type="submit" class="btn btn-black" style="width: 100%;">Зарегистрироваться</button>
      <p style="margin-top: 15px; text-align: center;">
        Уже есть аккаунт? <router-link to="/login" style="text-decoration: underline;">Войти</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const lastname = ref('');
const name = ref('');
const midname = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const error = ref('');

const handleRegister = async () => {
  try {
    const res = await axios.post('http://localhost:3001/api/register', {
      lastname: lastname.value,
      name: name.value,
      midname: midname.value,
      email: email.value,
      password: password.value
    });
    
    if (res.data.success) {
      alert('Регистрация успешна! Теперь вы можете войти.');
      router.push('/login');
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Ошибка регистрации';
  }
};
</script>
