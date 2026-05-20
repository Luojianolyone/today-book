# Today Book — 个人综合管理系统

一个本地搭建的个人综合管理网站，包含日记、复盘、物品统计、财务记账四大功能模块。

## 技术栈

- **后端**：Python FastAPI + SQLAlchemy + SQLite
- **前端**：React + TypeScript + TailwindCSS
- **部署**：Docker Compose

## 功能模块

| 模块 | 功能 |
|------|------|
| 📝 日记 | Markdown 编辑、日历视图、心情/天气标签、每日一篇 |
| 🔄 复盘 | 周/月/年复盘模板、完成事项/挑战/计划、完成率统计 |
| 📦 物品 | CRUD、多级分类/位置、购买价格/价值、资产编号 |
| 💰 财务 | 收支记账、多级分类、多账户、预算追踪、月度报表 |
| 📊 仪表盘 | 各模块数据汇总、快捷入口 |

## 快速启动

### 方式一：Docker（推荐）

```bash
git clone <repo-url>
cd today_book
docker-compose up -d
```

访问 http://localhost

### 方式二：本地开发

**后端：**
```bash
cd backend
pip install -r requirements.txt
python -m app.main
# API: http://localhost:8000
# 文档: http://localhost:8000/docs
# 前端代理已配置 /api → http://localhost:8000
```

**前端：**
```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

## 项目结构

```
today_book/
├── backend/          # FastAPI 后端
│   ├── app/
│   │   ├── api/v1/   # API 路由
│   │   ├── models/   # SQLAlchemy 模型
│   │   ├── schemas/  # Pydantic 模型
│   │   └── utils/    # 工具函数
│   └── data/         # SQLite 数据库
├── frontend/         # React 前端
│   └── src/
│       ├── api/      # API 客户端
│       ├── components/ # 组件
│       ├── pages/    # 页面
│       └── stores/   # Zustand 状态
└── docker-compose.yml
```

## API 文档

启动后端后访问：http://localhost:8000/docs

## License

MIT
