<template>
<!--  <div :class="prefix + '-footer'">Copyright © 2021-{{ new Date().getFullYear() }} Tencent. All Rights Reserved</div>-->
  <div :class="prefix + '-footer'">
    <p>
      &copy; 2024 {{appCnName}}. 版权所有.
      <a href="https://beian.miit.gov.cn/" target="_blank">豫ICP备2021037763号-1</a>
    </p>
  </div>
</template>

<script>
import { prefix,appCnName } from '@/config/global';
import Vue from 'vue';

export default Vue.extend({
  name: `${prefix}-footer`,
  data() {
    return {
      prefix,
      appCnName:appCnName
    };
  },
});
</script>

<style lang="less" scoped>
@import '@/style/variables';

.@{starter-prefix}-footer {
  color: var(--td-text-color-placeholder);
  line-height: 20px;
  text-align: center;
}
</style>
