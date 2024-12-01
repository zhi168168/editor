# 小红书文案编辑器

## 1. 项目概述

这是一个基于 Web 的文案编辑器，主要用于管理和编辑小红书平台的文案内容。项目采用前后端分离架构，使用 Express 作为后端服务，前端使用原生 JavaScript 实现。

## 2. 技术栈

- 前端：HTML5, CSS3, 原生 JavaScript
- 后端：Node.js, Express
- 数据存储：文件系统 (JSON)
- 进程管理：PM2

## 3. 核心功能

### 3.1 文案管理

#### 创建文案
- 支持手动创建空白文案
- 支持批量导入标题创建文案
- 每个文案包含标题、内容和创建时间
- 新创建的文案会自动添加到列表顶部

#### 编辑文案
- 支持实时编辑标题和内容
- 编辑器支持富文本格式
- Tab 键快捷切换标题和内容编辑区
- 自动保存编辑内容

#### 删除文案
- 支持单个文案删除（剪切功能）
- 支持批量清空所有文案
- 删除的文案可以恢复（最近删除功能）
- 空文案会在切换时自动删除

### 3.2 话题管理

#### 话题导入
- 支持批量导入话题
- 话题格式：#话题名[话题]#
- 可以为所有文案统一添加话题
- 支持一次添加多个话题

#### 话题移除
- 支持一键移除所有文案的话题
- 保留原文案内容不变

### 3.3 数据同步

#### 服务器存储
- 所有操作实时同步到服务器
- 使用 JSON 文件持久化存储
- 支持服务器故障时本地存储备份
- 页面加载时自动从服务器获取最新数据

#### 本地存储
- 使用 localStorage 作为备份存储
- 服务器连接失败时自动使用本地数据
- 确保数据不会丢失

### 3.4 其他功能

#### 日志记录
- 记录重要操作日志
- 支持下载日志文件
- 包含操作时间和详细信息

#### 界面交互
- 响应式设计
- 动画效果（删除、添加等）
- 文案数量统计显示
- 未填写内容提醒

## 4. 文件结构 