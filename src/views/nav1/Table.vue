
<template>
	<section>
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.tagCode" placeholder="类型ID"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.tagType" placeholder="标签类型"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getList">查询</el-button>
					<el-button type="primary" @click="handleAdd">添加类别</el-button>
					<el-button type="primary" @click="clearSearchArea">清空</el-button>
				</el-form-item>
			</el-form>
		</el-col>
		<!--列表-->
		<el-table stripe :data="typeList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="150">
			</el-table-column>
			<el-table-column type="index" width="150">
			</el-table-column>
			<el-table-column prop="tagCode" label="标签ID" width="200" sortable>
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

		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>
        <!--编辑界面-->
		<el-dialog title="编辑" size = 'tiny' v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="标签ID" prop="tagCode">
					<el-input v-model="editForm.tagCode" width="200" auto-complete="off" readonly></el-input>
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
		<el-dialog title="新增标签类型" size = 'tiny' v-model="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="标签ID" prop="tagCode">
					<el-input v-model="addForm.tagCode" value='tagCode' auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="标签类型" prop="tagType">
					<el-input v-model="addForm.tagType" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="状态">
					<el-radio-group v-model="addForm.isEnable">
						<el-radio class="radio" :label="Y">启用</el-radio>
						<el-radio class="radio" :label="N">禁用</el-radio>
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
	import { getTypeList, removeUser, batchRemoveUser, editTagItem, addUser } from '../../api/api';

	export default {
		data() {
			return {
				filters: {
					tagCode: '',
					tagType:'',
				},
				typeList: [],
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
                    tagType: [
                        { required: true, message: '请输入标签类型', trigger: 'blur' }
                    ]
				},
				//编辑界面数据
				editForm: {
                    "tagCode": '0',
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
			    this.filters.tagCode = ''
				this.filters.tagType = ''
				this.getList();
			},
			//获取类型定义列表
			getList() {
				let param = {
					tagCode: this.filters.tagCode,
					tagType: this.filters.tagType
				};
				console.log(param)
				this.listLoading = true;
				//NProgress.start();
				getTypeList(param).then((res) => {
				    console.log(res)
					if(res.data.status == 200){
				        this.typeList = res.data.data;
				        let status = {'Y':'启用','N':'禁用'};
				        for(var i = 0; i < this.typeList.length;i++){
				            this.typeList[i].isEnable = status[this.typeList[i].isEnable]
						}
					}
					this.msg = res.msg;
					this.listLoading = false;
					//NProgress.done();
				});
			},
			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { id: row.id };
					removeUser(para).then((res) => {
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
				let statusObj = {'启用':'Y', '禁用':'N'};
				this.editForm = Object.assign({}, row);
				this.editForm.isEnable = statusObj[this.editForm.isEnable];
				console.log(this.editForm)
			},
			//显示新增界面
			handleAdd: function () {
				this.addFormVisible = true;
				this.addForm = {
					tagId: '',
					sex: -1,
					age: 0,
					birth: '',
					addr: ''
				};
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.editForm);
							editTagItem(para).then((res) => {
								this.editLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
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
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.addLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.addForm);
							para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
							addUser(para).then((res) => {
								this.addLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
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
				var ids = this.sels.map(item => item.id).toString();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { ids: ids };
					batchRemoveUser(para).then((res) => {
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

