<template>
  <Dashboard :frame-src="frameSrc" :loading="true"/>
</template>
<script lang="ts">
import Dashboard from '@/components/dashboard/index.vue';
import {grafanaDomain, datasource} from "@/constants";
export default {
  name: 'vpsDashboard',
  components: {
    Dashboard,
  },
  data() {
    return {
      loading: true,
      grafana: {
        domain: grafanaDomain,
        datasource: datasource,
        jobName: "",
        hostName: ""
      },
      frameSrc: '',
    };
  },
  mounted() {
  },
  created() {
    // 取参数
    if (this.$route.query.jobName != null) {
      this.grafana.jobName = this.$route.query.jobName;
    }
    if (this.$route.query.hostName != null) {
      this.grafana.hostName = this.$route.query.hostName;
    }
    let str = "&var-datasource="+encodeURI(this.grafana.datasource)+"&var-job="+encodeURI(this.grafana.jobName)+"&var-node="+encodeURI(this.grafana.hostName);
    this.frameSrc = this.grafana.domain + "/d/rYdddlPWk/node-exporter-full?orgId=1&timezone=browser"+str+"&refresh=5s";
  },
  methods: {

  },
};
</script>
<style lang="less" scoped>
</style>
