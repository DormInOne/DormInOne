<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4 flex-wrap">
        <button class="btn btn-primary inline-flex items-center gap-2 whitespace-nowrap" @click="openAddModal">
          <Plus class="w-4 h-4" />
          添加排班
        </button>
        <button class="btn btn-secondary inline-flex items-center gap-2 whitespace-nowrap" @click="openSwapModal">
          <ArrowLeftRight class="w-4 h-4" />
          换值班
        </button>
        <button class="btn btn-outline inline-flex items-center gap-2 whitespace-nowrap" @click="openManageModal">
          <List class="w-4 h-4" />
          管理排班
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn btn-secondary transition-all duration-200 hover:scale-105 hover:bg-gray-200 dark:hover:bg-gray-600" @click="prevWeek">
          <ChevronLeft class="w-4 h-4" />
        </button>
        <span class="text-gray-700 dark:text-gray-300 font-medium min-w-[120px] text-center">
          {{ weekRange }}
        </span>
        <button class="btn btn-secondary transition-all duration-200 hover:scale-105 hover:bg-gray-200 dark:hover:bg-gray-600" @click="nextWeek">
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="card p-6">
      <div class="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div
          v-for="day in weekDays"
          :key="day.date"
          :class="[
            'p-3 rounded-lg transition-all duration-300',
            day.isToday ? 'bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-200 dark:ring-primary-800' : 'bg-gray-50 dark:bg-gray-700'
          ]"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ day.name }}
            </span>
            <span :class="[
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300',
              day.isToday ? 'bg-primary-500 text-white scale-110' : 'bg-gray-200 dark:bg-gray-600'
            ]">
              {{ day.day }}
            </span>
          </div>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="item in getScheduleForDay(day.date)"
              :key="item.id"
              :class="[
                'p-2 rounded-md text-sm cursor-pointer transition-all duration-300 group',
                item.completed
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 hover:scale-[1.02] hover:shadow-sm'
              ]"
              @click="toggleComplete(item)"
            >
              <div class="flex items-center justify-between">
                <p class="font-medium truncate">{{ item.roommateName }}</p>
                <button 
                  class="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded transition-all duration-200"
                  @click.stop="openEditModal(item)"
                >
                  <Edit class="w-3 h-3" />
                </button>
              </div>
              <p class="text-xs opacity-75 mt-1">{{ item.task }}</p>
              <div v-if="item.isRecurring" class="flex items-center gap-1 mt-1">
                <Repeat class="w-3 h-3 text-xs opacity-50" />
                <span class="text-xs opacity-50">固定</span>
              </div>
            </div>
            <button
              v-if="getScheduleForDay(day.date).length === 0"
              class="w-full p-3 text-xs text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-primary-400 hover:text-primary-500 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600"
              @click="openAddModalWithDate(day.date)"
            >
              <Plus class="w-3 h-3 inline mr-1" />
              添加任务
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="card p-6 w-full max-w-md mx-4 transform transition-all duration-300 animate-modal-in">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingSchedule ? '编辑排班' : '添加排班' }}
          </h3>
          <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200" @click="closeModal">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form @submit.prevent="saveSchedule">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                日期
              </label>
              <input
                v-model="formData.date"
                type="date"
                required
                class="form-input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                室友 <span class="text-gray-400">(可多选)</span>
              </label>
              <div class="space-y-2">
                <div
                  v-for="r in roommates"
                  :key="r.id"
                  :class="[
                    'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all duration-200',
                    formData.roommateIds.includes(r.id) 
                      ? 'bg-primary-100 dark:bg-primary-900/30 ring-1 ring-primary-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  ]"
                  @click="toggleRoommate(r.id)"
                >
                  <div :class="[
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                    formData.roommateIds.includes(r.id) ? 'border-primary-500 bg-primary-500' : 'border-gray-300 dark:border-gray-600'
                  ]">
                    <Check v-if="formData.roommateIds.includes(r.id)" class="w-3 h-3 text-white" />
                  </div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ r.name }}</span>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                任务
              </label>
              <select v-model="formData.task" class="form-select">
                <option value="扫地">扫地</option>
                <option value="拖地">拖地</option>
                <option value="倒垃圾">倒垃圾</option>
                <option value="擦窗户">擦窗户</option>
                <option value="整理书桌">整理书桌</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="formData.isRecurring"
                  type="checkbox"
                  class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">固定值班（每周重复）</span>
              </label>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button type="button" class="btn btn-secondary flex-1" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary flex-1">
              {{ editingSchedule ? '保存修改' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showSwapModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="card p-6 w-full max-w-lg mx-4 transform transition-all duration-300 animate-modal-in">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">交换值班</h3>
          <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200" @click="closeSwapModal">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              选择要交换的排班
            </label>
            <select v-model="swapData.fromId" class="form-select">
              <option value="">请选择排班</option>
              <option v-for="s in schedule" :key="s.id" :value="s.id">
                {{ s.date }} - {{ s.roommateName }} - {{ s.task }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              选择交换对象
            </label>
            <select v-model="swapData.toId" class="form-select">
              <option value="">请选择排班</option>
              <option v-for="s in schedule.filter(s2 => s2.id !== swapData.fromId)" :key="s.id" :value="s.id">
                {{ s.date }} - {{ s.roommateName }} - {{ s.task }}
              </option>
            </select>
          </div>
          <div class="flex gap-3 mt-6">
            <button type="button" class="btn btn-secondary flex-1" @click="closeSwapModal">
              取消
            </button>
            <button type="button" class="btn btn-primary flex-1" @click="swapSchedule">
              确认交换
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showManageModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="card p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col transform transition-all duration-300 animate-modal-in">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">管理排班</h3>
          <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200" @click="closeManageModal">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">日期</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">室友</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">任务</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">状态</th>
                <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in schedule"
                :key="item.id"
                class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <td class="py-3 px-4 text-sm text-gray-900 dark:text-white">{{ item.date }}</td>
                <td class="py-3 px-4 text-sm text-gray-900 dark:text-white">{{ item.roommateName }}</td>
                <td class="py-3 px-4 text-sm text-gray-900 dark:text-white">{{ item.task }}</td>
                <td class="py-3 px-4">
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    item.completed ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  ]">
                    {{ item.completed ? '已完成' : '未完成' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200" @click="openEditModal(item)">
                      <Edit class="w-4 h-4 text-gray-500" />
                    </button>
                    <button class="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors duration-200" @click="confirmDelete(item)">
                      <Trash2 class="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="schedule.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar class="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>暂无排班记录</p>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
      :show="showConfirmModal"
      title="确认删除"
      :message="confirmMessage"
      type="danger"
      @confirm="handleDelete"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script setup>import { ref, computed, onMounted } from 'vue';
import { Plus, ChevronLeft, ChevronRight, X, Edit, Trash2, ArrowLeftRight, List, Repeat, Check, Calendar } from 'lucide-vue-next';
import { scheduleApi, roommatesApi } from '../services/api';
import { useToast } from '../composables/useToast';
import ConfirmModal from '../components/ConfirmModal.vue';
const { success, error } = useToast();
const roommates = ref([]);
const schedule = ref([]);
const currentWeekStart = ref(getWeekStart());
const showModal = ref(false);
const showSwapModal = ref(false);
const showManageModal = ref(false);
const showConfirmModal = ref(false);
const editingSchedule = ref(null);
const deletingSchedule = ref(null);
const confirmMessage = ref('');
const formData = ref({
 date: '',
 roommateIds: [],
 task: '扫地',
 isRecurring: false
});
const swapData = ref({
 fromId: '',
 toId: ''
});
function getWeekStart(date = new Date()) {
 const d = new Date(date);
 const day = d.getDay();
 const diff = d.getDate() - day + (day === 0 ? -6 : 1);
 return new Date(d.setDate(diff));
}
const weekDays = computed(() => {
 const days = [];
 const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
 const today = new Date().toDateString();
 for (let i = 0; i < 7; i++) {
 const date = new Date(currentWeekStart.value);
 date.setDate(currentWeekStart.value.getDate() + i);
 days.push({
 date: date.toISOString().split('T')[0],
 name: dayNames[i],
 day: date.getDate(),
 isToday: date.toDateString() === today
 });
 }
 return days;
});
const weekRange = computed(() => {
 const start = currentWeekStart.value;
 const end = new Date(start);
 end.setDate(start.getDate() + 6);
 return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
});
const getScheduleForDay = (date) => {
 return schedule.value.filter(s => s.date === date);
};
const prevWeek = () => {
 const newStart = new Date(currentWeekStart.value);
 newStart.setDate(currentWeekStart.value.getDate() - 7);
 currentWeekStart.value = newStart;
};
const nextWeek = () => {
 const newStart = new Date(currentWeekStart.value);
 newStart.setDate(currentWeekStart.value.getDate() + 7);
 currentWeekStart.value = newStart;
};
const loadData = async () => {
 try {
 const [roommatesRes, scheduleRes] = await Promise.all([
 roommatesApi.getAll(),
 scheduleApi.getAll()
 ]);
 roommates.value = roommatesRes.data;
 schedule.value = scheduleRes.data;
 }
 catch (err) {
 error('加载失败', '无法加载排班数据，请检查后端服务是否正常运行');
 console.error('加载数据失败:', err);
 }
};
const toggleRoommate = (id) => {
 const index = formData.value.roommateIds.indexOf(id);
 if (index === -1) {
 formData.value.roommateIds.push(id);
 }
 else {
 formData.value.roommateIds.splice(index, 1);
 }
};
const openAddModal = () => {
 editingSchedule.value = null;
 const today = new Date().toISOString().split('T')[0];
 formData.value = { date: today, roommateIds: [], task: '扫地', isRecurring: false };
 showModal.value = true;
};
const openAddModalWithDate = (date) => {
 editingSchedule.value = null;
 formData.value = { date, roommateIds: [], task: '扫地', isRecurring: false };
 showModal.value = true;
};
const openEditModal = (item) => {
 editingSchedule.value = item;
 formData.value = {
 date: item.date,
 roommateIds: [item.roommateId],
 task: item.task,
 isRecurring: item.isRecurring || false
 };
 showModal.value = true;
};
const closeModal = () => {
 showModal.value = false;
 editingSchedule.value = null;
};
const saveSchedule = async () => {
 try {
 if (formData.value.roommateIds.length === 0) {
 error('添加失败', '请至少选择一个室友');
 return;
 }
 const savePromises = formData.value.roommateIds.map(async (roommateId) => {
 const roommate = roommates.value.find(r => r.id === roommateId);
 const data = {
 date: formData.value.date,
 roommateId,
 roommateName: roommate?.name || '',
 task: formData.value.task,
 completed: false,
 isRecurring: formData.value.isRecurring
 };
 if (editingSchedule.value) {
 return scheduleApi.update(editingSchedule.value.id, data);
 }
 else {
 return scheduleApi.create(data);
 }
 });
 await Promise.all(savePromises);
 if (editingSchedule.value) {
 success('修改成功', '排班已更新');
 }
 else {
 success('添加成功', `已为 ${formData.value.roommateIds.length} 位室友添加排班`);
 }
 closeModal();
 loadData();
 }
 catch (err) {
 error('保存失败', '无法保存排班信息');
 console.error('保存失败:', err);
 }
};
const toggleComplete = async (item) => {
 try {
 await scheduleApi.update(item.id, { completed: !item.completed });
 success(item.completed ? '任务未完成' : '任务已完成');
 loadData();
 }
 catch (err) {
 error('更新失败', '无法更新任务状态');
 console.error('更新失败:', err);
 }
};
const openSwapModal = () => {
 swapData.value = { fromId: '', toId: '' };
 showSwapModal.value = true;
};
const closeSwapModal = () => {
 showSwapModal.value = false;
};
const swapSchedule = async () => {
 if (!swapData.value.fromId || !swapData.value.toId) {
 error('交换失败', '请选择要交换的两个排班');
 return;
 }
 try {
 const fromSchedule = schedule.value.find(s => s.id === swapData.value.fromId);
 const toSchedule = schedule.value.find(s => s.id === swapData.value.toId);
 if (!fromSchedule || !toSchedule) {
 error('交换失败', '排班信息不存在');
 return;
 }
 await Promise.all([
 scheduleApi.update(fromSchedule.id, {
 roommateId: toSchedule.roommateId,
 roommateName: toSchedule.roommateName
 }),
 scheduleApi.update(toSchedule.id, {
 roommateId: fromSchedule.roommateId,
 roommateName: fromSchedule.roommateName
 })
 ]);
 success('交换成功', `${fromSchedule.roommateName} 和 ${toSchedule.roommateName} 的值班已交换`);
 closeSwapModal();
 loadData();
 }
 catch (err) {
 error('交换失败', '无法交换排班');
 console.error('交换失败:', err);
 }
};
const openManageModal = () => {
 showManageModal.value = true;
};
const closeManageModal = () => {
 showManageModal.value = false;
};
const confirmDelete = (item) => {
 deletingSchedule.value = item;
 confirmMessage.value = `确定要删除 ${item.roommateName} 在 ${item.date} 的排班吗？`;
 showConfirmModal.value = true;
};
const closeConfirmModal = () => {
 showConfirmModal.value = false;
 deletingSchedule.value = null;
};
const handleDelete = async () => {
 try {
 await scheduleApi.delete(deletingSchedule.value.id);
 success('删除成功', '排班已删除');
 loadData();
 closeConfirmModal();
 closeManageModal();
 }
 catch (err) {
 error('删除失败', '无法删除排班');
 console.error('删除失败:', err);
 }
};
onMounted(() => {
 loadData();
});
</script>

<style scoped>
@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal-in {
  animation: modal-in 0.2s ease-out;
}

.max-h-64::-webkit-scrollbar {
  width: 4px;
}

.max-h-64::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-64::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.max-h-64::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>