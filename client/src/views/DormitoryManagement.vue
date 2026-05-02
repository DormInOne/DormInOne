<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">宿舍管理</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">管理各楼层下的宿舍</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="btn btn-primary flex items-center gap-2"
      >
        <Plus class="w-5 h-5" />
        创建宿舍
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">宿舍名称</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">所属班级</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">所属楼层</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">邀请码</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="dorm in dormitories" :key="dorm.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ dorm.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ dorm.className }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ getFloorName(dorm.floorId) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <code class="font-mono text-sm text-gray-700 dark:text-gray-300">{{ getInviteCode(dorm.id)?.code || '-' }}</code>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getInviteStatusClass(dorm.id)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ getInviteStatusText(dorm.id) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <button
                  @click="regenerateInvite(dorm.id)"
                  class="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                  title="重新生成邀请码"
                >
                  <RefreshCw class="w-5 h-5" />
                </button>
                <button
                  @click="deleteDorm(dorm.id)"
                  class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  title="删除"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ editingDorm ? '编辑宿舍' : '创建宿舍' }}</h3>
          <button @click="closeCreateModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">所属楼层</label>
            <select
              v-model="form.floorId"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
            >
              <option value="">请选择楼层</option>
              <option v-for="floor in floors" :key="floor.id" :value="floor.id">
                {{ floor.buildingName }} - {{ floor.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">宿舍名称</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="如：301"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">所属班级</label>
            <input
              v-model="form.className"
              type="text"
              placeholder="如：2024级计算机1班"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
            />
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="closeCreateModal" class="flex-1 btn btn-outline">取消</button>
            <button @click="saveDorm" class="flex-1 btn btn-primary">{{ editingDorm ? '保存' : '创建' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, RefreshCw, Trash2, X } from 'lucide-vue-next'
import { floorsApi, dormitoriesApi } from '../services/api'

const floors = ref([])
const dormitories = ref([])
const invites = ref([])

const showCreateModal = ref(false)
const editingDorm = ref(null)

const form = reactive({
  floorId: '',
  name: '',
  className: ''
})

const loadData = async () => {
  try {
    const [floorRes, dormRes] = await Promise.all([
      floorsApi.getAll(),
      dormitoriesApi.getAll()
    ])
    floors.value = floorRes.data
    dormitories.value = dormRes.data
    
    const inviteData = await fetch('http://localhost:3000/api/invites', {
      headers: {
        'x-role': localStorage.getItem('dorminone_role') || '',
        'x-username': localStorage.getItem('dorminone_username') || ''
      }
    }).then(res => res.json())
    invites.value = inviteData
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

const getFloorName = (floorId) => {
  const floor = floors.value.find(f => f.id === floorId)
  return floor ? `${floor.buildingName} - ${floor.name}` : '未知楼层'
}

const getInviteCode = (dormId) => {
  return invites.value.find(i => i.dormId === dormId && i.type === 'dorm')
}

const getInviteStatusClass = (dormId) => {
  const invite = getInviteCode(dormId)
  if (!invite) return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
  if (invite.used) return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
  if (Date.now() > invite.expireTime) return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
  return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
}

const getInviteStatusText = (dormId) => {
  const invite = getInviteCode(dormId)
  if (!invite) return '未生成'
  if (invite.used) return '已使用'
  if (Date.now() > invite.expireTime) return '已过期'
  return '未使用'
}

const closeCreateModal = () => {
  showCreateModal.value = false
  editingDorm.value = null
  form.floorId = ''
  form.name = ''
  form.className = ''
}

const saveDorm = async () => {
  if (!form.floorId) {
    alert('请选择楼层')
    return
  }
  if (!form.name) {
    alert('请输入宿舍名称')
    return
  }
  
  try {
    if (editingDorm.value) {
      await dormitoriesApi.update(editingDorm.value.id, form)
    } else {
      await dormitoriesApi.create(form.floorId, form.name, form.className)
    }
    closeCreateModal()
    await loadData()
  } catch (error) {
    console.error('保存失败:', error)
  }
}

const regenerateInvite = async (dormId) => {
  try {
    await dormitoriesApi.regenerateInvite(dormId)
    await loadData()
  } catch (error) {
    console.error('重新生成邀请码失败:', error)
  }
}

const deleteDorm = async (dormId) => {
  if (!confirm('确定要删除这个宿舍吗？')) return
  try {
    await dormitoriesApi.delete(dormId)
    await loadData()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>