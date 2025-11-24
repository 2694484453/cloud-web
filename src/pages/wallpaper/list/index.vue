<template>
  <div>
    <t-card class="list-card-container" :bordered="false">
      <t-form
        ref="form"
        :data="formData"
        :label-width="80"
        colon
        @reset="onReset"
        @submit="onSubmit"
        :style="{ marginBottom: '8px' }"
      >
        <t-row justify="space-between">
          <t-input v-model="searchForm.name" class="search-input" placeholder="请输入你需要搜索的内容" clearable>
            <template #suffix-icon>
              <search-icon size="20px"/>
            </template>
          </t-input>
          <t-col :span="2" class="operation-container">
            <t-button theme="primary" type="submit" :style="{ marginLeft: '8px' }"> 查询</t-button>
            <t-button type="reset" variant="base" theme="default"> 重置</t-button>
          </t-col>
        </t-row>
      </t-form>
      <div class="table-container">
        <t-space direction="vertical">
          <t-space :breakLine="true" :style="{ height: '700px', 'overflow-y': 'scroll' }" >
            <t-image-viewer v-model="overView.visible" draggable mode="modeless" :images="[formData.url]">
              <template #trigger="{open}">
                <div @click="open">
                  <t-space v-for="item in data" :key="item.id">
                    <t-image
                      :key="item"
                      :src="item.url"
                      :style="{ width: '280px', height: '140px' }"
                      :lazy="true"
                      :alt="item.name"
                      @click="clickOverView(item)"
                    />
                    <div class="tdesign-demo-image-viewer__ui-image--hover">
                      <a :href="item.url" target="_blank">{{ item.name }}</a>
                    </div>
                  </t-space>
                </div>
              </template>
            </t-image-viewer>
          </t-space>
        </t-space>
      </div>
    </t-card>
    <t-pagination style="margin-top: 15px"
                  v-model="searchForm.pageNum"
                  :total="pagination.total"
                  :page-size.sync="searchForm.pageSize"
                  @current-change="onCurrentChange"
                  @page-size-change="onPageSizeChange"
                  @change="onChange"
    />
    <t-dialog
      :header="confirm.header"
      :body="confirm.body"
      :visible.sync="confirm.visible"
      @confirm="handleSubmit"
      :onCancel="onCancel">
    </t-dialog>
    <!--抽屉-->
    <t-drawer
      :visible.sync="drawer.visible"
      :header="drawer.header"
      :on-overlay-click="() => (drawer.visible = false)"
      :on-size-drag-end="handleSizeDrag"
      showOverlay
      :sizeDraggable="true"
      placement="right"
      destroyOnClose
      size="30%"
      @close="drawer.visible = false"
      :onConfirm="handleSubmit"
      @cancel="drawer.visible = false"
    >
      <t-space v-show="drawer.operation === 'add'|| drawer.operation ==='edit'" direction="vertical"
               style="width: 100%">
        <t-form
          ref="formValidatorStatus"
          :data="form"
          :label-width="100"
          @reset="onReset"
        >
          <t-form-item label="id" name="id" v-show="false">
            <t-input v-model="form.id" :maxlength="32" with="120"></t-input>
          </t-form-item>
          <t-form-item label="仓库名称" name="repoName">
            <t-input v-model="form.repoName" placeholder="请输入仓库名称" :maxlength="64" with="120"></t-input>
          </t-form-item>
          <t-form-item label="仓库地址" name="repoUrl">
            <t-input v-model="form.repoUrl" placeholder="请输入仓库地址" :maxlength="64" with="120"></t-input>
          </t-form-item>
        </t-form>
      </t-space>
      <t-space v-show="drawer.operation === 'info'" direction="vertical" style="width: 100%">
        <t-descriptions bordered :layout="'vertical'" :item-layout="'horizontal'" :column="3">
          <t-descriptions-item label="仓库名称">{{ form.repoName }}</t-descriptions-item>
          <t-descriptions-item label="仓库主页"><a :href="form.repoUrl">{{ form.repoUrl }}</a></t-descriptions-item>
          <t-descriptions-item label="制品地址"><a
            :href="form.repoUrl+'/index.yaml'">{{ form.repoUrl + "/index.yaml" }}</a></t-descriptions-item>
          <t-descriptions-item label="更新时间">{{ form.repoUpdateTime }}</t-descriptions-item>
        </t-descriptions>
      </t-space>
    </t-drawer>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import {SearchIcon, BrowseIcon} from 'tdesign-icons-vue';
