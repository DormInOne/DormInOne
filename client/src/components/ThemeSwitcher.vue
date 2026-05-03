<template>
  <div class="theme-switcher relative">
    <button
      class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      @click="showPanel = !showPanel"
    >
      <component :is="currentThemeIcon" class="w-5 h-5" />
      <span v-if="showLabel" class="text-sm font-medium">{{ currentThemeName }}</span>
    </button>

    <div
      v-if="showPanel"
      class="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50 animate-fade-scale-in"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">主题设置</h3>
        <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" @click="showPanel = false">
          <X class="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">外观模式</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="theme in settingsStore.THEMES"
              :key="theme.value"
              class="theme-btn p-3 rounded-lg border-2 transition-all duration-200"
              :class="[
                settingsStore.theme === theme.value 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              ]"
              @click="selectTheme(theme.value)"
            >
              <component :is="getThemeIcon(theme.value)" class="w-6 h-6 mx-auto mb-1" />
              <span class="text-xs">{{ theme.name }}</span>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">主色调</label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="color in settingsStore.PRIMARY_COLORS"
              :key="color.value"
              class="color-btn w-10 h-10 rounded-full transition-transform duration-200 hover:scale-110"
              :style="{ backgroundColor: color.value, boxShadow: settingsStore.primaryColor === color.value ? `0 0 0 3px ${color.value}40` : 'none' }"
              :title="color.name"
              @click="selectColor(color.value)"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">界面布局</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="layout in settingsStore.LAYOUTS"
              :key="layout.value"
              class="layout-btn p-3 rounded-lg border-2 transition-all duration-200"
              :class="[
                settingsStore.layout === layout.value 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              ]"
              @click="selectLayout(layout.value)"
            >
              <component :is="layout.value === 'compact' ? LayoutGrid : Maximize2" class="w-5 h-5 mx-auto mb-1" />
              <span class="text-xs">{{ layout.name }}</span>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">字体大小</label>
          <div class="flex items-center gap-2">
            <button
              v-for="size in settingsStore.FONT_SIZES"
              :key="size.value"
              class="flex-1 py-2 px-3 rounded-lg border-2 text-sm transition-all duration-200"
              :class="[
                settingsStore.fontSize === size.value 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              ]"
              @click="selectFontSize(size.value)"
            >
              {{ size.name }}
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div class="flex items-center gap-2">
            <Sparkles class="w-4 h-4 text-gray-500" />
            <span class="text-sm text-gray-600 dark:text-gray-400">动画过渡</span>
          </div>
          <Switch v-model="settingsStore.userSettings.animationsEnabled" />
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          class="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          @click="resetToDefault"
        >
          恢复默认设置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>import { ref, computed } from 'vue';
import { Sun, Moon, Leaf, X, LayoutGrid, Maximize2, Sparkles } from 'lucide-vue-next';
import Switch from './Switch.vue';
import { useSettingsStore } from '../stores/settingsStore';
import { useAppStore } from '../stores/appStore';
const settingsStore = useSettingsStore();
const appStore = useAppStore();
const showPanel = ref(false);
const showLabel = ref(true);
const currentThemeName = computed(() => {
 const theme = settingsStore.THEMES.find(t => t.value === settingsStore.theme);
 return theme?.name || '亮色模式';
});
const currentThemeIcon = computed(() => {
 switch (settingsStore.theme) {
 case 'dark': return Moon;
 case 'warm': return Leaf;
 default: return Sun;
 }
});
const getThemeIcon = (theme) => {
 switch (theme) {
 case 'dark': return Moon;
 case 'warm': return Leaf;
 default: return Sun;
 }
};
const selectTheme = async (theme) => {
 settingsStore.userSettings.theme = theme;
 settingsStore.applyTheme();
 await saveSettings();
};
const selectColor = async (color) => {
 settingsStore.userSettings.primaryColor = color;
 settingsStore.applyPrimaryColor(color);
 await saveSettings();
};
const selectLayout = async (layout) => {
 settingsStore.userSettings.layout = layout;
 settingsStore.applyLayout();
 await saveSettings();
};
const selectFontSize = async (size) => {
 settingsStore.userSettings.fontSize = size;
 settingsStore.applyFontSize();
 await saveSettings();
};
const resetToDefault = async () => {
 settingsStore.userSettings = settingsStore.getDefaultUserSettings();
 settingsStore.applyTheme();
 settingsStore.applyFontSize();
 settingsStore.applyLayout();
 settingsStore.applyPrimaryColor('#3B82F6');
 await saveSettings();
};
const saveSettings = async () => {
 if (appStore.userId) {
 await settingsStore.saveUserSettings(appStore.userId, settingsStore.userSettings);
 }
};
</script>

<style scoped>
@keyframes fade-scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-scale-in {
  animation: fade-scale-in 0.2s ease-out;
}

.theme-btn:hover {
  transform: translateY(-2px);
}

.color-btn {
  transition: transform 0.2s, box-shadow 0.2s;
}

</style>