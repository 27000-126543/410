<template>
  <div class="complaints-page">
    <el-card shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="投诉状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 140px">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已解决" value="resolved" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="searchForm.priority" placeholder="全部" clearable style="width: 120px">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="投诉类型">
          <el-select v-model="searchForm.type" placeholder="全部" clearable style="width: 140px">
            <el-option label="司机投诉" value="driver" />
            <el-option label="乘客投诉" value="passenger" />
            <el-option label="系统问题" value="system" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="提交时间">
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
          <el-button type="primary" @click="fetchComplaintList">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" style="margin-top: 20px">
      <el-table :data="complaintList" v-loading="loading" stripe>
        <el-table-column prop="complaintNo" label="投诉编号" width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="typeMap[row.type]?.type || 'info'">
              {{ typeMap[row.type]?.label || row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="90">
          <template #default="{ row }">
            <el-tag :type="priorityMap[row.priority]?.type || 'info'">
              {{ priorityMap[row.priority]?.label || row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="投诉人" width="150">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="28">{{ row.complainant?.nickname?.charAt(0) }}</el-avatar>
              <div>
                <p class="name">{{ row.complainant?.nickname || '-' }}</p>
                <p class="phone">{{ row.complainant?.phone || '-' }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="被投诉人" width="150">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="28">{{ row.respondent?.nickname?.charAt(0) }}</el-avatar>
              <div>
                <p class="name">{{ row.respondent?.nickname || '-' }}</p>
                <p class="phone">{{ row.respondent?.phone || '-' }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="投诉内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type || 'info'" effect="dark">
              {{ statusMap[row.status]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="处理人" width="100">
          <template #default="{ row }">
            {{ row.handler?.nickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="170">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
            <el-button
              v-if="row.status === 'pending' || row.status === 'processing'"
              type="warning"
              link
              @click="openHandleDialog(row)"
            >
              处理
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
          @size-change="fetchComplaintList"
          @current-change="fetchComplaintList"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="投诉详情" width="600px">
      <el-descriptions v-if="currentComplaint" :column="2" border>
        <el-descriptions-item label="投诉编号">{{ currentComplaint.complaintNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusMap[currentComplaint.status]?.type || 'info'">
            {{ statusMap[currentComplaint.status]?.label || currentComplaint.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="类型">
          {{ typeMap[currentComplaint.type]?.label || currentComplaint.type }}
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          {{ priorityMap[currentComplaint.priority]?.label || currentComplaint.priority }}
        </el-descriptions-item>
        <el-descriptions-item label="投诉人">
          {{ currentComplaint.complainant?.nickname }} ({{ currentComplaint.complainant?.phone }})
        </el-descriptions-item>
        <el-descriptions-item label="被投诉人">
          {{ currentComplaint.respondent?.nickname || '-' }} ({{ currentComplaint.respondent?.phone || '-' }})
        </el-descriptions-item>
        <el-descriptions-item label="投诉内容" :span="2">
          {{ currentComplaint.description }}
        </el-descriptions-item>
        <el-descriptions-item label="证据" :span="2" v-if="currentComplaint.evidence">
          <div v-if="typeof currentComplaint.evidence === 'string'">
            {{ currentComplaint.evidence }}
          </div>
          <div v-else-if="Array.isArray(currentComplaint.evidence)">
            <el-image
              v-for="(img, idx) in currentComplaint.evidence"
              :key="idx"
              :src="img"
              :preview-src-list="currentComplaint.evidence"
              fit="cover"
              style="width: 100px; height: 100px; margin-right: 10px"
            />
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="处理结果" :span="2" v-if="currentComplaint.handleResult">
          {{ currentComplaint.handleResult }}
        </el-descriptions-item>
        <el-descriptions-item label="处理备注" :span="2" v-if="currentComplaint.handleRemark">
          {{ currentComplaint.handleRemark }}
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ formatDate(currentComplaint.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="响应时间">
          {{ currentComplaint.responseTime ? `${currentComplaint.responseTime} 分钟` : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="处理人">
          {{ currentComplaint.handler?.nickname || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="解决时间">
          {{ currentComplaint.resolvedAt ? formatDate(currentComplaint.resolvedAt) : '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="handleDialogVisible" title="处理投诉" width="500px">
      <el-form :model="handleForm" label-width="100px">
        <el-form-item label="投诉编号">
          <span>{{ currentComplaint?.complaintNo }}</span>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="handleForm.status" style="width: 100%">
            <el-option label="处理中" value="processing" />
            <el-option label="已解决" value="resolved" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理结果">
          <el-input v-model="handleForm.handleResult" type="textarea" :rows="3" placeholder="请输入处理结果" />
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input v-model="handleForm.handleRemark" type="textarea" :rows="2" placeholder="请输入处理备注" />
        </el-form-item>
        <el-form-item label="用户是否满意" v-if="handleForm.status === 'resolved' || handleForm.status === 'closed'">
          <el-radio-group v-model="handleForm.complainantSatisfied">
            <el-radio :value="true">满意</el-radio>
            <el-radio :value="false">不满意</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="满意度评分" v-if="handleForm.status === 'resolved' || handleForm.status === 'closed'">
          <el-rate v-model="handleForm.satisfactionRating" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitHandle">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { getComplaintList, handleComplaint } from '@/api'

const loading = ref(false)
const submitLoading = ref(false)
const complaintList = ref([])
const dateRange = ref([])
const detailDialogVisible = ref(false)
const handleDialogVisible = ref(false)
const currentComplaint = ref(null)

const searchForm = reactive({
  status: '',
  priority: '',
  type: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const handleForm = reactive({
  status: 'processing',
  handleResult: '',
  handleRemark: '',
  complainantSatisfied: null,
  satisfactionRating: 0
})

const typeMap = {
  driver: { label: '司机投诉', type: 'warning' },
  passenger: { label: '乘客投诉', type: 'danger' },
  system: { label: '系统问题', type: 'info' },
  other: { label: '其他', type: 'info' }
}

const priorityMap = {
  high: { label: '高', type: 'danger' },
  medium: { label: '中', type: 'warning' },
  low: { label: '低', type: 'info' }
}

const statusMap = {
  pending: { label: '待处理', type: 'danger' },
  processing: { label: '处理中', type: 'warning' },
  resolved: { label: '已解决', type: 'success' },
  closed: { label: '已关闭', type: 'info' }
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const fetchComplaintList = async () => {
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
    const res = await getComplaintList(params)
    complaintList.value = res.data.list || res.data.rows || []
    pagination.total = res.data.total || 0
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.status = ''
  searchForm.priority = ''
  searchForm.type = ''
  dateRange.value = []
  pagination.page = 1
  fetchComplaintList()
}

const viewDetail = (row) => {
  currentComplaint.value = row
  detailDialogVisible.value = true
}

const openHandleDialog = (row) => {
  currentComplaint.value = row
  handleForm.status = row.status === 'pending' ? 'processing' : row.status
  handleForm.handleResult = ''
  handleForm.handleRemark = ''
  handleForm.complainantSatisfied = null
  handleForm.satisfactionRating = 0
  handleDialogVisible.value = true
}

const submitHandle = async () => {
  if (!currentComplaint.value) return
  submitLoading.value = true
  try {
    await handleComplaint(currentComplaint.value.id, handleForm)
    ElMessage.success('处理成功')
    handleDialogVisible.value = false
    fetchComplaintList()
  } catch (e) {
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchComplaintList()
})
</script>

<style lang="scss" scoped>
.complaints-page {
  .search-form {
    margin: 0;
  }

  .user-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .name {
      margin: 0;
      font-size: 14px;
      color: #303133;
    }

    .phone {
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
