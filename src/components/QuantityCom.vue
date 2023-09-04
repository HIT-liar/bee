<template>
    <div class="com-container">
        <div class="title" :style="comStyle">
            <span>▎ 出入量(只)</span>
        </div>
        <div class="com-chart" ref="quantity_ref">
        </div>
    </div>
</template>

<script>
import echarts from 'echarts';
export default {
    data() {
        return {
            chartInstance: null,
            allData: null,
            titleFontSize: 0
        }
    },
    created() {
        this.$socket.registerCallBack('QuantityGet', this.getData)
    },
    mounted() {
        this.initChart()
        this.$socket.send({
            action: 'getData',
            socketType: 'QuantityGet'
        })
        // this.getData()
        // this.startInterval()
        window.addEventListener('resize', this.screenAdapter)
        this.screenAdapter()
    },
    destroyed() {
        window.removeEventListener('resize', this.screenAdapter)
        // clearInterval(this.timerId)
        this.$socket.unRegisterCallBack('QuantityGet')
    },
    computed: {
        comStyle() {
            return {
                fontSize: this.titleFontSize + 'px'
            }
        }
    },
    methods: {
        initChart() {
            this.chartInstance = echarts.init(this.$refs.quantity_ref, 'theme3')

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

        getData(ret) {
            //await this.$http.get
            // const {data : ret} =  await this.$http.get('/quantity?id=1')
            console.log(ret)
            //对allData进行赋值
            this.allData = ret.reverse()
            this.upDateChart()
        },

        upDateChart() {
            // 处理数据
            let timeArr = this.allData.map(item => (item.upTime))
            let inArr = this.allData.map(item => (item.beeIn))
            let outArr = this.allData.map(item => (item.beeOut))

            const color1 = 'rgba(133,172,186,0.5)'
            const color2 = 'rgba(133,172,186,0)'
            const color3 = 'rgba(201,158,170,0.5)'
            const color4 = 'rgba(201,158,170,0)'

            const seriesArr = [{
                name: '入',
                type: 'line',
                data: inArr,
                stack: 'map',
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
            },
            {
                name: '出',
                type: 'line',
                data: outArr,
                stack: 'map',
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
                            color: color3
                        },//0%时颜色值
                        {
                            offset: 1,
                            color: color4
                        } //100%时颜色值
                    ])
                }
            }]

            const legendArr = [{ name: '入', top: '15%' }, {
                name: '出',
                top: '15%'
            }]

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
                legend: legendArr,
                series: seriesArr
            }
            this.chartInstance.setOption(dataOption)
        },

        screenAdapter() {
            this.titleFontSize = this.$refs.quantity_ref.offsetWidth / 100 * 3.6
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
</style>