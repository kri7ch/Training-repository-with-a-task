<template>
  <div class="min-h-screen flex flex-col font-sans text-gray-900 bg-white">
    <header v-if="!isAdminRoute" class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        <router-link to="/" class="text-xl font-black tracking-tighter uppercase">STEPZY</router-link>
        
        <nav class="hidden md:block">
          <ul class="flex gap-8">
            <li><router-link to="/" class="text-sm font-medium text-gray-600 hover:text-black transition-colors" active-class="text-black">Каталог</router-link></li>
            <li v-if="store.user"><router-link to="/profile" class="text-sm font-medium text-gray-600 hover:text-black transition-colors" active-class="text-black">Личный кабинет</router-link></li>
            <li v-else><router-link to="/login" class="text-sm font-medium text-gray-600 hover:text-black transition-colors" active-class="text-black">Войти</router-link></li>
          </ul>
        </nav>
        
        <div class="flex items-center gap-4">
          <router-link v-if="store.user" to="/cart" class="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity">
            <span>Корзина</span>
            <span v-if="store.cartCount > 0" class="bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{{ store.cartCount }}</span>
          </router-link>
          <div v-else class="md:hidden">
            <router-link to="/login" class="text-sm font-medium">Войти</router-link>
          </div>
        </div>
      </div>
    </header>

    <main :class="isAdminRoute ? 'flex-grow' : 'flex-grow container mx-auto px-4 sm:px-6 lg:px-8'">
      <router-view></router-view>
    </main>

    <footer v-if="!isAdminRoute" class="border-t border-gray-100 mt-auto py-12">
      <div class="container mx-auto px-4 text-center">
        <p class="text-gray-400 text-sm">&copy; 2026 Stepzy Shop. Все права защищены.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useShopStore } from './store';

const store = useShopStore();
const route = useRoute();

const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin');
});

onMounted(() => {
  store.init();
});
</script>

<style>
@import './assets/main.css';
</style>
