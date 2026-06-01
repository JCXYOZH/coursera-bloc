<template>
  <div class="exchange-container">
    <el-card>
      <div slot="header">积分兑换</div>
      <el-table :data="items" style="width: 100%">
        <el-table-column prop="name" label="物品名称" align="center"></el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.exchanged" type="success" size="small"
                       @click="viewPdf(scope.row)">查看</el-button>
            <el-button v-else-if="scope.row.pointsRequired === 0" type="warning" size="small"
                       @click="exchange(scope.row)">限时</el-button>
            <el-button v-else type="primary" size="small"
                       @click="exchange(scope.row)">{{ scope.row.pointsRequired }}积分</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="PDF预览" :visible.sync="pdfVisible" fullscreen :close-on-click-modal="false" custom-class="pdf-dialog">
      <iframe :src="pdfUrl" class="pdf-iframe"></iframe>
    </el-dialog>
  </div>
</template>

<script>
import exchangeApi from '@/api/exchange'

export default {
  data() {
    return {
      items: [],
      pdfVisible: false,
      pdfUrl: ''
    }
  },
  created() {
    this.loadItems()
  },
  methods: {
    loadItems() {
      exchangeApi.list().then(res => {
        if (res.code === 1) {
          this.items = res.response.map(item => {
            item.pointsRequired = Number(item.pointsRequired) || 0
            return item
          })
        } else if (res.code === 401) {
          this.$message.error('请先登录')
          // 不跳转，用户可以手动刷新
        } else {
          this.$message.error(res.message || '请求失败')
        }
      }).catch(() => {
        this.$message.error('网络异常，请稍后重试')
      })
    },
    exchange(item) {
      const points = Number(item.pointsRequired) || 0
      this.$confirm(`确定消耗${points}积分兑换“${item.name}”？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        exchangeApi.exchange(item.id).then(res => {
          if (res.code === 1 && res.response.success) {
            this.$message.success('兑换成功')
            this.loadItems()
          } else {
            this.$message.error(res.response.message || '兑换失败')
          }
        })
      })
    },
    viewPdf(item) {
      if (!item.pdfPath) return;
      const fileName = item.pdfPath.split('/').pop();
      // 直接请求后端接口，不通过 /api 代理？其实代理会自动加上 /api
      // 注意：axios 的 baseURL 是 ''，所以直接写 /api/public/pdf/...
      this.pdfUrl = `/api/public/pdf/${fileName}`;
      this.pdfVisible = true;
    }
  }
}
</script>

<style>
/* 全局样式，确保全屏对话框内容填满 */
.pdf-dialog .el-dialog__body {
  height: calc(100vh - 60px);
  padding: 0;
  overflow: hidden;
}
.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
