<!--
<template>
    <section>
        &lt;!&ndash;工具条&ndash;&gt;
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.typeCode" placeholder="类别编码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="filters.typeName" placeholder="类别名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getList">查询</el-button>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                    <el-button type="primary" @click="clearSearchArea">清空</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        &lt;!&ndash;列表&ndash;&gt;
        <el-table stripe border :data="typeList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="150">
            </el-table-column>
            <el-table-column type="index" width="150">
            </el-table-column>
            <el-table-column prop="typeCode" label="编号" width="200" sortable>
            </el-table-column>
            <el-table-column prop="typeLevel" label="层级" width="100" sortable>
            </el-table-column>
            <el-table-column prop="typeName" label="标签名称" width="250" sortable>
            </el-table-column>
            <el-table-column prop="isEnable" label="状态" width="200" sortable>
            </el-table-column>
            <el-table-column label="操作" width="300">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        &lt;!&ndash;工具条&ndash;&gt;
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="10" :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        &lt;!&ndash;编辑界面&ndash;&gt;
        <el-dialog title="编辑" size = 'tiny' v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="80px" :rules="editAndAddFormRules" ref="editForm">
                <el-form-item label="类别编码" prop="typeCode">
                    <el-input v-model="editForm.typeCode" width="200" auto-complete="on" readonly></el-input>
                </el-form-item>
                <el-form-item label="类别名称" prop="typeName">
                    <el-input v-model="editForm.typeName" width="200" auto-complete="on"></el-input>
                </el-form-item>
                <el-form-item label="层级" prop="typeLevel">
                    <el-input v-model="editForm.typeLevel" auto-complete="on"></el-input>
                </el-form-item>
                <el-form-item label="是否固定资产" prop="isProperty">
                    <el-radio-group v-model="editForm.isProperty">
                        <el-radio class="radio" label="Y">是</el-radio>
                        <el-radio class="radio"  label="N">否</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="是否启用" prop="isEnable">
                    <el-radio-group v-model="addForm.isEnable">
                        <el-radio class="radio" label="Y">是</el-radio>
                        <el-radio class="radio" label="N">否</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">确认</el-button>
            </div>
        </el-dialog>

        &lt;!&ndash;新增界面&ndash;&gt;
        <el-dialog title="新增类别" size = 'tiny' v-model="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" label-width="80px" :rules="editAndAddFormRules" ref="addForm">
                <el-form-item label="类别编码">
                    <el-input v-model="addForm.typeCode"  auto-complete="on" readonly></el-input>
                </el-form-item>
                <el-form-item label="类别名称">
                    <el-input v-model="addForm.typeName" auto-complete="on"></el-input>
                </el-form-item>
                <el-form-item label="层级">
                    <el-input v-model="addForm.typeLevel" auto-complete="on"></el-input>
                </el-form-item>
                <el-form-item label="是否固定资产">
                    <el-radio-group v-model="addForm.isProperty">
                        <el-radio class="radio" label="Y">是</el-radio>
                        <el-radio class="radio" label="N">否</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="是否启用">
                    <el-radio-group v-model="addForm.isEnable">
                        <el-radio class="radio" label="Y">是</el-radio>
                        <el-radio class="radio" label="N">否</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">确认</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
    import util from '../../common/js/util'
    import { getTagList, deleteTagItem, batchDeleteTag, editTagItem, addTagItem } from '../../api/api';

    export default {
        data: function(){
            return{
                filters: {
                    typeCode: '',
                    typeName:'',
                },
                typeList: [],
                total: 0,
                page: 1,
                listLoading: false,
                sels: [],//列表选中列

                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editAndAddFormRules: {
                    isEnable:[
                        {required: true, message: '请选择', trigger: 'blur'}
                    ],
                    isProperty:[
                        {required: true, message: '请选择', trigger: 'blur'}
                    ],
                    typeName:[
                        {required: true, message: '请输入类别名称', trigger: 'blur'}
                    ],
                    typeLevel: [
                        { required: true, message: '请输入类别层级', trigger: 'blur' }
                    ]
                },
                //编辑界面数据
                editForm: {
                    "typeCode": 0,
                    "typeName": "",
                    "typeLevel": "",
                    "isProperty": "",
                    "isEnable": "",
                },

                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                //新增界面数据
                addForm: {
                    "typeCode": 0,
                    "typeName": "",
                    "typeLevel": "",
                    "isProperty": "",
                    "isEnable": "",
                }

            }
        },

        methods:{
            //换页
            handleCurrentChange(val) {
                this.page = val;
                this.getList();
            },
            //清除搜索框内容
            clearSearchArea(){
                this.filters.typeCode = '';
                this.filters.typeName = '';
                this.getList();
            },
            //获取类型定义列表
            getList() {
                let param = {
                    typeCode: this.filters.typeCode,
                    typeName: this.filters.typeNameg
                };
                this.listLoading = true;
                getTypeList(param).then((res) => {
                    this.typeList = res.data.data;
                    let status = {'Y':'启用','N':'禁用'};
                    for(var i = 0; i < this.typeList.length;i++){
                        this.typeList[i].isEnable = status[this.typeList[i].isEnable]
                    }
                    this.listLoading = false;
                });
            },

            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该类型吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = { typeCode: row.typeCode };
                    deleteTagItem(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getList();
                    });
                }).catch(() => {

                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;
                this.editLoading = false;
                let statusObj = {'启用':'Y', '禁用':'N'};
                this.editForm = Object.assign({}, row);
                this.editForm.isEnable = statusObj[this.editForm.isEnable];
            },
            //显示新增界面
            handleAdd: function () {
                this.addFormVisible = true;
                this.addLoading = false;
                this.addForm = {
                    "typeCode": 0,
                    "typeName": "",
                    "typeLevel": "",
                    "isEnable": "",
                    "isProperty": ""
                };
            },
            //编辑
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认修改吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            //NProgress.start();
                            let para = {
                                "tagCode": this.editForm.tagCode,
                                "tagName": this.editForm.tagName,
                                "tagType": this.editForm.tagType,
                                "tagDesc": this.editForm.tagDesc,
                                "creator": this.editForm.creator,
                                "isEnable": this.editForm.isEnable,
                                "itemCodes": this.editForm.itemCodes
                            };
                            editTagItem(para).then((res) => {
                                this.editLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '修改成功',
                                    type: 'success'
                                });
                                this.$refs['editForm'].resetFields();
                                this.editFormVisible = false;
                                this.getList();
                            });
                        });
                    }
                });
            },
            //新增
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认新增吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            //NProgress.start();
                            let para = {
                                "tagCode": '0',
                                "tagName": this.addForm.tagName,
                                "tagType": this.addForm.tagType,
                                "tagDesc": this.addForm.tagDesc,
                                "creator": this.addForm.creator,
                                "isEnable": this.addForm.isEnable,
                                "itemCodes": JSON.stringify([1,2,3])
                            };
                            addTagItem(para).then((res) => {
                                this.addLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '新增成功',
                                    type: 'success'
                                });
                                this.$refs['addForm'].resetFields();
                                this.addFormVisible = false;
                                this.getList();
                            });
                        });
                    }
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var codes = this.sels.map(item => item.tagCode);
                this.$confirm('确认删除选中标签吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = { tagCodes: codes };
                    batchDeleteTag(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getList();
                    });
                }).catch(() => {

                });
            }
        },
        mounted() {
            this.getList();
        }
    }

</script>

<style scoped>

</style>-->
<template>
    <section>
        main
    </section>
</template>

<script>
    export default {
    }

</script>

<style scoped>

</style>