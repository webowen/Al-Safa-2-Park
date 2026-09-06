# Cesium Core Package

这是一个最小化的 Cesium 核心包，保留了：

- Cesium Viewer 初始化
- globe / terrain / imagery
- camera / mouse rotate / pan / zoom
- 基础 3D 场景渲染
- 可直接扩展到迪拜公园项目

适合你复制到新工程后，再删掉不需要的 UI 和酒店业务代码。

## 说明

你可以把这个目录看成“底层骨架包”，后续再按你的公园场景替换：

- 删除酒店 UI
- 删除酒店运营数据
- 替换为 SU / 3D Tiles 模型
- 补充公园场景逻辑

## 启动

```bash
npm install
npm run dev
```

访问：

```text
http://localhost:5173/
```
