<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button class="btn btn-primary inline-flex items-center gap-2 whitespace-nowrap" @click="openAddModal">
          <Plus class="w-4 h-4" />
          添加室友
        </button>
      </div>
      <div class="relative">
        <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索室友..."
          class="form-input pl-10 w-64"
        />
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

    <div class="card p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="roommate in filteredRoommates"
          :key="roommate.id"
          class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <User class="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white">{{ roommate.name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ roommate.role === 'admin' ? '舍长' : '成员' }}
              </p>
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
            <Phone class="w-4 h-4 inline mr-1" />
            {{ roommate.phone || '未填写' }}
          </p>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-sm flex items-center gap-1 transition-transform hover:scale-105" @click="openEditModal(roommate)">
              <Edit class="w-3 h-3" />
              编辑
            </button>
            <button class="btn btn-danger btn-sm flex items-center gap-1 transition-transform hover:scale-105" @click="confirmDelete(roommate)">
              <Trash2 class="w-3 h-3" />
              删除
            </button>
          </div>
        </div>
      </div>
      <div v-if="filteredRoommates.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
        <User class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>暂无室友，点击上方按钮添加</p>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="card p-6 w-full max-w-md mx-4 transform transition-all duration-300">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingRoommate ? '编辑室友' : '添加室友' }}
          </h3>
          <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" @click="closeModal">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form @submit.prevent="saveRoommate">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                姓名
              </label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="form-input"
                placeholder="请输入姓名"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                手机号
              </label>
              <input
                v-model="formData.phone"
                type="tel"
                class="form-input"
                placeholder="请输入手机号"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                角色
              </label>
              <select v-model="formData.role" class="form-select">
                <option value="member">成员</option>
                <option value="admin">舍长</option>
              </select>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button type="button" class="btn btn-secondary flex-1" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary flex-1">
              {{ editingRoommate ? '保存修改' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, User, Phone, Edit, Trash2, X } from 'lucide-vue-next'
import { roommatesApi } from '../services/api'
import { useToast } from '../composables/useToast'
import ConfirmModal from '../components/ConfirmModal.vue'

const { success, error } = useToast()

const roommates = ref([])
const searchQuery = ref('')
const showModal = ref(false)
const showConfirmModal = ref(false)
const editingRoommate = ref(null)
const deleteRoommateId = ref(null)
const confirmMessage = ref('')
const formData = ref({
  name: '',
  phone: '',
  role: 'member'
})

const filteredRoommates = computed(() => {
  if (!searchQuery.value) return roommates.value
  const query = searchQuery.value.toLowerCase()
  return roommates.value.filter(r => 
    r.name.toLowerCase().includes(query) || 
    r.phone.includes(query)
  )
})

const loadRoommates = async () => {
  try {
    const res = await roommatesApi.getAll()
    roommates.value = res.data
  } catch (err) {
    error('加载失败', '无法加载室友数据，请检查后端服务是否正常运行')
    console.error('加载室友失败:', err)
  }
}

const openAddModal = () => {
  editingRoommate.value = null
  formData.value = { name: '', phone: '', role: 'member' }
  showModal.value = true
}

const openEditModal = (roommate) => {
  editingRoommate.value = roommate
  formData.value = {
    name: roommate.name,
    phone: roommate.phone,
    role: roommate.role
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingRoommate.value = null
}

const saveRoommate = async () => {
  try {
    if (editingRoommate.value) {
      await roommatesApi.update(editingRoommate.value.id, formData.value)
      success('修改成功', `室友「${formData.value.name}」已更新`)
    } else {
      await roommatesApi.create(formData.value)
      success('添加成功', `室友「${formData.value.name}」已添加`)
    }
    closeModal()
    loadRoommates()
  } catch (err) {
    error('保存失败', '无法保存室友信息')
    console.error('保存失败:', err)
  }
}

const confirmDelete = (roommate) => {
  deleteRoommateId.value = roommate.id
  confirmMessage.value = `确定要删除室友「${roommate.name}」吗？此操作无法撤销。`
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  deleteRoommateId.value = null
  confirmMessage.value = ''
}

const handleDelete = async () => {
  if (!deleteRoommateId.value) return
  try {
    await roommatesApi.delete(deleteRoommateId.value)
    success('删除成功', '室友已删除')
    loadRoommates()
  } catch (err) {
    error('删除失败', '无法删除室友')
    console.error('删除失败:', err)
  } finally {
    closeConfirmModal()
  }
}

onMounted(() => {
  loadRoommates()
})
</script>
