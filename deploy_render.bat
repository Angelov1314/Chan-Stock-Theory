@echo off
echo ========================================
echo 缠论技术分析系统 - Render后端部署脚本
echo ========================================

echo.
echo 1. 检查Git状态...
git status

echo.
echo 2. 添加所有更改...
git add .

echo.
echo 3. 提交更改...
git commit -m "更新后端API - 添加用户系统、关注列表、研究历史功能"

echo.
echo 4. 推送到GitHub...
git push origin main

echo.
echo 5. 部署完成！
echo.
echo 后端API已更新到Render: https://chan-stock-theory.onrender.com
echo.
echo 新功能包括:
echo - 用户注册登录API
echo - 股票关注列表API
echo - 研究历史保存API
echo - 中文股票代码自动识别
echo - 用户数据管理
echo.
echo 请等待Render自动部署完成（通常需要2-3分钟）
echo 然后测试PWA应用: https://angelov1314.github.io/Chan-Stock-Theory/
echo.
pause
