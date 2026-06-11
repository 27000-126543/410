<template>
  <div class="hot-routes-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>实时定价建议（未来3小时）</span>
              <el-tag type="success">当前 {{ pricingData.currentHour }}:00</el-tag>
            </div>
          </template>
          <el-row :gutter="16" v-loading="pricingLoading">
            <el-col :span="8" v-for="(item, index) in pricingData.suggestions" :key="index">
              <div class="pricing-card" :class="{ peak: item.isPeak }">
                <div class="pricing-header">
                  <span class="route">{{ item.route }}</span>
                  <el-tag v-if="item.isPeak" type="danger" size="small">高峰</el-tag>
                </div>
                <div class="pricing-time">
                  <el-icon><Clock /></el-icon>
                  {{ item.hour }}
                </div>
                <div class="pricing-body">
                  <div class="price-item">
                    <span class="label">基础价</span>
                    <span class="value">¥{{ item.currentBasePrice }}</span>
                  </div>
                  <div class="price-item suggested">
                    <span class="label">建议价</span>
                    <span class="value">¥{{ item.suggestedPrice }}</span>
                  </div>
                  <div class="price-item">
                    <span class="label">价格系数</span>
                    <span class="value">x{{ item.priceMultiplier }}</span>
                  </div>
                </div>
                <div class="pricing-footer">
                  <div class="trend" :class="item.trend">
                    <el-icon><TrendCharts /></el-icon>
                    {{ trendMap[item.trend] || item.trend }}
                  </div>
                  <div class="confidence">
                    置信度: {{ item.confidence }}%
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="24" v-if="!pricingData.suggestions?.length">
              <el-empty description="暂无定价建议" />
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>热门路线预测</span>
          <div class="header-actions">
            <el-form :inline="true" :model="searchForm" size="small">
              <el-form-item>
                <el-date-picker
                  v-model="searchForm.date"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  :clearable="false"
                />
              </el-form-item>
              <el-form-item>
                <el-select v-model="searchForm.city" placeholder="全部城市" clearable style="width: 140px">
                  <el-option label="北京" value="北京" />
                  <el-option label="上海" value="上海" />
                  <el-option label="广州" value="广州" />
                  <el-option label="深圳" value="深圳" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="fetchHotRoutes">
                  <el-icon><Search /></el-icon>查询
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </template>

      <el-table :data="routeList" v-loading="loading" stripe>
        <el-table-column type="index" label="排名" width="70" align="center">
          <template #default="{ $index }">
            <span v-if="$index < 3" class="rank" :class="`rank-${$index + 1}`">{{ $index + 1 }}</span>
            <span v-else>{{ $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column label="路线" min-width="300">
          <template #default="{ row }">
            <div class="route-cell">
              <el-icon color="#409EFF"><Location /></el-icon>
              <span class="start">{{ row.startPoint }}</span>
              <el-icon><Right /></el-icon>
              <el-icon color="#67C23A"><LocationFilled /></el-icon>
              <span class="end">{{ row.endPoint }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="hourOfDay" label="时段" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.hourOfDay }}:00</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="热度" width="120">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.min(row.predictedDemand, 100)"
              :color="row.isHot ? '#f56c6c' : '#409eff'"
              :stroke-width="10"
            />
          </template>
        </el-table-column>
        <el-table-column prop="predictedOrders" label="预测订单" width="120">
          <template #default="{ row }">
            <span class="orders">{{ row.predictedOrders }} 单</span>
          </template>
        </el-table-column>
        <el-table-column prop="historicalOrders" label="历史订单" width="120" />
        <el-table-column label="价格建议" width="200">
          <template #default="{ row }">
            <div class="price-suggest">
              <span>基础: ¥{{ row.suggestedBasePrice }}</span>
              <el-tag v-if="row.isPeak" type="danger" size="small">
                高峰: ¥{{ row.suggestedPeakPrice }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="标签" width="140">
          <template #default="{ row }">
            <el-tag v-if="row.isHot" type="danger" size="small" effect="dark">热门</el-tag>
            <el-tag v-if="row.isPeak" type="warning" size="small" effect="dark">高峰</el-tag>
            <el-tag :type="trendTagMap[row.trend] || 'info'" size="small">
              {{ trendMap[row.trend] || row.trend }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="confidence" label="置信度" width="100">
          <template #default="{ row }">
            {{ row.confidence }}%
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Location, LocationFilled, Right, Clock, TrendCharts } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { getHotRoutes, getPricingSuggestions } from '@/api'

const loading = ref(false)
const pricingLoading = ref(false)
const routeList = ref([])
const pricingData = reactive({
  currentHour: 0,
  suggestions: [],
  summary: {}
})

const searchForm = reactive({
  city: '',
  date: dayjs().format('YYYY-MM-DD'),
  limit: 20
})

const trendMap = {
  rising: '上升',
  falling: '下降',
  stable: '稳定'
}

const trendTagMap = {
  rising: 'success',
  falling: 'danger',
  stable: 'info'
}

const fetchHotRoutes = async () => {
  loading.value = true
  try {
    const res = await getHotRoutes(searchForm)
    routeList.value = res.data || []
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const fetchPricingSuggestions = async () => {
  pricingLoading.value = true
  try {
    const res = await getPricingSuggestions({ city: searchForm.city })
    Object.assign(pricingData, res.data || {})
  } catch (e) {
  } finally {
    pricingLoading.value = false
  }
}

onMounted(() => {
  fetchHotRoutes()
  fetchPricingSuggestions()
})
</script>

<style lang="scss" scoped>
.hot-routes-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      :deep(.el-form-item) {
        margin-bottom: 0;
      }
    }
  }

  .pricing-card {
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    border-left: 4px solid #409eff;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.peak {
      background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
      border-left-color: #f56c6c;
    }

    .pricing-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .route {
        font-size: 15px;
        font-weight: bold;
        color: #303133;
      }
    }

    .pricing-time {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #909399;
      margin-bottom: 12px;
    }

    .pricing-body {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;

      .price-item {
        text-align: center;

        .label {
          display: block;
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }

        .value {
          font-size: 16px;
          font-weight: bold;
          color: #303133;
        }

        &.suggested .value {
          color: #f56c6c;
          font-size: 20px;
        }
      }
    }

    .pricing-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid #dcdfe6;

      .trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;

        &.rising {
          color: #67c23a;
        }

        &.falling {
          color: #f56c6c;
        }

        &.stable {
          color: #909399;
        }
      }

      .confidence {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .rank {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    color: #fff;
    font-weight: bold;
    font-size: 12px;

    &.rank-1 {
      background: linear-gradient(135deg, #ffd700 0%, #ffb800 100%);
    }

    &.rank-2 {
      background: linear-gradient(135deg, #c0c4cc 0%, #909399 100%);
    }

    &.rank-3 {
      background: linear-gradient(135deg, #d4a066 0%, #b8823a 100%);
    }
  }

  .route-cell {
    display: flex;
    align-items: center;
    gap: 6px;

    .start {
      color: #409eff;
      font-weight: 500;
    }

    .end {
      color: #67c23a;
      font-weight: 500;
    }
  }

  .orders {
    color: #f56c6c;
    font-weight: bold;
  }

  .price-suggest {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #606266;
  }
}
</style>
