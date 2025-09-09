@echo off
echo 缠论技术分析系统 - 移动端部署脚本
echo =====================================

echo.
echo 1. 检查必要文件...
if not exist "index.html" (
    echo 错误: index.html 不存在
    pause
    exit /b 1
)
if not exist "manifest.json" (
    echo 错误: manifest.json 不存在
    pause
    exit /b 1
)
if not exist "sw.js" (
    echo 错误: sw.js 不存在
    pause
    exit /b 1
)

echo ✓ 必要文件检查完成

echo.
echo 2. 生成应用图标...
if not exist "icon-192.png" (
    echo 警告: icon-192.png 不存在，请手动生成
)
if not exist "icon-512.png" (
    echo 警告: icon-512.png 不存在，请手动生成
)

echo.
echo 3. 部署选项:
echo [1] 本地测试服务器
echo [2] 上传到GitHub Pages
echo [3] 上传到Netlify
echo [4] 仅显示部署说明

set /p choice="请选择部署方式 (1-4): "

if "%choice%"=="1" (
    echo.
    echo 启动本地测试服务器...
    python -m http.server 8080
) else if "%choice%"=="2" (
    echo.
    echo GitHub Pages 部署说明:
    echo 1. 将 mobile-app 目录内容上传到 GitHub 仓库
    echo 2. 在仓库设置中启用 GitHub Pages
    echo 3. 选择源分支为 main
    echo 4. 访问 https://你的用户名.github.io/仓库名
) else if "%choice%"=="3" (
    echo.
    echo Netlify 部署说明:
    echo 1. 访问 https://netlify.com
    echo 2. 注册/登录账户
    echo 3. 点击 "New site from Git"
    echo 4. 连接 GitHub 仓库
    echo 5. 设置构建命令为空
    echo 6. 设置发布目录为 mobile-app
    echo 7. 点击 "Deploy site"
) else if "%choice%"=="4" (
    echo.
    echo 部署说明:
    echo 1. 将 mobile-app 目录中的所有文件上传到支持HTTPS的Web服务器
    echo 2. 确保 manifest.json 和 sw.js 可以正常访问
    echo 3. 在手机浏览器中访问部署的URL
    echo 4. 点击浏览器菜单中的"添加到主屏幕"
    echo 5. 应用将作为PWA安装到手机桌面
) else (
    echo 无效选择
)

echo.
echo 部署完成！
pause
