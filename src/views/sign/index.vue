<template>
  <div class="sign-container">
    <el-card class="sign-card">
      <div slot="header">
        <span class="card-title">每日签到</span>
      </div>
      <div class="points-info">
        <div class="points-number">{{ points }}</div>
        <div class="points-label">我的积分</div>
      </div>
      <div class="continuous-days">
        连续签到 <span class="days">{{ continuousDays }}</span> 天
      </div>
      <el-divider></el-divider>
      <div class="sign-action">
        <el-button
          type="warning"
          size="medium"
          :disabled="isSigned"
          @click="openSlider"
          round
        >
          {{ isSigned ? '今日已签到' : '签到领积分' }}
        </el-button>
      </div>
      <el-divider></el-divider>
      <div class="invite-section">
        <p class="invite-title">邀请好友得积分</p>
        <el-input
          v-model="inviteMobile"
          placeholder="填写好友账号(手机号)"
          style="margin-bottom: 10px;"
        ></el-input>
        <el-button type="success" size="small" @click="invite" :loading="inviting">
          邀请（+25积分）
        </el-button>
      </div>
    </el-card>

    <!-- 滑块验证遮罩 -->
    <div v-if="showSlider" class="slider-mask" @click.self="closeSlider">
<!--      <div class="slider-box" :style="{ marginTop: sliderPosition.top }" @click.stop>-->
      <div class="slider-box" :style="{ top: sliderPosition.top }" @click.stop>
        <div class="slider-header">请完成验证</div>
        <div class="slider-body">
          <div class="slider-track" ref="sliderTrack">
            <div class="slider-fill" :style="{ width: fillWidth + 'px' }"></div>
            <div
              class="slider-thumb"
              :class="{ dragging: isDragging }"
              @mousedown="startDrag"
              :style="{ left: thumbLeft + 'px' }"
            >
              <i class="el-icon-d-arrow-right"></i>
            </div>
          </div>
          <div class="slider-tip">{{ sliderTip }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import signApi from '@/api/sign'

export default {
  data() {
    return {
      points: 0,
      continuousDays: 0,
      isSigned: false,
      inviteMobile: '',
      inviting: false,
      showSlider: false,
      sliderPosition: { top: '30%' }, // 随机位置
      isDragging: false,
      thumbLeft: 0,
      fillWidth: 0,
      startX: 0,
      sliderTip: '按住滑块拖动到最右边',
      verified: false
    }
  },
  created() {
    this.loadSignInfo()
  },
  methods: {
    loadSignInfo() {
      signApi.getSignInfo().then(res => {
        if (res.code === 1) {
          this.points = res.response.points || 0  // 防御 null
          this.continuousDays = res.response.continuousDays || 0
          this.isSigned = res.response.isSigned || false
        }
      })
    },
    /*randomSliderPosition() {
      const top = Math.floor(Math.random() * 60) + 20
      this.sliderPosition = { top: top + '%' }
    },*/
    randomSliderPosition() {
      // 随机生成 10% 到 90% 之间的垂直位置，保证滑块不超出窗口
      const top = Math.floor(Math.random() * 80) + 10 // 10~90
      this.sliderPosition = { top: top + '%' }
    },
    // 打开滑块验证，随机位置
    openSlider() {
      this.randomSliderPosition()
      this.showSlider = true
      this.verified = false
      this.thumbLeft = 0
      this.fillWidth = 0
      this.sliderTip = '按住滑块拖动到最右边'
    },
    closeSlider() {
      this.showSlider = false
      this.isDragging = false
    },
    startDrag(e) {
      if (this.verified) return
      this.isDragging = true
      this.startX = e.clientX
      document.addEventListener('mousemove', this.onDrag)
      document.addEventListener('mouseup', this.stopDrag)
    },
    onDrag(e) {
      if (!this.isDragging) return
      const track = this.$refs.sliderTrack
      if (!track) return
      const trackWidth = track.clientWidth
      const thumbWidth = 40
      let dx = e.clientX - this.startX
      let left = Math.max(0, Math.min(dx, trackWidth - thumbWidth))
      this.thumbLeft = left
      this.fillWidth = left
    },
    stopDrag() {
      if (!this.isDragging) return
      this.isDragging = false
      document.removeEventListener('mousemove', this.onDrag)
      document.removeEventListener('mouseup', this.stopDrag)

      const track = this.$refs.sliderTrack
      if (!track) return
      const trackWidth = track.clientWidth
      const thumbWidth = 40

      if (this.fillWidth >= trackWidth - thumbWidth) {
        // 验证通过
        this.verified = true
        this.sliderTip = '验证通过'
        this.fillWidth = trackWidth
        this.thumbLeft = trackWidth - thumbWidth
        setTimeout(() => {
          this.showSlider = false
          this.doSign()
        }, 500)
      } else {
        // 复位
        this.thumbLeft = 0
        this.fillWidth = 0
        this.sliderTip = '验证失败，请重试'
      }
    },
    doSign() {
      signApi.sign().then(res => {
        if (res.code === 1 && res.response.success) {
          this.$message.success('签到成功！获得 ' + res.response.pointsEarned + ' 积分')
          this.points = res.response.totalPoints || 0
          this.continuousDays = res.response.continuousDays || 0
          this.isSigned = true
        } else {
          this.$message.error(res.response.message || '签到失败')
        }
      })
    },
    invite() {
      if (!this.inviteMobile) {
        this.$message.warning('请输入手机号')
        return
      }
      this.inviting = true
      signApi.invite(this.inviteMobile).then(res => {
        if (res.code === 1 && res.response.success) {
          this.$message.success(res.response.message)
          this.inviteMobile = ''
          // 重新获取最新积分，确保准确
          this.loadSignInfo()
        } else {
          this.$message.error(res.response.message || '邀请失败')
        }
        this.inviting = false
      })
    }
  }
}
</script>

<style scoped>
.sign-container {
  max-width: 500px;
  margin: 0 auto;
  padding-top: 20px;
}
.sign-card {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
.points-info {
  text-align: center;
  margin: 20px 0;
}
.points-number {
  font-size: 40px;
  font-weight: bold;
  color: #f56c6c;
}
.points-label {
  color: #909399;
}
.continuous-days {
  text-align: center;
  margin: 10px 0;
  font-size: 18px;
}
.sign-action {
  text-align: center;
  margin: 20px 0;
}
.invite-section {
  padding: 10px;
}
.slider-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  /*display: flex;
  justify-content: center;*/
}
/*.slider-box {
  width: 400px;
  background: white;
  border-radius: 8px;
  padding: 20px;
}*/
.slider-box {
  position: fixed;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  background: white;
  border-radius: 8px;
  padding: 20px;
}
.slider-header {
  font-size: 16px;
  margin-bottom: 15px;
}
.slider-track {
  position: relative;
  width: 100%;
  height: 40px;
  background: #e4e7ed;
  border-radius: 20px;
  overflow: hidden;
}
.slider-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #409eff;
  border-radius: 20px;
}
.slider-thumb {
  position: absolute;
  top: 0;
  width: 40px;
  height: 40px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.slider-tip {
  margin-top: 10px;
  color: #909399;
  font-size: 14px;
}
</style>
