<template>
  <div class="wallpaper-grid-container">
    <!-- 加载状态 -->
    <t-loading v-if="loading" size="large" />

    <!-- 错误提示 -->
    <t-alert v-else-if="error" theme="danger" :message="error" style="margin-bottom: 16px;" />

    <!-- 空数据 -->
    <t-empty v-else-if="!wallpapers || wallpapers.length === 0" description="暂无壁纸" />

    <!-- 壁纸网格 -->
    <div v-else class="wallpaper-grid">
      <div
        v-for="item in wallpapers"
        :key="item.id || item.url"
        class="wallpaper-item"
        @click="handlePreview(item)"
      >
        <img
          :src="item.url"
          :alt="item.name || 'Wallpaper'"
          class="wallpaper-img"
          loading="lazy"
          @error="handleImageError(item)"
        />
        <div v-if="item.name" class="wallpaper-title">{{ item.name }}</div>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <t-dialog
      v-model:visible="previewVisible"
      width="80%"
      height="80%"
      :footer="false"
      @close="previewVisible = false"
    >
      <div class="preview-content">
        <img
          v-if="previewImage"
          :src="previewImage"
          :alt="previewName"
          class="preview-img"
        />
      </div>
    </t-dialog>
  </div>
</template>

<script>
export default {
  name: 'WallpaperGrid',
  props: {
    // 可选：传入数据（如果父组件已请求）
    data: {
      type: Array,
      default: () => []
    },
    // 可选：是否由本组件发起请求（需提供 api 函数）
    fetchApi: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      error: '',
      wallpapers: [],
      previewVisible: false,
      previewImage: '',
      previewName: ''
    };
  },
  watch: {
    // 如果父组件传入 data，直接使用
    data: {
      handler(newVal) {
        this.wallpapers = newVal || [];
      },
      immediate: true
    }
  },
  async created() {
    // 如果提供了 fetchApi，则自动加载
    if (this.fetchApi && this.data.length === 0) {
      await this.loadData();
    }
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.error = '';
      try {
        const res = await this.fetchApi();
        // 假设结构: res.data.rows = [{ id, url, name }, ...]
        this.wallpapers = res?.data?.rows || [];
      } catch (err) {
        this.error = '加载壁纸失败，请稍后重试';
        console.error('Wallpaper load error:', err);
      } finally {
        this.loading = false;
      }
    },
    handlePreview(item) {
      this.previewImage = item.url;
      this.previewName = item.name || '';
      this.previewVisible = true;
    },
    handleImageError(item) {
      this.$message.warning(`壁纸加载失败: ${item.name || item.url}`);
      // 可选：替换为占位图
      // item.url = '/placeholder-wallpaper.jpg';
    }
  }
};
</script>

<style scoped>
.wallpaper-grid-container {
  width: 100%;
}

.wallpaper-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
}

.wallpaper-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: #f5f5f5;
}

.wallpaper-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.wallpaper-img {
  width: 100%;
  height: auto;
  display: block;
  aspect-ratio: 16 / 9; /* 推荐比例，可按需调整 */
  object-fit: cover;
}

.wallpaper-title {
  padding: 8px;
  font-size: 12px;
  color: #333;
  text-align: center;
  background: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
