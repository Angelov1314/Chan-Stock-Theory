#!/usr/bin/env python3
"""
生成PWA应用图标
"""
from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    """创建指定尺寸的应用图标"""
    # 创建图像
    img = Image.new('RGB', (size, size), color='#2c3e50')
    draw = ImageDraw.Draw(img)
    
    # 绘制背景圆形
    margin = size // 20
    draw.ellipse([margin, margin, size-margin, size-margin], fill='#34495e', outline='#ffffff', width=2)
    
    # 绘制图表线条
    center = size // 2
    line_width = max(2, size // 64)
    
    # 绘制上升趋势线
    points = []
    for i in range(5):
        x = center - size//4 + i * size//8
        y = center + size//6 - i * size//12
        points.append((x, y))
    
    if len(points) > 1:
        draw.line(points, fill='#ffffff', width=line_width)
    
    # 绘制数据点
    for point in points:
        draw.ellipse([point[0]-line_width, point[1]-line_width, 
                     point[0]+line_width, point[1]+line_width], 
                    fill='#ffffff')
    
    # 保存图像
    img.save(filename, 'PNG')
    print(f"✓ 生成图标: {filename} ({size}x{size})")

def main():
    """主函数"""
    print("生成PWA应用图标...")
    
    # 生成192x192图标
    create_icon(192, 'icon-192.png')
    
    # 生成512x512图标
    create_icon(512, 'icon-512.png')
    
    print("\n图标生成完成！")
    print("现在可以将 mobile-app 目录部署到Web服务器了。")

if __name__ == '__main__':
    try:
        main()
    except ImportError:
        print("错误: 需要安装 Pillow 库")
        print("请运行: pip install Pillow")
    except Exception as e:
        print(f"错误: {e}")
