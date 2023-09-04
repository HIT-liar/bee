<template>
  <div class="screen-container">
    <header class="screen-header">
      <div>
        <img src="~@/assets/header_border_dark.png" alt="">
      </div>
      <span class="logo">
        <img src="https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png" />
        <span>正常状态</span>
        <img src="https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png" />
        <span>异常状态</span>
        <img src="~@/assets/yellow.png" alt="">
        <span>收获状态</span>
      </span>
      <span class="title">智能蜂箱实时监控系统</span>
      <div class="title-right">
        <el-button style="background-color:#235586; color:white; border-radius:2%; " @click="showPromptBox()">设置</el-button>
        <span class="datetime">{{ dateFormat(newDate) }}</span>

      </div>

    </header>
    <el-dialog title="设置" :visible.sync="dialogTableVisible" center :append-to-body='true' :lock-scroll="false" width="30%">
      <Setting></Setting>
    </el-dialog>
    <div class="screen-body">
      <section class="screen-left">
        <div id="left-top">
          <!--温湿度实时折线图-->
          <TAH></TAH>
        </div>
        <div id="left-bottom">
          <!--重量实时折线图-->
          <Weight></Weight>
        </div>
      </section>
      <section class="screen-middle">
        <div id="middle-top">
          <!--蜂箱地图-->
          <BeehiveMap></BeehiveMap>
        </div>
        <div id="middle-bottom">
          <!--实时蜜蜂出入量折线图-->
          <Quantity></Quantity>
        </div>
      </section>
      <section class="screen-right">
        <div id="right-top">
          <!--温湿度平均值-->
          <TAHAvg></TAHAvg>
        </div>
        <div id="right-bottom">
          <!--出入量平均值-->
          <QuantityAvg></QuantityAvg>
        </div>
      </section>

    </div>

  </div>
  
</template>

<script>
import Quantity from '@/components/QuantityCom.vue'
import TAH from '@/components/TemperatureCom.vue'
import Weight from '@/components/WeightCom.vue'
import TAHAvg from '@/components/TAHAvgCom.vue'
import QuantityAvg from '@/components/QuantityAvgCom.vue'
import BeehiveMap from '@/components/MapCom.vue'
import Setting from '@/components/SettingCom.vue'

export default {
  data() {
    return {
      dialogTableVisible: false,
      newDate: new Date()
    }
  },
  mounted() {
    let that = this
    this.timer = setInterval(function () {
      that.newDate = new Date().toLocaleString()
    })
  },
  // 销毁时清除计时器
  beforeDestroy: function () {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },

  methods: {
    // 时间格式化
    dateFormat() {
      var date = new Date()
      var year = date.getFullYear()

      var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      var hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
      var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
      var seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
      let week = date.getDay() // 星期
      let weekArr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      // 拼接 时间格式处理
      return year + '年' + month + '月' + day + '日 ' + hours + ':' + minutes + ':' + seconds + ' ' + weekArr[week]
    },
    showPromptBox() {
      this.dialogTableVisible=true;
    }

  },

  components: {
    Quantity,
    TAH,
    Weight,
    TAHAvg,
    QuantityAvg,
    BeehiveMap,
    Setting
  }

}
</script>

<style lang="less" scoped>
.screen-container {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background-color: #2e2d3a;
  color: #ffffff;
  box-sizing: border-box;
}

.screen-header {
  width: 100%;
  height: 64px;
  font-size: 20px;
  position: relative;

  >div {
    img {
      width: 100%;
    }
  }

  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }

  .title-right {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
  }
}

.datetime {
  font-size: 15px;
  margin-left: 10px;
}

.logo {
  position: absolute;
  left: 0px;
  top: 55%;
  transform: translateY(-80%);

  img {
    height: 30px;
    width: 25px;
  }
}

.screen-body {
  width: 100%;
  height: 100%;
  display: flex;
  margin-top: 10px;

  .screen-left {
    height: 100%;
    width: 27.6%;

    #left-top {
      height: 53%;
      position: relative;
    }

    #left-bottom {
      height: 31%;
      margin-top: 25px;
      position: relative;
    }
  }

  .screen-middle {
    height: 100%;
    width: 41.5%;
    margin-left: 1.6%;
    margin-right: 1.6%;

    #middle-top {
      width: 100%;
      height: 56%;
      position: relative;
    }

    #middle-bottom {
      margin-top: 25px;
      width: 100%;
      height: 28%;
      position: relative;
    }
  }

  .screen-right {
    height: 100%;
    width: 27.6%;

    #right-top {
      height: 46%;
      position: relative;
    }

    #right-bottom {
      height: 38%;
      margin-top: 25px;
      position: relative;
    }
  }
}
</style>