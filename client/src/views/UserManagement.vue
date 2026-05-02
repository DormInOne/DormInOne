<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">用户管理</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">管理系统用户账号</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Users class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ userStats.all }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">总用户数</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
            <Shield class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ userStats.supervisor }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">宿管数量</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <UserPlus class="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ userStats.member }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">成员数量</p>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">用户名</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">姓名</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">角色</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">所属</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.username }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getRoleClass(user.role)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ getRoleText(user.role) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ getUserLocation(user) }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <button
                  @click="deleteUser(user.id)"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Users, Shield, UserPlus, Trash2 } from 'lucide-vue-next'
import { usersApi, floorsApi, dormitoriesApi } from '../services/api'

const users = ref([])
const floors = ref([])
const dorms = ref([])

const userStats = computed(() => ({
  all: users.value.length,
  supervisor: users.value.filter(u => u.role === 'supervisor').length,
  dorm_admin: users.value.filter(u => u.role === 'dorm_admin').length,
  member: users.value.filter(u => u.role === 'member').length
}))

const getRoleClass = (role) => {
  switch (role) {
    case 'supervisor':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    case 'dorm_admin':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
    case 'member':
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }
}

const getRoleText = (role) => {
  switch (role) {
    case 'supervisor':
      return '楼层宿管'
    case 'dorm_admin':
      return '宿舍舍长'
    case 'member':
      return '宿舍成员'
    default:
      return '未知'
  }
}

const getUserLocation = (user) => {
  if (user.role === 'supervisor' && user.floorId) {
    const floor = floors.value.find(f => f.id === user.floorId)
    return floor ? `${floor.buildingName} - ${floor.name}` : '未绑定'
  }
  if ((user.role === 'dorm_admin' || user.role === 'member') && user.dormId) {
    const dorm = dorms.value.find(d => d.id === user.dormId)
    return dorm ? `${dorm.className} - ${dorm.name}` : '未绑定'
  }
  return '未绑定'
}

const deleteUser = async (userId) => {
  if (!confirm('确定要删除这个用户吗？')) return
  try {
    await usersApi.delete(userId)
    await loadData()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

const loadData = async () => {
  try {
    const [userRes, floorRes, dormRes] = await Promise.all([
      usersApi.getAll(),
      floorsApi.getAll(),
      dormitoriesApi.getAll()
    ])
    users.value = userRes.data
    floors.value = floorRes.data
    dorms.value = dormRes.data
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>