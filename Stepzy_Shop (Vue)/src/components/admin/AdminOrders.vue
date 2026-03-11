<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 min-h-[400px]">
    <div class="overflow-visible">
      <table class="w-full text-left text-sm text-gray-600">
        <thead class="bg-gray-50 text-gray-900 font-semibold uppercase tracking-wider text-xs border-b border-gray-200">
          <tr>
            <th class="px-6 py-4">ID</th>
            <th class="px-6 py-4">Дата</th>
            <th class="px-6 py-4">Клиент</th>
            <th class="px-6 py-4">Сумма</th>
            <th class="px-6 py-4">Статус</th>
            <th class="px-6 py-4">Действия</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 font-mono text-xs text-gray-400">#{{ order.id }}</td>
            <td class="px-6 py-4">{{ new Date(order.order_date).toLocaleDateString() }}</td>
            <td class="px-6 py-4">
              <div class="font-medium text-gray-900">{{ order.user_name }}</div>
              <div class="text-xs text-gray-500">{{ order.user_email }}</div>
            </td>
            <td class="px-6 py-4 font-bold">{{ order.total_price ? order.total_price.toLocaleString() : 0 }} ₽</td>
            <td class="px-6 py-4">
              <span 
                class="px-2 py-1 rounded-full text-xs font-semibold"
                :class="{
                  'bg-green-100 text-green-700': order.order_status === 'Завершен',
                  'bg-blue-100 text-blue-700': order.order_status === 'Оформлен',
                  'bg-yellow-100 text-yellow-700': order.order_status === 'В обработке',
                  'bg-orange-100 text-orange-700': order.order_status === 'Доставляется',
                  'bg-red-100 text-red-700': order.order_status === 'Отказ'
                }"
              >
                {{ order.order_status }}
              </span>
            </td>
            <td class="px-6 py-4 relative">
              <div class="w-40">
                <CustomSelect 
                  v-model="order.newStatus" 
                  :options="statusOptions"
                  :show-placeholder-in-list="false"
                  placeholder="Статус"
                  @update:model-value="updateStatus(order)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import CustomSelect from '../CustomSelect.vue';

const orders = ref([]);

const statusOptions = [
  { label: 'Оформлен', value: 'Оформлен' },
  { label: 'В обработке', value: 'В обработке' },
  { label: 'Доставляется', value: 'Доставляется' },
  { label: 'Завершен', value: 'Завершен' },
  { label: 'Отказ', value: 'Отказ' }
];

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3001/api/admin/orders');
    orders.value = res.data.map(o => ({ ...o, newStatus: o.order_status }));
  } catch (err) {
    console.error('Error fetching orders:', err);
  }
});

const updateStatus = async (order) => {
  try {
    await axios.put(`http://localhost:3001/api/admin/orders/${order.id}/status`, {
      status: order.newStatus
    });
    order.order_status = order.newStatus;
    alert(`Статус заказа #${order.id} обновлен`);
  } catch (err) {
    console.error('Error updating status:', err);
    alert('Ошибка обновления статуса');
  }
};
</script>
