<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <template v-if="showMainLayout">
      <Sidebar />
      <main :class="['transition-all duration-300 ease-in-out', sidebarCollapsed ? 'ml-20' : 'ml-64']">
        <Header />
        <div class="p-6">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </template>
    <template v-else>
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </template>
    <ToastContainer />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.page-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.page-leave-to {
  opacity: 0;
  transform: scale(1.02);
}
</style>

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