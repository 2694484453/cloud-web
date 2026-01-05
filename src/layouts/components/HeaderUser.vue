<template>
  <div>
    <t-dropdown :min-column-width="125" trigger="click">
      <template #dropdown>
        <t-dropdown-menu>
          <t-dropdown-item class="operations-dropdown-container-item" @click="handleNav('/')">
            <user-circle-icon/>
            <t-link href="/user">个人中心</t-link>
          </t-dropdown-item>
          <t-dropdown-item class="operations-dropdown-container-item" @click="handleLogout">
            <poweroff-icon/>
            退出登录
          </t-dropdown-item>
        </t-dropdown-menu>
      </template>
      <t-button class="header-user-btn" theme="default" variant="text">
        <template #icon>
          <user-circle-icon class="header-user-avatar"/>
        </template>
        <div class="header-user-account" v-text="userName"></div>
        <template #suffix>
          <chevron-down-icon/>
        </template>
      </t-button>
    </t-dropdown>
  </div>
</template>
<script lang="ts">
import {
  UserCircleIcon,
  PoweroffIcon,
} from 'tdesign-icons-vue';
import {cleanUser} from "@/config/storage";

export default {
  name: 'HeaderUser',
  components: {
    UserCircleIcon,
    PoweroffIcon
  },
  data() {
    return {
      userName: '',
    }
  },
  mounted() {
    this.userName = localStorage.getItem('username') ?? '访客';
  },
  methods: {
    handleNav(url) {
      this.$router.push(url);
    },
    handleLogout() {
      this.$router.push(`/login?redirect=${this.$router.history.current.fullPath}`);
      cleanUser();
    },
  }
}
</script>
<style scoped lang="less">
@import '@/style/variables.less';

.header-menu {
  flex: 1 1 1;
  display: inline-flex;
}

.operations-container {
  display: flex;
  align-items: center;
  margin-right: 12px;

  .t-popup__reference {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .t-button {
    margin: 0 8px;

    &.header-user-btn {
      margin: 0;
    }
  }

  .t-icon {
    font-size: 20px;

    &.general {
      margin-right: 16px;
    }
  }
}

.header-operate-left {
  display: flex;
  margin-left: 20px;
  align-items: normal;
  line-height: 0;

  .collapsed-icon {
    font-size: 20px;
  }
}

.header-logo-container {
  width: 184px;
  height: 26px;
  display: flex;
  margin-left: 24px;
  color: var(--td-text-color-primary);

  .t-logo {
    width: 100%;
    height: 100%;

    &:hover {
      cursor: pointer;
    }
  }

  &:hover {
    cursor: pointer;
  }
}

.header-user-account {
  display: inline-flex;
  align-items: center;
  color: var(--td-text-color-primary);

  .t-icon {
    margin-left: 4px;
    font-size: 16px;
  }
}

.t-head-menu__inner {
  border-bottom: 1px solid var(--td-border-level-1-color);
}

.t-menu--light {
  .header-user-account {
    color: var(--td-text-color-primary);
  }
}

.t-menu--dark {
  .t-head-menu__inner {
    border-bottom: 1px solid var(--td-gray-color-10);
  }

  .header-user-account {
    color: rgba(255, 255, 255, 0.55);
  }

  .t-button {
    --ripple-color: var(--td-gray-color-10) !important;

    &:hover {
      background: var(--td-gray-color-12) !important;
    }
  }
}
</style>
