#!/bin/bash

# GitHub仓库创建和发布脚本
echo "🚀 AI-Hustler GitHub发布脚本"
echo "=============================="

# 检查GitHub CLI是否安装
if ! command -v gh &> /dev/null; then
    echo "❌ 请先安装GitHub CLI: https://cli.github.com/"
    exit 1
fi

# GitHub登录检查
echo "🔐 检查GitHub登录状态..."
gh auth status

if [ $? -ne 0 ]; then
    echo "❌ 请先登录GitHub: gh auth login"
    exit 1
fi

# 创建GitHub仓库
echo "📦 创建GitHub仓库..."
REPO_NAME="ai-hustler"
REPO_DESCRIPTION="🤖 AI赚钱黑客 - 用AI工具快速变现的终极技能包"
REPO_HOMEPAGE="https://github.com/your-username/ai-hustler"

gh repo create $REPO_NAME \
    --public \
    --description "$REPO_DESCRIPTION" \
    --homepage "$REPO_HOMEPAGE" \
    --enable-issues \
    --enable-wiki \
    --enable-discussions

if [ $? -eq 0 ]; then
    echo "✅ GitHub仓库创建成功！"
    
    # 添加远程仓库
    echo "🔗 添加远程仓库..."
    git remote add origin https://github.com/your-username/ai-hustler.git
    
    # 推送到GitHub
    echo "📤 推送到GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo "🎉 发布成功！"
        echo "📍 仓库地址：https://github.com/your-username/ai-hustler"
        echo ""
        echo "🎯 下一步建议："
        echo "1. 设置仓库Topics: ai, money, hustle, openclaw, automation"
        echo "2. 创建Release并添加标签"
        echo "3. 分享到技术社区"
        echo "4. 录制演示视频"
    else
        echo "❌ 推送失败，请检查网络连接"
    fi
else
    echo "❌ 仓库创建失败，请检查仓库名是否已存在"
fi