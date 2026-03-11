<template>
  <div class="py-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-extrabold mb-2 text-gray-900">Каталог</h1>
      <p class="text-gray-500">Лучшие товары по отличным ценам</p>
    </div>

    <div class="flex flex-wrap gap-4 mb-8 border-b border-gray-200 pb-6 items-center">
      <div class="flex-1 min-w-[200px]">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Поиск устройства..."
          class="w-full px-4 py-2 rounded-full border border-gray-200 bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black/5 transition-colors"
        >
      </div>
      <div class="w-full sm:w-auto min-w-[200px]">
        <CustomSelect 
          v-model="selectedCategory" 
          :options="categoryOptions" 
          placeholder="Все категории"
        />
      </div>
      <div class="w-full sm:w-auto min-w-[200px]">
        <CustomSelect 
          v-model="selectedManufacturer" 
          :options="manufacturerOptions" 
          placeholder="Все бренды"
        />
      </div>
      <div class="w-full sm:w-auto min-w-[200px]">
        <CustomSelect 
          v-model="sortBy" 
          :options="sortOptions" 
          :show-placeholder-in-list="false"
          placeholder="Сортировка"
        />
      </div>
    </div>

    <div v-if="loading" class="text-center py-10 text-gray-500">Загрузка...</div>
    
    <div v-else>
      <div v-if="filteredProducts.length === 0" class="text-center py-16 text-gray-500 text-lg">
        Ничего не найдено
      </div>
      
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id" 
          class="group relative flex flex-col bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <router-link :to="'/product/' + product.id" class="flex-1 block p-3">
            <div class="relative aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
              <img
                :src="product.image ? '/src/assets/products/' + product.image : '/src/assets/products/picture.png'"
                :alt="product.model_name"
                class="w-3/4 h-3/4 object-contain"
                @error="(e) => e.target.src = '/src/assets/products/picture.png'"
              >
              <div v-if="product.discount > 0" class="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 rounded">
                -{{ product.discount }}%
              </div>
            </div>
            
            <div class="flex flex-col gap-1">
              <p class="text-xs text-gray-500 uppercase tracking-wide">{{ product.manufacturer }}</p>
              <h3 class="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[40px] leading-tight">
                {{ product.model_name }}
              </h3>
              
              <div class="flex items-center gap-2 mt-2">
                <span v-if="product.discount > 0" class="text-xs text-gray-400 line-through">
                  {{ product.price.toLocaleString() }} ₽
                </span>
                <span class="text-base font-bold text-gray-900">
                  {{ calculateDiscount(product.price, product.discount).toLocaleString() }} ₽
                </span>
              </div>
              <div class="text-xs text-gray-500 mt-1">
                В наличии: {{ product.stock_quantity || 0 }} шт.
              </div>
            </div>
          </router-link>
          
          <div class="p-3 pt-0 mt-auto">
            <div v-if="getItemQuantity(product.id) > 0" class="flex items-center justify-between bg-gray-100 rounded-lg p-1">
              <button 
                @click.stop="store.decreaseQuantity(product.id)"
                class="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-gray-50 text-gray-600 font-bold"
              >
                -
              </button>
              <span class="font-semibold text-sm">{{ getItemQuantity(product.id) }}</span>
              <button 
                @click.stop="handleAddToCart(product)"
                class="w-8 h-8 flex items-center justify-center bg-black rounded-md shadow-sm hover:bg-gray-800 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="getItemQuantity(product.id) >= (product.stock_quantity || 0)"
              >
                +
              </button>
            </div>
            <button
              v-else
              @click.stop="handleAddToCart(product)"
              class="w-full py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!product.stock_quantity || product.stock_quantity <= 0"
            >
              {{ 
                !product.stock_quantity || product.stock_quantity <= 0 
                  ? 'Нет в наличии' 
                  : (store.user ? 'В корзину' : 'Войти') 
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useShopStore } from '../store';
import CustomSelect from '../components/CustomSelect.vue';

const store = useShopStore();
const router = useRouter();
const products = ref([]);
const categories = ref([]);
const manufacturers = ref([]);
const loading = ref(true);

const searchQuery = ref('');
const selectedCategory = ref('');
const selectedManufacturer = ref('');
const sortBy = ref('name');

const categoryOptions = computed(() => 
  categories.value.map(c => ({ label: c.name, value: c.id }))
);

const manufacturerOptions = computed(() => 
  manufacturers.value.map(m => ({ label: m.name, value: m.id }))
);

const sortOptions = [
  { label: 'По умолчанию', value: 'name' },
  { label: 'Сначала дешевле', value: 'price_asc' },
  { label: 'Сначала дороже', value: 'price_desc' }
];

const calculateDiscount = (price, discount) => {
  return Math.round((price || 0) * (1 - (discount || 0) / 100));
};

onMounted(async () => {
  try {
    const results = await Promise.allSettled([
      axios.get('http://localhost:3001/api/products'),
      axios.get('http://localhost:3001/api/categories'),
      axios.get('http://localhost:3001/api/manufacturers')
    ]);
    const [pRes, cRes, mRes] = results;
    products.value = pRes.status === 'fulfilled' ? pRes.value.data : [];
    categories.value = cRes.status === 'fulfilled' ? cRes.value.data : [];
    manufacturers.value = mRes.status === 'fulfilled' ? mRes.value.data : [];
  } catch (err) {
    console.error('Error fetching data:', err);
  } finally {
    loading.value = false;
  }
});

const filteredProducts = computed(() => {
  let result = [...products.value];
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(p =>
      (p.model_name && p.model_name.toLowerCase().includes(q)) ||
      (p.manufacturer && p.manufacturer.toLowerCase().includes(q))
    );
  }
  if (selectedCategory.value) {
    result = result.filter(p => p.type_id === parseInt(selectedCategory.value));
  }
  if (selectedManufacturer.value) {
    result = result.filter(p => p.brand_id === parseInt(selectedManufacturer.value));
  }
  if (sortBy.value === 'price_asc') {
    result.sort((a, b) => calculateDiscount(a.price, a.discount) - calculateDiscount(b.price, b.discount));
  } else if (sortBy.value === 'price_desc') {
    result.sort((a, b) => calculateDiscount(b.price, b.discount) - calculateDiscount(a.price, a.discount));
  } else {
    result.sort((a, b) => (a.model_name || '').localeCompare(b.model_name || ''));
  }
  return result;
});

const handleAddToCart = (product) => {
  if (!store.user) {
    router.push('/login');
    return;
  }
  store.addToCart({
    ...product,
    name: product.model_name,
    price: calculateDiscount(product.price, product.discount)
  });
};

const getItemQuantity = (productId) => {
  const item = store.cart.find(p => p.id === productId || p.device_id === productId);
  return item ? item.quantity : 0;
};
</script>
