<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-900">Управление товарами</h2>
      <button 
        @click="openModal()"
        class="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
      >
        + Добавить товар
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-base text-gray-600">
          <thead class="bg-gray-50 text-gray-900 font-semibold uppercase tracking-wider text-xs border-b border-gray-200">
            <tr>
              <th class="px-6 py-5">ID</th>
              <th class="px-6 py-5">Фото</th>
              <th class="px-6 py-5">Название</th>
              <th class="px-6 py-5">Категория</th>
              <th class="px-6 py-5">Бренд</th>
              <th class="px-6 py-5 text-right">Цена</th>
              <th class="px-6 py-5 text-center">Склад</th>
              <th class="px-6 py-5 text-right">Действия</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-5 font-mono text-sm text-gray-400">#{{ product.id }}</td>
              <td class="px-6 py-5">
                <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center p-2">
                  <img 
                    :src="product.image ? '/src/assets/products/' + product.image : '/src/assets/products/picture.png'" 
                    class="max-w-full max-h-full object-contain mix-blend-multiply"
                    @error="(e) => e.target.src = '/src/assets/products/picture.png'"
                  >
                </div>
              </td>
              <td class="px-6 py-5 font-medium text-gray-900">{{ product.model_name }}</td>
              <td class="px-6 py-5">{{ product.category }}</td>
              <td class="px-6 py-5">{{ product.manufacturer }}</td>
              <td class="px-6 py-5 text-right font-medium">{{ product.price.toLocaleString() }} ₽</td>
              <td class="px-6 py-5 text-center">
                <span 
                  class="px-2 py-1 rounded-full text-xs font-bold"
                  :class="product.stock_quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ product.stock_quantity || 0 }} шт.
                </span>
              </td>
              <td class="px-6 py-5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    @click="openModal(product)"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Редактировать"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    @click="deleteProduct(product.id)"
                    class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Удалить"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" @click="showModal = false" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div @click.stop class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 class="text-xl font-bold text-gray-900">{{ isEditing ? 'Редактирование товара' : 'Новый товар' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-black">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveProduct" class="p-6">
          <div class="flex flex-col md:flex-row gap-8">
            <div class="w-full md:w-1/3 flex flex-col gap-4">
              <div class="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                <img 
                  v-if="form.image_url && !imageLoadError"
                  :src="'/src/assets/products/' + form.image_url" 
                  class="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                  @error="imageLoadError = true"
                  @load="imageLoadError = false"
                >
                <div v-else class="text-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm">Нет изображения</span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Имя файла</label>
                <input v-model="form.image_url" @input="imageLoadError = false" type="text" placeholder="image.png" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 outline-none">
              </div>
            </div>

            <div class="w-full md:w-2/3 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Название модели</label>
                  <input v-model="form.model_name" type="text" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 outline-none">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Цена (₽)</label>
                  <input v-model.number="form.price" type="number" required min="0" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 outline-none">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Скидка (%)</label>
                  <input v-model.number="form.discount" type="number" min="0" max="100" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 outline-none">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                  <CustomSelect 
                    v-model="form.type_id" 
                    :options="categoryOptions" 
                    placeholder="Выберите категорию"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Бренд</label>
                  <CustomSelect 
                    v-model="form.brand_id" 
                    :options="manufacturerOptions" 
                    placeholder="Выберите бренд"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Поставщик</label>
                  <CustomSelect 
                    v-model="form.supplier_id" 
                    :options="supplierOptions" 
                    placeholder="Выберите поставщика"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Количество на складе</label>
                  <input v-model.number="form.stock_quantity" type="number" required min="0" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 outline-none">
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Характеристики</label>
                <textarea v-model="form.specifications" rows="4" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 outline-none"></textarea>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-100">
            <button type="button" @click="showModal = false" class="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">Отмена</button>
            <button type="submit" class="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import axios from 'axios';
import CustomSelect from '../CustomSelect.vue';

const products = ref([]);
const categories = ref([]);
const manufacturers = ref([]);
const suppliers = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const editId = ref(null);
const imageLoadError = ref(false);

const form = reactive({
  model_name: '',
  price: 0,
  type_id: null,
  brand_id: null,
  supplier_id: null,
  stock_quantity: 0,
  discount: 0,
  image_url: '',
  specifications: ''
});

const categoryOptions = computed(() => categories.value.map(c => ({ label: c.name, value: c.id })));
const manufacturerOptions = computed(() => manufacturers.value.map(m => ({ label: m.name, value: m.id })));
const supplierOptions = computed(() => suppliers.value.map(s => ({ label: s.name, value: s.id })));

const fetchData = async () => {
  try {
    const [pRes, cRes, mRes, sRes] = await Promise.all([
      axios.get('http://localhost:3001/api/products'),
      axios.get('http://localhost:3001/api/categories'),
      axios.get('http://localhost:3001/api/manufacturers'),
      axios.get('http://localhost:3001/api/suppliers')
    ]);
    products.value = pRes.data;
    categories.value = cRes.data;
    manufacturers.value = mRes.data;
    suppliers.value = sRes.data;
  } catch (err) {
    console.error('Error fetching data:', err);
  }
};

onMounted(fetchData);

const openModal = (product = null) => {
  if (product) {
    isEditing.value = true;
    editId.value = product.id;
    Object.assign(form, {
      model_name: product.model_name,
      price: product.price,
      type_id: product.type_id,
      brand_id: product.brand_id,
      supplier_id: product.supplier_id,
      stock_quantity: product.stock_quantity,
      discount: product.discount,
      image_url: product.image,
      specifications: product.specifications
    });
  } else {
    isEditing.value = false;
    editId.value = null;
    Object.assign(form, {
      model_name: '',
      price: 0,
      type_id: '',
      brand_id: '',
      supplier_id: '',
      stock_quantity: 0,
      discount: 0,
      image_url: '',
      specifications: ''
    });
  }
  showModal.value = true;
};

const saveProduct = async () => {
  try {
    if (isEditing.value) {
      await axios.put(`http://localhost:3001/api/products/${editId.value}`, form);
    } else {
      await axios.post('http://localhost:3001/api/products', form);
    }
    await fetchData();
    showModal.value = false;
  } catch (err) {
    console.error('Error saving product:', err);
    alert('Ошибка сохранения: ' + (err.response?.data?.message || err.message));
  }
};

const deleteProduct = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
  try {
    await axios.delete(`http://localhost:3001/api/products/${id}`);
    await fetchData();
  } catch (err) {
    console.error('Error deleting product:', err);
    alert('Ошибка удаления: ' + (err.response?.data?.message || err.message));
  }
};
</script>
