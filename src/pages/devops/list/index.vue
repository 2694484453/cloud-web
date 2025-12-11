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
            <t-button @click="handleSetupContract">新建</t-button>
            <t-button variant="base" theme="default" :disabled="!selectedRowKeys.length"> 导出配置</t-button>
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
            <span v-if="row.status === 'done'">
              <t-tag theme="success" variant="light">已完成</t-tag>
            </span>
            <span v-if="row.status === 'running'">
              <t-tag theme="warning" variant="light">运行中</t-tag>
            </span>
            <span v-if="row.status === 'fail'">
              <t-tag theme="danger" variant="light">失败</t-tag>
            </span>
            <span v-if="row.status === null">
              <t-tag theme="danger" variant="light">未知</t-tag>
            </span>
          </template>
          <template #op="slotProps">
            <a class="t-button-link" @click="handleClickExec(slotProps.row)">执行</a>
            <a class="t-button-link" @click="handleClickEdit(slotProps.row)">编辑</a>
<!--            <a class="t-button-link" @click="handleClickDetail(slotProps.row)">日志</a>-->
            <a class="t-button-link" @click="handleClickLogs(slotProps.row)">日志</a>
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
    <t-drawer
      :visible.sync="editor.visible"
      :header="editor.header"
      :on-overlay-click="() => (editor.visible = false)"
      placement="right"
      destroyOnClose
      showOverlay
      :sizeDraggable="true"
      :on-size-drag-end="handleSizeDrag"
      size="50%"
      @cancel="closeSSE;editor.visible = false"
      @close="handleClose"
      :onConfirm="handleClose">
      <MonacoEditor :config="editor" :value="editor.value"/>
    </t-drawer>
    <t-drawer
      :visible.sync="drawer.visible"
      :header="drawer.header"
      :on-overlay-click="() => (drawer.visible = false)"
      placement="right"
      destroyOnClose
      showOverlay
      :sizeDraggable="true"
      :on-size-drag-end="handleSizeDrag"
      size="35%"
      @cancel="handleClose"
      @close="handleClose"
      :onConfirm="handleDrawerOk">
      <t-space direction="vertical" style="width: 100%">
        <t-form
          ref="formValidatorStatus"
          :data="formData"
          :label-width="100"
          @reset="onReset"
        >
          <t-space direction="vertical" style="width: 100%">
            <t-tabs :value="drawer.step" placement="left" @change="handlerChange" size="medium">
              <t-tab-panel value="base" label="基本信息" style="width: 100%">
                <t-form-item label="名称" name="name">
                  <t-input v-model="formData.jobName" maxlength="64" placeholder="请输入名称" clearable with="200"></t-input>
                </t-form-item>
                <t-form-item label="构建集群" name="type">
                  <t-select v-model="formData.contextName" placeholder="请选择" @change="getGitRepoList" :maxlength="32" with="200" clearable>
                    <t-option v-for="(item,index) in clusterList" :key="index" :label="item.clusterName" :value="item.clusterName">
                      {{ item.clusterName }}
                    </t-option>
                  </t-select>
                </t-form-item>
                <t-form-item label="描述" name="description">
                  <t-textarea v-model="formData.description" placeholder="请输入描述" maxlength="200"
                              :autosize="{minRows:3}"></t-textarea>
                </t-form-item>
              </t-tab-panel>
              <t-tab-panel value="git" label="git仓库">
                <t-form-item label="仓库名称" name="type">
                  <t-select v-model="formData.git.url" placeholder="请选择" @change="getGitRepoList" :maxlength="32" with="200" clearable>
                    <t-option v-for="(item,index) in gitRepoList" :key="index" :label="item.name" :value="item.url">
                      {{ item.name }}
                    </t-option>
                  </t-select>
                </t-form-item>
                <t-form-item label="分支" name="branch">
                  <t-input v-model="formData.git.branch" placeholder="请输入内容" :maxlength="32" with="200" clearable></t-input>
                </t-form-item>
              </t-tab-panel>
              <t-tab-panel value="build" label="镜像构建">
                <t-form-item label="镜像名称" name="taskBuildImage">
                  <t-input v-model="formData.build.imageName" maxlength="256"></t-input>
                </t-form-item>
                <t-form-item label="镜像版本" name="containerName">
                  <t-input v-model="formData.build.imageVersion" placeholder="请输入内容"></t-input>
                </t-form-item>
                <t-form-item label="环境变量" name="env">
                  <t-input v-model="formData.build.env" placeholder="请输入内容"></t-input>
                </t-form-item>
                <t-form-item label="自定义命令行" name="">
                  <t-textarea
                    v-model="formData.build.cmd"
                    placeholder="['/bin/sh', '-c', 'xxx']"
                    name="description"
                    :autosize="{ minRows: 3, maxRows: 20 }"
                  />
                </t-form-item>
              </t-tab-panel>
              <t-tab-panel value="push" label="镜像推送">
                <p style="padding: 25px">选项卡3</p>
              </t-tab-panel>
              <t-tab-panel value="deploy" label="镜像部署">
                <p style="padding: 25px">选项卡3</p>
              </t-tab-panel>
            </t-tabs>
          </t-space>
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
import { sseService } from '@/utils/sse';

