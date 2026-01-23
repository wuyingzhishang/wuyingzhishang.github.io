# 聚合工具箱

一个功能强大的在线工具集合，提供二维码生成、油价查询、汇率转换、文本处理等实用功能。

## 功能特性

### 📱 二维码生成
- 支持网址、文本内容转换为二维码
- 多种尺寸选择（150px/200px/300px/400px）
- 一键下载生成的二维码图片
- 无跨域限制，生成速度快

### ⛽ 油价查询
- 支持全国各地区的实时油价查询
- 提供92号、95号、98号汽油和0号柴油价格
- 热门地区快速选择
- 实时更新油价信息

### 💱 汇率转换
- 实时加密货币价格查询（USDT、TRX）
- 国际金额快速转换（K/M/B单位）
- 多API数据源保障，确保数据可靠性
- 自动轮询更新机制

### 🌐 代理 IP
- 获取高质量免费代理 IP 地址
- 支持多协议：HTTP、HTTPS、SOCKS4、SOCKS5
- 按国家/地区筛选代理
- 批量提取（1-50个）
- 一键复制全部代理

### 🔍 IP 查询
- 查看当前 IP 地址详细信息
- **6级质量评估体系**：优秀、良好、中等、较差、差劲、极差
- IP 类型识别：住宅 IP、广播 IP、机房 IP
- 欺诈风险评分 (Fraud Score)
- ASN 运营商信息
- 响应延迟检测
- 一键复制检测报告
- 基于 IPPure API

### 📝 文本处理
- 灵活的文本格式转换
- 支持自定义源格式和目标格式
- 智能后缀添加功能
- 批量文本处理
- 一键复制处理结果
- 自动识别分隔符（支持复杂分隔符如 `----|----`）
- 实时行数统计
- 独立清空输入功能
- 处理状态指示器

## 技术栈

- **前端框架**: 原生 HTML5、CSS3、JavaScript (ES6+)
- **数据来源**:
  - 二维码生成 API (api.lykep.com)
  - 油价查询 API (api.nxvav.cn)
  - 代理 IP API (proxy.scdn.io)
  - IP 信息 API (IPPure - my.ippure.com)
  - Binance Exchange API
  - CoinGecko API
  - Frankfurter Central Bank API
- **设计风格**: 科技极客风格，软暗色主题

## 项目结构

```
wuyingzhishang.github.io/
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # JavaScript 逻辑
└── README.md           # 项目说明文档
```

## 使用方法

### 本地运行

1. 克隆仓库
```bash
git clone https://github.com/wuyingzhishang/wuyingzhishang.github.io.git
```

2. 进入项目目录
```bash
cd wuyingzhishang.github.io
```

3. 启动本地服务器
```bash
python -m http.server 8000
```

4. 在浏览器中打开
```
http://localhost:8000
```

### 在线访问

直接访问：https://wuyingzhishang.github.io/

## 功能说明

### 油价查询
1. 在搜索框中输入地区名称
2. 点击"查询"按钮或选择热门地区
3. 查看该地区的实时油价信息

### 汇率转换
1. 查看实时加密货币价格（USDT、TRX）
2. 输入金额和选择单位（K/M/B）
3. 自动显示转换结果

### 文本处理
1. 设置源文本格式和目标格式
2. 输入要处理的文本（每行一个）
3. 配置是否添加后缀及后缀数字
4. 点击"处理文本"按钮
5. 复制或清空处理结果

## 特色功能

- **多API回退机制**: 汇率数据采用多API源，确保服务稳定性
- **响应式设计**: 完美适配桌面端和移动端，移动端优化触摸体验
- **实时更新**: 油价、汇率数据实时更新
- **用户体验**: 加载动画、错误提示、快捷操作、平滑过渡
- **社交分享**: 支持复制网址、添加到主屏幕、生成分享图
- **现代化UI**: 采用最新的设计语言，提供优雅的视觉体验

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge
- 其他现代浏览器

## 开发说明

### 代码规范
- 遵循 DRY 原则（Don't Repeat Yourself）
- 保持代码简洁明了（KISS 原则）
- 使用描述性的变量和函数名
- 为复杂逻辑添加注释

### 设计原则
- **可测试性**: 组件保持单一职责
- **代码简洁**: 避免不必要的复杂性
- **风格一致**: 遵循项目代码约定
- **异常处理**: 正确处理边缘情况和错误

## 部署

本项目使用 GitHub Pages 进行部署，自动从 `main` 分支构建和发布。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 版本历史

### v2.2.0 (2026-01-23)
- 🔍 新增 IP 查询功能（基于 IPPure API）
- 🌐 新增代理 IP 提取功能
- 📊 6级 IP 质量评估体系
- ⚡ 响应延迟检测
- 📋 一键复制 IP 检测报告
- 🏠 IP 类型识别（住宅/广播/机房）

### v2.1.0 (2026-01-22)
- 📱 新增二维码生成功能
- 🔗 支持网址/文本转二维码
- ⬇️ 支持一键下载二维码图片
- 🎨 UI 优化与调整

### v2.0.0 (2026-01-05)
- 🎨 全新UI设计，采用现代化设计语言
- 🗑️ 移除抖音热点功能
- ✨ 优化视觉体验，提升用户交互
- 📱 改进移动端适配
- 🔧 优化代码结构和性能

### v1.0.0 (2026-01-02)
- 初始版本发布
- 实现油价查询功能
- 实现汇率转换功能
- 实现文本处理功能
- 添加社交分享功能
- 优化用户体验和界面设计

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- **GitHub**: [wuyingzhishang](https://github.com/wuyingzhishang)
- **项目地址**: https://github.com/wuyingzhishang/wuyingzhishang.github.io
- **在线演示**: https://wuyingzhishang.github.io/

## 致谢

感谢所有为这个项目做出贡献的开发者！

---

**注意**:
- 油价信息仅供参考，实际价格以加油站为准
- 汇率数据由第三方API提供，可能存在延迟
- 所有API服务均来自第三方，请以官方数据为准
