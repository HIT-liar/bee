<template>
    <div id="container"></div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader';
import icon from '../assets/yellow.png'
export default {
    data() {
        return {
            allData: null,
            // statusData : null,
            mainBeehiveId: 1,//默认最开始显示的蜂箱信息为一号蜂箱
            currentAMap: null,
            beehivesLastedStatus: null,
            // exceptions: []
            exceptions: [{
                id: 1,
                exception1: false,
                exception2: false
            }],
            setting:null
        }
    },
    created() {
        this.$socket.registerCallBack('InitialData', this.getInitialData)
        this.$socket.registerCallBack('AllFirstDataGet', this.statusMonitor)
        this.$socket.registerCallBack('MainIdChange', this.centerChange)
        this.$socket.registerCallBack('SettingGet',this.settingGet)
        window.handle=(id,eId) =>{
            console.log("yes")
            this.exceptions.forEach(exception=>{
                if(exception.id == id){
                    if(eId == 1){
                        exception.exception1 = false
                    }
                    if(eId == 2){
                        exception.exception2 = false
                    }
                }
            })
            this.beehivesLastedStatus.forEach(status =>{
                if(status.id == id){
                    if(eId==1){
                        status.exception1=false
                    }
                    if(eId == 2){
                        status.exception2=false
                    }
                }
            })

            this.statusMonitor(this.beehivesLastedStatus)
        }
        // this.$socket.registerCallBack('LocationChange',this.updateData)
    },
    mounted() {
        this.initMap()
        this.$socket.send({
            action: 'getData',
            socketType: 'SettingGet'
        })
        this.$socket.send({
            action: 'getData',
            socketType: 'InitialData'
        })
        this.$socket.send({
            action: 'getData',
            socketType: 'AllFirstDataGet'
        })
    },
    destroyed() {
        this.$socket.unRegisterCallBack('InitialData')
        this.$socket.unRegisterCallBack('AllFirstDataGet')
        this.$socket.unRegisterCallBack('MainIdChange')
        this.$socket.unRegisterCallBack('SettingGet')
        // this.$socket.unRegisterCallBack('LocationChange')    
    },
    methods: {
        initMap() {
            AMapLoader.load({
                key: "0a68ac006f00b653fb25cf16308eb646",// 申请好的Web端开发者Key，首次调用 load 时必填
                version: "2.0",      // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
                plugins: [''],       // 需要使用的的插件列表，如比例尺'AMap.Scale'等
            }).then((AMap) => {
                this.currentAMap = AMap
                console.log("debug")
                console.log(this.currentAMap)
                this.map = new AMap.Map("container", {  //设置地图容器id
                    viewMode: "3D",    //是否为3D地图模式
                    zoom: 19,           //初始化地图级别
                    pitch: 45,
                    terrain: true,
                    center: [126.63204, 45.7456], //初始化地图中心点位置
                });
            }).catch(e => {
                console.log(e);
            })
        },
        getInitialData(ret) {
            // 等待地图数据初始化完成
            console.log(ret)
            if (!this.currentAMap||!this.setting) {
                setTimeout(() => {
                    console.log('正在获取数据')
                    this.getInitialData(ret)
                }, 500)
                return
            }
            // 获得所有蜂箱以及其位置信息
            this.allData = ret.dataNeeded;
            this.mainBeehiveId = ret.mainBeehiveId

            // 验证接收到了信息
            console.log(this.allData)
            if (!this.allData || !this.beehivesLastedStatus) {
                setTimeout(() => {
                    console.log("正在接收初始化数据")
                    this.getInitialData(ret)
                }, 500)
                return
            } else {
                // 因为下面会重新建立marker以及infoWindow，所以这里先清理一下
                this.map.clearMap()
                // 遍历每个蜂箱，建立marker
                console.log("收到的数据")
                console.log(this.allData)
                this.allData.forEach(element => {
                    const position = new this.currentAMap.LngLat(element.xLocation, element.yLocation); // Marker经纬度
                    const marker = new this.currentAMap.Marker({
                        position: position,
                        icon: new this.currentAMap.Icon({
                            image: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
                            imageSize: new this.currentAMap.Size(35, 45)
                        }),
                        offset: new this.currentAMap.Pixel(-13, -30) // 以 icon 的 [center bottom] 为原点
                    });
                    // 需要在事件e中调用的事情
                    marker.id = element.id;
                    marker.mainId = this.mainBeehiveId
                    marker.socket = this.$socket
                    marker.beehivesLastedStatus = this.beehivesLastedStatus
                    marker.nowMap = this.map
                    marker.exception1 = false
                    marker.exception2 = false
                    marker.exceptionQuantity = 0
                    marker.harvest = false

                    // 获取当前蜂箱的最新信息
                    let status = null
                    for (var i = 0; i < this.beehivesLastedStatus.length; i++) {
                        if (this.beehivesLastedStatus[i].id === element.id) {
                            status = this.beehivesLastedStatus[i]
                            break
                        }
                    }
                    // 编制成在infoWindow中显示的数据
                    let infoContent =
                        '<div style="display: flex">' +
                        '<div><img  width="80" src=".//public/bee.jpg"></div>' +
                        '<div>' +
                        '<div style="color:black;">蜂箱号: ' + element.id + '</div>' +
                        '<div style="color:black;">目前温度: ' + status.temperature + '℃</div>' +
                        '<div style="color:black;">目前湿度: ' + status.humidity + '%</div>' +
                        '<div style="color:black;">目前重量: ' + status.weight + 'kg</div>'

                    // 异常状态判断，以及显示，需要修改判断条件
                    let exceptionString = '<div style="color:red;">'
                    if (status.temperature > this.setting.maxTem) {
                        exceptionString = exceptionString + '当前蜂箱温度过高  '
                        marker.exception1 = true
                        marker.exceptionQuantity++;
                    }
                    if (status.temperature < this.setting.minTem) {
                        exceptionString = exceptionString + '当前蜂箱温度过低  '
                        marker.exception1 = true
                        marker.exceptionQuantity++;
                    }
                    if (status.humidity > this.setting.maxHumidity) {
                        exceptionString = exceptionString + '当前蜂箱湿度过高  '
                        marker.exception1 = true
                        marker.exceptionQuantity++;
                    }
                    if (status.humidity < this.setting.minHumidity) {
                        exceptionString = exceptionString + '当前蜂箱湿度过低  '
                        marker.exception1 = true
                        marker.exceptionQuantity++
                    }
                    exceptionString = exceptionString + '</div>'

                    // 第二种异常，需要服务器传送
                    let exceptionStringAnother = ''
                    if (this.exceptions.length > 0) {
                        // let index = null
                        let theException = null
                        for (var j = 0; j < this.exceptions.length; j++) {
                            if (this.exceptions[j].id === element.id) {
                                // index = j
                                theException = this.exceptions[j]
                                break
                            }
                        }
                        if (theException) {
                            if (theException.exception1) {
                                marker.exception2 = true
                                exceptionStringAnother = exceptionStringAnother + '<div style="color:red;">检测到害虫<input id="pest" class="btn" type="button" value="已解决" onclick="handle(' + theException.id + ',1)"/></div>'

                            }
                            if (theException.exception2) {
                                marker.exception2 = true
                                exceptionStringAnother = exceptionStringAnother + '<div style="color:red;" >蜂箱中蜜蜂有分家趋势<input id="separate" class="btn" type="button" value="已解决" onclick="handle(' + theException.id + ',2)"/></div>'
                            }
                        }
                    }

                    // 蜂箱中蜂蜜是否可以收获的显示
                    let harvestString = '<div style="color:#ff7f50;">'
                    if (status.weight >this.setting.theWeight) {
                        marker.harvest = true
                        harvestString = harvestString + '蜂箱已达到收获蜂蜜重量</div>'
                    }

                    if (marker.exception1) {
                        infoContent = infoContent + exceptionString
                    }
                    if (marker.exception2) {
                        infoContent = infoContent + exceptionStringAnother
                    }
                    if (marker.harvest) {
                        infoContent = infoContent + harvestString
                    }

                    infoContent = infoContent + '</div>' + '</div>'
                    marker.infoWindow = new this.currentAMap.InfoWindow({
                        content: infoContent,
                        offset: new this.currentAMap.Pixel(0, -30)
                    })

                    const harvestIcon = new this.currentAMap.Icon({
                        image: icon,
                        imageSize: new this.currentAMap.Size(35, 45)
                    })
                    const warningIcon = new this.currentAMap.Icon({
                        image: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
                        imageSize: new this.currentAMap.Size(35, 45)
                    })
                    if (marker.exception1 || marker.exception2) {
                        marker.setIcon(warningIcon)
                    } else if (marker.harvest) {
                        marker.setIcon(harvestIcon)
                    }

                    this.map.add(marker)
                    if (element.id === this.mainBeehiveId) {
                        console.log("设置默认中心点")
                        this.map.setCenter(position)
                        const defaultIcon = new this.currentAMap.Icon({
                            image: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
                            imageSize: new this.currentAMap.Size(45, 55)
                        })
                        const warnIcon = new this.currentAMap.Icon({
                            image: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
                            imageSize: new this.currentAMap.Size(45, 55)
                        })
                        const harIcon = new this.currentAMap.Icon({
                            image: icon,
                            imageSize: new this.currentAMap.Size(45, 55)
                        })
                        console.log(harIcon)
                        if (marker.exception1 || marker.exception2) {
                            marker.setIcon(warnIcon)
                        } else if (marker.harvest) {
                            marker.setIcon(harIcon)
                        } else {
                            marker.setIcon(defaultIcon)
                        }
                        marker.infoWindow.open(this.map, marker.getPosition())
                    }
                    marker.on('click', function (e) {
                        if (e.target.id === e.target.mainId) {
                            console.log('点击了目前显示的蜂箱')
                            return
                        } else {
                            // marker.getIcon().setImageSize(48,48)
                            e.target.socket.send({
                                action: 'getData',
                                socketType: 'MainIdChange',
                                MainId: element.id
                            })
                        }
                    })
                    marker.on('mouseover', function (e) {
                        console.log(e.target.infoWindow.getContent())
                        e.target.infoWindow.open(e.target.nowMap, e.target.getPosition())
                    })
                    // marker.on('mouseout', function (e) {
                    //     e.target.nowMap.clearInfoWindow()
                    // })
                });

            }

        },
        statusMonitor(ret) {
            // 第一次的数据加载就交给InitialData吧
            if (!this.beehivesLastedStatus) {
                this.beehivesLastedStatus = ret
                return
            }
            this.beehivesLastedStatus = ret
            if (!this.currentAMap) {
                return
            }
            else {
                // 获得所有marker
                console.log("执行了status监测，infoWindow数据更新")
                let markers = this.map.getAllOverlays('marker')
                markers.forEach(element => {
                    let status = null
                    for (var i = 0; i < this.beehivesLastedStatus.length; i++) {
                        if (this.beehivesLastedStatus[i].id === element.id) {
                            status = this.beehivesLastedStatus[i]
                            break
                        }
                    }
                     console.log("bug1")
                     console.log(status)
                    let infoContent =
                        '<div style="display: flex">' +
                        '<div><img  width="80" src=".//public/bee.jpg"></div>' +
                        '<div>' +
                        '<div style="color:black;">蜂箱号: ' + element.id + '</div>' +
                        '<div style="color:black;">目前温度: ' + status.temperature + '℃</div>' +
                        '<div style="color:black;">目前湿度: ' + status.humidity + '%</div>' +
                        '<div style="color:black;">目前重量: ' + status.weight + 'kg</div>'

                        console.log("bug2")
                    element.exception1 = false
                    element.exception2 = false
                    element.exceptionQuantity = 0
                    element.harvest = false
                    console.log("bug3")
                    let exceptionString = '<div style="color:red;">'
                    if (status.temperature > this.setting.maxTem) {
                        exceptionString = exceptionString + '当前蜂箱温度过高  '
                        element.exception1 = true
                        element.exceptionQuantity++;
                    }
                    if (status.temperature < this.setting.minTem) {
                        exceptionString = exceptionString + '当前蜂箱温度过低  '
                        element.exception1 = true
                        element.exceptionQuantity++;
                    }
                    if (status.humidity > this.setting.maxHumidity) {
                        exceptionString = exceptionString + '当前蜂箱湿度过高  '
                        element.exception1 = true
                        element.exceptionQuantity++;
                    }
                    if (status.humidity < this.setting.minHumidity) {
                        exceptionString = exceptionString + '当前蜂箱湿度过低  '
                        element.exception1 = true
                        element.exceptionQuantity++
                    }
                    exceptionString = exceptionString + '</div>'

                    // 需要从ret中读取是否有相应状态，若有判断this.exceptions是否有记录，若无，增添记录，若有，更新记录至与ret一致
                    if (status.exception) {
                        let has = false
                        if (this.exceptions.length > 0) {
                            this.exceptions.forEach(exception => {
                                if (exception.id == status.id) {
                                    has = true
                                    if (status.exception1) {
                                        exception.exception1 = true
                                    }
                                    if (status.exception2) {
                                        exception.exception2 = true
                                    }
                                }
                            })
                            if (!has) {
                                let exception1 = false
                                let exception2 = false
                                if (status.exception1) {
                                    exception1 = true
                                }
                                if (status.exception2) {
                                    exception2 = true
                                }
                                this.exceptions.push({
                                    id: status.id,
                                    exception1: exception1,
                                    exception2: exception2
                                })
                            }
                        } else {
                            let exception1 = false
                            let exception2 = false
                            if (status.exception1) {
                                exception1 = true
                            }
                            if (status.exception2) {
                                exception2 = true
                            }
                            this.exceptions.push({
                                id: status.id,
                                exception1: exception1,
                                exception2: exception2
                            })
                        }
                    }

                    let exceptionStringAnother = ''
                    if (this.exceptions.length > 0) {
                        // let index = null
                        let theException = null
                        for (var j = 0; j < this.exceptions.length; j++) {
                            if (this.exceptions[j].id === element.id) {
                                // index = j
                                theException = this.exceptions[j]
                                break
                            }
                        }
                        if (theException) {
                            if (theException.exception1) {
                                element.exception2 = true
                                exceptionStringAnother = exceptionStringAnother + '<div style="color:red;">检测到害虫<input id="pest" class="btn" type="button" value="已解决" onclick="handle(' + theException.id + ',1)"/></div>'

                            }
                            if (theException.exception2) {
                                element.exception2 = true
                                exceptionStringAnother = exceptionStringAnother + '<div style="color:red;" >蜂箱中蜜蜂有分家趋势<input id="separate" class="btn" type="button" value="已解决" onclick="handle(' + theException.id + ',2)"/></div>'
                            }
                        }
                    }

                    let harvestString = '<div style="color:#ff7f50;">'
                    if (status.weight > this.setting.theWeight) {
                        element.harvest = true
                        harvestString = harvestString + '蜂箱已达到收获蜂蜜重量</div>'
                    }

                    if (element.exception1) {
                        infoContent = infoContent + exceptionString
                    }
                    if (element.exception2) {
                        infoContent = infoContent + exceptionStringAnother
                    }
                    if (element.harvest) {
                        infoContent = infoContent + harvestString
                    }

                    // 更新图标
                    const harvestIcon = new this.currentAMap.Icon({
                        image: icon,
                        imageSize: new this.currentAMap.Size(35, 45)
                    })
                    const warningIcon = new this.currentAMap.Icon({
                        image: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
                        imageSize: new this.currentAMap.Size(35, 45)
                    })
                    const blueIcon = new this.currentAMap.Icon({
                        image: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
                        imageSize: new this.currentAMap.Size(35, 45)
                    })
                    if (element.exception1 || element.exception2) {
                        element.setIcon(warningIcon)
                    } else if (element.harvest) {
                        element.setIcon(harvestIcon)
                    } else {
                        element.setIcon(blueIcon)
                    }

                    // 当其为主选时更新图标
                    if (element.id === this.mainBeehiveId) {
                        const defaultIcon = new this.currentAMap.Icon({
                            image: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
                            imageSize: new this.currentAMap.Size(45, 55)
                        })
                        const warnIcon = new this.currentAMap.Icon({
                            image: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
                            imageSize: new this.currentAMap.Size(45, 55)
                        })
                        const harIcon = new this.currentAMap.Icon({
                            image: icon,
                            imageSize: new this.currentAMap.Size(45, 55)
                        })
                        if (element.exception1 || element.exception2) {
                            element.setIcon(warnIcon)
                        } else if (element.harvest) {
                            element.setIcon(harIcon)
                        } else {
                            element.setIcon(defaultIcon)
                        }
                    }

                    // 更新其infoWindow的值
                    element.infoWindow.setContent(infoContent)

                })

            }
        },
        centerChange(ret) {
            if (ret.changed) {
                this.$socket.send({
                    action: 'getData',
                    socketType: 'InitialData'
                })
            }
        },
        settingGet(ret){
           this.setting=ret;
           console.log(this.setting)
           this.statusMonitor(this.beehivesLastedStatus)
        }
        // Handle(id,eId) {
        //     console.log("yes")
        //     this.exceptions.forEach(exception=>{
        //         if(exception.id == id){
        //             if(eId == 1){
        //                 exception.exception1 = false
        //             }
        //             if(eId == 2){
        //                 exception.exception2 = false
        //             }
        //         }
        //     })
        //     this.beehivesLastedStatus.forEach(status =>{
        //         if(status.id == id){
        //             if(eId==1){
        //                 status.exception1=false
        //             }
        //             if(eId == 2){
        //                 status.exception2=false
        //             }
        //         }
        //     })

        //     this.statusMonitor(this.beehivesLastedStatus)
        // }
        //     updateData(){

        //     },
        //     showAllBeehives(){

        //     }
    }
}
</script>

<style scoped>
#container {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.custom-content-marker {
    position: relative;
    width: 25px;
    height: 34px;
}

.custom-content-marker img {
    width: 100%;
    height: 100%;
}

.custom-content-marker .close-btn {
    position: absolute;
    top: -6px;
    right: -8px;
    width: 15px;
    height: 15px;
    font-size: 12px;
    background: #ccc;
    border-radius: 50%;
    color: #fff;
    text-align: center;
    line-height: 15px;
    box-shadow: -1px 1px 1px rgba(10, 10, 10, .2);
}

.custom-content-marker .close-btn:hover {
    background: #666;
}
</style>