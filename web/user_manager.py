#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
用户管理系统
处理用户注册、登录、历史记录、关注列表等功能
"""

import os
import json
import hashlib
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import sqlite3
from contextlib import contextmanager

class UserManager:
    def __init__(self, db_path: str = "users.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """初始化数据库表"""
        with self.get_db_connection() as conn:
            cursor = conn.cursor()
            
            # 用户表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP,
                    is_active BOOLEAN DEFAULT 1
                )
            ''')
            
            # 研究历史表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS research_history (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    symbol TEXT NOT NULL,
                    start_date TEXT NOT NULL,
                    end_date TEXT NOT NULL,
                    timeframe TEXT NOT NULL,
                    analysis_data TEXT NOT NULL,
                    chart_data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # 关注列表表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS watchlists (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    symbol TEXT NOT NULL,
                    display_name TEXT,
                    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    UNIQUE(user_id, symbol)
                )
            ''')
            
            conn.commit()
    
    @contextmanager
    def get_db_connection(self):
        """获取数据库连接"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()
    
    def hash_password(self, password: str) -> str:
        """密码哈希"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def generate_user_id(self) -> str:
        """生成用户ID"""
        return str(uuid.uuid4())
    
    def register_user(self, username: str, email: str, password: str) -> Tuple[bool, str]:
        """用户注册"""
        try:
            user_id = self.generate_user_id()
            password_hash = self.hash_password(password)
            
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO users (id, username, email, password_hash)
                    VALUES (?, ?, ?, ?)
                ''', (user_id, username, email, password_hash))
                conn.commit()
            
            return True, "注册成功"
        except sqlite3.IntegrityError as e:
            if "username" in str(e):
                return False, "用户名已存在"
            elif "email" in str(e):
                return False, "邮箱已存在"
            else:
                return False, "注册失败"
        except Exception as e:
            return False, f"注册失败: {str(e)}"
    
    def authenticate_user(self, username: str, password: str) -> Tuple[Optional[str], str]:
        """用户认证"""
        try:
            password_hash = self.hash_password(password)
            
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT id, username, password_hash FROM users 
                    WHERE (username = ? OR email = ?) AND password_hash = ? AND is_active = 1
                ''', (username, username, password_hash))
                
                user = cursor.fetchone()
                if user:
                    # 更新最后登录时间
                    cursor.execute('''
                        UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
                    ''', (user['id'],))
                    conn.commit()
                    return user['id'], "登录成功"
                else:
                    return None, "用户名或密码错误"
        except Exception as e:
            return None, f"认证失败: {str(e)}"
    
    def get_user_info(self, user_id: str) -> Optional[Dict]:
        """获取用户信息"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT id, username, email, created_at, last_login 
                    FROM users WHERE id = ? AND is_active = 1
                ''', (user_id,))
                
                user = cursor.fetchone()
                if user:
                    return dict(user)
                return None
        except Exception as e:
            print(f"获取用户信息失败: {str(e)}")
            return None
    
    def save_research_history(self, user_id: str, symbol: str, start_date: str, 
                            end_date: str, timeframe: str, analysis_data: Dict, 
                            chart_data: str = None) -> Tuple[bool, str]:
        """保存研究历史"""
        try:
            history_id = str(uuid.uuid4())
            
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO research_history 
                    (id, user_id, symbol, start_date, end_date, timeframe, analysis_data, chart_data)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (history_id, user_id, symbol, start_date, end_date, 
                     timeframe, json.dumps(analysis_data), chart_data))
                conn.commit()
            
            return True, "历史记录保存成功"
        except Exception as e:
            return False, f"保存失败: {str(e)}"
    
    def get_research_history(self, user_id: str, limit: int = 50) -> List[Dict]:
        """获取研究历史"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT id, symbol, start_date, end_date, timeframe, 
                           analysis_data, chart_data, created_at
                    FROM research_history 
                    WHERE user_id = ? 
                    ORDER BY created_at DESC 
                    LIMIT ?
                ''', (user_id, limit))
                
                history = []
                for row in cursor.fetchall():
                    history.append({
                        'id': row['id'],
                        'symbol': row['symbol'],
                        'start_date': row['start_date'],
                        'end_date': row['end_date'],
                        'timeframe': row['timeframe'],
                        'analysis_data': json.loads(row['analysis_data']),
                        'chart_data': row['chart_data'],
                        'created_at': row['created_at']
                    })
                return history
        except Exception as e:
            print(f"获取历史记录失败: {str(e)}")
            return []
    
    def add_to_watchlist(self, user_id: str, symbol: str, display_name: str = None) -> Tuple[bool, str]:
        """添加到关注列表"""
        try:
            watchlist_id = str(uuid.uuid4())
            if not display_name:
                display_name = symbol
            
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT OR REPLACE INTO watchlists 
                    (id, user_id, symbol, display_name)
                    VALUES (?, ?, ?, ?)
                ''', (watchlist_id, user_id, symbol, display_name))
                conn.commit()
            
            return True, "已添加到关注列表"
        except Exception as e:
            return False, f"添加失败: {str(e)}"
    
    def remove_from_watchlist(self, user_id: str, symbol: str) -> Tuple[bool, str]:
        """从关注列表移除"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    DELETE FROM watchlists WHERE user_id = ? AND symbol = ?
                ''', (user_id, symbol))
                conn.commit()
            
            return True, "已从关注列表移除"
        except Exception as e:
            return False, f"移除失败: {str(e)}"
    
    def get_watchlist(self, user_id: str) -> List[Dict]:
        """获取关注列表"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT symbol, display_name, added_at
                    FROM watchlists 
                    WHERE user_id = ? 
                    ORDER BY added_at DESC
                ''', (user_id,))
                
                watchlist = []
                for row in cursor.fetchall():
                    watchlist.append({
                        'symbol': row['symbol'],
                        'display_name': row['display_name'],
                        'added_at': row['added_at']
                    })
                return watchlist
        except Exception as e:
            print(f"获取关注列表失败: {str(e)}")
            return []
    
    def delete_research_history(self, user_id: str, history_id: str) -> Tuple[bool, str]:
        """删除研究历史"""
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    DELETE FROM research_history 
                    WHERE id = ? AND user_id = ?
                ''', (history_id, user_id))
                conn.commit()
            
            return True, "历史记录已删除"
        except Exception as e:
            return False, f"删除失败: {str(e)}"

# 全局用户管理器实例
user_manager = UserManager()
