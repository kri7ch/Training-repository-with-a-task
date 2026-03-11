<template>
  <div class="py-12 bg-gray-50/50 min-h-[80vh]">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      <!-- Sidebar -->
      <div class="w-full md:w-64 flex-shrink-0">
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-400">
              {{ userInitials }}
            </div>
            <div>
              <p class="font-bold text-gray-900 leading-tight">{{ store.user?.name }} {{ store.user?.lastname }}</p>
              <!-- Role hidden as requested -->
            </div>
          </div>
          
          <nav class="space-y-1">
            <button 
              @click="activeTab = 'profile'"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="activeTab === 'profile' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Профиль
            </button>
            <button 
              @click="activeTab = 'orders'"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="activeTab === 'orders' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Заказы
            </button>
            <button 
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Выйти
            </button>
          </nav>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-grow">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Настройки аккаунта</h2>
          
          <div class="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Личные данные</h3>
            
            <form @submit.prevent="handleUpdateProfile">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Фамилия</label>
                  <input 
                    v-model="form.lastname" 
                    type="text" 
                    required 
                    maxlength="50"
                    class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Имя</label>
                  <input 
                    v-model="form.name" 
                    type="text" 
                    required 
                    maxlength="50"
                    class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Отчество</label>
                  <input 
                    v-model="form.midname" 
                    type="text" 
                    maxlength="50"
                    class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    v-model="form.email" 
                    type="email" 
                    required 
                    class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                  >
                </div>
              </div>

              <div v-if="message" :class="{'text-green-600': success, 'text-red-500': !success}" class="mb-4 text-sm font-medium">
                {{ message }}
              </div>

              <div class="flex justify-end">
                <button 
                  type="submit" 
                  class="px-6 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
                  :disabled="loading"
                >
                  {{ loading ? 'Сохранение...' : 'Сохранить изменения' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Orders Tab -->
        <div v-if="activeTab === 'orders'">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">История заказов</h2>
          
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div v-if="orders.length === 0" class="p-12 text-center text-gray-500">
              Вы еще не совершали покупок.
            </div>
            
            <div v-else>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-gray-600">
                  <thead class="bg-gray-50 text-gray-900 font-semibold uppercase tracking-wider text-xs border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-4">№ Заказа</th>
                      <th class="px-6 py-4">Дата</th>
                      <th class="px-6 py-4">Статус</th>
                      <th class="px-6 py-4">Доставка</th>
                      <th class="px-6 py-4">Код получения</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4 font-medium text-gray-900">#{{ order.id }}</td>
                      <td class="px-6 py-4">{{ new Date(order.date_order).toLocaleDateString() }}</td>
                      <td class="px-6 py-4">
                        <span 
                          class="px-2 py-1 rounded-full text-xs font-semibold"
                          :class="{
                            'bg-green-100 text-green-700': order.status_order === 'Завершен',
                            'bg-blue-100 text-blue-700': order.status_order === 'Оформлен',
                            'bg-yellow-100 text-yellow-700': order.status_order === 'В обработке'
                          }"
                        >
                          {{ order.status_order }}
                        </span>
                      </td>
                      <td class="px-6 py-4">{{ new Date(order.date_delivery).toLocaleDateString() }}</td>
                      <td class="px-6 py-4 font-mono font-bold">{{ order.code }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useShopStore } from '../store';
import axios from 'axios';
import { useRouter } from 'vue-router';

const store = useShopStore();
const router = useRouter();
const orders = ref([]);
const activeTab = ref('profile');
const loading = ref(false);
const message = ref('');
const success = ref(false);

const form = reactive({
  lastname: '',
  name: '',
  midname: '',
  email: ''
});

const userInitials = computed(() => {
  if (store.user && store.user.name && store.user.lastname) {
    return (store.user.name[0] + store.user.lastname[0]).toUpperCase();
  }
  return 'U';
});

onMounted(async () => {
  if (!store.user) {
    router.push('/login');
    return;
  }
  
  // Init form
  form.lastname = store.user.lastname || '';
  form.name = store.user.name || '';
  form.midname = store.user.midname || '';
  form.email = store.user.email || '';

  try {
    const res = await axios.get(`http://localhost:3001/api/orders/${store.user.id}`);
    orders.value = res.data;
  } catch (err) {
    console.error('Error fetching orders:', err);
  }
});

const handleUpdateProfile = async () => {
  loading.value = true;
  message.value = '';
  success.value = false;

  // Frontend validation
  const lastname = form.lastname ? form.lastname.trim() : '';
  const name = form.name ? form.name.trim() : '';
  const midname = form.midname ? form.midname.trim() : '';
  const email = form.email ? form.email.trim() : '';

  if (!lastname || !name || !email) {
    message.value = 'Заполните обязательные поля';
    loading.value = false;
    return;
  }

  if (lastname.length < 2 || name.length < 2) {
    message.value = 'Имя и фамилия должны содержать минимум 2 символа';
    loading.value = false;
    return;
  }

  try {
    const res = await axios.put(`http://localhost:3001/api/users/${store.user.id}`, {
      lastname,
      name,
      midname,
      email
    });
    if (res.data.success) {
      store.setUser(res.data.user);
      // Update form with trimmed values
      form.lastname = res.data.user.lastname;
      form.name = res.data.user.name;
      form.midname = res.data.user.midname;
      form.email = res.data.user.email;
      
      success.value = true;
      message.value = 'Данные успешно обновлены';
    }
  } catch (err) {
    success.value = false;
    message.value = err.response?.data?.message || 'Ошибка обновления профиля';
  } finally {
    loading.value = false;
  }
};

const handleLogout = () => {
  if (confirm('Вы действительно хотите выйти?')) {
    store.logout();
    router.push('/login');
  }
};
</script>
