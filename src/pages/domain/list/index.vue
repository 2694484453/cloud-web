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
            <t-button variant="base" theme="default" :disabled="!selectedRowKeys.length"> 导出</t-button>
            <!--            <p v-if="!!selectedRowKeys.length" class="selected-count">已选{{ selectedRowKeys.length }}项</p>-->
          </div>
          <t-input v-model="formData.domainName" class="search-input" placeholder="请输入你需要搜索的内容" clearable>
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
          <template #status="{ row }">
            <t-tag v-if="row.status === CONTRACT_STATUS.FAIL" theme="danger" variant="light">审核失败</t-tag>
            <t-tag v-if="row.status === CONTRACT_STATUS.AUDIT_PENDING" theme="warning" variant="light">待审核</t-tag>
            <t-tag v-if="row.status === CONTRACT_STATUS.EXEC_PENDING" theme="warning" variant="light">待履行</t-tag>
            <t-tag v-if="row.status === CONTRACT_STATUS.EXECUTING" theme="success" variant="light">履行中</t-tag>
            <t-tag v-if="row.status === CONTRACT_STATUS.FINISH" theme="success" variant="light">已完成</t-tag>
          </template>
          <template #contractType="{ row }">
            <p v-if="row.contractType === CONTRACT_TYPES.MAIN">审核失败</p>
            <p v-if="row.contractType === CONTRACT_TYPES.SUB">待审核</p>
            <p v-if="row.contractType === CONTRACT_TYPES.SUPPLEMENT">待履行</p>
          </template>
          <template #CreateTimestamp="{ row }">
            <p>{{ new Date(row.CreateTimestamp).toLocaleString() }}</p>
          </template>
          <template #Status="{ row }">
            <p v-if="row.Status === 'ENABLE'" class="payment-col">
              已启用
              <trend class="dashboard-item-trend" type="down"/>
            </p>
            <p v-if="row.Status === 'DISABLE'" class="payment-col">
              未启用
              <trend class="dashboard-item-trend" type="up"/>
            </p>
          </template>
          <template #op="slotProps">
            <a class="t-button-link" @click="handleClickDownload(slotProps.row)">生成</a>
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
      size="30%"
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
          <t-form-item label="域名" name="url">
            <t-input v-model="formData.domainName" class="search-input" placeholder="" clearable></t-input>
          </t-form-item>
          <t-form-item label="描述" name="name">
            <t-textarea v-model="formData.description" class="search-input" placeholder="" clearable
                        maxlength="256"></t-textarea>
          </t-form-item>
        </t-form>
      </t-space>
      <t-space v-show="drawer.operation === 'detail'" direction="vertical" style="width: 100%">
        <t-descriptions bordered :layout="'vertical'" :item-layout="'horizontal'" :column="2">
          <t-descriptions-item label="名称">{{ formData.domainName }}</t-descriptions-item>
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
        {colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left'},
        {
          title: '域名',
          align: 'left',
          width: 150,
          ellipsis: true,
          colKey: 'domainName',
          fixed: 'left',
        },
        {
          title: '状态',
          colKey: 'Status',
          width: 80,
          cell: {col: 'Status'}
        },
        {
          title: '类型',
          width: 160,
          ellipsis: true,
          colKey: 'type',
        },
        {
          title: '描述',
          width: 160,
          ellipsis: true,
          colKey: 'description',
        },
        {
          title: '创建时间',
          width: 150,
          ellipsis: true,
          colKey: 'createTime',
        },
        {
          title: '更新时间',
          width: 150,
          ellipsis: true,
          colKey: 'updateTime',
        },
        {
          align: 'center',
          fixed: 'right',
          width: 150,
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
        defaultPageSize: 20,
        total: 0,
        defaultCurrent: 1,
      },
      searchValue: '',
      confirmVisible: false,
      deleteIdx: -1,
      // 搜索框
      searchForm: {
        name: "",
        type: "",
        pageNum: 1,
        pageSize: 10
      },
      formData: {
        domainName: "",
        type: "",
        status: "",
        createByUserName: '',
        updateByUserName: '',
        createTime: '',
        updateTime: '',
        description: "",
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
      typeList: []
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
    this.page()
  },
  methods: {
    page() {
      this.dataLoading = true;
      this.$request.get('/domain/page', {
        params: this.formData
      }).then((res) => {
        if (res.data.code === 200) {
          this.data = res.data.rows;
          this.pagination = {
            ...this.pagination,
            total: res.data.total,
          };
        }
      }).catch((e: Error) => {
        console.log(e);
      }).finally(() => {
        this.dataLoading = false;
      });
    },
    getTypeList() {
      this.$request.get("/domain/domainList").then(res => {
        this.typeList = res.data.data
      }).catch((err) => {

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
      this.drawer.operation = 'detail';
      this.drawer.visible = true;
      this.drawer.header = row.domainName;
      this.formData = row
    },
    handleSetupContract() {
      this.drawer.operation = 'add';
      this.drawer.header = '新增';
      this.drawer.visible = true;
    },
    handleClickDownload(row) {

    },
    handleClickDelete(row: { rowIndex: any }) {
      this.deleteIdx = row.rowIndex;
      this.confirmVisible = true;
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
      this.$message.success('删除成功');
      this.resetIdx();
    },
    resetIdx() {
      this.deleteIdx = -1;
    },
    onReset(data) {
      console.log(data);
    },
    onSubmit(data) {
      this.page();
    },
    // drawer大小
    handleSizeDrag({size}) {
      console.log('size drag size: ', size);
    },
    // 确认抽屉
    handleDrawerOk() {
      switch (this.drawer.operation) {
        case 'add':
          this.$request.post('/domain/add', this.formData).then((res) => {
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
    // 确认对话框
    onConfirmOk() {
      switch (this.confirm.operation) {
        case 'codeSpaceAdd':
          this.$request.post('/git/codeSpace/add', {
            spaceName: this.formData.name,
            repoId: this.formData.id
          }).then((res) => {
            if (res.data.code === 200) {
              this.$message.success("地址已分配完成，正在初始化数据中...")
              setTimeout(() => {
                this.$router.push('/git/codeSpace')
              },10000)
            }
          }).catch((e: Error) => {
            console.log(e)
          }).finally(() => {

          })
          break;
        case 'delete':
          this.$request.delete("/git/repo/delete?id=" + this.formData.params.id).then(res => {
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
    // 取消删除
    onCancel() {
      this.confirm.visible = false;
    },
    // 取消抽屉
    onCancelDrawer() {
      this.drawer.visible = false;
      this.dataLoading = false;
    },
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
