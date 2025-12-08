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
          <div class="left-operation-container">
            <t-button @click="handleSetupContract">添加</t-button>
            <t-button @click="handleExporter">导出</t-button>
            <p v-if="!!selectedRowKeys.length" class="selected-count">已选{{ selectedRowKeys.length }}项</p>
          </div>
          <t-input v-model="searchValue" class="search-input" placeholder="请输入你需要搜索的内容" clearable>
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
        <t-table
          :columns="columns"
          :data="data"
          :rowKey="rowKey"
          :verticalAlign="verticalAlign"
          :hover="hover"
          :selected-row-keys="selectedRowKeys"
          :loading="dataLoading"
          :headerAffixedTop="true"
          :headerAffixProps="{ offsetTop: offsetTop, container: getContainer }"
        >
          <template #status="{row}">
            <span v-if="row.status === 'ok'">
              <t-tag theme="success" variant="light">正常</t-tag>
            </span>
            <span v-if="row.status === 'fail'">
              <t-tag theme="danger" variant="light">异常</t-tag>
            </span>
            <span v-if="row.status === null">
              <t-tag theme="danger" variant="light">未知</t-tag>
            </span>
          </template>
          <template #op="slotProps">
            <a class="t-button-link" @click="handleClickDetail(slotProps.row)">详情</a>
            <a class="t-button-link" @click="handleClickDelete(slotProps.row)">删除</a>
          </template>
        </t-table>
      </div>
    </t-card>
    <t-pagination
      style="margin-top: 15px"
      v-model="searchForm.pageNum"
      :total="pagination.total"
      :page-size.sync="searchForm.pageSize"
      @current-change="onCurrentChange"
      @page-size-change="onPageSizeChange"
      @change="onChange"/>
    <t-dialog
      :header="confirm.header"
      :body="confirm.body"
      :visible.sync="confirm.visible"
      @confirm="onConfirmOk"
      :onCancel="onCancel"
    >
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
      size="35%"
      @close="onCancelDrawer"
      :onConfirm="handleDrawerOk"
      @cancel="onCancelDrawer"
    >
      <t-space v-show="drawer.operation === 'add'|| drawer.operation ==='edit'" direction="vertical"
               style="width: 100%">
        <t-form
          ref="formValidatorStatus"
          :data="formData"
          :label-width="100"
          @reset="onReset"
        >
          <t-form-item label="名称" name="name">
            <t-input v-model="formData.name" class="search-input" placeholder="" clearable></t-input>
          </t-form-item>
          <t-form-item label="配置" name="type">
            <t-textarea v-model="formData.config"></t-textarea>
          </t-form-item>
          <t-form-item label="描述" name="name">
            <t-textarea v-model="formData.description" placeholder="" clearable maxlength="200"></t-textarea>
          </t-form-item>
        </t-form>
      </t-space>
      <t-space v-show="drawer.operation === 'detail'" direction="vertical" style="width: 100%">
        <t-descriptions bordered :layout="'vertical'" :item-layout="'horizontal'" :column="2">
          <t-descriptions-item label="名称">{{ formData.name }}</t-descriptions-item>
          <t-descriptions-item label="类型">{{ formData.type }}</t-descriptions-item>
          <t-descriptions-item label="状态">{{ formData.status }}</t-descriptions-item>
          <t-descriptions-item label="创建者">{{ formData.createByUserName }}</t-descriptions-item>
          <t-descriptions-item label="创建时间">{{ formData.createTime }}</t-descriptions-item>
          <t-descriptions-item label="更新时间">{{ formData.updateTime }}</t-descriptions-item>
          <t-descriptions-item label="更新者">{{ formData.updateByUserName }}</t-descriptions-item>
          <t-descriptions-item label="备注">{{ formData.description }}</t-descriptions-item>
        </t-descriptions>
      </t-space>
    </t-drawer>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import {SearchIcon} from 'tdesign-icons-vue';
import Trend from '@/components/trend/index.vue';
import {prefix} from '@/config/global';

import {CONTRACT_STATUS, CONTRACT_STATUS_OPTIONS, CONTRACT_TYPES, CONTRACT_PAYMENT_TYPES} from '@/constants';
import {downloadFile} from "tdesign-vue/es/image-viewer/utils";

