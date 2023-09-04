const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      "/api":{
        target: 'http://60.204.223.197:8004/',      //后端接口的根目录
        changeOrigin: true,                    //是否跨域
        pathRewrite: {
            '^/api': '/'
        }
      }
    }
}
})

