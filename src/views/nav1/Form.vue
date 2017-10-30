<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.tagCode" placeholder="标签ID"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.tagName" placeholder="标签名称"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.tagType" placeholder="标签类型"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getList">查询</el-button>
					<el-button type="primary" @click="handleAdd">新增</el-button>
					<el-button type="primary" @click="clearSearchArea">清空</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table stripe :data="labelList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="150">
			</el-table-column>
			<el-table-column type="index" width="150">
			</el-table-column>
			<el-table-column prop="tagCode" label="标签ID" width="150" sortable>
			</el-table-column>
			<el-table-column prop="tagName" label="标签名称" width="250" sortable>
			</el-table-column>
			<el-table-column prop="tagType" label="标签类型" width="200" sortable>
			</el-table-column>
			<el-table-column prop="isEnable" label="状态" width="200" sortable>
			</el-table-column>
			<el-table-column prop="updateTime" label="修改时间" min-width="200" sortable>
			</el-table-column>
			<el-table-column label="操作" width="300">
				<template scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="10" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" size = 'tiny' v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="标签ID" prop="tagCode">
					<el-input v-model="editForm.tagCode" width="200" auto-complete="off" readonly></el-input>
				</el-form-item>
				<el-form-item label="标签名称" prop="tagName">
					<el-input v-model="editForm.tagName" width="200" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="标签类型" prop="tagType">
					<el-input v-model="editForm.tagType" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="状态" prop="isEnable">
					<el-radio-group v-model="editForm.isEnable">
						<el-radio class="radio" label="Y">启用</el-radio>
						<el-radio class="radio"  label="N">禁用</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">确认</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增标签" size = 'tiny' v-model="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="标签ID">
					<el-input v-model="addForm.tagCode"  auto-complete="off" readonly></el-input>
				</el-form-item>
				<el-form-item label="标签名称">
					<el-input v-model="addForm.tagName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="标签类型">
					<el-select v-model="addForm.tagType" filterable placeholder="请选择">
						<el-option
								v-for="item in options"
								:key="item.value"
								:label="item.label"
								:value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="状态">
					<el-radio-group v-model="addForm.isEnable">
						<el-radio class="radio" label="Y">启用</el-radio>
						<el-radio class="radio" label="N">禁用</el-radio>
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
    //import NProgress from 'nprogress'
    import { getTagList, deleteTagItem, batchDeleteTag, editTagItem, addTagItem } from '../../api/api';

    export default {
        data: function() {
            return {
                filters: {
                    tagCode: '',
                    tagName:'',
                    tagType:''
                },
                options: [{
                    value: '选项1',
                    label: '黄金糕'
                }, {
                    value: '选项2',
                    label: '双皮奶'
                }, {
                    value: '选项3',
                    label: '蚵仔煎'
                }],
                labelList: [],
                total: 0,
                page: 1,
                listLoading: false,
                sels: [],//列表选中列

                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    isEnable:[
                        {required: true, message: '请选择状态', trigger: 'blur'}
                    ],
                    tagName:[
                        {required: true, message: '请输入标签名称', trigger: 'blur'}
                    ],
                    tagType: [
                        { required: true, message: '请输入标签类型', trigger: 'blur' }
                    ]
                },
                //编辑界面数据
                editForm: {
                    "tagCode": 0,
                    "tagName": "",
                    "tagType": "",
                    "tagDesc": "",
                    "creator": "",
                    "isEnable": "",
                    "itemCodes": ""
                },

                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    tagType: [
                        { required: true, message: '请输入标签类型', trigger: 'blur' }
                    ],
                    tagName: [
                        { required: true, message: '请输入标签名称', trigger: 'blur' }
                    ],
                    isEnable:[
                        {required: true, message: '请选择状态', trigger: 'blur'}
                    ]
                },
                //新增界面数据
                addForm: {
                    "tagCode":'0',
                    "tagName": "",
                    "tagType": "",
                    "tagDesc": "",
                    "creator": "",
                    "isEnable": "",
                    "itemCodes": ""
                }

            }
        },
        methods: {
            //性别显示转换
			/*formatSex: function (row, column) {
			 return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
			 },*/
            handleCurrentChange(val) {
                this.page = val;
                this.getList();
            },
            clearSearchArea(){
                this.filters.tagCode = '';
                this.filters.tagType = '';
                this.filters.tagName = '';
                this.getList();
            },
            //获取标签列表
            getList() {
                let param = {
                    tagCode: this.filters.tagCode,
                    tagType: this.filters.tagType,
					tagName: this.filters.tagNameg
                };
                console.log(param)
                this.listLoading = true;
                //NProgress.start();
                getTagList(param).then((res) => {
					this.labelList = res.data.data;
					let status = {'Y':'启用','N':'禁用'};
					for(var i = 0; i < this.labelList.length;i++){
						this.labelList[i].isEnable = status[this.labelList[i].isEnable]
					}
                    this.listLoading = false;
                    //NProgress.done();
                });
            },

            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该标签吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = { tagCode: row.tagCode };
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
                    "tagCode": 0,
                    "tagName": "",
                    "tagType": "",
                    "tagDesc": "",
                    "creator": "",
                    "isEnable": 'Y',
                    "itemCodes": ""
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

</style>