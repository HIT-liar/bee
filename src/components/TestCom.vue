<template>
  <div>跨域</div>
</template>

<script>
export default {
    data(){
        return{
            got:{}
        }
    },
    mounted(){
        this.$http.get('humidity').then(res=>{
				console.log(res.data)
			})
    }


}
</script>

<style>

</style>