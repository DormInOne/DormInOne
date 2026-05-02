<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <template v-if="showMainLayout">
      <Sidebar />
      <main :class="['transition-all duration-300', sidebarCollapsed ? 'ml-20' : 'ml-64']">
        <Header />
        <div class="p-6">
          <router-view />
        </div>
      </main>
    </template>
    <template v-else>
      <router-view />
    </template>
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

const showMainLayout = computed(() => {
  return appStore.isLoggedIn && appStore.hasCompletedOnboarding
})

onMounted(() => {
  appStore.initDarkMode()
})
</script>