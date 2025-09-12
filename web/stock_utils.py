#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
股票工具函数
处理股票代码格式化、中文股票后缀添加等功能
"""

import re
from typing import Tuple, List, Dict

class StockUtils:
    def __init__(self):
        # 上海证券交易所股票代码模式
        self.sh_patterns = [
            r'^60\d{4}$',  # 主板
            r'^68\d{4}$',  # 科创板
            r'^90\d{4}$',  # B股
        ]
        
        # 深圳证券交易所股票代码模式
        self.sz_patterns = [
            r'^00\d{4}$',  # 主板
            r'^30\d{4}$',  # 创业板
            r'^20\d{4}$',  # B股
            r'^15\d{4}$',  # 基金
            r'^16\d{4}$',  # 基金
            r'^18\d{4}$',  # 基金
        ]
        
        # 常见股票代码映射
        self.stock_mappings = {
            # 知名A股
            '平安银行': '000001.SZ',
            '万科A': '000002.SZ',
            '中国平安': '601318.SH',
            '贵州茅台': '600519.SH',
            '招商银行': '600036.SH',
            '五粮液': '000858.SZ',
            '比亚迪': '002594.SZ',
            '宁德时代': '300750.SZ',
            '腾讯控股': '00700.HK',
            '阿里巴巴': '09988.HK',
            '美团': '03690.HK',
            '小米集团': '01810.HK',
            
            # 美股常见
            '苹果': 'AAPL',
            '微软': 'MSFT',
            '谷歌': 'GOOGL',
            '亚马逊': 'AMZN',
            '特斯拉': 'TSLA',
            '英伟达': 'NVDA',
            'Meta': 'META',
            '奈飞': 'NFLX',
        }
    
    def is_chinese_stock_code(self, symbol: str) -> bool:
        """判断是否为中文股票代码"""
        # 移除可能的.SH/.SZ后缀
        clean_symbol = symbol.upper().replace('.SH', '').replace('.SZ', '')
        
        # 检查是否为纯数字6位代码
        if re.match(r'^\d{6}$', clean_symbol):
            return True
        
        # 检查是否匹配已知的中文股票代码模式
        for pattern in self.sh_patterns + self.sz_patterns:
            if re.match(pattern, clean_symbol):
                return True
        
        return False
    
    def get_exchange_suffix(self, symbol: str) -> str:
        """获取股票代码对应的交易所后缀"""
        clean_symbol = symbol.upper().replace('.SH', '').replace('.SZ', '')
        
        # 检查上海证券交易所
        for pattern in self.sh_patterns:
            if re.match(pattern, clean_symbol):
                return '.SH'
        
        # 检查深圳证券交易所
        for pattern in self.sz_patterns:
            if re.match(pattern, clean_symbol):
                return '.SZ'
        
        return ''
    
    def format_chinese_stock(self, symbol: str) -> str:
        """格式化中文股票代码，自动添加后缀"""
        if not symbol:
            return symbol
        
        # 如果已经有后缀，直接返回
        if '.SH' in symbol.upper() or '.SZ' in symbol.upper():
            return symbol.upper()
        
        # 检查是否为中文股票代码
        if self.is_chinese_stock_code(symbol):
            suffix = self.get_exchange_suffix(symbol)
            if suffix:
                return f"{symbol.upper()}{suffix}"
        
        return symbol.upper()
    
    def get_stock_info(self, symbol: str) -> Dict:
        """获取股票信息"""
        formatted_symbol = self.format_chinese_stock(symbol)
        
        info = {
            'original': symbol,
            'formatted': formatted_symbol,
            'is_chinese': self.is_chinese_stock_code(symbol),
            'exchange': self.get_exchange_suffix(symbol),
            'display_name': symbol
        }
        
        # 检查是否有中文名称映射
        for chinese_name, code in self.stock_mappings.items():
            if symbol.upper() == code.upper():
                info['display_name'] = f"{chinese_name} ({code})"
                break
        
        return info
    
    def search_stocks(self, query: str) -> List[Dict]:
        """搜索股票"""
        results = []
        query_upper = query.upper()
        
        # 搜索中文名称
        for chinese_name, code in self.stock_mappings.items():
            if query_upper in chinese_name.upper() or query_upper in code.upper():
                results.append({
                    'symbol': code,
                    'display_name': f"{chinese_name} ({code})",
                    'type': 'mapped'
                })
        
        # 如果输入的是纯数字，尝试格式化
        if re.match(r'^\d{6}$', query):
            formatted = self.format_chinese_stock(query)
            if formatted != query:
                results.append({
                    'symbol': formatted,
                    'display_name': f"{query} ({formatted})",
                    'type': 'formatted'
                })
        
        return results
    
    def validate_symbol(self, symbol: str) -> Tuple[bool, str]:
        """验证股票代码格式"""
        if not symbol or not symbol.strip():
            return False, "股票代码不能为空"
        
        symbol = symbol.strip().upper()
        
        # 检查是否包含特殊字符
        if not re.match(r'^[A-Z0-9\.]+$', symbol):
            return False, "股票代码格式不正确"
        
        # 检查长度
        if len(symbol) < 1 or len(symbol) > 20:
            return False, "股票代码长度不正确"
        
        return True, "格式正确"

# 全局股票工具实例
stock_utils = StockUtils()
