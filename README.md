# 南湖技术地图 · Nanhu Tech Map

园区企业资源能力可视化平台。

## 功能

- **园区全览**：交互式地图，点击楼栋查看入驻企业
- **资源广场**：企业卡片列表，支持搜索与筛选
- **信息更新**：企业信息提交表单

## 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 技术栈

- React 18 + TypeScript
- React Router v6
- Lucide React（图标）
- Webpack 5 + Babel
- Tailwind CSS

## 目录结构

```
src/
├── App.tsx                  # 路由入口
├── index.tsx                # 应用挂载
├── components/
│   ├── Layout.tsx           # 顶部导航布局
│   ├── CompanyCard.tsx      # 企业卡片组件
│   ├── CompanyModal.tsx     # 企业详情弹窗
│   └── ConnectModal.tsx     # 对接申请弹窗
├── pages/
│   ├── MapPageNew.tsx       # 园区全览（地图页）
│   ├── ListPage.tsx         # 资源广场（列表页）
│   └── SubmitPage.tsx       # 信息更新（提交页）
├── data/
│   └── companyData.ts       # 企业数据
├── hooks/
│   └── useTheme.ts          # 主题 Hook
└── styles/
    └── index.css            # 全局样式
```

## 数据更新

企业数据在 `src/data/companyData.ts` 中维护，按需修改即可。
