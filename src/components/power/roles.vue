<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',i1===0?'bdtop':'','vcenter']"
              v-for="(item1,i1) of scope.row.children"
              :key="i1"
            >
              <!-- 一级权限区域 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二三级权限区域 -->
              <el-col :span="19">
                <el-row
                  :class="[i2===0?'':'bdtop','vcenter']"
                  v-for="(item2,i2) of item1.children"
                  :key="i2"
                >
                  <!-- 二级 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3,i3) of item2.children"
                      :key="i3"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <!-- 按钮区域 -->
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRolesById(scope.row.id)"
            >删除</el-button>
            <!-- 分配权限按钮 -->
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 表单区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 表单区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形图 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defkeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表区域
      roleList: [],
      // 添加角色对话框的显示与隐藏
      addDialogVisible: false,
      // 添加角色的表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色的表单验证规则
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 编辑角色对话框的显示与隐藏
      editDialogVisible: false,
      // 编辑角色的表单数据
      editForm: {},
      // 编辑角色的表单验证规则
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 控制分配权限对话框显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点Id值数组
      defkeys: [],
      // 当前即将分配权限的id
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      // console.log(res)
      if (res.meta.status !== 200) { return this.$message.error('获取角色列表失败！') }
      this.roleList = res.data
      // console.log(this.roleList)
    },
    // 监听添加角色对话框关闭事件
    addDialogClosed () {
      // console.log(this)
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加新角色
    addRoles () {
      // console.log(this)
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        // console.log(res)
        if (res.meta.status !== 201) { return this.$message.error('添加角色失败') }
        this.$message.success('添加角色成功！')
        this.addDialogVisible = false
        this.getRolesList()
      })
    },
    // 展示编辑角色对话框
    async showEditDialog (id) {
      // console.log(id)
      const { data: res } = await this.$http.get(`roles/${id}`)
      // console.log(res)
      if (res.meta.status !== 200) { return this.$message.error('请求数据失败') }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听编辑角色对话框关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑角色并提交
    editDialogInfo () {
      this.$refs.editFormRef.validate(valid => {
        // console.log(valid)
        // console.log(this.editForm)
        if (!valid) return
        this.$http.put(`roles/${this.editForm.roleId}`, { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc })
        this.editDialogVisible = false
        this.getRolesList()
        this.$message.success('编辑角色成功！')
      })
    },
    // 删除角色
    async removeRolesById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') return
      const { data: res } = await this.$http.delete(`roles/${id}`)
      // console.log(res)
      if (res.meta.status !== 200) { return this.$message.error('删除角色失败') }
      this.$message.success('删除角色成功')
      this.getRolesList()
    },
    // 根据ID删除对应的权限
    async removeRightById (role, rightId) {
      const confirmRes = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(confirmRes)
      if (confirmRes !== 'confirm') { return this.$message.error('取消了删除！') }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) { return this.$message.error('删除权限失败') }
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) { return this.$message.error('获取权限列表数据失败') }
      // 把获取到的权限数据保存到data中
      this.rightsList = res.data
      // console.log(this.rightsList)
      this.getLeafKeys(role, this.defkeys)
      this.setRightDialogVisible = true
    },
    // 通过递归获取角色下所有三级权限的ID,保存到数组中
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限对话框关闭事件
    setRightDialogClosed () {
      this.defkeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      const key = [
        // 使用...展开运算符展开获得的数组
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(key)
      const idStr = key.join(',')
      // console.log(idStr)
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) { return this.$message.error('分配权限失败') }
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
