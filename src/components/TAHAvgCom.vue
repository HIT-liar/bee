<template>
    <div class='com-container'>
        <div class="title" :style="comStyle">
            <span>{{ '▎ ' + showTitle }}</span>
            <span class="iconfont title-icon" @click="showChoice = !showChoice"><svg width="20" height="24"
                    viewBox="0 0 48 40" fill="none">
                    <path d="M39.6 17.444L24.044 33 8.487 17.444" stroke="#ffffff" stroke-width="2" />
                </svg></span>
            <div class="select-con" v-show="showChoice" :style="marginStyle">
                <div class="select-item" @click="handleSelect(false)" v-show="myChoice">
                    平均湿度(%rh)
                </div>
                <div class="select-item" @click="handleSelect(true)" v-show="!myChoice">
                    平均温度(℃)
                </div>
            </div>
        </div>
        <div class="com-chart" ref="tahavg_ref"></div>
    </div>
</template>

<script>
import echarts from 'echarts'
export default {
    data() {
        return {
            chartInstance: null,
            allData: null,
            showChoice: false, // 是否显示可选项
            choice: 'temperature',
            myChoice: true,
            titleFontSize: 0,
        }
    },
    created() {
        this.$socket.registerCallBack('TAHAvgGet', this.getData)
    },
    mounted() {
        this.initChart()
        this.$socket.send({
            action: 'getData',
            socketType: 'TAHAvgGet'
        })
        window.addEventListener('resize', this.screenAdapter)
        this.screenAdapter()
    },
    destroyed() {
        window.removeEventListener('resize', this.screenAdapter)
        this.$socket.unRegisterCallBack('TAHAvgGet')
    },
    computed: {
        comStyle() {
            return {
                fontSize: this.titleFontSize + 'px'
            }
        },
        showTitle() {
            if (this.choice.includes('temperature')) {
                return '平均温度(℃)'
            } else {
                return '平均湿度(%rh)'
            }
        },
        marginStyle() {
            return {
                marginLeft: this.titleFontSize + 'px'
            }
        }

    },
    methods: {
        initChart() {
            this.chartInstance = echarts.init(this.$refs.tahavg_ref, 'theme4')
            const initOption = {
                grid: {
                    top: '40%',
                    left: '5%',
                    right: '5%',
                    bottom: '5%',
                    containLabel: true

                },
                tooltip: {
                    show: true
                },
                xAxis: {
                    type: 'category'
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        type: 'bar'
                    }
                ]
            }
            this.chartInstance.setOption(initOption)
        },
        getData(ret) {
            console.log(ret)
            // 获取服务器的数据内容
            this.allData = ret.reverse()

            this.updateChart()
        },
        updateChart() {
            let timeArr = this.allData.map(item => {
                var valueAfter = item.day.toString()
                var resultString = ''
                var count = 0
                for (var code in valueAfter) {
                    if(count>=5){
                    if (valueAfter[code] == 'T') {
                        break
                    } else {
                        resultString += valueAfter[code]
                    }
                }
                    count++;
                }
                return resultString
            })
            let dataArr = null
            if (this.choice.includes('temperature')) {
                dataArr = this.allData.map(item => (item.temperatureAvg))
            } else {
                dataArr = this.allData.map(item => (item.humidityAvg))
            }
            // 处理图表需要的数据
            const dataOption = {
                xAxis: {
                    data: timeArr,
                    axisLabel: {
                        interval: 0
                    }
                },
                series: [{
                    data: dataArr,
                    markPoint: {
                        data: [
                            {
                                type: 'max', name: '最大值'
                            }, {
                                type: 'min', name: '最小值'
                            }
                        ]
                    },
                    itemStyle: {
                        color: () => {
                            return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: '#cbf4ff'
                                },
                                {
                                    offset: 1,
                                    color: '#23e5e5'
                                }
                            ])

                        }
                    }
                }]
            }
            this.chartInstance.setOption(dataOption)
        },
        screenAdapter() {
            this.titleFontSize = this.$refs.tahavg_ref.offsetWidth / 100 * 3.6
            const adapterOption = {
                series: [
                    {
                        barWidth: this.titleFontSize,
                        itemStyle: {
                            barBorderRadius: [this.titleFontSize / 2, this.titleFontSize / 2, 0, 0]
                        }
                    }
                ]
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
        }
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
</style>