import {CONTRACT_STATUS, CONTRACT_STATUS_OPTIONS, CONTRACT_TYPES, CONTRACT_PAYMENT_TYPES} from '@/constants';
import MonacoEditor from "@/components/editor/MonacoEditor.vue";

export default Vue.extend({
  name: 'ListBase',
  components: {
    MonacoEditor,
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
          title: '任务名称',
          align: 'left',
          width: 120,
          ellipsis: true,
          colKey: 'jobName',
          fixed: 'left',
        },
        {
          title: '类型',
          width: 80,
          ellipsis: true,
          fixed: 'left',
          colKey: 'type',
        },
        {
          title: '标签',
          width: 120,
          ellipsis: true,
          colKey: 'labels',
        },
        {
          title: '状态',
          colKey: 'status',
          width: 80,
          ellipsis: true,
        },
        {
          title: '命名空间',
          colKey: 'nameSpace',
          ellipsis: true,
          width: 120,
        },
        {
          title: '最近一次执行',
          width: 150,
          ellipsis: true,
          colKey: "updateTime"
        },
        {
          title: "创建时间",
          width: 150,
          ellipsis: true,
          colKey: "createTime"
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
      // 与pagination对齐
      pagination: {
        defaultPageSize: 10,
        total: 0,
        defaultCurrent: 1,
      },
      // 对话框
      confirm: {
        header: "",
        body: "",
        operation: "update",
        visible: false
      },
      searchValue: '',
      confirmVisible: false,
      deleteIdx: -1,
      deleteType: -1,
      // 搜索框
      searchForm: {
        name: "",
        type: "",
        pageNum: 1,
        pageSize: 10
      },
      formData: {
        jobName: "",
        contextName: "",
        description: "",
        git: {
          type: "",
          url: "",
          branch: "",
        },
        build: {
          imageName: "",
          imageVersion: "",
          env: [],
          cmd: ""
        },
        push: {},
        deploy: {}
      },
      gitRepoList: [],
      clusterList: [],
      gitRepoTypeList: [],
      taskBuildTypeList: [],
      taskBuildImageList: [],
      formConfig: {
        visible: false,
        header: "新增"
      },
      // 抽屉
      drawer: {
        step: "base",
        header: "",
        visible: false,
        operation: "add",
        dynamicForm: {}
      },
      typeList: [],
      // monaco
      editor: {
        language: "text",
        fontSize: "15",
        value: "",
        readOnly: true,
        header: "",
        // 抽屉
        visible: false,
      },
      selectedJob: {
        jobName: "",
        nameSpace: ""
      },
      eventSource: null,
      isConnected: false,
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
    this.page();
    this.isConnected = false;
    sseService.close();
  },
  beforeDestroy() {
    if (this.eventSource) {
      this.eventSource.close();
    }
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
    getGitRepoList() {
      this.dataLoading = true;
      this.$request.get('/git/repo/list', {
        params: this.searchForm
      }).then((res) => {
        if (res.data.code === 200) {
          console.log("data", res.data.data)
          this.gitRepoList = res.data.data;
        }
      }).catch((e: Error) => {
        console.log(e);
      }).finally(() => {
        this.dataLoading = false;
      });
    },
    getGitRepoTypeList() {
      this.$request.get('/git/common/types').then((res) => {
        if (res.data.code === 200) {
          this.form.gitRepoTypeList = res.data.data;
        }
      }).catch((e: Error) => {
        console.log(e);
      });
    },
    getTaskBuildTypeList() {
      this.$request.get('/devops/common/types').then((res) => {
        if (res.data.code === 200) {
          this.form.taskBuildTypeList = res.data.data;
        }
      }).catch((e: Error) => {
        console.log(e);
      });
    },
    getClusterList() {
      this.$request.get('/kubernetes/cluster/list', {
        params: {
          isPublic: true,
        }
      }).then((res) => {
        if (res.data.code === 200) {
          this.clusterList = res.data.data;
        }
      }).catch((e: Error) => {
        console.log(e);
      });
    },
    handlerChange(newValue: any) {
      this.drawer.step = newValue;
      switch (newValue) {
        case "git":
          this.getGitRepoTypeList();
          break;
        case "build":
          this.getTaskBuildTypeList();
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
    handleSizeDrag({size}) {
      console.log('size drag size: ', size);
    },
    handleClickLogs(row:any) {
      this.formData = row;
      // 连接sse
      sseService.connect({
        url: "/devops/job/jobLogs?jobName=" + row.jobName + "&nameSpace=" + row.nameSpace,
        withCredentials: true,
        onOpen: () => {
          this.isConnected = true;
          this.$message.success('SSE连接成功');
        },
        onMessage: (event: MessageEvent) => {
          this.handleNewMessage(event.data);
        },
        onError: (error: Event) => {
          console.error('SSE错误:', error);
          this.$message.error('SSE连接错误');
        }
      });
      // 监听自定义事件[8](@ref)
      sseService.addEventListener('logs', (event: MessageEvent) => {
        console.log(event.data);
      });
    },
    // 新增
    handleSetupContract() {
      this.drawer.header = "新增";
      this.drawer.operation = "add";
      this.drawer.visible = true;
      this.getGitRepoList();
      this.getClusterList();
    },
    handleClickDelete(row: any) {
      this.confirm.visible = true;
    },
    handleClickExec(row) {

    },
    handleClickEdit(row:any) {
      this.formData = row;
      this.drawer.visible = true;
      this.drawer.header = row.jobName;
      this.drawer.operation = "edit";
      this.getGitRepoList();
      this.getClusterList();
    },
    onConfirmOk() {
      switch (this.confirm.operation) {
        case "delete":
          // 真实业务请发起请求
          this.confirm.visible = false;
          // 请求删除
          this.$request.delete("/monitor/delete", {
            params: {
              id: this.formData.id
            }
          }).then(res => {
            this.$message.success(res.data.msg);
          }).catch(err => {

          })
          break;
      }
    },
    onCancel() {
      this.drawer.visible = false;
      this.confirm.visible = false;
    },
    handleClose() {
      this.drawer.visible = false;
      this.confirm.visible = false;
      this.closeSSE();
    },
    resetIdx() {
      this.deleteIdx = -1;
    },
    onReset() {
    },
    onSubmit() {
      this.page();
    },
    // 创建job
    handleDrawerOk() {
      switch (this.drawer.operation) {
        case "add":
          this.$request.post("/devops/job/add", this.formData).then(res => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg);
              this.drawer.visible = false;
              this.page();
            } else {
              this.$message.error(res.data.msg);
            }
          }).catch((err) => {

          })
          break;
        case "edit":
          this.$request.put("/devops/job/edit", this.formData).then(res => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg);
              this.drawer.visible = false;
              this.page();
            } else {
              this.$message.error(res.data.msg);
            }
          })
          break;
      }

    },
    getTypeList() {
      this.$request.get("/monitor/typeList").then(res => {
        this.typeList = res.data.data
      }).catch((err) => {

      })
    },
    page() {
      this.dataLoading = true;
      this.$request.get('/devops/job/page', {
        params: this.searchForm
      }).then((res) => {
        if (res.data.code === 200) {
          this.data = res.data.rows;
          this.pagination.total = res.data.total
        }
      }).catch((e: Error) => {
        console.log(e);
      }).finally(() => {
        this.dataLoading = false;
      });
    },
    closeSSE() {
      sseService.close();
    },
  }
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