import Trend from '@/components/trend/index.vue';
import {prefix} from '@/config/global';

import {CONTRACT_STATUS, CONTRACT_STATUS_OPTIONS, CONTRACT_TYPES, CONTRACT_PAYMENT_TYPES} from '@/constants';

export default Vue.extend({
  name: 'ListBase',
  components: {
    SearchIcon,
    Trend,
    BrowseIcon,
  },
  data() {
    return {
      CONTRACT_STATUS,
      CONTRACT_STATUS_OPTIONS,
      CONTRACT_TYPES,
      CONTRACT_PAYMENT_TYPES,
      prefix,
      dataLoading: false,
      // 响应数据
      data: [],
      selectedRowKeys: [1, 2],
      value: 'first',
      columns: [
        {
          title: '名称',
          align: 'left',
          width: 120,
          ellipsis: true,
          colKey: 'name',
          fixed: 'left',
        },
        {
          title: '制品数量',
          width: 80,
          ellipsis: true,
          fixed: 'left',
          colKey: 'artifactTotal',
        },
        {
          title: '版本数量',
          width: 80,
          ellipsis: true,
          fixed: 'left',
          colKey: 'artifactVersionTotal',
        },
        {
          title: '状态',
          width: 80,
          ellipsis: true,
          fixed: 'left',
          colKey: 'status',
        },
        {
          title: '仓库地址',
          width: 200,
          ellipsis: true,
          colKey: "repoUrl"
        },
        {
          title: '更新时间',
          width: 160,
          ellipsis: true,
          fixed: 'left',
          colKey: 'repoUpdateTime',
        },
        {
          align: 'left',
          fixed: 'right',
          width: 160,
          colKey: 'op',
          title: '操作',
        },
      ],
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
      searchValue: '',
      confirmVisible: false,
      deleteIdx: -1,
      deleteType: -1,
      // 查询表单数据
      searchForm: {
        name: "",
        pageNum: 1,
        pageSize: 20
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
      typeList: [],
      overView: {
        visible: false,
        selectedKey: "",
      }
    };
  },
  computed: {
    confirmBody() {
      if (this.deleteIdx > -1) {
        const {name} = this.data?.[this.deleteIdx];
        return `删除后，${name}的所有信息将被清空，且无法恢复`;
      }
      return '';
    },
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
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
    // 删除
    handleClickDelete(row) {
      this.formData = row;
      this.confirm.visible = true;
      this.confirm.header = "确定要删除吗？";
      this.confirm.body = "一旦删除成功后，无法恢复！";
      this.drawer.operation = 'delete';
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
    // 导出
    handleExport() {
      this.$request.post('/helmRepo/export', {
        serverName: 'hcs.gpg123.vip',
      }, {responseType: 'blob'}).then(res => {
        const blob = new Blob([res.data]);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'repositories.yaml';
        link.click();
        URL.revokeObjectURL(link.href); // 释放内存
      })
    },
    // getTypeList() {
    //   this.$request.get("/imageRepo/typeList").then(res => {
    //     this.typeList = res.data.data
    //   }).catch((err) => {
    //
    //   })
    // },
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
@import '@/style/variables';

.payment-col {
  display: flex;

  .trend-container {
    display: flex;
    align-items: center;
    margin-left: 8px;
  }
}

.left-operation-container {
  padding: 0 0 6px 0;
  margin-bottom: 16px;

  .selected-count {
    display: inline-block;
    margin-left: var(--td-comp-margin-s);
    color: var(--td-text-color-secondary);
  }
}

.search-input {
  width: 360px;
}

.t-button + .t-button {
  margin-left: var(--td-comp-margin-s);
}

.tdesign-demo-image-viewer__ui-image {
  width: 160px;
  height: 160px;
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
  left: 10px;
  right: 10px;
  top: 10px;
  bottom: 10px;
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
  //cursor: pointer;
  //position: absolute;
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
