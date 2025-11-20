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
          <t-col :span="3">
<!--            <t-form-item label="仓库源" name="repoName">-->
<!--              <t-select v-model="searchForm.repoName">-->
<!--                <t-option v-for="(item,index) in repoList" :key="index" :label="item" :value="item">{{ item }}-->
<!--                </t-option>-->
<!--              </t-select>-->
<!--              <t-input v-model="searchForm.repoName" :style="{ width: '200px' }" placeholder="请输入内容"/>-->
<!--            </t-form-item>-->
            <t-form-item label="名称" name="name">
              <t-input v-model="searchForm.name" :style="{ width: '200px' }" placeholder="请输入内容"/>
            </t-form-item>
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
          <template #icon="{row}">
            <t-image :src="row.icon" fit="cover"  :style="{ width: '36px', height: '36px' }"/>
          </template>
          <template #name="{row}">
            <p>{{ row.name }}</p>
          </template>
          <template #CreatedAt="{row}">
            <p>{{ new Date(row.CreatedAt).toLocaleString() }}</p>
          </template>
          <template #op="slotProps">
            <a class="t-button-link" @click="handleClickDetail(slotProps.row)">详情</a>
            <t-space>
              <a v-show="slotProps.row.status === null" class="t-button-link" @click="handleClickInstall(slotProps.row)">安装</a>
            </t-space>
