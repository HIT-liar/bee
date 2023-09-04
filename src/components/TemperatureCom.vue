<template>
    <div class="com-container">
        <div class="title" :style="comStyle">
            <span>{{ '▎ ' + showTitle }}</span>
            <span class="iconfont title-icon" @click="showChoice = !showChoice"><svg width="20" height="24"
                    viewBox="0 0 48 40" fill="none">
                    <path d="M39.6 17.444L24.044 33 8.487 17.444" stroke="#ffffff" stroke-width="2" />
                </svg></span>
            <div class="select-con" v-show="showChoice" :style="marginStyle">
                <div class="select-item" @click="handleSelect(false)" v-show="myChoice">
                    湿度(%rh)
                </div>
                <div class="select-item" @click="handleSelect(true)" v-show="!myChoice">
                    温度(℃)
                </div>
            </div>
        </div>
        <div class="com-chart" ref="temperature_ref">
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
            showChoice: false, // 是否显示可选项
            choice: 'temperature',
            myChoice: true,
            titleFontSize: 0,
            // timerId: null  //定时器标识
        }
    },
    created() {
        this.$socket.registerCallBack('TAHGet', this.getData)
    },
    mounted() {
        this.initChart()
        this.$socket.send({
            action: 'getData',
            socketType: 'TAHGet'
        })
        // this.getData()
        // this.startInterval()
        window.addEventListener('resize', this.screenAdapter)
        this.screenAdapter()
    },
    destroyed() {
        window.removeEventListener('resize', this.screenAdapter)
        // clearInterval(this.timerId)
        this.$socket.unRegisterCallBack('TAHGet')
    },
    computed: {
        comStyle() {
            return {
                fontSize: this.titleFontSize + 'px'
            }
        },
        showTitle() {
            if (this.choice.includes('temperature')) {
                return '温度(℃)'
            } else {
                return '湿度(%rh)'
            }
        },
        marginStyle() {
            return {
                marginLeft: this.titleFontSize + 'px'
            }
        }

    },
    methods: {
        //初始化chart实例
        initChart() {
            this.chartInstance = echarts.init(this.$refs.temperature_ref, 'theme')
            const initOption = {
                // title: {
                //   text: '温度',
                //   textStyle:{
                //   fontSize: 30
                // },
                // left: 20,
                // top : 20,
                // subtext: '温度(℃)',
                // subtextStyle:{
                //   fontSize: 18
                // },
                // },
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

            // const { data: ret } = await this.$http.get(this.choice)

            console.log(ret)
            //对allData进行赋值
            this.allData = ret.reverse()
            this.updateChart()
        },

        updateChart() {
            //处理数据
            let timeArr = this.allData.map(item => (item.upTime))
            let temperatureArr = null
            if (this.choice.includes('temperature')) {
                temperatureArr = this.allData.map(item => (item.temperature))
            } else {
                temperatureArr = this.allData.map(item => (item.humidity))
            }
            //颜色
            const color1 = 'rgba(243,149,82,0.5)'
            const color2 = 'rgba(243,149,82,0)'
            // let temperatureArr = this.allData.map(item=>{
            //     return{
            //         type: 'line',
            //         data: item.temperature
            //     }
            // })
            console.log(timeArr)
            console.log(temperatureArr)
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
                    data: temperatureArr,
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
            this.titleFontSize = this.$refs.temperature_ref.offsetWidth / 100 * 3.6
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

        handleSelect(flag) {
            if (flag) {
                this.choice = 'temperature'

            } else {
                this.choice = 'humidity'

            }
            this.updateChart()
            this.showChoice = false
            this.myChoice = flag
        },
        //定时器，每过3秒，重新得到一次数据
        // startInterval() {
        //     if (this.timerId) {
        //         clearInterval(this.timerId)
        //     }
        //     this.timerId = setInterval(() => {
        //         this.getData()
        //     }, 3000);
        // },
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

    .title-icon {
        cursor: pointer;
        margin: 10px;
    }
}

.select-con {
    background-color: #26404e;
}

// .subtitle{
//     size: ;
// }
</style>