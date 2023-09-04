<!--
    重量折线图
-->

<template>
    <div class="com-container">
        <div class="title" :style="comStyle">
            <span>▎ 重量(kg)</span>
        </div>
        <div class="com-chart" ref="weight_ref">
        </div>
    </div>
</template>

<script>
import echarts from 'echarts'
export default {
    data() {
        return {
            chartInstance: null,// echart实例
            allData: null,      // 从服务器中获取的所有数据
            titleFontSize: 0,
            // timerId : null  //定时器标识
        }
    },
    created() {
        this.$socket.registerCallBack('WeightGet', this.getData)
    },
    mounted() {
        this.initChart()
        this.$socket.send({
            action: 'getData',
            socketType: 'WeightGet'
        })
        // this.getData()
        // this.startInterval()
        window.addEventListener('resize', this.screenAdapter)
        this.screenAdapter()
    },
    destroyed() {
        window.removeEventListener('resize', this.screenAdapter)
        // clearInterval(this.timerId)
        this.$socket.unRegisterCallBack("WeightGet")
    },
    computed: {
        comStyle() {
            return {
                fontSize: this.titleFontSize + 'px'
            }
        }

    },
    methods: {
        //初始化chart实例
        initChart() {
            this.chartInstance = echarts.init(this.$refs.weight_ref, 'theme2')
            const initOption = {
                grid: {
                    left: '3%',
                    top: '35%',
                    right: '4%',
                    bottom: '1%',
                    containLabel: true
                },
                tooltip: {
                    trigger: 'axis',
                },
                xAxis: {
                    splitLine: {
                        show: false // 不显示网格线
                    },
                    type: 'category',
                    boundaryGap: false
                },
                yAxis: {
                    splitLine: {
                        show: false // 不显示网格线
                    },
                    type: 'value',
                    scale: true
                },


            }
            this.chartInstance.setOption(initOption)
        },

        //todo:获取服务器数据
        getData(ret) {

            // const {data : ret} =  await this.$http.get('/weight?id=1')

            console.log(ret)
            //对allData进行赋值
            this.allData = ret.reverse()
            this.updateChart()
        },

        updateChart() {
            //处理数据
            let timeArr = this.allData.map(item => (item.upTime))

            let WeightArr = this.allData.map(item => (item.weight))


            //颜色
            const color1 = 'rgba(102,202,156,0.5)'
            const color2 = 'rgba(102,202,156,0)'
            console.log(timeArr)
            console.log(WeightArr)
            const dataOption = {
                xAxis: {
                    data: timeArr,
                    axisLabel: {
                        interval: 0,
                        formatter: function (value) {
                            var valueAfter = value.toString()
                            var resultString = ''

                            for (var code in valueAfter) {

                                if (valueAfter[code] == 'T') {
                                    resultString += '\n'
                                } else {
                                    resultString += valueAfter[code]
                                }
                            }
                            return resultString
                        }
                    }
                },
                // yAxis:{
                //   data: temperatureArr
                // },
                series: [{
                    data: WeightArr,
                    type: 'line',
                    markPoint: {
                        data: [
                            {
                                type: 'max', name: '最大值'
                            }, {
                                type: 'min', name: '最小值'
                            }
                        ]
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: color1
                            },//0%时颜色值
                            {
                                offset: 1,
                                color: color2
                            } //100%时颜色值
                        ])
                    }
                }]
            }
            this.chartInstance.setOption(dataOption)
        },

        screenAdapter() {
            this.titleFontSize = this.$refs.weight_ref.offsetWidth / 100 * 3.6
            const adapterOption = {
                //  title : {                
                //     textStyle : {
                //         fontSize : '300%'
                //     },
                //     subtextStyle:{
                //      fontSize : '100%' 
                //  }
                //  }
            }
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize()

        },
        //定时器，每过3秒，重新得到一次数据
        // startInterval(){
        //     if(this.timerId){
        //       clearInterval(this.timerId)
        //     }
        //     this.timerId = setInterval(() => {
        //       this.getData()
        //     }, 3000);
        //   }
    }
}
</script>

<style lang="less" scoped>
.title {
    position: absolute;
    z-index: 10;
    left: 20px;
    top: 20px;
    color: white;
}

// .subtitle{
//     size: ;
// }
</style>