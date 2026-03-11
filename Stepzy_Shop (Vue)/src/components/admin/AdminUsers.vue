<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-gray-600">
        <thead class="bg-gray-50 text-gray-900 font-semibold uppercase tracking-wider text-xs border-b border-gray-200">
          <tr>
            <th class="px-6 py-4">ID</th>
            <th class="px-6 py-4">ФИО</th>
            <th class="px-6 py-4">Email</th>
            <th class="px-6 py-4">Роль</th>
            <th class="px-6 py-4">Дата регистрации</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 font-mono text-xs text-gray-400">#{{ user.id }}</td>
            <td class="px-6 py-4 font-medium text-gray-900">
              {{ user.last_name }} {{ user.first_name }} {{ user.middle_name || '' }}
            </td>
            <td class="px-6 py-4">{{ user.email }}</td>
            <td class="px-6 py-4">
              <span 
                class="px-2 py-1 rounded-full text-xs font-semibold"
                :class="{
                  'bg-purple-100 text-purple-700': user.role === 'администратор',
                  'bg-blue-100 text-blue-700': user.role === 'менеджер',
                  'bg-gray-100 text-gray-700': user.role === 'клиент'
                }"
              >
                {{ user.role }}
              </span>
            </td>
            <td class="px-6 py-4">
              {{ user.registration_date ? new Date(user.registration_date).toLocaleDateString() : '—' }}
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

const users = ref([]);

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3001/api/admin/users');
    users.value = res.data;
  } catch (err) {
    console.error('Error fetching users:', err);
  }
});
</script>
