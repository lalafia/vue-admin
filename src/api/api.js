import axios from 'axios';

var instance = axios.create({
    // baseURL: 'http://192.168.1.58'
    baseURL: 'http://192.168.2.56:8080/nerp'
})
instance.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

/*export const requestLogin = params => { return axios.post(`${base}/login`, params).then(res => res.data); };*/

export const getTagList = params => instance.get(`/goodsTag/findBy`, {params: params});
export const editTagItem = params => instance.post(`/goodsTag/update`, params);
export const deleteTagItem = params => instance.post(`/goodsTag/deleteByTagCode`, params);
export const batchDeleteTag = params => instance.post(`/goodsTag/BatchDeleteByTagCode`, params);
export const addTagItem = params => instance.post(`/goodsTag/insert`, params);

/*
export const getUserListPage = params => { return axios.get(`${base}/user/listpage`, { params: params }); };

export const removeUser = params => { return axios.get(`${base}/user/remove`, { params: params }); };

export const batchRemoveUser = params => { return axios.get(`${base}/user/batchremove`, { params: params }); };

export const editUser = params => { return axios.get(`${base}/user/edit`, { params: params }); };

export const addUser = params => { return axios.get(`${base}/user/add`, { params: params }); };*/
