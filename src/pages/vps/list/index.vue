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
<!--            <t-button variant="base" theme="default" :disabled="!selectedRowKeys.length">导出配置</t-button>-->
<!--            <p v-if="!!selectedRowKeys.length" class="selected-count">已选{{ selectedRowKeys.length }}项</p>-->
          </div>
          <t-input v-model="searchForm.hostName" class="search-input" placeholder="请输入你需要搜索的内容" clearable>
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
          @sort-change="sortChange"
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
            <a class="t-button-link" @click="handleClickEdit(slotProps.row)">修改</a>
            <a class="t-button-link" @click="handleClickDelete(slotProps.row)">删除</a>
          </template>
        </t-table>
      </div>
    </t-card>
    <!--分页-->
    <t-pagination
      v-model="searchForm.pageNum"
      :total="pagination.total"
      :page-size.sync="searchForm.pageSize"
      @current-change="onCurrentChange"
      @page-size-change="onPageSizeChange"
      @change="onChange"/>
    <!--对话框-->
    <t-dialog
      :header="confirm.header"
      :body="confirm.body"
      :visible.sync="confirm.visible"
      @confirm="handleConfirmOk"
      :onCancel="onCancel"
    >
    </t-dialog>
    <!--抽屉-->
    <t-drawer
      :visible.sync="drawer.visible"
      :header="drawer.header"
      :on-overlay-click="() => (drawer.visible = false)"
      placement="right"
      destroyOnClose
      showOverlay
      :sizeDraggable="true"
      :on-size-drag-end="handleSizeDrag"
      size="40%"
      @cancel="drawer.visible = false"
      @close="drawer.visible = false"
      :onConfirm="handleDrawerOk">
      <t-space v-show="drawer.operation === 'add'|| drawer.operation ==='edit'"  direction="vertical" style="width: 100%">
        <t-form
          ref="formValidatorStatus"
          :data="formData"
          :label-width="120"
          @reset="onReset"
        >
          <t-form-item label="id" name="id" v-show="false">
            <t-input v-model="formData.id" placeholder="请输入内容" :maxlength="32" with="200"></t-input>
          </t-form-item>
          <t-form-item label="主机名称" name="branch" >
            <t-input v-model="formData.hostName" placeholder="请输入主机名称（英文字母和数字的组合）" :maxlength="32" with="200"></t-input>
          </t-form-item>
