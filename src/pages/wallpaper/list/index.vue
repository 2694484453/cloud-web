<template>
  <div class="wallpaper-list-container">
    <!-- 页头 -->
    <WallpaperHeader class="header-fixed" @cateName="changeCate" @name="changeSearchData" :cateList="cateList"
                     :total="total"/>
    <!-- 内容区域 -->
    <div class="list-content">
      <t-space direction="horizontal">
        <t-space direction="horizontal">
            <span v-for="(item, index) in tagList" :key="index">
            <t-tag
              @click="searchForm.name = item.keywordName"
              :color="item.keywordColor"
              :style="{ color: 'white' }"
              class="hover-pointer"
            >{{ item.keywordName }}
            </t-tag>
          </span>
        </t-space>
      </t-space>
      <div class="image-grid">
        <t-space v-for="(item,index) in data" direction="vertical">
          <t-skeleton :loading="dataLoading" :animation="'gradient'" :theme="'tab'">
            <t-card
              :bordered="true"
              hover-shadow
              class="list-card"
              header-bordered
            >
              <template #title>
                <div class="card-header">
                  {{ item.name }}
                </div>
              </template>
              <template #cover>
                <t-image-viewer
                  :key="item.url"
                  :images="imageList"
                  :index="index"
                  :default-index="index">
                  <template #trigger="{ open }">
                    <div @click="open(index)">
                      <t-image
                        class="hover-pointer"
                        :style="{ width: '284px', height: '160px' }"
                        :src="item.url +
                             (searchForm.cateName !=='dynamic' ? '?x-oss-process=image/resize,w_300,h_160,m_fill':'?x-oss-process=video/snapshot,t_0,f_jpg')"/>
                    </div>
                  </template>
                </t-image-viewer>
              </template>
              <!-- 优化：将统计信息放在左侧 -->
              <template #footer>
                <div class="card-footer">
                  <t-tooltip content="浏览次数">
                    <browse-icon/>
                    <span>{{ item.viewCount }}次</span>
                  </t-tooltip>
                  <t-tooltip content="下载次数" style="margin-left: 16px;">
                    <download-icon/>
                    <span>{{ item.downloadCount }}次</span>
                  </t-tooltip>
                  <t-tooltip content="查看" style="margin-left: 16px;">
                    <info-circle-icon/>
                    <a @click="handleDetail(item)">详情</a>
                  </t-tooltip>
                  <t-tooltip content="下载" style="margin-left: 16px;">
                    <download-icon/>
                    <a @click="handleDownload(item)">下载</a>
                  </t-tooltip>
                </div>
              </template>
            </t-card>
          </t-skeleton>
        </t-space>
      </div>
      <t-space :style="{ width: '100%', height: '160px'}" v-show="data.length === 0">
        <t-empty v-show="dataLoading==false && data.length ==0"/>
      </t-space>
    </div>
    <div class="pagination-wrap">
      <t-pagination
        showFirstAndLastPageBtn
        v-model="searchForm.current"
        :total="pagination.total"
        :page-size="searchForm.size"
        :page-size-options="['12', '24', '48']"
        @current-change="onCurrentChange"
        @page-size-change="onsizeChange"
      />
    </div>
    <!-- 页脚 -->
    <Footer style="margin-top: 10px"/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import WallpaperHeader from "@/layouts/components/WallpaperHeader.vue";
import Footer from "@/layouts/components/Footer.vue";
import {BrowseIcon, DownloadIcon, InfoCircleIcon} from 'tdesign-icons-vue';
import {download} from "@/utils/download";

