# AI-Hustler

基于OpenClaw的AI工具包，提供套利发现、提示词生成、内容创作、任务聚合、项目分析和收入追踪功能。

![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)
![OpenAI](https://img.shields.io/badge/OpenAI-API-blue.svg)

## 功能
- `discover` - 发现AI可替代的高价服务
- `prompt-cash` - 生成各类场景的专业提示词  
- `content` - 批量生成社交媒体内容
- `annotation` - 聚合数据标注众包任务
- `analyze` - 分析AI项目机会和市场潜力
- `earnings` - 记录和统计收入数据

## 安装
```bash
git clone https://gitee.com/qiguoqing/ai-hustler.git
cd ai-hustler
npm install
echo "OPENAI_API_KEY=your-api-key" > .env
```

## 使用
```bash
ai-hustler discover      # 发现套利机会
ai-hustler prompt-cash   # 生成提示词
ai-hustler content       # 内容套利
ai-hustler annotation    # 数据标注
ai-hustler analyze       # 项目分析
ai-hustler earnings      # 收入追踪
ai-hustler interactive   # 交互模式
```

## 开源地址
- Gitee: https://gitee.com/qiguoqing/ai-hustler
- GitHub: https://github.com/qiguoqing/ai-hustler

## 技术栈
- Node.js ≥ 16.0.0
- OpenAI API
- OpenClaw ≥ 1.5.0