<!--            <a class="t-button-link" @click="handleClickConfirm(slotProps.row)">删除</a>-->
          </template>
        </t-table>
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
      @confirm="handleSubmit(operation)"
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
      @close="onCancelDrawer"
      :onConfirm="handleDrawerOk"
      @cancel="onCancelDrawer"
    >
      <t-space v-show="drawer.operation === 'add'|| drawer.operation ==='edit'" direction="vertical" style="width: 100%">
        <t-form
          ref="formValidatorStatus"
          :data="formData"
          :label-width="100"
          @reset="onReset"
        >
          <t-form-item label="id" name="id" v-show="false">
            <t-input v-model="formData.id" :maxlength="32" with="120"></t-input>
          </t-form-item>
          <t-form-item label="名称" name="name">
            <t-input v-model="formData.name" placeholder="请输入仓库名称" :maxlength="64" with="120"></t-input>
          </t-form-item>
          <t-form-item label="类型" name="type">
            <t-input v-model="formData.type" placeholder="请输入仓库名称" :maxlength="64" with="120"></t-input>
          </t-form-item>
          <t-form-item label="地址" name="url">
            <t-input v-model="formData.url" placeholder="请输入仓库地址" :maxlength="64" with="120"></t-input>
          </t-form-item>
        </t-form>
      </t-space>
      <t-space v-show="drawer.operation === 'detail'" direction="vertical" style="width: 100%">
        <t-descriptions  bordered :layout="'vertical'" :item-layout="'horizontal'" :column="2">
          <t-descriptions-item label="名称">
            <t-space>
              <t-image fit="cover" :style="{width:'32px',height:'32px'}" :src="formData.icon"/>
            </t-space>
              {{formData.name}}
          </t-descriptions-item>
          <t-descriptions-item label="类型">{{formData.type}}</t-descriptions-item>
          <t-descriptions-item label="主页"><a :href="formData.home">{{formData.home}}</a></t-descriptions-item>
          <t-descriptions-item label="描述">{{formData.description}}</t-descriptions-item>
          <t-descriptions-item label="地址"><a :href="formData.url">{{formData.url}}</a></t-descriptions-item>
          <t-descriptions-item label="上架时间">{{formData.createTime}}</t-descriptions-item>
          <t-descriptions-item label="上架人">{{formData.createBy}}</t-descriptions-item>
          <t-descriptions-item label="更新时间">{{formData.updateTime}}</t-descriptions-item>
          <t-descriptions-item label="更新人">{{formData.updateBy}}</t-descriptions-item>
        </t-descriptions>
      </t-space>
      <t-space v-show="drawer.operation === 'install'" direction="vertical" style="width: 100%">
        <t-form
          ref="formValidatorStatus"
          :data="drawer.dynamicForm"
          :label-width="100"
          @reset="onReset"
        >
        <div v-for="(v,k) in drawer.dynamicForm">
          <t-form-item :label="k" :name="k">
            <t-input v-model="drawer.dynamicForm[k]" :type="typeof drawer.dynamicForm[k]" placeholder="请输入仓库名称" :maxlength="64" with="120" ></t-input>
          </t-form-item>
        </div>
        </t-form>
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
          title: '',
          align: 'right',
          width: 42,
          ellipsis: true,
          colKey: 'icon',
          fixed: 'right',
        },
        {
          title: '名称',
          align: 'left',
          width: 150,
          ellipsis: true,
          colKey: 'name',
          fixed: 'left',
        },
        {
          title: '版本',
          width: 80,
          ellipsis: true,
          fixed: 'left',
          colKey: 'version',
        },
        {
          title: '类型',
          width: 80,
          ellipsis: true,
          fixed: 'left',
          colKey: 'type',
        },
        {
          title: '描述',
          colKey: 'description',
          ellipsis: true,
          width: 180,
        },
        {
          title: '创建时间',
          width: 120,
          ellipsis: true,
          colKey: "createTime"
        },
        {
          title: '更新时间',
          width: 120,
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
      deleteType: -1,
      // 搜索框
      searchForm: {
        name: "",
        type: "",
        pageNum: 1,
        pageSize: 10
      },
      // 当前数据
      formData: {
        id: 0,
        url: "",
        name: "",
        icon: "",
        type: "",
        home: "",
        description: "",
        createTime: "",
        updateTime: "",
        createBy: "",
        updateBy: "",
        status: "",
        values: ""
      },
      operation: "",
      typeList: [],
      repoList: [],
      namespaceList: []
    };
  },
  computed: {
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
  },
  mounted() {
  },
  created() {
    // 初始化加载查询请求
    this.page();
  },
  watch:{
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
    },
    onChange(pageInfo) {
      console.log('Page Info: ', pageInfo);
    },
    handleClickDetail(row) {
      console.log(row);
      this.formData = row;
      this.drawer.operation = 'detail';
      this.drawer.visible = true;
    },
    handleClickInstall(row) {
      this.formData = row;
      console.log(this.formData);
      this.drawer.visible = true;
      this.drawer.operation = 'install';
      this.$request.post('/app/market/values', this.formData).then((res) => {
        if (res.data.code === 200) {
          console.log(res.data.data);
          this.drawer.dynamicForm = res.data.data;
          //this.$message.success(res.data.msg);
        } else  {
          //this.$message.error(res.data.msg);
        }
      }).catch((e: Error) => {
        console.log(e);
      }).finally(() => {
        //this.dataLoading = false;
        //this.drawer.visible = false;
      });
    },
    handleSetupContract() {
      this.$router.push('/prometheus/add');
    },
    // 对话框信息自定义
    handleClickConfirm(row) {
      switch(this.confirm.operation) {
        case 'add':
          break;
        case 'update':
          break;
        case 'delete':
          this.confirm.visible = true;
          this.confirm.header = "删除：" + this.formData.name;
          this.confirm.body = "确认删除吗？一旦删除数据无法恢复";
          break;
      }
      this.formData = row
    },
    // 取消删除
    onCancel() {
      this.confirm.visible = false;
      this.dataLoading = false;
      this.$message.info("取消删除！");
    },
    // 确认抽屉
    handleDrawerOk() {
      console.log('执行:',this.drawer.operation);
      switch (this.drawer.operation) {
        case 'add':
          this.drawer.visible = false;
          break;
        case 'detail':
          this.drawer.visible = false;
          break;
        // 执行安装
        case 'install':
          console.log(this.formData);
          this.formData.values = this.drawer.dynamicForm;
          this.$request.post('/app/market/install', this.formData).then((res) => {
              console.log(res.data.data);
          }).catch((e: Error) => {
            console.log(e);
          }).finally(() => {

          })
          break;
      }
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
    resetIdx() {
      this.deleteIdx = -1;
    },
    // 清除搜索
    onReset(data) {
      console.log(data);
      this.page();
    },
    // 搜索提交
    onSubmit(data) {
      this.page();
    },
    // 分页查询
    page() {
      this.dataLoading = true;
      this.$request.get('/app/market/page', {
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
    // 基本操作
    handleSubmit(operation) {
      this.operation = operation;
      //this.dataLoading = true;
      switch (operation) {
        case 'add':
          this.confirm.operation = "add";
          break;
        case 'detail':
          this.drawer.visible = true;
          this.drawer.header = "详情：" + this.formData.name;
          break;
        case 'update':
          break;
        case 'delete':
          this.$request.delete('/app/market/delete', {
            data: this.formData
          }).then((res) => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg);
              this.handleSubmit("search")
            } else  {
              this.$message.error(res.data.msg);
            }
          }).catch((e: Error) => {
            console.log(e);
          }).finally(() => {
            this.confirm.visible = false;
            this.dataLoading = false;
          });
          break;
        case 'reset':
          break;
        //
        case "install":
          this.drawer.header = "安装" + this.formData.name;
          this.drawer.visible = true;
      }
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
