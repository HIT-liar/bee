<template>
        <div class="main">
                <el-form>
                        <el-form-item label="最高温度(℃):">
                                <el-input v-model="maxTem" style="margin-top: 5px;"></el-input>
                        </el-form-item>
                        <el-form-item label="最低温度(℃):">
                                <el-input v-model="minTem" style="margin-top: 5px;"></el-input>
                        </el-form-item>
                        <el-form-item label="最高湿度(%rh):">
                                <el-input v-model="maxHumidity" style="margin-top: 5px;"></el-input>
                        </el-form-item>
                        <el-form-item label="最低湿度(%rh):">
                                <el-input v-model="minHumidity" style="margin-top: 5px;"></el-input>
                        </el-form-item>
                        <el-form-item label="期望重量(kg):">
                                <el-input v-model="theWeight" style="margin-top: 5px;"></el-input>
                        </el-form-item>
                </el-form>
                <el-button style="background-color:#235586; color:white; border-radius:12px;float:right; " @click="submitForm()" >确定</el-button>

        </div>
</template>

<script>
export default {
        data() {
                return {
                        maxTem: null,
                        minTem: null,
                        maxHumidity: null,
                        minHumidity: null,
                        theWeight: null

                }
        },
        created() {
                this.$socket.registerCallBack('SettingGet2', this.getData)
        },
        mounted() {
                this.$socket.send({
                        action: 'getData',
                        socketType: 'SettingGet2'
                })
        },
        methods: {
                submitForm() {
                        let nowData={
                        maxTem: this.maxTem,
                        minTem: this.minTem,
                        maxHumidity: this.maxHumidity,
                        minHumidity: this.minHumidity,
                        theWeight: this.theWeight
                        }

                        this.$socket.send({
                                action: 'getData',
                                socketType: 'settingChange',
                                value: nowData
                        })
                
                },
                getData(ret) {
                        this.maxTem = ret.maxTem
                        this.minTem = ret.minTem
                        this.maxHumidity = ret.maxHumidity
                        this.minHumidity = ret.minHumidity
                        this.theWeight = ret.theWeight
                }
        }

}
</script>

<style>
.main {
        height: 100%;
        width: 100%;
}
</style>