<template>
     <div class="screen-container">
    <header class="screen-header">
      <div>
      
      </div>
      <span class="logo">

      </span>
      <span class="title">智能蜂箱实时监控系统</span>
      <div class="title-right">

        <span class="datetime">2049-01-01 00:00:00</span>

      </div>

    </header>

    
    <div class="hhh">
    <BeehiveMap></BeehiveMap>
    </div>  
            
        
    </div>
  
</template>

<script>


import BeehiveMap from '@/components/MapCom.vue'

export default {
    data(){
        return{

        }
    },
    components:{
        BeehiveMap
    }


}
</script>

<style lang="less" scoped>

.screen-container {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background-color: #2e2d3a;
  color: #c66767;
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
  top: 50%;
  transform: translateY(-80%);

  img {
    height: 35px;
    width: 128px;
  }
}
.hhh{
    height: 100%;
    width: 41.5%;
}
</style>