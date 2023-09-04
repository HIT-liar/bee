export default class SocketService {
    /**
     * 单例的设计模式
     */

    static instance = null
    static get Instance() {
        if (!this.instance) {
            this.instance = new SocketService()
        }
        return this.instance
    }

    //和服务器连接的socket
    ws = null

    //存储回调函数
    callBackMapping = {}

    //标识是否连接成功
    connected = false

    //send重连执行了多少次
    sendRetryCount = 0

    //onclose重连执行了多少次
    connectRetryCount = 0

    //定义连接服务器方法
    connect() {
        if (!window.WebSocket) {
            return console.log("您的浏览器不支持WebSocket")
        }
        // this.ws = new WebSocket('ws://192.168.43.206:8004/beehive')
        this.ws = new WebSocket('ws://60.204.223.197:8004/beehive')
        // 连接成功的事件
        this.ws.onopen = () => {
            this.connected = true
            console.log("连接服务器成功")
            this.connectRetryCount = 0
        }
        // 连接服务器失败
        this.ws.onclose = () => {
            this.connected = false
            console.log("连接服务器失败")
            this.connectRetryCount++
            setTimeout(() => {
                this.connect()
            }, this.connectRetryCount * 500)
        }
        //得到服务器发送过来的数据的事件
        this.ws.onmessage = msg => {
            console.log("从服务端获取到了数据")
            //真正服务器发送过来的数据在msg.data字段
            console.log(msg.data)
            const recvData = JSON.parse(msg.data)
            const socketType = recvData.socketType

            //判断回调函数是否存在
            if (this.callBackMapping[socketType]) {
                const action = recvData.action

                if (action === 'getData') {
                    const realData = recvData.value
                    console.log(realData)
                    this.callBackMapping[socketType].call(this, realData)
                }
            }
        }
    }

    registerCallBack(socketType, callBack) {
        this.callBackMapping[socketType] = callBack
    }

    unRegisterCallBack(socketType) {
        this.callBackMapping[socketType] = null
    }

    //发送数据的方法
    send(data) {
        if (this.connected) {
            this.sendRetryCount = 0
            this.ws.send(JSON.stringify(data))
        } else {
            this.sendRetryCount++
            setTimeout(() => {
                this.send(data)
            }, this.sendRetryCount * 500)
        }

    }
}