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
              @click="searchForm.name = item.dictValue"
              :color="colors[index]"
              :style="{ color: 'white' }"
              class="hover-pointer"
            >{{ item.dictValue }}
            </t-tag>
          </span>
        </t-space>
        <t-tag style="margin-left: 20px" size="medium" theme="default" class="hover-pointer"
               @click="searchForm.name = null">
          清空过滤
        </t-tag>
      </t-space>
      <div class="image-grid">
        <t-space v-for="item in data" :key="item.id" direction="vertical">
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
                <t-image :lazy="true"
                         :style="{ width: '100%', height: '160px', cursor: 'pointer' }"
                         :alt="item.name"
                         :src="item.url +
                         (searchForm.cateName !=='dynamic' ? '?x-oss-process=image/resize,w_300,h_160,m_fill':'?x-oss-process=video/snapshot,t_0,f_jpg')"></t-image>
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
                    <a @click="handleDetail(item)" :href="'/info?id='+item.id">查看</a>
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
    <!-- 图片预览器 & 分页 -->
    <t-image-viewer v-model:visible="overView.visible" :images="overView.imageList" :index="overView.index"/>
    <div class="pagination-wrap">
      <t-pagination
        showFirstAndLastPageBtn
        v-model="searchForm.pageNum"
        :total="pagination.total"
        :page-size="searchForm.pageSize"
        :page-size-options="['12', '24', '48']"
        @current-change="onCurrentChange"
        @page-size-change="onPageSizeChange"
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

export default Vue.extend({
  name: 'ListBase',
  components: {
    Footer,
    WallpaperHeader,
    BrowseIcon,
    DownloadIcon,
    InfoCircleIcon
  },
  data() {
    return {
      dataLoading: false,
      data: [],
      searchForm: {
        name: '',
        cateName: "二次元",
        pageNum: 1,
        pageSize: 24
      },
      pagination: {
        total: 0,
      },
      overView: {
        visible: false,
        index: 0,
        imageList: []
      },
      cateList: [],
      tagList: [],
      total: 0,
      colors: [
        '#d71818', '#FFA500', '#d4d477', '#cbeacb', '#00FFFF',
        '#0000FF', '#4B0082', '#800080', '#FF00FF', '#008000',
        '#FF0000', '#500FF2', '#92318d', '#9bb1b1', '#FFA500',
        '#1d1c1c', '#1d1c1c', "#00FFFF", '#429242', '#00FF00',
        '#FF0000', '#FF00FF', "#6ec3c3", '#17ea17', '#00FF00',
        '#FF0000', '#FF00FF', "#3e7979", '#54b754', '#00FF00'
      ]
    };
  },
  created() {
    for (let i = 0; i < this.searchForm.pageSize; i++) {
      this.data.push({
        id: i,
        name: i,
        url: i,
      })
    }
  },
  mounted() {
    this.getCate();
    this.getOverView();
    // 确保在 DOM 更新后执行
    const savedPageNum = localStorage.getItem("wallpaper.searchForm.pageNum");
    const savedPageSize = localStorage.getItem("wallpaper.searchForm.pageSize");
    // 假设你有一个方法来处理分页点击
    this.searchForm.pageNum = savedPageNum ? Number.parseInt(savedPageNum) : 1;
    this.searchForm.pageSize = savedPageSize ? Number.parseInt(savedPageSize) : 24;
    this.searchForm.cateName = localStorage.getItem('wallpaper.searchForm.cateName') ?? this.searchForm.cateName;
    this.getList();
  },
  watch: {
    "searchForm.pageNum"(newVal, oldVal) {
      if (oldVal !== newVal) {
        // 存储
        localStorage.setItem('wallpaper.searchForm.pageNum', newVal);
        // 刷新数据
        this.getList();
      }
    },
    "searchForm.pageSize"(newVal, oldVal) {
      if (oldVal !== newVal) {
        // 存储
        localStorage.setItem('wallpaper.searchForm.pageSize', newVal);
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
        this.searchForm.pageNum = 1;
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
          this.cateList = res.data.data.cate;
          this.tagList = res.data.data.tags;
        }
      }).catch((e: Error) => {
      }).finally(() => {
      })
    },
    onPageSizeChange(size: number) {
      this.searchForm.pageSize = size;
      this.searchForm.pageNum = 1;
    },
    onCurrentChange(current: number) {
      this.searchForm.pageNum = current;
    },
    handleDetail(item:any) {
      localStorage.setItem('wallpaper.detail', JSON.stringify(item));
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
</style>
