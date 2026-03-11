<template>
  <div class="min-h-screen bg-gray-50 flex">
    <aside class="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
      <div class="p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Admin Panel</h2>
        <div class="space-y-1">
          <div class="text-sm">
            <span class="text-gray-500">Должность:</span>
            <span class="font-medium text-gray-900 ml-1 capitalize">{{ store.user?.role || 'Администратор' }}</span>
          </div>
          <div class="text-sm">
            <span class="text-gray-500">ФИО:</span>
            <span class="font-medium text-gray-900 ml-1">
              {{ store.user ? `${store.user.lastname} ${store.user.name} ${store.user.midname || ''}`.trim() : 'Загрузка...' }}
            </span>
          </div>
        </div>
      </div>
      <nav class="flex-grow p-4 space-y-2">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
          :class="activeTab === tab.id ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'"
        >
          {{ tab.label }}
        </button>
      </nav>
      <div class="p-4 border-t border-gray-100">
        <button @click="handleLogout" class="w-full px-4 py-2 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Выйти
        </button>
      </div>
    </aside>

    <div class="md:hidden w-full fixed top-0 left-0 bg-white z-50 border-b p-4 flex justify-between items-center">
      <h2 class="font-bold">Admin Panel</h2>
      <select v-model="activeTab" class="border rounded p-1">
        <option v-for="tab in tabs" :key="tab.id" :value="tab.id">{{ tab.label }}</option>
      </select>
    </div>

    <main class="flex-grow p-8 md:p-12 mt-12 md:mt-0 overflow-y-auto h-screen">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ currentTabLabel }}</h1>
        
        <component :is="currentTabComponent" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useShopStore } from '../store';
import AdminProducts from '../components/admin/AdminProducts.vue';
import AdminUsers from '../components/admin/AdminUsers.vue';
import AdminOrders from '../components/admin/AdminOrders.vue';

const router = useRouter();
const store = useShopStore();
const activeTab = ref('products');

const tabs = [
  { id: 'products', label: 'Товары', component: AdminProducts },
  { id: 'users', label: 'Пользователи', component: AdminUsers },
  { id: 'orders', label: 'Заказы', component: AdminOrders },
];

const currentTabComponent = computed(() => {
  return tabs.find(t => t.id === activeTab.value)?.component;
});

const currentTabLabel = computed(() => {
  return tabs.find(t => t.id === activeTab.value)?.label;
});

const handleLogout = () => {
  if (confirm('Вы действительно хотите выйти из админ-панели?')) {
    store.logout();
    router.push('/login');
  }
};
</script>
