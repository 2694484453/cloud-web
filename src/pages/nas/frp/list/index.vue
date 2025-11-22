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
            <t-button @click="handleSetupContract"> 新建</t-button>
            <t-button @click="handleExport" variant="base" theme="default" :disabled="!selectedRowKeys.length"> 导出
            </t-button>
          </div>
          <t-input v-model="searchForm.name" class="search-input" placeholder="请输入你需要搜索的内容" clearable>
            <template #suffix-icon>
              <search-icon size="20px"/>
            </template>
          </t-input>
          <t-col :span="2" class="operation-container">
            <t-button theme="primary" type="submit" :style="{ marginLeft: '8px' }"> 查询</t-button>
            <t-button type="reset" variant="base" theme="default"> 重置</t-button>
            <t-button theme="default" variant="base" :style="{ marginRight: '8px' }">
              <a href="https://docs.gpg123.vip" target="_blank">帮助文档</a>
            </t-button>
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
            <t-tag v-if="row.status === 'offline'" theme="danger" variant="light">离线</t-tag>
            <t-tag v-if="row.status === 'noExist'" theme="warning" variant="light">不存在</t-tag>
            <t-tag v-if="row.status === 'online'" theme="success" variant="light">在线</t-tag>
            <t-tag v-if="row.status === null" theme="warning" variant="light">unknown</t-tag>
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
        <div style="margin-top: 10px">
          <t-pagination
            v-model="searchForm.pageNum"
            :total="pagination.total"
            :page-size.sync="searchForm.pageSize"
            @current-change="onCurrentChange"
            @page-size-change="onPageSizeChange"
            @change="onChange"
          />
        </div>
      </div>
    </t-card>
    <t-dialog
      header="确认删除当前所选项目？"
      :body="confirmBody"
      :visible.sync="confirmVisible"
      @confirm="onConfirmDelete"
      :onCancel="onCancel"
    >
    </t-dialog>
    <!-- -->
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
      @cancel="drawer.visible = false"
      @close="drawer.visible = false"
      :onConfirm="handleDrawerOk">
      <t-space v-show="drawer.operation === 'add'|| drawer.operation ==='edit'" direction="vertical" style="width: 100%">
        <t-form
          ref="formValidatorStatus"
          :data="formData"
          :label-width="120"
          @reset="onReset"
        >
          <t-form-item label="id" name="id" v-show="false">
            <t-input v-model="formData.id" placeholder="请输入内容" :maxlength="32" with="200"></t-input>
          </t-form-item>
          <t-form-item label="服务名称" name="branch">
            <t-input v-model="formData.name" placeholder="请输入英文字母和数字的组合名称" :maxlength="32" with="200"></t-input>
          </t-form-item>
          <t-form-item label="协议类型" name="type">
            <t-select v-model="formData.type" placeholder="请选择">
              <t-option v-for="(item,index) in typeList" :key="index" :label="item" :value="item">{{ item }}</t-option>
            </t-select>
          </t-form-item>
          <!--            <t-form-item label="服务端" name="frpsName" >-->
          <!--              <t-select v-model="form.frpServer" placeholder="请选择" style="width: 322px">-->
          <!--                <t-option v-for="(item,index) in serviceList" :key="index" :label="item.serverName" :value="item.serverName" >{{item.serverName}}</t-option>-->
          <!--              </t-select>-->
          <!--            </t-form-item>-->
          <t-form-item label="客户端ip地址" name="localIp">
            <t-input v-model="formData.localIp" placeholder="请输入ip地址" :maxlength="32" with="200"></t-input>
          </t-form-item>
          <t-form-item label="客户端端口" name="localPort">
            <t-input v-model="formData.localPort" placeholder="请输入端口号" :maxlength="32" with="200"></t-input>
          </t-form-item>
          <t-form-item label="映射域名" name="customDomains">
            <t-input v-model="formData.customDomains" placeholder="请输入域名地址" :maxlength="32" with="200"></t-input>
          </t-form-item>
          <t-form-item label="备注" name="description">
            <t-textarea v-model="formData.description" placeholder="请输入备注内容" :maxlength="120"
                        with="200"></t-textarea>
          </t-form-item>
        </t-form>
      </t-space>
      <t-space v-show="drawer.operation === 'detail'" direction="vertical" style="width: 100%">
        <t-descriptions  bordered :layout="'vertical'" :item-layout="'horizontal'" :column="2">
          <t-descriptions-item label="服务名称">{{formData.name}}</t-descriptions-item>
          <t-descriptions-item label="协议类型">{{formData.type}}</t-descriptions-item>
          <t-descriptions-item label="客户端ip地址">{{formData.localIp}}</t-descriptions-item>
          <t-descriptions-item label="客户端端口">{{formData.localPort}}</t-descriptions-item>
          <t-descriptions-item label="映射域名">{{formData.customDomains}}</t-descriptions-item>
          <t-descriptions-item label="备注">{{formData.description}}</t-descriptions-item>
          <t-descriptions-item label="创建时间">{{formData.createTime}}</t-descriptions-item>
          <t-descriptions-item label="创建人">{{formData.createByUserName}}</t-descriptions-item>
          <t-descriptions-item label="更新时间">{{formData.updateTime}}</t-descriptions-item>
          <t-descriptions-item label="更新人">{{formData.updateByUserName}}</t-descriptions-item>
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
import { Icon } from 'tdesign-icons-vue';
import {CONTRACT_STATUS, CONTRACT_STATUS_OPTIONS, CONTRACT_TYPES, CONTRACT_PAYMENT_TYPES} from '@/constants';

