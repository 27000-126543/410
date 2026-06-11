<template>
  <div class="logs-page">
    <el-card shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="模块">
          <el-select v-model="searchForm.module" placeholder="全部模块" clearable style="width: 140px">
            <el-option label="用户管理" value="user" />
            <el-option label="投诉处理" value="complaint" />
            <el-option label="订单管理" value="order" />
            <el-option label="系统管理" value="system" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.action" placeholder="全部" clearable style="width: 180px">
            <el-option label="更新用户状态" value="update_user_status" />
            <el-option label="处理投诉" value="handle_complaint" />
            <el-option label="管理员登录" value="admin_login" />
            <el-option label="管理员登出" value="admin_logout" />
          </el-select>
        </el-form-item>
        <el-form-item label="管理员ID">
          <el-input v-model="searchForm.adminId" placeholder="管理员ID" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchLogs">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" style="margin-top: 20px">
      <el-table :data="logList" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="管理员" width="150">
          <template #default="{ row }">
            <div class="admin-cell">
              <el-avatar :size="28">{{ row.admin?.nickname?.charAt(0) }}</el-avatar>
              <div>
                <p class="name">{{ row.admin?.nickname || row.adminName }}</p>
                <p class="id">ID: {{ row.adminId }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="120">
          <template #default="{ row }">
            <el-tag :type="moduleMap[row.module]?.type || 'info'" size="small">
              {{ moduleMap[row.module]?.label || row.module }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作" width="180">
          <template #default="{ row }">
            <el-tag size="small">{{ actionMap[row.action]?.label || row.action }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetType" label="目标类型" width="100" />
        <el-table-column prop="targetId" label="目标ID" width="100" />
        <el-table-column prop="description" label="操作描述" min-width="300" show-overflow-tooltip />
        <el-table-column prop="ipAddress" label="IP地址" width="140" />
        <el-table-column prop="createdAt" label="操作时间" width="170" fixed="right">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchLogs"
          @current-change="fetchLogs"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { getAdminLogs } from '@/api'

const loading = ref(false)
const logList = ref([])
const dateRange = ref([])

const searchForm = reactive({
  module: '',
  action: '',
  adminId: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const moduleMap = {
  user: { label: '用户管理', type: 'primary' },
  complaint: { label: '投诉处理', type: 'warning' },
  order: { label: '订单管理', type: 'success' },
  system: { label: '系统管理', type: 'info' }
}

const actionMap = {
  update_user_status: { label: '更新用户状态' },
  handle_complaint: { label: '处理投诉' },
  admin_login: { label: '管理员登录' },
  admin_logout: { label: '管理员登出' }
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const res = await getAdminLogs(params)
    logList.value = res.data.list || res.data.rows || []
    pagination.total = res.data.total || 0
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.module = ''
  searchForm.action = ''
  searchForm.adminId = ''
  dateRange.value = []
  pagination.page = 1
  fetchLogs()
}

onMounted(() => {
  fetchLogs()
})
</script>

<style lang="scss" scoped>
.logs-page {
  .search-form {
    margin: 0;
  }

  .admin-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .name {
      margin: 0;
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }

    .id {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: #909399;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