export default Vue.extend({
  name: 'ListBase',
  components: {
    Footer,
    WallpaperHeader,
    BrowseIcon,
    DownloadIcon,
    InfoCircleIcon
  },
  data: function () {
    return {
      dataLoading: false,
      data: [],
      searchForm: {
        name: '',
        cateName: "二次元",
        current: 1,
        size: 24,
        orders: []
      },
      pagination: {
        total: 0,
      },
      imagePreview: {
        visible: false,
        index: 0,
        url: ""
      },
      imageList: [],
      cateList: [],
      tagList: [],
      total: 0
    };
  },
  created() {
    for (let i = 0; i < this.searchForm.size; i++) {
      this.data.push({
        id: i,
        name: i,
        url: i,
      })
    }
  },
  mounted() {
    this.getCate();
    this.getTags();
    this.getOverView();
    // 确保在 DOM 更新后执行
    const savedCurrent = localStorage.getItem("wallpaper.searchForm.current");
    const savedSize = localStorage.getItem("wallpaper.searchForm.size");
    // 假设你有一个方法来处理分页点击
    this.searchForm.current = savedCurrent ? Number.parseInt(savedCurrent) : 1;
    this.searchForm.size = savedSize ? Number.parseInt(savedSize) : 24;
    this.searchForm.cateName = localStorage.getItem('wallpaper.searchForm.cateName') ?? this.searchForm.cateName;
    this.getList();
  },
  watch: {
    "searchForm.current"(newVal, oldVal) {
      if (oldVal !== newVal) {
        // 存储
        localStorage.setItem('wallpaper.searchForm.current', newVal);
        // 刷新数据
        this.getList();
      }
    },
    "searchForm.size"(newVal, oldVal) {
      if (oldVal !== newVal) {
        // 存储
        localStorage.setItem('wallpaper.searchForm.size', newVal);
        // 刷新数据
        this.getList();
      }
    },
    "searchForm.name"(newVal, oldVal) {
      if (oldVal !== newVal) {
        // 刷新数据
        localStorage.setItem('wallpaper.searchForm.name', newVal);
        this.getList();
      }
    },
    "searchForm.cateName"(newVal, oldVal) {
      if (oldVal !== newVal) {
        // 存储
        localStorage.setItem('wallpaper.searchForm.cateName', newVal);
        // 变更分类，num设置为1
        this.searchForm.current = 1;
        this.searchForm.name = null;
        // 刷新数据
        this.getList();
      }
    }
  },
  methods: {
    changeCate(val: string) {
      this.searchForm.cateName = val;
    },
    changeSearchData(val: string) {
      this.searchForm.name = val;
    },
    getOverView() {
      this.$request.get("/wallpaper/overView", {}).then(res => {
        if (res.data.code === 200) {
          this.total = res.data.data.total;
        }
      }).catch(err => {
      }).finally(() => {
      })
    },
    getList() {
      this.dataLoading = true;
      this.$request.get('/wallpaper/page', {
        params: this.searchForm
      }).then((res) => {
        if (res.data.code === 200) {
          this.data = res.data.rows;
          res.data.rows.forEach(row => {
            this.imageList.push(row.url)
          })
          this.pagination.total = res.data.total;
        }
      }).catch((e: Error) => {
        console.error(e);
      }).finally(() => {
        this.dataLoading = false;
      });
    },
    getCate() {
      this.$request.get('/wallpaper/category', {}).then((res) => {
        if (res.data.code === 200) {
          this.cateList = res.data.data;
        }
      }).catch((e: Error) => {
      }).finally(() => {
      })
    },
    getTags() {
      this.$request.get('/wallpaper/tags', {
        params: {
          size: 18
        }
      }).then((res) => {
        if (res.data.code === 200) {
          this.tagList = res.data.data;
        }
      }).catch((e: Error) => {
      }).finally(() => {
      })
    },
    onsizeChange(size: number) {
      this.searchForm.size = size;
      this.searchForm.current = 1;
    },
    onCurrentChange(current: number) {
      this.searchForm.current = current;
    },
    handleDetail(item: any) {
      localStorage.setItem('wallpaper.detail', JSON.stringify(item));
      const url = "/info?id=" + item.id + (this.searchForm.cateName === 'dynamic' ? "&cateName=dynamic" : "");
      // 作为统计使用
      this.$router.push(url);
    },
    handleDownload(item: any) {
      // 执行下载
      download(item.url, item.name);
      const url = "/download?id=" + item.id + (this.searchForm.cateName === 'dynamic' ? "&cateName=dynamic" : "");
      // 作为统计使用
      this.$router.push(url);
    },
    onOpen(item: any, index: number) {
      this.imagePreview.visible = true;
      this.imagePreview.index = index;
      this.imagePreview.url = item.url;
      console.log(this.imagePreview);
    },
    onClose(index: number) {
      this.visible = this.visible.map((item, i) => {
        if (i === index) return false;
        return item;
      });
    },
    renderMask() {

    }
  },
});
</script>

