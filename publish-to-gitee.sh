#!/bin/bash

# Gitee发布脚本
echo "🚀 AI-Hustler Gitee发布脚本"
echo "============================"

# 检查Git状态
echo "📋 检查Git状态..."
git status

# 添加Gitee远程仓库
echo "🔗 添加Gitee远程仓库..."
git remote add gitee https://gitee.com/ai-hustler/ai-hustler.git 2>/dev/null || echo "远程仓库可能已存在"

# 推送到Gitee
echo "📤 推送到Gitee..."
git push -u gitee main

if [ $? -eq 0 ]; then
    echo "🎉 Gitee发布成功！"
    echo "📍 仓库地址：https://gitee.com/ai-hustler/ai-hustler"
    echo ""
    echo "🎯 下一步建议："
    echo "1. 在Gitee项目页面完善信息"
    echo "2. 添加项目标签：AI, 赚钱, 副业, OpenClaw, 自动化"
    echo "3. 发布第一条动态介绍项目"
    echo "4. 分享到Gitee推荐项目"
else
    echo "❌ 推送失败，请检查："
    echo "1. Gitee仓库是否已创建"
    echo "2. 远程仓库地址是否正确"
    echo "3. 网络连接是否正常"
fi