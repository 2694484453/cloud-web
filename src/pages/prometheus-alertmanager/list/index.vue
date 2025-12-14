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
            <t-button @click="handleSetupContract"> 添加规则</t-button>
            <t-button variant="base" theme="default" :disabled="!selectedRowKeys.length"> 导出配置</t-button>
            <!--            <p v-if="!!selectedRowKeys.length" class="selected-count">已选{{ selectedRowKeys.length }}项</p>-->
          </div>
          <t-col :span="3">
            <t-input v-model="searchForm.alertName" class="search-input" placeholder="请输入你需要搜索的内容" clearable>
              <template #suffix-icon>
                <search-icon size="20px"/>
              </template>
            </t-input>
          </t-col>
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
          <template #paymentType="{ row }">
            <p v-if="row.paymentType === CONTRACT_PAYMENT_TYPES.PAYMENT" class="payment-col">
              付款
              <trend class="dashboard-item-trend" type="up"/>
            </p>
            <p v-if="row.paymentType === CONTRACT_PAYMENT_TYPES.RECEIPT" class="payment-col">
              收款
              <trend class="dashboard-item-trend" type="down"/>
            </p>
          </template>
          <template #op="slotProps">
            <a class="t-button-link" @click="handleClickDetail(slotProps.row)">详情</a>
            <a class="t-button-link" @click="handleClickEdit(slotProps.row)">编辑</a>
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
      @change="onChange"
    />
    <t-dialog
      :header="confirm.header"
      :body="confirm.body"
      :visible.sync="confirm.visible"
      @confirm="handleConfirmOk"
      :onCancel="onCancel">
    </t-dialog>
    <t-drawer
      :visible.sync="drawer.visible"
      :header="drawer.header"
      :on-overlay-click="() => (drawer.visible = false)"
      placement="right"
      destroyOnClose
      showOverlay
      :sizeDraggable="true"
      :on-size-drag-end="handleSizeDrag"
      :size="drawer.size"
      @close="onCancelDrawer"
      :onConfirm="handleDrawerOk"
      @cancel="onCancelDrawer">
      <t-space v-show="drawer.operation === 'add'|| drawer.operation ==='edit'"  direction="vertical" style="width: 100%">
        <t-form
          ref="formValidatorStatus"
          :data="formData"
          :label-width="120"
          @reset="onReset"
        >
          <t-form-item label="规则名称" name="branch">
            <t-input v-model="formData.alertName" placeholder="请输入英文字母和数字的组合名称" :maxlength="64" with="200" clearable></t-input>
          </t-form-item>
          <t-form-item label="分组名称" name="localIp">
            <t-input v-model="formData.groupName" :maxlength="64" with="200" clearable></t-input>
          </t-form-item>
          <t-form-item label="表达式" name="kubeContext">
            <t-textarea v-model="formData.expr" placeholder="请输入表达式" :autosize="{minRows:5}"></t-textarea>
          </t-form-item>
          <t-form-item label="标签" name="chartUrl">
            <t-textarea v-model="formData.labels" placeholder="请输入备注内容" :maxlength="9999" with="200" :autosize="{minRows:3}"></t-textarea>
          </t-form-item>
          <t-form-item label="annotations" name="description">
            <t-textarea v-model="formData.annotations" placeholder="请输入备注内容" :maxlength="9999" with="200" :autosize="{minRows:3}"></t-textarea>
          </t-form-item>
          <t-form-item label="描述" name="description">
            <t-textarea v-model="formData.description" placeholder="请输入备注内容" :maxlength="200" with="200" :autosize="{minRows:3}"></t-textarea>
          </t-form-item>
        </t-form>
      </t-space>
      <t-space v-show="drawer.operation === 'detail'" direction="vertical" style="width: 100%" >
        <t-descriptions bordered :layout="'vertical'" :item-layout="'horizontal'" :column="3">
          <t-descriptions-item label="规则名称" >{{formData.alertName}}</t-descriptions-item>
          <t-descriptions-item label="分组名称">{{formData.groupName}}</t-descriptions-item>
          <t-descriptions-item label="类型">{{formData.type}}</t-descriptions-item>
          <t-descriptions-item label="表达式">{{formData.expr}}</t-descriptions-item>
          <t-descriptions-item label="持续时间">{{formData.forTime}}</t-descriptions-item>
          <t-descriptions-item label="状态">{{formData.status}}</t-descriptions-item>
          <t-descriptions-item label="标签">{{formData.labels}}</t-descriptions-item>
          <t-descriptions-item label="annotations">{{formData.annotations}}</t-descriptions-item>
          <t-descriptions-item label="创建时间">{{formData.createTime}}</t-descriptions-item>
          <t-descriptions-item label="创建者">{{formData.createByUserName}}</t-descriptions-item>
          <t-descriptions-item label="更新时间">{{formData.updateTime}}</t-descriptions-item>
          <t-descriptions-item label="更新者">{{formData.updateByUserName}}</t-descriptions-item>
          <t-descriptions-item label="描述">{{formData.description}}</t-descriptions-item>
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
        {
          title: '规则名称',
          align: 'left',
          width: 150,
          ellipsis: true,
          colKey: 'alertName',
          fixed: 'left',
        },
        {
          title: '类型',
          width: 150,
          ellipsis: true,
          fixed: 'left',
          colKey: 'type',
        },
        {
          title: '状态',
          colKey: 'status',
          width: 80, cell:
            {col: 'status'}
        },
        {
          title: 'group名称',
          align: 'left',
          width: 140,
          ellipsis: true,
          colKey: 'groupName',
          fixed: 'left',
        },
        {
          title: '标签',
          width: 160,
          ellipsis: true,
          colKey: 'labels',
        },
        {
          title: '描述',
          width: 160,
          ellipsis: true,
          colKey: "description"
        },
        {
          title: '创建时间',
          width: 160,
          ellipsis: true,
          colKey: "createTime"
        },
        {
          title: '更新时间',
          width: 160,
          ellipsis: true,
          colKey: "updateTime"
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
        defaultPageSize: 10,
        total: 0,
        defaultCurrent: 1,
      },
      searchValue: '',
      confirmVisible: false,
      deleteIdx: -1,
      deleteType: -1,
      formData: {
        id: "",
        alertName: "",
        groupName: "",
        description: "",
        createTime: "",
        updateTime: "",
        createdBy: "",
        updateBy: "",
        createByUserName: "",
        updateByUserName: "",
        type: "",
        expr: "",
        forTime: "",
        labels: "",
        annotations: "",
        status: ""
      },
      // 搜索框
      searchForm:{
        alertName: "",
        groupName: "",
        pageNum: 1,
        pageSize: 10
      },
      // 抽屉
      drawer: {
        header: "",
        visible: false,
        operation: "add",
        size: '40%',
      },
      // 对话框
      confirm: {
        header: "",
        body: "",
        operation: "update",
        visible: false
      },
      typeList: []
    };
  },
  computed: {
    confirmBody() {
      if (this.deleteIdx > -1) {
        const {name} = this.data?.[this.deleteIdx];
        return `删除后，${name}的所有合同信息将被清空，且无法恢复`;
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
    this.getTypeList()
    this.page();
  },
  watch:{
    "searchForm.name"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page();
      }
    },
    "searchForm.pageSize"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page();
      }
    },
    "searchForm.pageNum"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page();
      }
    }
  },
  methods: {
    // drawer大小
    handleSizeDrag({size}) {
      console.log('size drag size: ', size);
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
    },
    onChange(pageInfo) {
      console.log('Page Info: ', pageInfo);
    },
    // 确认抽屉
    handleDrawerOk() {
      console.log('执行:',this.operation);
      switch (this.operation) {
        case 'add':
          this.$request.post('/prometheus/rule/add', this.formData).then((res) => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg);
              this.page();
            } else  {
              this.$message.error(res.data.msg);
            }
          }).catch((e: Error) => {
            console.log(e);
          }).finally(() => {
            this.dataLoading = false;
          });
          break;
      case "edit":
        this.$request.post('/prometheus/rule/edit', this.formData).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg);
            this.page();
          } else  {
            this.$message.error(res.data.msg);
          }
        }).catch((e: Error) => {
          console.log(e);
        }).finally(() => {
          this.dataLoading = false;
        });
      }
    },
    // 对话框信息自定义
    handleConfirmOk() {
      switch(this.operation) {
        case 'delete':
          this.confirm.visible = true;
          this.confirm.header = "删除：" + this.formData.alertName;
          this.confirm.body = "确认删除吗？一旦删除数据无法恢复";
          break;
      }
    },
    // 取消抽屉
    onCancelDrawer() {
      this.drawer.visible = false;
      this.dataLoading = false;
    },
    getContainer() {
      return document.querySelector('.tdesign-starter-layout');
    },
    handleClickDetail(row:any) {
      this.formData = row;
      this.drawer.visible = true;
      this.drawer.operation = 'detail';
      this.drawer.header = row.alertName;
    },
    handleClickEdit(row:any) {
      this.formData = row;
      this.drawer.visible = true;
      this.drawer.operation = 'edit';
      this.drawer.header = row.alertName;
    },
    handleSetupContract() {
      this.formData = {}
      this.drawer.visible = true;
      this.drawer.operation = 'add';
      this.drawer.header = '新增';
    },
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
    onCancel() {
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
    getTypeList() {
      this.$request.get("/monitor/typeList").then(res => {
        this.typeList = res.data.data
      }).catch((err) => {

      })
    },
    page() {
      this.dataLoading = true;
      this.$request.get('/prometheus/rule/page', {
          params: this.searchForm
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
