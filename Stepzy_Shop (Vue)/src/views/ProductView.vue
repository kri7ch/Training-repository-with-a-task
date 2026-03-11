<template>
  <div class="py-12">
    <div v-if="loading" class="text-center py-10 text-gray-500">Загрузка...</div>
    <div v-else-if="!product" class="text-center py-10 text-gray-500">Товар не найден</div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
      <div class="space-y-4">
        <div class="relative bg-gray-50 rounded-xl overflow-hidden aspect-square flex items-center justify-center p-8">
          <img
            :src="currentImage ? '/src/assets/products/' + currentImage : '/src/assets/products/picture.png'"
            :alt="product.model_name"
            class="max-w-full max-h-full object-contain"
            @error="(e) => e.target.src = '/src/assets/products/picture.png'"
          >
          <div v-if="product.discount > 0" class="absolute top-4 left-4 bg-black text-white text-sm font-bold px-3 py-1 rounded">
            -{{ product.discount }}%
          </div>
        </div>
        
        <div v-if="product.images && product.images.length > 1" class="flex gap-2 overflow-x-auto pb-2">
          <button 
            v-for="(img, index) in product.images" 
            :key="index" 
            class="w-20 h-20 flex-shrink-0 border-2 rounded-lg p-2 bg-gray-50 hover:border-gray-300 transition-colors"
            :class="currentImageIndex === index ? 'border-black' : 'border-transparent'"
            @click="currentImageIndex = index"
          >
            <img
              :src="'/src/assets/products/' + img"
              :alt="product.model_name"
              class="w-full h-full object-contain"
              @error="(e) => e.target.src = '/src/assets/products/picture.png'"
            >
          </button>
        </div>
      </div>

      <div class="flex flex-col">
        <div class="mb-6">
          <p class="text-sm text-gray-500 uppercase tracking-wider mb-2 font-medium">
            {{ product.manufacturer }} / {{ product.category }}
          </p>
          <h1 class="text-3xl font-extrabold text-gray-900 leading-tight mb-4">
            {{ product.model_name }}
          </h1>
          <div class="text-sm text-gray-500">
            В наличии: <span :class="{'text-red-500': !product.stock_quantity, 'text-green-600': product.stock_quantity > 0}">{{ product.stock_quantity || 0 }} шт.</span>
          </div>
        </div>
        
        <div class="mb-8 pb-8 border-b border-gray-100">
          <div class="flex items-baseline gap-4">
            <span v-if="product.discount > 0" class="text-lg text-gray-400 line-through">
              {{ product.price.toLocaleString() }} ₽
            </span>
            <span class="text-4xl font-bold text-gray-900">
              {{ calculateDiscount(product.price, product.discount).toLocaleString() }} ₽
            </span>
          </div>
        </div>

        <div class="mb-8">
          <div v-if="getItemQuantity(product.id) > 0" class="flex items-center gap-4">
            <div class="flex items-center border border-gray-200 rounded-xl">
              <button 
                @click="store.decreaseQuantity(product.id)"
                class="w-12 h-12 flex items-center justify-center text-xl font-bold hover:bg-gray-50 rounded-l-xl transition-colors"
              >
                &minus;
              </button>
              <span class="w-12 text-center text-lg font-medium">{{ getItemQuantity(product.id) }}</span>
              <button 
                @click="handleAddToCart"
                class="w-12 h-12 flex items-center justify-center text-xl font-bold hover:bg-gray-50 rounded-r-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="getItemQuantity(product.id) >= (product.stock_quantity || 0)"
              >
                &plus;
              </button>
            </div>
            <span class="text-sm text-gray-500">В корзине</span>
          </div>
          <button
            v-else
            @click="handleAddToCart"
            class="w-full py-4 bg-black text-white text-lg font-bold rounded-xl hover:bg-gray-800 transition-all hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!product.stock_quantity || product.stock_quantity <= 0"
          >
            {{ 
              !product.stock_quantity || product.stock_quantity <= 0 
                ? 'Нет в наличии' 
                : (store.user ? 'Добавить в корзину' : 'Войти, чтобы купить') 
            }}
          </button>
        </div>
        
        <div class="prose prose-sm text-gray-600">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Характеристики</h3>
          <p class="leading-relaxed">{{ product.specifications }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useShopStore } from '../store';

const route = useRoute();
const router = useRouter();
const store = useShopStore();
const product = ref(null);
const loading = ref(true);
const currentImageIndex = ref(0);

const calculateDiscount = (price, discount) => {
  return Math.round((price || 0) * (1 - (discount || 0) / 100));
};

const currentImage = computed(() => {
  if (product.value && product.value.images && product.value.images.length > 0) {
    return product.value.images[currentImageIndex.value];
  }
  return product.value?.image; 
});

onMounted(async () => {
  try {
    const res = await axios.get(`http://localhost:3001/api/products/${route.params.id}`);
    product.value = res.data;
  } catch (err) {
    console.error('Error fetching product:', err);
  } finally {
    loading.value = false;
  }
});

const handleAddToCart = () => {
  if (!store.user) {
    router.push('/login');
    return;
  }
  store.addToCart({
    ...product.value,
    name: product.value.model_name,
    price: calculateDiscount(product.value.price, product.value.discount)
  });
};

const getItemQuantity = (productId) => {
  const item = store.cart.find(p => p.id === productId || p.device_id === productId);
  return item ? item.quantity : 0;
};
</script>
