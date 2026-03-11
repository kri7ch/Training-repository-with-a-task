<template>
  <div class="py-12 bg-white">
    <div class="mb-8 flex items-center gap-2 text-sm text-gray-500">
      <router-link to="/" class="hover:text-black">&lsaquo; Вернуться в каталог</router-link>
    </div>

    <div class="flex flex-col lg:flex-row gap-16">
      <div class="flex-grow">
        <div class="flex justify-between items-baseline mb-8">
          <h1 class="text-4xl font-light text-gray-900">Корзина</h1>
          <span class="text-sm text-gray-500">{{ store.cartCount }} ТОВАРОВ</span>
        </div>

        <div v-if="store.cart.length === 0" class="py-12 text-center text-gray-500 border-t border-gray-100">
          <p class="mb-4">Ваша корзина пуста.</p>
          <router-link to="/" class="inline-block px-6 py-2 border border-black rounded-full hover:bg-black hover:text-white transition-colors">
            Перейти в каталог
          </router-link>
        </div>

        <div v-else>
          <div class="hidden md:grid grid-cols-12 gap-6 text-xs text-gray-400 uppercase tracking-wider mb-4 px-2">
            <div class="col-span-5">Товар</div>
            <div class="col-span-2 text-center">Категория</div>
            <div class="col-span-2 text-center">Количество</div>
            <div class="col-span-3 text-right">Цена</div>
          </div>

          <div class="space-y-6">
            <div 
              v-for="item in store.cart" 
              :key="item.id" 
              class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-t border-gray-100 py-6"
            >
              <div class="md:col-span-5 flex gap-6">
                <div class="w-32 h-32 bg-gray-50 rounded-lg flex items-center justify-center p-4 flex-shrink-0">
                  <img
                    :src="item.image ? '/src/assets/products/' + item.image : '/src/assets/products/picture.png'"
                    :alt="item.name"
                    class="max-w-full max-h-full object-contain mix-blend-multiply"
                    @error="(e) => e.target.src = '/src/assets/products/picture.png'"
                  >
                </div>
                <div class="flex flex-col justify-center">
                  <h3 class="text-lg font-medium text-gray-900 mb-1">{{ item.name }}</h3>
                  <p class="text-xs text-gray-500 uppercase tracking-wide">{{ item.manufacturer }}</p>
                </div>
              </div>

              <div class="hidden md:block md:col-span-2 text-center text-sm text-gray-600">
                {{ item.category || 'Device' }}
              </div>

              <div class="md:col-span-2 flex items-center justify-center">
                <div class="flex items-center border border-gray-200 rounded-full px-2 py-1">
                  <button 
                    @click="store.decreaseQuantity(item.id)"
                    class="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                  >
                    &minus;
                  </button>
                  <span class="w-8 text-center text-sm font-medium">{{ item.quantity }}</span>
                  <button 
                    @click="store.addToCart(item)"
                    class="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                  >
                    &plus;
                  </button>
                </div>
              </div>

              <div class="md:col-span-3 flex items-center justify-between md:justify-end gap-6">
                <span class="text-sm font-medium whitespace-nowrap">{{ (item.price * item.quantity).toLocaleString() }} ₽</span>
                <button 
                  @click="store.removeFromCart(item.id)"
                  class="text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:w-96 flex-shrink-0">
        <div class="bg-gray-50 rounded-2xl p-8 sticky top-24">
          <h2 class="text-xl font-medium mb-8">Итого</h2>

          <div class="space-y-4 mb-8">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Сумма</span>
              <span class="font-medium">{{ store.cartTotal.toLocaleString() }} ₽</span>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-4 mb-8">
            <div class="flex justify-between items-end">
              <span class="text-base font-medium">Всего к оплате</span>
              <span class="text-2xl font-bold">{{ store.cartTotal.toLocaleString() }} ₽</span>
            </div>
          </div>

          <div v-if="!store.user" class="text-center">
            <p class="text-sm text-gray-500 mb-4">Для оформления заказа необходимо войти</p>
            <router-link 
              to="/login" 
              class="block w-full py-4 bg-black text-white text-center font-bold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Войти
            </router-link>
          </div>

          <div v-else>
             <div class="mb-6">
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Пункт выдачи
              </label>
              <CustomSelect 
                v-model="selectedPoint" 
                :options="pickupOptions" 
                placeholder="Выберите адрес..."
              />
            </div>

            <button 
              @click="placeOrder" 
              :disabled="!selectedPoint || store.cart.length === 0" 
              class="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ОФОРМИТЬ ЗАКАЗ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useShopStore } from '../store';
import axios from 'axios';
import { useRouter } from 'vue-router';
import CustomSelect from '../components/CustomSelect.vue';

const store = useShopStore();
const router = useRouter();
const pickupPoints = ref([]);
const selectedPoint = ref('');

const pickupOptions = computed(() => 
  pickupPoints.value.map(p => ({
    label: `${p.address_city}, ${p.address_street}, ${p.address_number_house}`,
    value: p.id
  }))
);

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3001/api/pickup-points');
    pickupPoints.value = res.data;
  } catch (err) {
    console.error('Error fetching pickup points:', err);
  }
});

const placeOrder = async () => {
  try {
    const res = await axios.post('http://localhost:3001/api/orders', {
      user_id: store.user.id,
      pickup_point_id: selectedPoint.value,
      products: store.cart
    });
    
    if (res.data.success) {
      alert(`Заказ успешно оформлен! Ваш код: ${res.data.code}`);
      store.clearCart();
      router.push('/profile');
    }
  } catch (err) {
    alert('Ошибка при оформлении заказа');
  }
};
</script>
