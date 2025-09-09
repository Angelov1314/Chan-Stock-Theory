@echo off
echo 部署到GitHub Pages
echo ==================

echo.
echo 1. 检查Git状态...
git status

echo.
echo 2. 添加所有文件...
git add .

echo.
echo 3. 提交更改...
git commit -m "Deploy mobile app with PWA support"

echo.
echo 4. 推送到GitHub...
git push origin main

echo.
echo 5. 部署完成！
echo.
echo 访问地址: https://angelov1314.github.io/Chan-Stock-Theory/mobile-app/
echo.
echo 在手机上访问上述地址，然后：
echo 1. 点击浏览器菜单
echo 2. 选择"添加到主屏幕"
echo 3. 应用将安装到手机桌面
echo.
pause
