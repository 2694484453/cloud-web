<template>
  <div>
    <WallpaperHeader/>
    <t-card :bordered="false">
      <t-form
        ref="form"
        :data="formData"
        :label-width="80"
        colon
        @reset="onReset"
        @submit="onSubmit"
        :style="{ marginBottom: '10px' }"
      >
      </t-form>
      <div>
        <t-space direction="vertical">
          <t-space :breakLine="true" :style="{ height: '720px', 'overflow-y': 'scroll' }" >
            <t-image-viewer v-model="overView.visible" :images="[overView.images]">
              <template #trigger="{open}">
                <div @click="open">
                  <t-space v-for="item in data" :key="item.id" direction="vertical">
                    <t-image
                      :key="item"
                      :src="item.url+'?x-oss-process=image/resize,w_800'"
                      :style="{ width: '280px', height: '130px' ,marginLeft: '10px',marginRight:'10px'}"
                      :lazy="true"
                      :alt="item.name"
                      @click="clickOverView(item)"
                    />
                    <div style="margin-left: 10px">
                      <a :href="item.url" target="_blank">{{ item.name }}</a>
                    </div>
                  </t-space>
                </div>
              </template>
            </t-image-viewer>
          </t-space>
        </t-space>
      </div>
      <t-pagination style="margin-top: 15px"
                    v-model="searchForm.pageNum"
                    :total="pagination.total"
                    :page-size.sync="searchForm.pageSize"
                    @current-change="onCurrentChange"
                    @page-size-change="onPageSizeChange"
                    @change="onChange"
      />
    </t-card>
    <Footer/>
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
      // 响应数据
      data: [],
      selectedRowKeys: [1, 2],
      value: 'first',
      rowKey: 'index',
      tableLayout: 'auto',
      verticalAlign: 'top',
      hover: true,
      rowClassName: (rowKey: string) => `${rowKey}-class`,
      // 分页数据
      pagination: {
        defaultPageSize: 20,
        total: 0,
        defaultCurrent: 1,
      },
      // 查询表单数据
      searchForm: {
        name: "",
        pageNum: 1,
        pageSize: 24
      },
      // 提交表单数据
      formData: {
        id: "",
        name: "",
        url: "",
      },
      // 抽屉
      drawer: {
        header: "",
        visible: false,
        type: "",
        operation: "add",
        row: {}
      },
      // 对话框
      confirm: {
        header: "",
        body: "",
        operation: "update",
        visible: false
      },
      //
      form: {
        id: "",
        repoName: "",
        repoUrl: "",
        repoUpdateTime: ""
      },
      overView: {
        visible: false,
        selectedKey: "",
        images: []
      }
    };
  },
  computed: {
  },
  mounted() {
  },
  created() {
    this.page();
  },
  watch: {
    "searchForm.name"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page()
      }
    },
    "searchForm.pageSize"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page()
      }
    },
    "searchForm.pageNum"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page()
      }
    }
  },
  methods: {
    getContainer() {
      return document.querySelector('.tdesign-starter-layout');
    },
    onPageSizeChange(size, pageInfo) {
      console.log('Page Size:', this.pageSize, size, pageInfo);
      // 刷新
      this.searchForm.pageSize = size
    },
    onCurrentChange(current, pageInfo) {
      console.log('Current Page', this.current, current, pageInfo);
      // 刷新
      this.searchForm.pageNum = current
      this.getList()
    },
    onChange(pageInfo) {
      console.log('Page Info: ', pageInfo);
    },
    // 更新
    handleClickUpdate(row) {
      this.confirm.visible = true;
      this.confirm.header = "确定要更新吗？";
      this.confirm.body = `可能需要几十秒到几分钟时间`;
      this.drawer.operation = 'update'
      this.formData = row;
    },
    // 点击详情
    handleClickDetail(row) {
      this.drawer.visible = true;
      this.drawer.header = "详情";
      this.drawer.operation = 'info';
      this.formData = row;
    },
    // 点击编辑
    handleClickEdit(row) {
      this.drawer.visible = true;
      this.drawer.header = "编辑";
      this.drawer.operation = 'edit';
      this.formData = row;
    },
    // 添加仓库
    handleSetupContract() {
      this.formData = {};
      this.drawer.visible = true;
      this.drawer.header = "新增";
      this.drawer.operation = 'add';
    },
    onCancel() {
      this.resetIdx();
    },
    handleSizeDrag({size}) {
      console.log('size drag size: ', size);
    },
    resetIdx() {
      this.deleteIdx = -1;
    },
    onReset(data) {
      console.log(data);
      this.getList();
    },
    onSubmit() {
      this.page();
    },
    clickOverView(item) {
      this.formData = item;
      this.overView.visible = true;
      this.overView.selectedKey = item.id;
      this.overView.images = item.url;
    },
    // 提交执行创建
    handleSubmit() {
      switch (this.drawer.operation) {
        // 添加
        case "add":
          this.$request.post("/helmRepo/add", this.form).then(res => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg);
              this.drawer.visible = false;
              this.getList();
            } else {
              this.$message.error(res.data.msg);
            }
          })
          break;
        // 编辑
        case "edit":
          break;
        // 更新
        case "update":
          this.$request.put("/helmRepo/update?repoName=" + this.form.repoName).then(res => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg);
              this.confirm.visible = false;
              this.getList();
            } else {
              this.$message.error(res.data.msg);
            }
          })
          break;
        // 删除
        case "delete":
          this.$request.delete("helmRepo/delete?repoName=" + this.form.repoName).then(res => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg)
              this.confirm.visible = false;
              this.getList();
            } else {
              this.$message.error(res.data.msg);
            }
          })
          break;
        // 查询
        case "search":
          this.getList(this.formData);
          break;
        case "default":
          break;
      }
    },
    // 分页查询
    page() {
      this.dataLoading = true;
      this.$request.get('/wallpaper/page', {
        params: this.searchForm
      }).then((res) => {
        if (res.data.code === 200) {
          console.log(res.data)
          this.data = res.data.rows;
          this.pagination.total = res.data.total;
        }
      }).catch((e: Error) => {
        console.log(e);
      }).finally(() => {
        this.dataLoading = false;
      });
    }
  },
});
</script>

<style lang="less" scoped>

</style>
