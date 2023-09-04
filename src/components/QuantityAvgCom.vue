<template>
    <div class="com-container">
        <div class="title" :style="comStyle">
            <span>▎ 平均出入量(只)</span>
        </div>
        <div class="com-chart" ref="quantityAvg_ref">
        </div>
    </div>
</template>

<script>
import echarts from 'echarts'
export default {
    data() {
        return {
            chartInstance: null,
            allData: null,
            titleFontSize: 0
        }
    },
    created() {
        this.$socket.registerCallBack('QuantityAvgGet', this.getData)
    },
    mounted() {
        this.initChart()
        this.$socket.send({
            action: 'getData',
            socketType: 'QuantityAvgGet'
        })
        window.addEventListener('resize', this.screenAdapter)
        this.screenAdapter()
    },
    destroyed() {
        window.removeEventListener('resize', this.screenAdapter)
        this.$socket.unRegisterCallBack('QuantityAvgGet')
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
            this.chartInstance = echarts.init(this.$refs.quantityAvg_ref, 'theme5')

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
            this.allData = ret.reverse()
            this.upDateChart()
        },
        upDateChart() {
            this.titleFontSize = this.$refs.quantityAvg_ref.offsetWidth / 100 * 3.6
            //todo: 数据处理
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

            let inArr = this.allData.map(item => (item.beeInAvg))
            let outArr = this.allData.map(item => (item.beeOutAvg))

            const seriesArr = [{
                barWidth: this.titleFontSize,
                name: '入',
                type: 'bar',
                data: inArr,
            }, {
                barWidth: this.titleFontSize,
                name: '出',
                data: outArr,
                type: 'bar',
            }]
            const legendArr = [{ name: '入', top: '15%' }, {
                name: '出',
                top: '15%'
            }]
            const dataOption = {
                xAxis: {
                    data: timeArr,
                    axisLabel: {
                        interval: 0
                    }
                },
                legend: legendArr,
                series: seriesArr
            }
            this.chartInstance.setOption(dataOption)
        },
        screenAdapter() {
            this.titleFontSize = this.$refs.quantityAvg_ref.offsetWidth / 100 * 3.6
            const adapterOption = {
                series: [
                    {
                        barWidth: this.titleFontSize,
                    },
                    {
                        barWidth: this.titleFontSize,
                    }
                ]
            }
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize()
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
}
</style>