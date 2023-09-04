import Vue from 'vue'
import App from './App.vue'
import router from './router'
//引入全局样式文件
import './assets/css/global.less'

// 引入Element组件，由饿了么提供的一些美化界面的组件
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

//  引入echarts 
import echarts from 'echarts'

// 引入axios 
import axios from 'axios'

// 引入theme
import theme from './theme/dark.json'
echarts.registerTheme('theme', theme)
import theme2 from './theme/dark2.json'
echarts.registerTheme('theme2', theme2)
import theme3 from './theme/dark3.json'
echarts.registerTheme('theme3', theme3)
import theme4 from './theme/dark4.json'
echarts.registerTheme('theme4', theme4)
import theme5 from './theme/dark5.json'
echarts.registerTheme('theme5', theme5)

//引入socket
import SocketService from '@/socket/socket_service'
//对服务端进行websocket连接
SocketService.Instance.connect()
Vue.prototype.$socket = SocketService.Instance

//配置请求基准路径
axios.defaults.baseURL = '/api'
//将axios挂载到vue原型对象上
//在别的组件中用this.$http来发起axios的请求
Vue.prototype.$http = axios
Vue.prototype.echarts = echarts


Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(echarts)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
