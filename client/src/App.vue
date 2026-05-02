<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Sidebar />
    <main :class="['transition-all duration-300', sidebarCollapsed ? 'ml-20' : 'ml-64']">
      <Header />
      <div class="p-6">
        <router-view />
      </div>
    </main>
    <ToastContainer />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import ToastContainer from './components/ToastContainer.vue'
import { useAppStore } from './stores/appStore'

const appStore = useAppStore()
const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)

onMounted(() => {
  appStore.initDarkMode()
})
</script>
