<template>
  <div 
    class="switch-wrap"
    :class="{ active: modelValue }"
    @click="handleClick"
  >
    <div class="switch-circle"></div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const handleClick = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>

<style scoped>
.switch-wrap {
  width: 46px;
  height: 24px;
  background-color: #dcdcdc;
  border-radius: 999px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.switch-circle {
  width: 20px;
  height: 20px;
  background: #ffffff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left 0.3s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.switch-wrap.active {
  background-color: #409eff;
}

.switch-wrap.active .switch-circle {
  left: 24px;
}
</style>