<template>
  <div class="wallpaper-list-container">
    <!-- 页头 -->
    <WallpaperHeader @type="changeType" />
    <!-- 使用一个包裹 div 来控制整体布局 -->
    <div class="list-content">
      <t-card :bordered="false" class="list-card">
        <!-- 图片列表网格 -->
        <div class="image-grid">
          <t-space
            v-for="item in data"
            :key="item.id"
            direction="vertical"
            class="image-item"
            @click="clickOverView(item)"
          >
            <t-image
              :src="item.url + '?x-oss-process=image/resize,w_300,h_160,m_fill'"
              :style="{ width: '100%', height: '160px', cursor: 'pointer' }"
              :lazy="true"
              :alt="item.name"
              fit="cover"
            />
            <div class="image-name">{{ item.name }}</div>
          </t-space>
        </div>
        <t-space :style="{ width: '100%', height: '160px'}" v-show="data.length === 0">
          <t-empty />
        </t-space>
        <!-- 分页组件 -->
        <div class="pagination-wrap">
          <t-pagination
            v-model="searchForm.pageNum"
            :total="pagination.total"
            :page-size="searchForm.pageSize"
            :page-size-options="['12', '24', '48']"
            @current-change="onCurrentChange"
            @page-size-change="onPageSizeChange"
          />
        </div>
      </t-card>
    </div>
    <!-- 页脚 -->
    <Footer />
    <!-- 图片预览器 -->
    <t-image-viewer
      v-model:visible="overView.visible"
      :images="overView.imageList"
      :index="overView.index"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import WallpaperHeader from "@/layouts/components/WallpaperHeader.vue";
import Footer from "@/layouts/components/Footer.vue";

export default Vue.extend({
  name: 'ListBase',
  components: {
    Footer,
    WallpaperHeader,
  },
  data() {
    return {
      dataLoading: false,
      data: [],
      searchForm: {
        name: "",
        type: "",
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
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    changeType(val) {
      this.searchForm.type = val;
      this.searchForm.pageNum = 1;
      this.getList();
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
    onPageSizeChange(size: number) {
      this.searchForm.pageSize = size;
      this.searchForm.pageNum = 1;
      this.getList();
    },
    onCurrentChange(current: number) {
      this.searchForm.pageNum = current;
      this.getList();
    },
    clickOverView(item) {
      const index = this.data.findIndex(v => v.id === item.id);
      this.overView.imageList = this.data.map(v => v.url);
      this.overView.index = index;
      this.overView.visible = true;
    }
  },
});
</script>

<style lang="less" scoped>
/* 全局样式重置，确保没有默认边距影响布局 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.wallpaper-list-container {
  /* 使用 Flex 布局垂直排列子元素 */
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20px; /* 统一的内边距 */
  box-sizing: border-box;
}

/* 内容区域，使用 flex: 1 来占据剩余空间 */
.list-content {
  flex: 1;
  overflow: hidden; /* 关键：隐藏内容区域的溢出，防止出现滚动条 */
}

.list-card {
  height: 100%; /* 卡片高度占满父容器 */
  display: flex;
  flex-direction: column; /* 卡片内部也是垂直布局 */
  overflow: hidden; /* 确保卡片内部不产生滚动 */
}

.image-grid {
  /* 图片网格使用 flex: 1 来撑开，或者使用 grid 自动换行 */
  flex: 1 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 10px 0;
  overflow-y: auto; /* 如果图片很多，让网格区域内部滚动（可选） */
}

.image-item {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.image-name {
  padding: 8px 12px;
  font-size: 14px;
  color: #333;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination-wrap {
  margin-top: 15px;
  text-align: left;
  flex-shrink: 0; /* 分页组件不缩小 */
}

@media (max-width: 768px) {
  .wallpaper-list-container {
    padding: 10px;
  }

  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }

  .image-name {
    font-size: 12px;
    padding: 4px 8px;
  }
}
</style>
