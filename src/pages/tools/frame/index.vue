<template>
  <Dashboard v-show="frameSrc!=null||frameSrc!=''" :frame-src="frameSrc" :loading="true"/>
  <Result404 v-show="!frameSrc"/>
</template>
<script lang="ts">
import Dashboard from '@/components/dashboard/index.vue';
import Result404 from "@/pages/result/404/index.vue";
export default {
  name: 'vpsDashboard',
  components: {
    Result404,
    Dashboard,
  },
  data() {
    return {
      loading: true,
      frameSrc: '',
    };
  },
  mounted() {
    // 取参数
    if (this.$route.query.src != null) {
      this.frameSrc = this.$route.query.src;
    } else  {
      this.loading = false;
    }
  },
  methods: {

  },
};
</script>
<style lang="less" scoped>
</style>
