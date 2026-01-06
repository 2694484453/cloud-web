<template>
  <div :class="layoutCls">
    <t-head-menu :class="menuCls" :theme="theme" expandType="popup" v-model:value="dirName"
                 @change="handleChange">
      <template #logo>
        <span v-if="showLogo" class="header-logo-container">已收录{{ total }}张壁纸</span>
        <div v-else class="header-operate-left">
          <t-button theme="default" shape="square" variant="text" @click="changeCollapsed">
            <view-list-icon class="collapsed-icon"/>
          </t-button>
          <search :layout="layout"/>
        </div>
      </template>
      <t-space v-for="item in cateList">
        <t-menu-item :value="item.dictValue">{{item.dictLabel}}</t-menu-item>
      </t-space>
      <t-tooltip content="暂未开放" :disabled="true">
        <t-menu-item :value="'dynamic_wallpaper'">动态壁纸</t-menu-item>
      </t-tooltip>
      <t-tooltip content="用户画廊">
        <t-menu-item :value="'upload'">用户画廊</t-menu-item>
      </t-tooltip>
      <menu-content v-show="layout !== 'side'" class="header-menu" :navData="menu"/>
      <template #operations>
        <div class="operations-container">
          <!-- 搜索框 -->
          <t-tooltip placement="bottom" content="搜索">
            <search @searchData="handleChangeSearchData" v-if="layout !== 'side'" :layout="layout" :searchData="searchData"/>
          </t-tooltip>
          <!-- 全局通知 -->
          <t-tooltip placement="bottom" content="系统通知">
            <WallpaperNotice/>
          </t-tooltip>
          <t-tooltip placement="bottom" content="暂未开放">
            <!--        您还没有订阅哦～-->
              <t-button theme="default" variant="text" :disabled="true">
                福利
              </t-button>
          </t-tooltip>
          <t-tooltip placement="bottom" content="AI壁纸生成">
              <t-button theme="primary" variant="text" tag="a" href="/ai">
                <wallpaper-icon style="width: 18px;height: 18px"/>
                AI壁纸生成
              </t-button>
          </t-tooltip>
          <t-tooltip placement="bottom" content="用户信息">
            <HeaderUser/>
          </t-tooltip>
          <t-tooltip placement="bottom" content="系统设置">
            <t-button theme="default" shape="square" variant="text" @click="toggleSettingPanel">
              <setting-icon/>
            </t-button>
          </t-tooltip>
        </div>
      </template>
    </t-head-menu>
  </div>
</template>

<script>
import Vue from 'vue';
import {
  ViewListIcon,
  LogoGithubIcon,
  HelpCircleIcon,
  SettingIcon,
  ChevronDownIcon,
} from 'tdesign-icons-vue';
import WallpaperIcon from '@/assets/icon/wallpaper.svg';
import {prefix} from '@/config/global';
import LogoFull from '@/assets/assets-logo-full.svg';
import Search from './Search.vue';
import MenuContent from './MenuContent.vue';
import WallpaperNotice from "@/layouts/components/WallpaperNotice.vue";
import HeaderUser from "@/layouts/components/HeaderUser.vue";

export default Vue.extend({
  name: 'WallpaperHeader',
  components: {
    HeaderUser,
    WallpaperNotice,
    MenuContent,
    LogoFull,
    Search,
    ViewListIcon,
    LogoGithubIcon,
    HelpCircleIcon,
    SettingIcon,
    ChevronDownIcon,
    WallpaperIcon,
  },
  props: {
    theme: String,
    layout: {
      type: String,
      default: 'top',
    },
    showLogo: {
      type: Boolean,
      default: true,
    },
    menu: {
      type: Array,
    },
    isFixed: {
      type: Boolean,
      default: false,
    },
    isCompact: {
      type: Boolean,
      default: false,
    },
    maxLevel: {
      type: Number,
      default: 3,
    },
    cateList: {
      type: Array,
      default: [],
    },
    searchData: {
      type: String,
      default: '',
    },
    total: {
      type: Number,
      default: 0,
    },
    dirName: {
      type: String,
      default: '',
    }
  },
  data() {
    return {
      prefix,
      visibleNotice: false,
      isSearchFocus: false,
      userName: '',
      name: "",
      dirName: '',
    };
  },
  computed: {
    showMenu() {
      return !(this.layout === 'mix' && this.showLogo === 'side');
    },
    layoutCls() {
      return [`${this.prefix}-header-layout`];
    },
    menuCls() {
      return [
        {
          [`${this.prefix}-header-menu`]: !this.isFixed,
          [`${this.prefix}-header-menu-fixed`]: this.isFixed,
          [`${this.prefix}-header-menu-fixed-side`]: this.layout === 'side' && this.isFixed,
          [`${this.prefix}-header-menu-fixed-side-compact`]: this.layout === 'side' && this.isFixed && this.isCompact,
        },
      ];
    },
  },
  mounted() {
    this.userName = localStorage.getItem('username') ?? '访客';
  },
  watch: {
    "dirName"(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.$emit("dirName", newVal);
      }
    },
    "name"(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.$emit("name", newVal);
      }
    },
  },
  methods: {
    handleChange(val) {
      this.dirName = val;
    },
    handleChangeSearchData(val) {
      this.name = val;
    },
    toggleSettingPanel() {
      this.$store.commit('setting/toggleSettingPanel', true);
    },
    changeCollapsed() {
      this.$store.commit('setting/toggleSidebarCompact');
    },
    navToGitHub() {
      window.open('https://github.com/2694484453/cloud-web');
    },
    // 帮助文档
    navToHelper() {
      window.open('https://gitbook.gpg123.vip');
    }
  },
});
</script>
<style lang="less">
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

.operations-dropdown-container-item {
  width: 100%;
  display: flex;
  align-items: center;

  .t-icon {
    margin-right: 8px;
  }

  .t-dropdown__item {
    .t-dropdown__item__content {
      display: flex;
      justify-content: center;
    }

    .t-dropdown__item__content__text {
      display: flex;
      align-items: center;
      font-size: 14px;
    }
  }

  .t-dropdown__item {
    width: 100%;
    margin-bottom: 0px;
  }

  &:last-child {
    .t-dropdown__item {
      margin-bottom: 8px;
    }
  }
}
</style>
