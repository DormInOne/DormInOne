<template>
  <div class="space-y-6">
    <div v-if="appStore.isSystemAdmin || appStore.isSupervisor" class="card p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
      <div class="flex items-center gap-2 text-blue-600 dark:text-blue-400">
        <Info class="w-5 h-5" />
        <span class="text-sm font-medium">请先选择楼层和宿舍，然后再进行成员管理操作</span>
      </div>
    </div>

    <div v-if="appStore.isSystemAdmin || appStore.isSupervisor" class="flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">楼层</label>
        <select 
          v-model="selectedFloor" 
          class="form-select w-48"
          @change="onFloorChange"
        >
          <option value="">请选择楼层</option>
          <option v-for="floor in availableFloors" :key="floor.id" :value="floor.id">
            {{ floor.name }}
          </option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">宿舍</label>
        <select 
          v-model="selectedDorm" 
          class="form-select w-48"
          :disabled="!selectedFloor"
        >
          <option value="">请选择宿舍</option>
          <option v-for="dorm in filteredDorms" :key="dorm.id" :value="dorm.id">
            {{ dorm.name }} ({{ dorm.className }})
          </option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">空床位</label>
        <select 
          v-model="selectedBed" 
          class="form-select w-48"
          :disabled="!selectedDorm"
        >
          <option value="">请选择空床位</option>
          <option v-for="bed in emptyBeds" :key="bed.id" :value="bed.id">
            床位 {{ bed.bedNumber }}
          </option>
        </select>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button 
          v-if="(appStore.isSystemAdmin || appStore.isSupervisor) && selectedDorm && selectedBed" 
          class="btn btn-primary inline-flex items-center gap-2 whitespace-nowrap" 
          @click="openAddModal"
        >
          <Plus class="w-4 h-4" />
          添加成员
        </button>
        <button 
          v-if="(appStore.isSystemAdmin || appStore.isSupervisor) && !selectedDorm" 
          class="btn btn-secondary inline-flex items-center gap-2 whitespace-nowrap cursor-not-allowed opacity-50" 
          disabled
          @click="showNoDormWarning"
        >
          <Plus class="w-4 h-4" />
          添加成员
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
          class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <User class="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white">{{ roommate.name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ getRoleText(roommate.role) }}
              </p>
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
            <UserCheck class="w-4 h-4 inline mr-1" />
            {{ roommate.username || '未设置' }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
            <Phone class="w-4 h-4 inline mr-1" />
            {{ roommate.phone || '未填写' }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
            <Bed class="w-4 h-4 inline mr-1" />
            {{ roommate.bedNumber || '未分配床位' }}
          </p>
          <div v-if="appStore.isSystemAdmin || appStore.isSupervisor" class="flex gap-2">
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
        <p>暂无成员</p>
        <p v-if="appStore.isSystemAdmin || appStore.isSupervisor" class="text-sm mt-2">请先选择宿舍和空床位，然后添加成员</p>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="card p-6 w-full max-w-md mx-4 transform transition-all duration-300 animate-modal-in">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingRoommate ? '编辑成员' : '添加成员' }}
          </h3>
          <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" @click="closeModal">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form @submit.prevent="saveRoommate">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                姓名 <span class="text-red-500">*</span>
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
                用户名 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.username"
                type="text"
                required
                class="form-input"
                placeholder="请输入用户名"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                初始密码 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.password"
                type="password"
                required
                class="form-input"
                placeholder="请输入初始密码"
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
                绑定床位
              </label>
              <div class="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span class="text-sm text-gray-600 dark:text-gray-300">
                  {{ selectedDormName }} - {{ selectedBedNumber }}
                </span>
              </div>
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
import { Plus, Search, User, Phone, Edit, Trash2, X, Info, UserCheck, Bed } from 'lucide-vue-next'
import { roommatesApi, bedsApi, floorsApi, dormitoriesApi, usersApi } from '../services/api'
import { useToast } from '../composables/useToast'
import { useAppStore } from '../stores/appStore'
import ConfirmModal from '../components/ConfirmModal.vue'

const { success, error } = useToast()
const appStore = useAppStore()

const roommates = ref([])
const beds = ref([])
const floors = ref([])
const dorms = ref([])
const searchQuery = ref('')
const showModal = ref(false)
const showConfirmModal = ref(false)
const editingRoommate = ref(null)
const deleteRoommateId = ref(null)
const confirmMessage = ref('')
const selectedFloor = ref('')
const selectedDorm = ref('')
const selectedBed = ref('')

const formData = ref({
  name: '',
  username: '',
  password: '',
  phone: '',
  role: 'member'
})

const getRoleText = (role) => {
  const roleMap = {
    'system_admin': '系统管理员',
    'supervisor': '楼层宿管',
    'dorm_admin': '宿舍舍长',
    'member': '宿舍成员',
    'admin': '宿舍舍长'
  }
  return roleMap[role] || '成员'
}

const availableFloors = computed(() => {
  if (appStore.isSystemAdmin) {
    return floors.value
  } else if (appStore.isSupervisor && appStore.floorId) {
    return floors.value.filter(f => f.id === appStore.floorId)
  }
  return []
})

const filteredDorms = computed(() => {
  if (!selectedFloor.value) return []
  return dorms.value.filter(d => d.floorId === selectedFloor.value)
})

const currentDorm = computed(() => {
  return dorms.value.find(d => d.id === selectedDorm.value)
})

const selectedDormName = computed(() => {
  if (!currentDorm.value) return '未选择宿舍'
  return `${currentDorm.value.className} - ${currentDorm.value.name}`
})

