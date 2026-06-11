<template>
  <div class="orders-page">
    <el-card shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 140px">
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付状态">
          <el-select v-model="searchForm.paymentStatus" placeholder="全部" clearable style="width: 140px">
            <el-option label="未支付" value="unpaid" />
            <el-option label="已支付" value="paid" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
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
          <el-button type="primary" @click="fetchOrderList">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" style="margin-top: 20px">
      <el-table :data="orderList" v-loading="loading" stripe>
        <el-table-column prop="orderNo" label="订单号" width="160" />
        <el-table-column label="行程信息" min-width="220">
          <template #default="{ row }">
            <div class="trip-info">
              <p class="route">
                <el-icon color="#409EFF"><Location /></el-icon>
                {{ row.Trip?.startPoint || '-' }}
                <el-icon><Right /></el-icon>
                <el-icon color="#67C23A"><LocationFilled /></el-icon>
                {{ row.Trip?.endPoint || '-' }}
              </p>
              <p class="time">
                <el-icon><Clock /></el-icon>
                {{ formatDate(row.Trip?.departureTime || row.createdAt) }}
              </p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="乘客" width="140">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="28">{{ row.passenger?.nickname?.charAt(0) }}</el-avatar>
              <div>
                <p class="name">{{ row.passenger?.nickname || '-' }}</p>
                <p class="phone">{{ row.passenger?.phone || '-' }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="司机" width="140">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="28">{{ row.driver?.nickname?.charAt(0) }}</el-avatar>
              <div>
                <p class="name">{{ row.driver?.nickname || '-' }}</p>
                <p class="phone">{{ row.driver?.phone || '-' }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="payAmount" label="支付金额" width="100">
          <template #default="{ row }">
            <span class="amount">¥{{ row.payAmount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="platformFee" label="平台费" width="100">
          <template #default="{ row }">
            <span>¥{{ row.platformFee || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="orderStatusMap[row.orderStatus]?.type || 'info'">
              {{ orderStatusMap[row.orderStatus]?.label || row.orderStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentStatus" label="支付状态" width="100">
          <template #default="{ row }">
            <el-tag :type="paymentStatusMap[row.paymentStatus]?.type || 'info'" effect="dark">
              {{ paymentStatusMap[row.paymentStatus]?.label || row.paymentStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
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
          @size-change="fetchOrderList"
          @current-change="fetchOrderList"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="订单详情" width="600px">
      <el-descriptions v-if="currentOrder" :column="2" border>
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="orderStatusMap[currentOrder.orderStatus]?.type || 'info'">
            {{ orderStatusMap[currentOrder.orderStatus]?.label || currentOrder.orderStatus }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付金额">¥{{ currentOrder.payAmount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="平台费">¥{{ currentOrder.platformFee || 0 }}</el-descriptions-item>
        <el-descriptions-item label="乘客">
          {{ currentOrder.passenger?.nickname }} ({{ currentOrder.passenger?.phone }})
        </el-descriptions-item>
        <el-descriptions-item label="司机">
          {{ currentOrder.driver?.nickname || '-' }} ({{ currentOrder.driver?.phone || '-' }})
        </el-descriptions-item>
        <el-descriptions-item label="出发地" :span="2">
          {{ currentOrder.Trip?.startPoint || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="目的地" :span="2">
          {{ currentOrder.Trip?.endPoint || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="出发时间" :span="2">
          {{ formatDate(currentOrder.Trip?.departureTime || currentOrder.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(currentOrder.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ currentOrder.paidAt ? formatDate(currentOrder.paidAt) : '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Location, LocationFilled, Right, Clock } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { getOrderList } from '@/api'

const loading = ref(false)
const orderList = ref([])
const dateRange = ref([])
const detailDialogVisible = ref(false)
const currentOrder = ref(null)

const searchForm = reactive({
  orderNo: '',
  status: '',
  paymentStatus: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const orderStatusMap = {
  pending: { label: '待确认', type: 'warning' },
  confirmed: { label: '已确认', type: 'primary' },
  in_progress: { label: '进行中', type: 'info' },
  completed: { label: '已完成', type: 'success' },
  cancelled: { label: '已取消', type: 'danger' }
}

const paymentStatusMap = {
  unpaid: { label: '未支付', type: 'warning' },
  paid: { label: '已支付', type: 'success' },
  refunded: { label: '已退款', type: 'info' }
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const fetchOrderList = async () => {
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
    const res = await getOrderList(params)
    orderList.value = res.data.list || res.data.rows || []
    pagination.total = res.data.total || 0
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.orderNo = ''
  searchForm.status = ''
  searchForm.paymentStatus = ''
  dateRange.value = []
  pagination.page = 1
  fetchOrderList()
}

const viewDetail = (row) => {
  currentOrder.value = row
  detailDialogVisible.value = true
}

onMounted(() => {
  fetchOrderList()
})
</script>

<style lang="scss" scoped>
.orders-page {
  .search-form {
    margin: 0;
  }

  .trip-info {
    .route {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 0;
      font-size: 14px;
      color: #303133;
    }

    .time {
      margin: 6px 0 0 0;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #909399;
    }
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

  .amount {
    color: #f56c6c;
    font-weight: bold;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
