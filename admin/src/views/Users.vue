<template>
  <div class="users-page">
    <el-card shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="昵称/手机号/真实姓名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="全部" clearable style="width: 120px">
            <el-option label="乘客" value="passenger" />
            <el-option label="司机" value="driver" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="inactive" />
            <el-option label="封禁" value="banned" />
          </el-select>
        </el-form-item>
        <el-form-item label="信誉等级">
          <el-select v-model="searchForm.reputationLevel" placeholder="全部" clearable style="width: 120px">
            <el-option label="优秀" value="excellent" />
            <el-option label="良好" value="good" />
            <el-option label="一般" value="normal" />
            <el-option label="较差" value="poor" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchUserList">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" style="margin-top: 20px">
      <el-table :data="userList" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="用户信息" min-width="180">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.avatar">
                {{ row.nickname?.charAt(0) }}
              </el-avatar>
              <div class="user-detail">
                <p class="nickname">{{ row.nickname }}</p>
                <p class="phone">{{ row.phone }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="realName" label="真实姓名" width="100" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="roleMap[row.role]?.type || 'info'">
              {{ roleMap[row.role]?.label || row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column label="信誉" width="180">
          <template #default="{ row }">
            <div class="reputation">
              <el-rate :model-value="row.reputationScore / 20" disabled show-score text-color="#ff9900" />
              <span class="reputation-level">
                <el-tag size="small" :type="reputationMap[row.reputationLevel]?.type || 'info'">
                  {{ reputationMap[row.reputationLevel]?.label || row.reputationLevel }}
                </el-tag>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type || 'info'" effect="dark">
              {{ statusMap[row.status]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="170">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openStatusDialog(row)">
              状态调整
            </el-button>
            <el-button type="warning" link @click="openReputationDialog(row)">
              信誉调整
            </el-button>
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
          @size-change="fetchUserList"
          @current-change="fetchUserList"
        />
      </div>
    </el-card>

    <el-dialog v-model="statusDialogVisible" title="状态调整" width="500px">
      <el-form :model="statusForm" label-width="100px">
        <el-form-item label="用户">
          <span>{{ currentUser?.nickname }} ({{ currentUser?.phone }})</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="statusForm.status">
            <el-radio value="active">正常</el-radio>
            <el-radio value="inactive">禁用</el-radio>
            <el-radio value="banned">封禁</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="statusForm.reason" type="textarea" :rows="3" placeholder="请输入调整原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitStatus">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="reputationDialogVisible" title="信誉调整" width="500px">
      <el-form :model="reputationForm" label-width="100px">
        <el-form-item label="用户">
          <span>{{ currentUser?.nickname }} ({{ currentUser?.phone }})</span>
        </el-form-item>
        <el-form-item label="当前信誉分">
          <el-tag type="warning">{{ currentUser?.reputationScore }}</el-tag>
        </el-form-item>
        <el-form-item label="调整后分值">
          <el-input-number v-model="reputationForm.reputationScore" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="reputationForm.reason" type="textarea" :rows="3" placeholder="请输入调整原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reputationDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitReputation">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { getUserList, updateUserStatus } from '@/api'

const loading = ref(false)
const submitLoading = ref(false)
const userList = ref([])

const searchForm = reactive({
  keyword: '',
  role: '',
  status: '',
  reputationLevel: '',
  city: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const statusDialogVisible = ref(false)
const reputationDialogVisible = ref(false)
const currentUser = ref(null)

const statusForm = reactive({
  status: '',
  reason: ''
})

const reputationForm = reactive({
  reputationScore: 0,
  reason: ''
})

const roleMap = {
  passenger: { label: '乘客', type: 'info' },
  driver: { label: '司机', type: 'success' },
  admin: { label: '管理员', type: 'danger' }
}

const statusMap = {
  active: { label: '正常', type: 'success' },
  inactive: { label: '禁用', type: 'warning' },
  banned: { label: '封禁', type: 'danger' }
}

const reputationMap = {
  excellent: { label: '优秀', type: 'success' },
  good: { label: '良好', type: 'primary' },
  normal: { label: '一般', type: 'warning' },
  poor: { label: '较差', type: 'danger' }
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const fetchUserList = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    userList.value = res.data.list || res.data.rows || []
    pagination.total = res.data.total || 0
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.role = ''
  searchForm.status = ''
  searchForm.reputationLevel = ''
  searchForm.city = ''
  pagination.page = 1
  fetchUserList()
}

const openStatusDialog = (row) => {
  currentUser.value = row
  statusForm.status = row.status
  statusForm.reason = ''
  statusDialogVisible.value = true
}

const openReputationDialog = (row) => {
  currentUser.value = row
  reputationForm.reputationScore = row.reputationScore
  reputationForm.reason = ''
  reputationDialogVisible.value = true
}

const submitStatus = async () => {
  if (!currentUser.value) return
  submitLoading.value = true
  try {
    await updateUserStatus(currentUser.value.id, statusForm)
    ElMessage.success('状态调整成功')
    statusDialogVisible.value = false
    fetchUserList()
  } catch (e) {
  } finally {
    submitLoading.value = false
  }
}

const submitReputation = async () => {
  if (!currentUser.value) return
  submitLoading.value = true
  try {
    await updateUserStatus(currentUser.value.id, reputationForm)
    ElMessage.success('信誉调整成功')
    reputationDialogVisible.value = false
    fetchUserList()
  } catch (e) {
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchUserList()
})
</script>

<style lang="scss" scoped>
.users-page {
  .search-form {
    margin: 0;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .user-detail {
      .nickname {
        margin: 0;
        font-size: 14px;
        color: #303133;
        font-weight: 500;
      }

      .phone {
        margin: 4px 0 0 0;
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .reputation {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
