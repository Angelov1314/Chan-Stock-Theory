@echo off
echo ========================================
echo 缠论技术分析系统 - PWA部署脚本
echo ========================================

echo.
echo 1. 检查Git状态...
git status

echo.
echo 2. 添加所有更改...
git add .

echo.
echo 3. 提交更改...
git commit -m "更新PWA版本 - 添加用户系统、关注列表、研究历史功能"

echo.
echo 4. 推送到GitHub...
git push origin main

echo.
echo 5. 部署完成！
echo.
echo PWA应用已部署到: https://angelov1314.github.io/Chan-Stock-Theory/
echo.
echo 新功能包括:
echo - 用户注册登录系统
echo - 股票关注列表管理
echo - 研究历史保存和查看
echo - 中文股票代码自动识别
echo - 响应式移动端界面
echo.
echo 请在手机浏览器中访问上述链接，然后点击"添加到主屏幕"安装PWA应用。
echo.
pause