const selectedBedNumber = computed(() => {
  if (!selectedBed.value) return '未选择床位'
  const bed = beds.value.find(b => b.id === selectedBed.value)
  return bed ? `床位 ${bed.bedNumber}` : '未选择床位'
})

const dormBeds = computed(() => {
  if (!selectedDorm.value) return []
  return beds.value.filter(b => b.dormId === selectedDorm.value)
})

const emptyBeds = computed(() => {
  return dormBeds.value.filter(b => b.status === 'empty')
})

const filteredRoommates = computed(() => {
  let result = roommates.value
  
  if (selectedDorm.value) {
    result = result.filter(r => r.dormId === selectedDorm.value)
  } else if (selectedFloor.value) {
    result = result.filter(r => r.floorId === selectedFloor.value)
  } else if (appStore.isSupervisor && appStore.floorId) {
    result = result.filter(r => r.floorId === appStore.floorId)
  } else if (appStore.isDormAdmin && appStore.dormId) {
    result = result.filter(r => r.dormId === appStore.dormId)
  } else if (appStore.isMember && appStore.dormId) {
    result = result.filter(r => r.dormId === appStore.dormId)
  }
  
  if (!searchQuery.value) return result
  const query = searchQuery.value.toLowerCase()
  return result.filter(r => 
    r.name.toLowerCase().includes(query) || 
    r.phone.includes(query) ||
    r.username.toLowerCase().includes(query)
  )
})

const loadData = async () => {
  try {
    const [roommatesRes, bedsRes, floorsRes, dormsRes] = await Promise.all([
      roommatesApi.getAll(),
      bedsApi.getAll(),
      floorsApi.getAll(),
      dormitoriesApi.getAll()
    ])
    roommates.value = roommatesRes.data
    beds.value = bedsRes.data
    floors.value = floorsRes.data
    dorms.value = dormsRes.data
    
    if (appStore.isSupervisor && appStore.floorId) {
      selectedFloor.value = appStore.floorId
    }
  } catch (err) {
    error('加载失败', '无法加载数据')
    console.error('加载数据失败:', err)
  }
}

const onFloorChange = () => {
  selectedDorm.value = ''
  selectedBed.value = ''
}

const showNoDormWarning = () => {
  error('操作提示', '请先选择要管理的宿舍和空床位')
}

const openAddModal = () => {
  editingRoommate.value = null
  formData.value = { name: '', username: '', password: '', phone: '', role: 'member' }
  showModal.value = true
}

const openEditModal = (roommate) => {
  editingRoommate.value = roommate
  formData.value = {
    name: roommate.name,
    username: roommate.username || '',
    password: '',
    phone: roommate.phone,
    role: roommate.role || 'member'
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingRoommate.value = null
}

const saveRoommate = async () => {
  try {
    const currentBed = beds.value.find(b => b.id === selectedBed.value)
    const currentDormData = dorms.value.find(d => d.id === selectedDorm.value)
    
    const roommateData = {
      name: formData.value.name,
      username: formData.value.username,
      phone: formData.value.phone,
      role: formData.value.role,
      dormId: selectedDorm.value,
      floorId: selectedFloor.value,
      bedId: selectedBed.value,
      bedNumber: currentBed?.bedNumber
    }

    if (editingRoommate.value) {
      await roommatesApi.update(editingRoommate.value.id, roommateData)
      
      if (formData.value.password) {
        await usersApi.update(editingRoommate.value.id, {
          username: formData.value.username,
          password: formData.value.password,
          name: formData.value.name,
          role: formData.value.role,
          floorId: selectedFloor.value,
          dormId: selectedDorm.value,
          floorName: currentDormData?.floorName,
          dormName: currentDormData?.name,
          className: currentDormData?.className,
          buildingName: currentDormData?.buildingName
        })
      }
      
      success('修改成功', `成员「${formData.value.name}」已更新`)
    } else {
      const roommateRes = await roommatesApi.create(roommateData)
      
      await usersApi.create({
        username: formData.value.username,
        password: formData.value.password,
        name: formData.value.name,
        role: 'member',
        floorId: selectedFloor.value,
        dormId: selectedDorm.value,
        floorName: currentDormData?.floorName,
        dormName: currentDormData?.name,
        className: currentDormData?.className,
        buildingName: currentDormData?.buildingName
      })
      
      if (currentBed) {
        await bedsApi.update(currentBed.id, {
          status: 'occupied',
          occupantName: formData.value.name,
          occupantId: roommateRes.data.id,
          checkInDate: new Date().toISOString().split('T')[0]
        })
      }
      
      success('添加成功', `成员「${formData.value.name}」已添加并分配到床位`)
    }
    closeModal()
    loadData()
  } catch (err) {
    error('保存失败', '无法保存成员信息')
    console.error('保存失败:', err)
  }
}

const confirmDelete = (roommate) => {
  deleteRoommateId.value = roommate.id
  confirmMessage.value = `确定要删除成员「${roommate.name}」吗？此操作将同时释放其绑定的床位。`
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
    const roommate = roommates.value.find(r => r.id === deleteRoommateId.value)
    
    if (roommate.bedId) {
      await bedsApi.update(roommate.bedId, {
        status: 'empty',
        occupantName: '',
        occupantId: '',
        checkInDate: ''
      })
    }
    
    await roommatesApi.delete(deleteRoommateId.value)
    await usersApi.delete(deleteRoommateId.value)
    
    success('删除成功', '成员已删除，床位已释放')
    loadData()
  } catch (err) {
    error('删除失败', '无法删除成员')
    console.error('删除失败:', err)
  } finally {
    closeConfirmModal()
  }
}

onMounted(() => {
  loadData()
})
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
  animation: modal-in 0.3s ease-out;
}
</style>