export default Vue.extend({
  name: 'ListBase',
  components: {
    SearchIcon,
    Trend,
  },
  data() {
    return {
      CONTRACT_STATUS,
      CONTRACT_STATUS_OPTIONS,
      CONTRACT_TYPES,
      CONTRACT_PAYMENT_TYPES,
      prefix,
      dataLoading: false,
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
          title: '状态',
          width: 80,
          ellipsis: true,
          fixed: 'left',
          colKey: 'status',
        },
        {
          title: '域名',
          align: 'left',
          width: 120,
          ellipsis: true,
          colKey: 'domain',
          fixed: 'left',
        },
        {
          title: '描述',
          width: 150,
          ellipsis: true,
          fixed: 'left',
          colKey: 'description',
        },
        {
          title: '创建时间',
          width: 150,
          ellipsis: true,
          colKey: "createTime"
        },
        {
          title: '更新时间',
          width: 150,
          ellipsis: true,
          colKey: "updateTime"
        },
        {
          align: 'left',
          fixed: 'right',
          width: 120,
          colKey: 'op',
          title: '操作',
        },
      ],
      rowKey: 'index',
      tableLayout: 'auto',
      verticalAlign: 'top',
      hover: true,
      rowClassName: (rowKey: string) => `${rowKey}-class`,
      // 与pagination对齐
      pagination: {
        defaultPageSize: 10,
        total: 0,
        defaultCurrent: 1,
      },
      searchValue: '',
      confirmVisible: false,
      deleteIdx: -1,
      deleteType: -1,
      formData: {
        name: "",
        type: "",
        status: "",
        description: "",
        config: "",
        createTime: '',
        createByUserName: '',
        updateTime: '',
        updateByUserName: '',
      },
      // 搜索框
      searchForm: {
        name: "",
        type: "",
        pageNum: 1,
        pageSize: 10
      },
      // 对话框
      confirm: {
        header: "",
        body: "",
        operation: "update",
        visible: false
      },
      // 抽屉
      drawer: {
        header: "",
        visible: false,
        type: "",
        operation: "add",
        row: {},
        dynamicForm: {}
      },
      typeList: [],
      namespaceList: []
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
  methods: {
    getNamespaceList() {
      this.$request.get("/imageRepo/namespaceList").then(res => {
        this.namespaceList = res.data.data;
      })
    },
    getContainer() {
      return document.querySelector('.tdesign-starter-layout');
    },
    onPageSizeChange(size, pageInfo) {
      console.log('Page Size:', this.pageSize, size, pageInfo);
      // 刷新
      this.formData.pageSize = size
      this.getList()
    },
    onCurrentChange(current, pageInfo) {
      console.log('Current Page', this.current, current, pageInfo);
      // 刷新
      this.formData.pageNum = current
      this.getList()
    },
    onChange(pageInfo) {
      console.log('Page Info: ', pageInfo);
    },
    handleClickDetail(row) {
      this.formData = row;
      this.drawer.operation = 'detail';
      this.drawer.header = row.name
      this.drawer.visible = true;
    },
    handleSetupContract() {
      this.drawer.operation = 'add'
      this.drawer.header = '添加'
      this.drawer.visible = true
    },
    // 导出
    handleExporter() {
      this.$request.post("/caddy/export", {responseType: 'blob'}).then(res => {
        const blob = new Blob([res.data]); // 根据文件类型设置
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'caddy.json'; // 设置下载文件名
        link.click();
        URL.revokeObjectURL(link.href);
      }).catch(err => {
        console.log(err);
      }).finally(() => {

      })
    },
    // 删除
    handleClickDelete(row: { rowIndex: any, type: any }) {
      this.deleteIdx = row.rowIndex;
      this.deleteType = row.type;
      this.confirmVisible = true;
      console.log("this", this.deleteType)
    },
    onConfirmDelete() {
      // 真实业务请发起请求
      this.data.splice(this.deleteIdx, 1);
      this.pagination.total = this.data.length;
      const selectedIdx = this.selectedRowKeys.indexOf(this.deleteIdx);
      if (selectedIdx > -1) {
        this.selectedRowKeys.splice(selectedIdx, 1);
      }
      this.confirmVisible = false;
      // 请求删除
      this.$request.delete("/monitor/delete", {
        params: {
          index: this.deleteIdx,
          type: this.deleteType
        }
      }).then(res => {
        this.$message.success(res.data.msg);
      }).catch(err => {

      })
      this.resetIdx();
    },
    resetIdx() {
      this.deleteIdx = -1;
    },
    onReset() {
      this.page();
    },
    onSubmit() {
      this.page();
    },
    // 确认对话框
    onConfirmOk() {
      switch (this.confirm.operation) {
        case 'codeSpaceAdd':
          this.$request.post('/caddy/add', {
            spaceName: this.formData.name,
            repoId: this.formData.id
          }).then((res) => {
            if (res.data.code === 200) {
              this.$message.success("地址已分配完成，正在初始化数据中...")
              setTimeout(() => {
                this.$router.push('/git/codeSpace')
              }, 10000)
            }
          }).catch((e: Error) => {
            console.log(e)
          }).finally(() => {

          })
          break;
        case 'delete':
          this.$request.delete("/caddy/delete?id=" + this.formData.params.id).then(res => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg)
              this.confirmVisible = false;
              this.resetIdx();
              this.getList();
            }
          })
          break;
      }
    },
    // 确认抽屉
    handleDrawerOk() {
      switch (this.drawer.operation) {
        case 'add':
          this.$request.post('/caddy/add', this.formData).then((res) => {
            if (res.data.code === 200) {
              console.log(res.data.data);
              this.$message.success(res.data.msg);
              this.drawer.visible = false;
            } else {
              this.$message.error(res.data.msg);
            }
          }).catch((err) => {

          }).finally(() => {
            this.page();
            this.dataLoading = false;
          })
          break;
        case 'edit':
          break;
        case 'detail':
          break;
      }
    },
    // 取消删除
    onCancel() {
      this.confirm.visible = false;
    },
    // 取消抽屉
    onCancelDrawer() {
      this.drawer.visible = false;
      this.dataLoading = false;
    },
    // drawer大小
    handleSizeDrag({size}) {
      console.log('size drag size: ', size);
    },
    page() {
      this.dataLoading = true;
      this.$request.get('/caddy/page', {
        params: this.formData
      }).then((res) => {
        if (res.data.code === 200) {
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
</style>