<style lang="less" scoped>
.header-fixed {
  position: fixed; /* 关键：固定定位 */
  top: 0;
  left: 0;
  right: 0;
  z-index: 999; /* 确保在最上层 */
  height: 44px; /* 导航栏高度 */
  line-height: 44px;
  background-color: #008489; /* 主题色 */
  color: #fff;
  text-align: center;
  font-size: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* 添加一点阴影 */
}

.wallpaper-list-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 15px;
  box-sizing: border-box;
}

.list-content {
  margin-top: 50px; /* 留出Header空间 */
  flex: 1;
  overflow: hidden;
}

.image-grid {
  flex: 1 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
  padding: 10px 0;
}

/* 1. 优化卡片样式 */
.list-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 卡片顶部的标题栏
.card-header {
  width: 100%;
  color: #1d1c1c;
  font-size: 12px;
  text-align: left;
  // 关键CSS：实现文字过长自动省略
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.t-card__cover {
  border-radius: 12px !important;
  overflow: hidden;
}

.t-card__cover img {
  border-radius: 12px !important;
  transition: transform 0.3s;
}

.t-card:hover img {
  transform: scale(1.05);
}

/* 5. 自定义Footer布局，将图标放在左侧 */
.card-footer {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 12px;
}

.card-footer .t-icon {
  margin-right: 4px;
  font-size: 16px;
  color: #9ea6a6; /* 图标主题色 */
}

/* 分页等其他样式保持不变 */
.pagination-wrap {
  margin-top: 10px;
  text-align: left;
}

/* 关键：添加悬停样式 */
.hover-pointer:hover {
  cursor: pointer !important; /* 确保覆盖其他样式 */
}

.tdesign-demo-image-viewer__ui-image {
  width: 100%;
  height: 100%;
  display: inline-flex;
  position: relative;
  justify-content: center;
  align-items: center;
  border-radius: var(--td-radius-small);
  overflow: hidden;
}

.tdesign-demo-image-viewer__ui-image--hover {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: var(--td-text-color-anti);
  line-height: 22px;
  transition: 0.2s;
}

.tdesign-demo-image-viewer__ui-image:hover .tdesign-demo-image-viewer__ui-image--hover {
  opacity: 1;
  cursor: pointer;
}

.tdesign-demo-image-viewer__ui-image--img {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  cursor: pointer;
  position: absolute;
}

.tdesign-demo-image-viewer__ui-image--footer {
  padding: 0 16px;
  height: 56px;
  width: 100%;
  line-height: 56px;
  font-size: 16px;
  position: absolute;
  bottom: 0;
  color: var(--td-text-color-anti);
  background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%);
  display: flex;
  box-sizing: border-box;
}

.tdesign-demo-image-viewer__ui-image--title {
  flex: 1;
}

.tdesign-demo-popup__reference {
  margin-left: 16px;
}

.tdesign-demo-image-viewer__ui-image--icons .tdesign-demo-icon {
  cursor: pointer;
}

.tdesign-demo-image-viewer__base {
  width: 160px;
  height: 160px;
  margin: 10px;
  border: 4px solid var(--td-bg-color-secondarycontainer);
  border-radius: var(--td-radius-medium);
}
</style>
