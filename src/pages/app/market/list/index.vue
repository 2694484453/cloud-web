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
            <t-button theme="primary" type="submit" :style="{ marginLeft: '8px' }" @click="handleSubmit('search',formData)"> 查询</t-button>
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
            <t-image :src="row.icon" fit="cover"  :style="{ width: '32px', height: '32px' }"/>
          </template>
          <template #name="{ row }">
            <p>{{ row.name }}</p>
          </template>
          <template #CreatedAt="{ row }">
            <p>{{ new Date(row.CreatedAt).toLocaleString() }}</p>
          </template>
          <template #op="slotProps">
            <a class="t-button-link" @click="handleSubmit('detail',slotProps.row)">详情</a>
            <a class="t-button-link" @click="handleClickDelete(slotProps.row)">删除</a>
          </template>
        </t-table>
        <div>
          <t-pagination style="margin-top: 15px"
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
      :header="confirm.header"
      :body="confirm.body"
      :visible.sync="confirm.visible"
      @confirm="handleSubmit('delete',formData)"
      :onCancel="onCancel">
    </t-dialog>
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
          width: 30,
          ellipsis: true,
          colKey: 'icon',
          fixed: 'right',
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
          width: 150,
        },
        {
          title: '创建时间',
          width: 120,
          ellipsis: true,
          colKey: "createdTime"
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
        row: {}
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
      formData: {},
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
    this.handleSubmit("search")
  },
  watch:{
    "searchForm.name"(newVal, oldVal) {
       if (newVal != oldVal) {
         this.handleSubmit("search")
        }
      },
    "searchForm.pageSize"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.handleSubmit("search")
      }
    },
    "searchForm.pageNum"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.handleSubmit("search")
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
      this.formData.pageSize = size
    },
    onCurrentChange(current, pageInfo) {
      console.log('Current Page', this.current, current, pageInfo);
      // 刷新
      this.formData.pageNum = current
    },
    onChange(pageInfo) {
      console.log('Page Info: ', pageInfo);
    },
    handleClickDetail() {
      this.$router.push('/detail/base');
    },
    handleSetupContract() {
      this.$router.push('/prometheus/add');
    },
    // 确认删除对话框
    handleClickDelete(row) {
      this.formData = row
      this.confirm.visible = true;
      this.confirm.header = "删除：" + this.formData.name;
      this.confirm.body = "确认删除吗？一旦删除数据无法恢复";
    },
    // 取消删除
    onCancel() {
      this.$message.info("取消删除！");
    },
    resetIdx() {
      this.deleteIdx = -1;
    },
    onReset(data) {
      console.log(data);
      this.getList();
    },
    onSubmit(data) {
      console.log(this.formData);
      this.getList(this.formData);
    },
    // 基本操作
    handleSubmit(operation,data) {
      this.formData = data;
      this.dataLoading = true;
      switch (operation) {
        case 'add':
          break;
        case 'detail':
          break;
        case 'update':
          break;
        case 'delete':
          this.$request.delete('/app/market/delete', {
            data: this.formData
          }).then((res) => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg);
              this.confirm.visible = false;
              this.dataLoading = false;
              this.handleSubmit("search")
            } else  {
              this.$message.error(res.data.msg);
            }
          }).catch((e: Error) => {
            console.log(e);
          }).finally(() => {
            this.dataLoading = false;
          });
          break;
        case 'reset':
          break;
        case "search":
          this.$request.get('/app/market/page', {
              params: this.searchForm
            }).then((res) => {
            if (res.data.code === 200) {
              this.data = res.data.rows;
              this.pagination.total = res.data.total;
              this.dataLoading = false;
            }
          }).catch((e: Error) => {
            console.log(e);
          }).finally(() => {
            this.dataLoading = false;
          });
          break;
      }
    },
    getTypeList() {
      this.$request.get("/imageRepo/typeList").then(res => {
        this.typeList = res.data.data
      }).catch((err) => {

      })
    },
    getRepoList() {
      this.$request.get("/helmRepo/list").then(res => {
        this.repoList = res.data.data
      }).catch((err) => {

      })
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
