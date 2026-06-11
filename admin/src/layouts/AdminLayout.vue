<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="aside">
      <div class="logo">
        <el-icon :size="24" color="#409EFF"><Van /></el-icon>
        <span v-show="!isCollapse" class="logo-text">拼车管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        background-color="#001529"
        text-color="#ffffffa6"
        active-text-color="#ffffff"
        class="menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>数据看板</template>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><List /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
        <el-menu-item index="/complaints">
          <el-icon><Warning /></el-icon>
          <template #title>投诉处理</template>
        </el-menu-item>
        <el-menu-item index="/hot-routes">
          <el-icon><TrendCharts /></el-icon>
          <template #title>热门路线</template>
        </el-menu-item>
        <el-menu-item index="/reports">
          <el-icon><Document /></el-icon>
          <template #title>运营报表</template>
        </el-menu-item>
        <el-menu-item index="/logs">
          <el-icon><Notebook /></el-icon>
          <template #title>操作日志</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="username">{{ adminUser?.nickname || '管理员' }}</span>
              <el-icon><CaretBottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { logout as apiLogout } from '@/api'

const route = useRoute()
const router = useRouter()

const isCollapse = ref(false)
const adminUser = ref(null)

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta.title || '')

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      try {
        await apiLogout()
      } catch (e) {}
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      ElMessage.success('退出成功')
      router.push('/login')
    } catch (e) {}
  } else if (command === 'profile') {
    ElMessage.info('个人中心功能开发中')
  }
}

onMounted(() => {
  const userStr = localStorage.getItem('admin_user')
  if (userStr) {
    try {
      adminUser.value = JSON.parse(userStr)
    } catch (e) {}
  }
})
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #002140;
  color: #fff;
  font-size: 18px;
  font-weight: bold;

  .logo-text {
    white-space: nowrap;
  }
}

.menu {
  border-right: none;
  height: calc(100vh - 60px);
}

:deep(.el-menu-item) {
  &:hover {
    background-color: #1890ff !important;
  }
}

:deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
}

.header {
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: relative;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #666;

  &:hover {
    color: #409eff;
  }
}

.header-right {
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 0 10px;
    height: 60px;

    &:hover {
      background-color: #f5f7fa;
    }
  }

  .username {
    font-size: 14px;
    color: #333;
  }
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