<!--          <t-form-item label="类型" name="type" >-->
<!--            <t-select v-model="form.hostType" placeholder="请选择">-->
<!--              <t-option v-for="(item,index) in typeList" :key="index" :label="item" :value="item" >{{item}}</t-option>-->
<!--            </t-select>-->
<!--          </t-form-item>-->
          <t-form-item label="ip/域名" name="localIp" >
            <t-input v-model="formData.hostIp" placeholder="请输入ip地址" :maxlength="32" with="200"></t-input>
          </t-form-item>
          <t-form-item label="端口" name="localPort" >
            <t-input v-model="formData.port" placeholder="请输入端口号" :maxlength="32" with="200"></t-input>
          </t-form-item>
          <t-form-item label="用户名" name="localPort" >
            <t-input v-model="formData.userName" placeholder="请输入用户名" :maxlength="32" with="200"></t-input>
          </t-form-item>
          <t-form-item label="密码" name="localPort" >
            <t-input v-model="formData.passWord" placeholder="请输入密码" :maxlength="32" with="200"></t-input>
          </t-form-item>
          <t-form-item label="备注" name="remotePort" >
            <t-textarea v-model="formData.description" placeholder="请输入备注内容" :maxlength="120" with="200"></t-textarea>
          </t-form-item>
        </t-form>
      </t-space>
      <t-space v-show="drawer.operation === 'detail'" direction="vertical" style="width: 100%">
        <t-descriptions  bordered :layout="'vertical'" :item-layout="'horizontal'" :column="2">
          <t-descriptions-item label="主机名称">{{formData.hostName}}</t-descriptions-item>
          <t-descriptions-item label="类型">{{formData.hostType}}</t-descriptions-item>
          <t-descriptions-item label="ip/域名">{{formData.hostIp}}</t-descriptions-item>
          <t-descriptions-item label="端口">{{formData.port}}</t-descriptions-item>
          <t-descriptions-item label="用户名">{{formData.userName}}</t-descriptions-item>
          <t-descriptions-item label="备注">{{formData.description}}</t-descriptions-item>
          <t-descriptions-item label="创建者">{{formData.createByUserName}}</t-descriptions-item>
          <t-descriptions-item label="创建时间">{{formData.createTime}}</t-descriptions-item>
          <t-descriptions-item label="更新时间">{{formData.updateTime}}</t-descriptions-item>
          <t-descriptions-item label="更新者">{{formData.updateByUserName}}</t-descriptions-item>
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
          title: '主机名称',
          align: 'left',
          width: 120,
          ellipsis: true,
          colKey: 'hostName',
          fixed: 'left',
          sortType: 'all',
          sorter: true,
        },
        {
          title: 'ip地址/域名',
          width: 120,
          ellipsis: true,
          colKey: 'hostIp',
        },
        {
          title: '端口',
          colKey: 'port',
          width: 60,
          cell: {col: 'status'},
          sortType: 'all',
          sorter: true,
        },
        {
          title: '系统',
          colKey: 'system',
          width: 80,
          cell: {col: 'status'}
        },
        {
          title: '用户',
          colKey: 'userName',
          width: 80,
          cell: {col: 'status'}
        },
        {
          title: "添加时间",
          colKey: 'createTime',
          width: 120,
          cell: {col: 'status'},
          sortType: 'all',
          sorter: true,
        },
        {
          title: '备注',
          colKey: 'description',
          width: 160,
          cell: {col: 'status'}
        },
        {
          align: 'left',
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
      // 抽屉
      drawer: {
        header: "",
        visible: false,
        type: "",
        operation: "add",
        row: {},
        dynamicForm: {}
      },
      // 对话框
      confirm: {
        header: "",
        body: "",
        operation: "update",
        visible: false
      },
      deleteIdx: -1,
      // 搜索框
      searchForm: {
        id: "",
        hostName: '',
        type: "",
        isAsc: "desc",
        orderByColumn: "createTime",
        pageNum: 1,
        pageSize: 10,
        // sort: {
        //   // 按照 status 字段进行排序
        //   sortBy: 'status',
        //   // 是否按照降序进行排序
        //   descending: true,
        // }
      },
      // 当前数据
      formData: {
        id: '',
        hostName: '',
        hostType: '',
        userName: 'root',
        passWord: '',
        hostIp: "",
        port: 22,
        description: '',
        updateTime: "",
        createTime: '',
        updateBy: '',
        updateByUserName: "",
        createBy: '',
        createByUserName: '',
      },
      typeList: [],
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
    // 初始化加载查询请求
    this.page()
  },
  watch:{
    "searchForm.hostName"(newVal, oldVal) {
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
    },
    "searchForm.isAsc"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page()
      }
    },
    "searchForm.orderByColumn"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page()
      }
    }
  },
  methods: {
    page() {
      this.dataLoading = true;
      this.$request.get('/cloud-host/page', {
          params: this.searchForm
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
    },
    getList() {
      this.$request.get('/api/get-list').then((res) => {
          if (res.code === 0) {
            const {list = []} = res.data;
            this.data = list;
            this.pagination = {
              ...this.pagination,
              total: list.length,
            };
          }
        }).catch((e: Error) => {
        console.log(e);
      }).finally(() => {
        this.dataLoading = false;
      });
    },
    // 新建
    handleSetupContract() {
      this.formData = {}
      this.drawer.visible = true;
      this.getServiceList();
      this.getTypeList();
    },
    // 导出
    handleExport() {

    },
    // 确定
    handleDrawerOk() {
      console.log('执行:',this.drawer.operation);
      switch (this.drawer.operation) {
        case 'add':
          this.$request.post("/cloud-host/add", this.formData).then(res => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg);
            }
          }).catch((e: Error) => {
            console.log(e);
          }).finally(() => {
            this.page();
            this.drawer.visible = false;
            this.dataLoading = false;
          })
          break;
        case 'detail':
          this.drawer.visible = false;
          break;
        case 'edit':
          this.$request.put("/cloud-host/edit", this.formData).then(res => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg);
            }
          }).catch((e: Error) => {
            console.log(e);
          }).finally(() => {
            this.page();
            this.drawer.visible = false;
            this.dataLoading = false;
          })
          break;
      }
    },
    // 点击删除
    handleClickDelete(row) {
      this.formData = row;
      this.confirm.operation = 'delete';
      this.confirm.body = '确认删除当前所选项目？';
      this.confirm.header = '删除' + row.hostName;
      this.confirm.visible = true;
    },
    // 确认删除
    handleConfirmOk() {
      // 真实业务请发起请求
      this.$request.delete('/cloud-host/delete?id=' + this.formData.id).then(res => {
        if (res.data.code === 200) {
          this.$message.success(res.data.msg);
        }
      }).catch((e: Error) => {
        console.log(e);
      }).finally(() => {
        this.page();
        this.confirm.visible = false;
        this.dataLoading = false;
      })
    },
    getContainer() {
      return document.querySelector('.tdesign-starter-layout');
    },
    onPageSizeChange(size, pageInfo) {
      console.log('Page Size:', size, pageInfo);
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
    handleClickDetail(row) {
      console.log(row);
      this.formData = row;
      this.drawer.header = "详情";
      this.drawer.operation = 'detail';
      this.drawer.visible = true;
    },
    // 编辑
    handleClickEdit(row) {
      this.drawer.visible = true;
      this.drawer.header = "编辑";
      this.drawer.operation = 'edit';
      this.formData = row
    },
    onCancel() {
      this.resetIdx();
    },
    resetIdx() {
      this.deleteIdx = -1;
    },
    onReset(data) {
      console.log(data);
    },
    onSubmit(data) {
      console.log(this.searchForm);
      this.page();
    },
    sortChange(sort) {
      // 对于受控属性而言，这里的赋值很重要，不可缺少
      console.log('sort-change',sort);
      this.searchForm.isAsc = sort.descending ? 'desc' : 'asc';
      this.searchForm.orderByColumn = sort.sortBy
    },
    // drawer大小
    handleSizeDrag({size}) {
      console.log('size drag size: ', size);
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