export default Vue.extend({
  name: 'ListBase',
  components: {
    SearchIcon,
    Trend,
    Icon,
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
          colKey: 'row-select',
          type: 'multiple',
          width: 64,
          fixed: 'left'
        },
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
          colKey: 'status',
          width: 80,
          cell: {
            col: 'status'
          }
        },
        {
          title: '类型',
          width: 80,
          ellipsis: true,
          colKey: 'type',
        },
        {
          title: '服务端',
          width: 120,
          colKey: 'frpServer',
        },
        {
          title: '客户端IP',
          width: 120,
          ellipsis: true,
          colKey: 'localIp',
        },
        {
          title: '端口',
          width: 60,
          ellipsis: true,
          colKey: 'localPort',
        },
        {
          title: '创建时间',
          width: 160,
          ellipsis: true,
          colKey: 'createTime',
        },
        {
          title: '更新时间',
          width: 160,
          ellipsis: true,
          colKey: 'updateTime',
        },
        {
          title: '描述',
          width: 180,
          ellipsis: true,
          colKey: 'description',
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
        defaultPageSize: 10,
        total: 0,
        defaultCurrent: 1,
      },
      // 查询参数
      searchForm: {
        name: '',
        type: '',
        pageNum: 1,
        pageSize: 10,
      },
      formConfig: {
        title: '新增',
        visible: false,
        header: '新增',
      },
      // 抽屉
      drawer: {
        header: "",
        visible: false,
        type: "",
        operation: "add",
        row: {},
        dynamicForm: {},
        size: "30%"
      },
      // 对话框
      confirm: {
        header: "",
        body: "",
        operation: "update",
        visible: false
      },
      formData: {
        id: '',
        name: '',
        type: '',
        localIp: "127.0.0.1",
        localPort: 80,
        customDomains: '',
        description: '',
        createTime: '',
        updateTime: '',
        createBy: "",
        updateBy: '',
        createByUserName: '',
        updateByUserName: '',
      },
      serviceList: [],
      typeList: [],
      searchValue: '',
      confirmVisible: false,
      deleteIdx: -1,
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
    this.page()
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
    page() {
      this.dataLoading = true;
      this.$request.get('/nas/frpc/page', {
        params: this.searchForm,
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
    // 类型列表
    getTypeList() {
      this.$request.get('/nas/frp/common/types').then((res) => {
        if (res.data.code === 200) {
          this.typeList = res.data.data;
        }
      }).catch((e: Error) => {
        console.log(e);
      }).finally(() => {
        this.dataLoading = false;
      })
    },
    // 创建
    handleDrawerOk() {
      console.log('执行:',this.drawer.operation);
      switch (this.drawer.operation) {
        case 'add':
          this.$request.post("/nas/frpc/add", this.formData).then(res => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg);
              this.drawer.visible = false;
            } else {
              this.$message.error(res.data.msg);
            }
          }).catch((e: Error) => {
            console.log(e);
          }).finally(() => {
            this.page();
            this.dataLoading = false;
          })
          break;
        case 'edit':
          this.$request.put("/nas/frpc/edit", this.formData).then(res => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg);
              this.drawer.visible = false;
            }
          }).catch((e: Error) => {
            console.log(e);
          }).finally(() => {
            this.page();
            this.dataLoading = false;
          })
          break;
        case 'detail':
          this.drawer.visible = false;
          break;
      }
    },
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
    },
    onChange(pageInfo) {
      console.log('Page Info: ', pageInfo);
    },
    handleClickDetail(row) {
      this.formData = row;
      this.drawer.visible = true;
      this.drawer.title = row.name + '详情';
      this.drawer.operation = 'detail';
    },
    // 编辑
    handleClickEdit(row) {
      this.formData = row;
      this.drawer.visible = true;
      this.drawer.operation = 'edit';
      this.drawer.header = "编辑";
      this.getTypeList();
    },
    // 新建s
    handleSetupContract() {
      this.formData = {}
      this.drawer.visible = true;
      this.drawer.title = '新增';
      this.drawer.operation = 'add';
      this.getTypeList();
    },
    // 导出
    handleExport() {
      this.$request.post('/nas/frpc/export', {}, {responseType: 'blob'}).then(res => {
        const blob = new Blob([res.data]);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'frpc.toml';
        link.click();
        URL.revokeObjectURL(link.href); // 释放内存
      })
    },
    // 点击删除
    handleClickDelete(row: { rowIndex: any }) {
      this.deleteIdx = row.rowIndex;
      this.confirm.visible = true;

    },
    // 确认删除
    onConfirmDelete(row) {
      // 真实业务请发起请求
      this.$request.delete('/nas/frpc/delete?id=' + this.form.id).then(res => {
        if (res.data.code === 200) {
          this.$message.success(res.data.msg);
          this.page();
          this.confirm.visible = false;
        }
      })
    },
    onReset(data) {
      console.log(data);
    },
    onCancel() {
      this.resetIdx();
    },
    resetIdx() {
      this.deleteIdx = -1;
    },
    onSubmit() {
      this.page();
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
