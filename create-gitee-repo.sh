#!/bin/bash

# Gitee仓库创建脚本
echo "🚀 AI-Hustler Gitee仓库创建脚本"
echo "============================="

# 检查参数
if [ -z "$1" ]; then
    echo "❌ 请提供Gitee用户名"
    echo "用法: ./create-gitee-repo.sh 你的Gitee用户名"
    exit 1
fi

GITEE_USER=$1
REPO_NAME="ai-hustler"
REPO_DESC="🤖 AI赚钱黑客 - 用AI工具快速变现的终极技能包"

# 使用curl创建Gitee仓库（需要私人令牌）
echo "📦 正在创建Gitee仓库..."

# 注意：你需要先在Gitee设置中创建私人令牌
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  https://gitee.com/api/v5/user/repos \
  -d "{
    \"access_token\": \"YOUR_GITEE_TOKEN\",
    \"name\": \"$REPO_NAME\",
    \"description\": \"$REPO_DESC\",
    \"private\": false,
    \"auto_init\": true,
    \"license\": \"MIT\",
    \"language\": \"JavaScript\",
    \"has_issues\": true,
    \"has_wiki\": true,
    \"has_pull_requests\": true
  }"

if [ $? -eq 0 ]; then
    echo "✅ Gitee仓库创建成功！"
    echo "📍 仓库地址：https://gitee.com/$GITEE_USER/$REPO_NAME"
else
    echo "❌ 仓库创建失败，请检查："
    echo "1. 是否提供了正确的Gitee私人令牌"
    echo "2. 仓库名是否已存在"
    echo "3. 网络连接是否正常"
fi