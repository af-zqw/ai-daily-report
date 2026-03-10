# 🤖 AI Daily Report

自动生成的 AI 技术日报，每天 8:00 (北京时间) 自动更新。

## 🌐 在线访问

https://af-zqw.github.io/ai-daily-report/

## 📋 内容来源

- **AI/ML** - 最新人工智能进展
- **前端开发** - 前端技术动态
- **后端/架构** - 系统架构设计
- **开源项目** - GitHub 热门项目

## 🛠️ 技术栈

- **TypeScript + Node.js**
- **Tavily API** - 新闻搜索
- **DeepSeek API** - AI 摘要与翻译
- **GitHub Actions** - 定时任务与部署

## 🚀 本地开发

```bash
# 安装依赖
npm install

# 设置环境变量
export TAVILY_API_KEY=your_key
export DEEPSEEK_API_KEY=your_key

# 运行完整流程
npm run daily

# 或分步运行
npm run collect      # 收集新闻
npm run generate     # AI 处理
npm run build:site   # 生成网站
```

## 📁 目录结构

```
.
├── .github/workflows/daily.yml  # GitHub Actions 配置
├── src/
│   ├── collector.ts             # 新闻收集
│   ├── generator.ts             # AI 处理
│   └── builder.ts               # 网站生成
├── docs/                        # 生成的网站 (GitHub Pages)
├── data/                        # 临时数据
└── templates/                   # HTML 模板
```

## 📝 License

MIT