// src/api/buildingMethod.js
import request from '@/utils/request';

// 1. 获取建筑方法列表
export function getBuildingMethodList(params) {
  return request({
    url: '/buildingMethod/list', // 后端接口路径
    method: 'get',
    params // GET请求参数（url拼接）
  });
}

// 2. 新增建筑方法
export function addBuildingMethod(data) {
  return request({
    url: '/buildingMethod/add',
    method: 'post',
    data // POST请求参数（请求体）
  });
}

// 3. 编辑建筑方法
export function editBuildingMethod(data) {
  return request({
    url: '/buildingMethod/edit',
    method: 'put',
    data
  });
}

// 4. 删除建筑方法
export function deleteBuildingMethod(id) {
  return request({
    url: `/buildingMethod/delete/${id}`, // 路径参数
    method: 'delete'
  });
}