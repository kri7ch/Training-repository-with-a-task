<template>
  <div class="relative" ref="selectRef">
    <button 
      type="button"
      @click="isOpen = !isOpen"
      class="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-black/5"
      :class="{'ring-2 ring-black/5 border-gray-300': isOpen}"
    >
      <span class="text-sm font-medium truncate mr-2" :class="modelValue ? 'text-gray-900' : 'text-gray-500'">
        {{ selectedLabel }}
      </span>
      <svg 
        class="w-4 h-4 text-gray-400 transition-transform duration-200"
        :class="{'rotate-180': isOpen}"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div 
        v-if="isOpen"
        class="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1 custom-scrollbar"
      >
        <div 
          v-if="placeholder && showPlaceholderInList"
          @click="selectOption('')"
          class="px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors"
          :class="{'bg-gray-50 font-medium': modelValue === ''}"
        >
          {{ placeholder }}
        </div>
        <div 
          v-for="option in options" 
          :key="option.value"
          @click="selectOption(option.value)"
          class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between group"
          :class="{'bg-gray-50 font-medium text-black': modelValue === option.value}"
        >
          <span>{{ option.label }}</span>
          <svg 
            v-if="modelValue === option.value"
            class="w-4 h-4 text-black"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Выберите...'
  },
  showPlaceholderInList: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const selectRef = ref(null);

const selectedLabel = computed(() => {
  if (!props.modelValue) return props.placeholder;
  const option = props.options.find(o => o.value === props.modelValue);
  return option ? option.label : props.placeholder;
});

const selectOption = (value) => {
  emit('update:modelValue', value);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>
