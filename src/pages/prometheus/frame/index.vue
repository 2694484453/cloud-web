<template>
  <Dashboard :frame-src="frameSrc" :loading="true"/>
</template>
<script lang="ts">
import { prefix } from '@/config/global';
import Dashboard from '@/components/dashboard/index.vue';
import {prometheusDomain} from "@/config/global";

export default {
  name: 'DetailAdvanced',
  components: {
    Dashboard
  },
  data() {
    return {
      prefix,
      loading: true,
      frameSrc: prometheusDomain,
    };
  },
  mounted() {

  },
  methods: {
  },
};
</script>
<style lang="less" scoped>

</style>
