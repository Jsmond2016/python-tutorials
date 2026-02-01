# 第16章：WebSocket 实时通信

## 本章简介

欢迎来到实时通信的世界！作为前端开发者，你可能已经使用过 WebSocket 或 Socket.io 进行实时数据传输。Python 的 FastAPI 同样提供了强大的 WebSocket 支持。

本章将帮助你：
- 理解 WebSocket 协议的工作原理
- 掌握 FastAPI 的 WebSocket 实现
- 实现实时聊天功能
- 处理连接管理和断线重连

**学习目标**：
- 理解 WebSocket vs HTTP 的区别
- 实现 WebSocket 服务器
- 管理多个客户端连接
- 处理实时消息广播

---

## 目录

1. [WebSocket 基础](#websocket-基础)
2. [FastAPI WebSocket](#fastapi-websocket)
3. [聊天室实现](#聊天室实现)
4. [连接管理](#连接管理)
5. [练习题](#练习题)
6. [练习答案](#练习答案)

---

## 16.1 WebSocket 基础

### 什么是 WebSocket

WebSocket 是一种全双工通信协议，允许服务器主动向客户端推送消息。

### HTTP vs WebSocket

```
HTTP 请求-响应模型:
客户端 ──请求──> 服务器
客户端 <──响应── 服务器
（每次请求都需要重新建立连接）

WebSocket 全双工模型:
客户端 <──────> 服务器
（一次连接，持续双向通信）
```

### 对比表格

| 特性 | HTTP | WebSocket |
|------|------|-----------|
| 通信模式 | 半双工（请求-响应） | 全双工（双向） |
| 连接 | 短连接 | 长连接 |
| 服务器推送 | 轮询/SSE | 原生支持 |
| 开销 | 每次请求带 HTTP 头 | 握手后轻量级 |
| 适用场景 | RESTful API | 实时通信 |

### WebSocket 握手过程

```http
# 1. 客户端发起握手请求
GET /ws/chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

# 2. 服务器响应
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

# 3. 连接建立，开始双向通信
```

### JavaScript vs Python WebSocket

```javascript
// 前端: WebSocket API
const ws = new WebSocket('ws://localhost:8000/ws/chat');

ws.onopen = () => {
  console.log('已连接');
  ws.send(JSON.stringify({ message: 'Hello' }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到消息:', data.message);
};

ws.onerror = (error) => console.error('错误:', error);
ws.onclose = () => console.log('连接关闭');
```

```python
# Python: FastAPI WebSocket
from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()  # 接受连接
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"收到: {data}")
    except Exception as e:
        print(f"错误: {e}")
    finally:
        await websocket.close()
```

---

## 16.2 FastAPI WebSocket

### 基本使用

### 创建简单的 Echo 服务

```python
# main.py
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse

app = FastAPI()

# WebSocket 端点
@app.websocket("/ws/echo")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # 接收消息
            data = await websocket.receive_text()
            # 发送回显
            await websocket.send_text(f"Echo: {data}")
    except Exception as e:
        print(f"连接断开: {e}")
    finally:
        await websocket.close()

# 简单的测试页面
@app.get("/")
async def get():
    html = """
    <!DOCTYPE html>
    <html>
    <head><title>WebSocket 测试</title></head>
    <body>
        <h1>WebSocket Echo 测试</h1>
        <input id="message" type="text" placeholder="输入消息">
        <button onclick="send()">发送</button>
        <ul id="messages"></ul>
        <script>
            const ws = new WebSocket('ws://localhost:8000/ws/echo');
            ws.onmessage = (event) => {
                const li = document.createElement('li');
                li.textContent = event.data;
                document.getElementById('messages').appendChild(li);
            };
            function send() {
                const input = document.getElementById('message');
                ws.send(input.value);
                input.value = '';
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html)
```

**运行服务器**：
```bash
# 安装依赖
pip install fastapi uvicorn websockets

# 运行
uvicorn main:app --reload
```

### 接收和发送 JSON

```python
from fastapi import WebSocket
from pydantic import BaseModel
import json

class Message(BaseModel):
    type: str
    content: str
    user: str

@app.websocket("/ws/chat")
async def chat_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # 接收 JSON 数据
            data_json = await websocket.receive_text()
            message = Message(**json.loads(data_json))

            # 处理消息
            response = {
                "type": "message",
                "content": f"{message.user}: {message.content}",
                "timestamp": "2024-01-01T00:00:00Z"
            }

            # 发送 JSON 响应
            await websocket.send_json(response)
    except Exception as e:
        print(f"错误: {e}")
```

### 路径参数和查询参数

```python
from fastapi import WebSocket, Query

@app.websocket("/ws/rooms/{room_id}")
async def room_websocket(
    websocket: WebSocket,
    room_id: str,
    token: str = Query(...)
):
    await websocket.accept()

    # 验证 token
    if not validate_token(token):
        await websocket.close(code=1008, reason="Unauthorized")
        return

    # 加入房间
    await join_room(room_id, websocket)

    try:
        while True:
            data = await websocket.receive_text()
            await broadcast_to_room(room_id, data)
    finally:
        await leave_room(room_id, websocket)
```

### WebSocket 状态码

| 状态码 | 说明 |
|--------|------|
| 1000 | 正常关闭 |
| 1001 | 端点离开 |
| 1002 | 协议错误 |
| 1003 | 不支持的数据类型 |
| 1008 | 违反策略（未授权） |
| 1011 | 服务器错误 |

```python
# 主动关闭连接
await websocket.close(code=1000, reason="正常关闭")

# 拒绝连接
await websocket.close(code=1008, reason="Token 无效")
```

---

## 16.3 聊天室实现

### 单聊功能

```python
# chat.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict
import json

app = FastAPI()

# 存储连接: {user_id: websocket}
active_connections: Dict[str, WebSocket] = {}

class ConnectionManager:
    """连接管理器"""
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"用户 {user_id} 已连接")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"用户 {user_id} 已断开")

    async def send_personal(self, message: str, user_id: str):
        """发送私聊消息"""
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_text(message)

    async def broadcast(self, message: str):
        """广播消息给所有用户"""
        for connection in self.active_connections.values():
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/chat/{user_id}")
async def websocket_chat(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)

    # 通知其他人用户上线
    await manager.broadcast(json.dumps({
        "type": "system",
        "content": f"用户 {user_id} 上线了",
        "online_users": list(manager.active_connections.keys())
    }))

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            # 处理私聊
            if message.get("type") == "private":
                target_user = message.get("target")
                await manager.send_personal(json.dumps({
                    "type": "private",
                    "from": user_id,
                    "content": message.get("content")
                }), target_user)

            # 处理群聊广播
            elif message.get("type") == "broadcast":
                await manager.broadcast(json.dumps({
                    "type": "broadcast",
                    "from": user_id,
                    "content": message.get("content")
                }))

    except WebSocketDisconnect:
        manager.disconnect(user_id)
        await manager.broadcast(json.dumps({
            "type": "system",
            "content": f"用户 {user_id} 离线了",
            "online_users": list(manager.active_connections.keys())
        }))
```

### 群聊功能

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict, List

app = FastAPI()

# 房间管理: {room_id: [websocket1, websocket2, ...]}
rooms: Dict[str, List[WebSocket]] = {}

class RoomManager:
    """房间管理器"""
    def __init__(self):
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def join_room(self, room_id: str, websocket: WebSocket):
        """加入房间"""
        if room_id not in self.rooms:
            self.rooms[room_id] = []

        self.rooms[room_id].append(websocket)
        await websocket.send_text(f"已加入房间: {room_id}")

        # 通知房间其他人
        await self.broadcast_to_room(room_id, {
            "type": "system",
            "content": "有新成员加入房间"
        }, exclude=websocket)

    async def leave_room(self, room_id: str, websocket: WebSocket):
        """离开房间"""
        if room_id in self.rooms and websocket in self.rooms[room_id]:
            self.rooms[room_id].remove(websocket)

            # 通知房间其他人
            await self.broadcast_to_room(room_id, {
                "type": "system",
                "content": "有成员离开房间"
            })

            # 清理空房间
            if not self.rooms[room_id]:
                del self.rooms[room_id]

    async def broadcast_to_room(
        self,
        room_id: str,
        message: dict,
        exclude: WebSocket = None
    ):
        """向房间广播消息"""
        if room_id not in self.rooms:
            return

        for connection in self.rooms[room_id]:
            if connection != exclude:
                await connection.send_json(message)

    def get_room_users(self, room_id: str) -> int:
        """获取房间在线人数"""
        return len(self.rooms.get(room_id, []))

room_manager = RoomManager()

@app.websocket("/ws/room/{room_id}")
async def room_chat(websocket: WebSocket, room_id: str):
    await websocket.accept()
    await room_manager.join_room(room_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()

            # 广播消息到房间
            await room_manager.broadcast_to_room(room_id, {
                "type": "message",
                "room": room_id,
                "content": data.get("content"),
                "user": data.get("user"),
                "timestamp": data.get("timestamp")
            })

    except WebSocketDisconnect:
        await room_manager.leave_room(room_id, websocket)
```

### 消息持久化

```python
# models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String, index=True)
    user_id = Column(String, index=True)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# 在 WebSocket 处理中保存消息
async def save_message(room_id: str, user_id: str, content: str, db):
    message = ChatMessage(
        room_id=room_id,
        user_id=user_id,
        content=content
    )
    db.add(message)
    await db.commit()

# 获取历史消息
async def get_room_history(room_id: str, db, limit: int = 50):
    messages = db.query(ChatMessage)\
        .filter_by(room_id=room_id)\
        .order_by(ChatMessage.created_at.desc())\
        .limit(limit)\
        .all()
    return messages[::-1]  # 按时间正序返回
```

### 前端连接示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>聊天室</title>
    <style>
        .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .message.system { background: #f0f0f0; color: #666; }
        .message.private { background: #e3f2fd; }
        .message.broadcast { background: #f1f8e9; }
        #messages { height: 400px; overflow-y: scroll; border: 1px solid #ddd; padding: 10px; }
    </style>
</head>
<body>
    <h1>聊天室</h1>
    <div>
        <label>用户名: </label>
        <input id="username" type="text" value="Guest">
    </div>
    <div>
        <label>房间: </label>
        <input id="room" type="text" value="general">
    </div>
    <button onclick="joinRoom()">加入房间</button>
    <div id="messages"></div>
    <div>
        <input id="message" type="text" placeholder="输入消息">
        <button onclick="sendMessage()">发送</button>
    </div>

    <script>
        let ws = null;

        function joinRoom() {
            const username = document.getElementById('username').value;
            const room = document.getElementById('room').value;

            ws = new WebSocket(`ws://localhost:8000/ws/room/${room}?user=${username}`);

            ws.onopen = () => {
                addMessage('system', '已连接到服务器');
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                addMessage(data.type, data.content);
            };

            ws.onerror = (error) => {
                addMessage('system', '连接错误');
            };

            ws.onclose = () => {
                addMessage('system', '连接已关闭');
            };
        }

        function sendMessage() {
            const input = document.getElementById('message');
            const content = input.value;

            ws.send(JSON.stringify({
                type: 'message',
                content: content,
                user: document.getElementById('username').value,
                timestamp: new Date().toISOString()
            }));

            input.value = '';
        }

        function addMessage(type, content) {
            const div = document.createElement('div');
            div.className = `message ${type}`;
            div.textContent = content;
            document.getElementById('messages').appendChild(div);
            document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
        }

        // 回车发送
        document.getElementById('message').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    </script>
</body>
</html>
```

---

## 16.4 连接管理

### 心跳机制

```python
import asyncio
from datetime import datetime

@app.websocket("/ws/ping")
async def ping_websocket(websocket: WebSocket):
    await websocket.accept()

    # 心跳任务
    async def send_ping():
        while True:
            try:
                await asyncio.sleep(30)  # 每30秒发送一次
                await websocket.send_json({
                    "type": "ping",
                    "timestamp": datetime.now().isoformat()
                })
            except Exception:
                break

    ping_task = asyncio.create_task(send_ping())

    try:
        while True:
            data = await websocket.receive_json()

            # 响应客户端的 pong
            if data.get("type") == "pong":
                print(f"收到 pong: {data.get('timestamp')}")

            # 处理其他消息
            elif data.get("type") == "message":
                await websocket.send_json({
                    "type": "response",
                    "content": f"收到: {data.get('content')}"
                })

    except WebSocketDisconnect:
        ping_task.cancel()
        print("连接已断开")
```

### 断线重连

```python
# 前端实现自动重连
class WebSocketClient {
    constructor(url, options = {}) {
        this.url = url;
        this.reconnectInterval = options.reconnectInterval || 3000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
        this.reconnectAttempts = 0;
        this.connect();
    }

    connect() {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log('已连接');
            this.reconnectAttempts = 0;
            if (this.onOpen) this.onOpen();
        };

        this.ws.onmessage = (event) => {
            if (this.onMessage) this.onMessage(event);
        };

        this.ws.onerror = (error) => {
            console.error('错误:', error);
            if (this.onError) this.onError(error);
        };

        this.ws.onclose = () => {
            console.log('连接关闭');
            if (this.onClose) this.onClose();
            this.reconnect();
        };
    }

    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => this.connect(), this.reconnectInterval);
        } else {
            console.error('超过最大重连次数');
        }
    }

    send(data) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        } else {
            console.error('连接未建立');
        }
    }

    close() {
        this.reconnectAttempts = this.maxReconnectAttempts;  // 停止重连
        this.ws.close();
    }
}

// 使用
const client = new WebSocketClient('ws://localhost:8000/ws/chat', {
    reconnectInterval: 3000,
    maxReconnectAttempts: 10
});

client.onMessage = (event) => {
    console.log('收到消息:', event.data);
};
```

### 连接限制

```python
from fastapi import WebSocket, HTTPException
from collections import defaultdict
from datetime import datetime, timedelta

# 连接限制: {ip: [connection_times]}
connection_history = defaultdict(list)
MAX_CONNECTIONS_PER_MINUTE = 10

async def check_rate_limit(client_ip: str):
    """检查连接频率"""
    now = datetime.now()
    one_minute_ago = now - timedelta(minutes=1)

    # 清理旧记录
    connection_history[client_ip] = [
        t for t in connection_history[client_ip]
        if t > one_minute_ago
    ]

    # 检查频率
    if len(connection_history[client_ip]) >= MAX_CONNECTIONS_PER_MINUTE:
        raise HTTPException(
            status_code=429,
            detail="连接过于频繁，请稍后再试"
        )

    connection_history[client_ip].append(now)

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket, client_ip: str = Header(...)):
    # 检查频率限制
    try:
        await check_rate_limit(client_ip)
    except HTTPException as e:
        await websocket.close(code=1008, reason=e.detail)
        return

    await websocket.accept()
    # ... 其他处理
```

### 在线用户管理

```python
from typing import Dict, Set
from datetime import datetime

class OnlineUserManager:
    """在线用户管理器"""
    def __init__(self):
        # {room_id: {user_id: {websocket, last_active}}}
        self.rooms: Dict[str, Dict[str, dict]] = {}

    async def add_user(self, room_id: str, user_id: str, websocket: WebSocket):
        """用户上线"""
        if room_id not in self.rooms:
            self.rooms[room_id] = {}

        self.rooms[room_id][user_id] = {
            "websocket": websocket,
            "last_active": datetime.now()
        }

        await self.broadcast_online_users(room_id)

    async def remove_user(self, room_id: str, user_id: str):
        """用户下线"""
        if room_id in self.rooms and user_id in self.rooms[room_id]:
            del self.rooms[room_id][user_id]

            await self.broadcast_online_users(room_id)

    async def update_activity(self, room_id: str, user_id: str):
        """更新用户活动时间"""
        if room_id in self.rooms and user_id in self.rooms[room_id]:
            self.rooms[room_id][user_id]["last_active"] = datetime.now()

    def get_online_users(self, room_id: str) -> list:
        """获取在线用户列表"""
        if room_id not in self.rooms:
            return []
        return list(self.rooms[room_id].keys())

    async def broadcast_online_users(self, room_id: str):
        """广播在线用户列表"""
        users = self.get_online_users(room_id)
        for user_data in self.rooms.get(room_id, {}).values():
            await user_data["websocket"].send_json({
                "type": "online_users",
                "users": users
            })

online_manager = OnlineUserManager()
```

---

## 常见问题

### Q1: WebSocket 和 Server-Sent Events (SSE) 怎么选？

**A**: 对比一下：

| 特性 | WebSocket | SSE |
|------|-----------|-----|
| 方向 | 双向 | 服务器→客户端 |
| 协议 | ws:// | HTTP |
| 浏览器支持 | 现代浏览器 | 除 IE 外 |
| 断线重连 | 需要自己实现 | 自动 |
| 二进制数据 | 支持 | 仅文本 |

**选择建议**：
- 需要客户端→服务器通信 → WebSocket
- 只需要服务器推送 → SSE
- 简单的实时通知 → SSE

### Q2: 如何处理 WebSocket 连接数过多？

**A**: 几种方案：

1. **使用 Redis Pub/Sub**（分布式）
```python
import redis

redis_client = redis.Redis()

# 发布消息
await redis_client.publish(f"room:{room_id}", message_json)

# 订阅消息
pubsub = redis_client.pubsub()
await pubsub.subscribe(f"room:{room_id}")
async for message in pubsub.listen():
    await websocket.send_text(message['data'])
```

2. **连接池限制**
```python
MAX_CONNECTIONS = 1000
if len(manager.active_connections) >= MAX_CONNECTIONS:
    await websocket.close(code=1013, reason="服务器繁忙")
```

3. **负载均衡** - 使用 Nginx 分发连接到多个服务器

### Q3: 如何实现消息确认机制？

**A**: 添加消息 ID 和确认：

```python
import uuid
from typing import Dict

# 待确认消息: {message_id: message}
pending_messages: Dict[str, dict] = {}

# 发送消息时添加 ID
message_id = str(uuid.uuid4())
pending_messages[message_id] = {"content": content, "timestamp": now}

await websocket.send_json({
    "id": message_id,
    "content": content,
    "require_ack": True
})

# 接收确认
if data.get("type") == "ack":
    message_id = data.get("message_id")
    if message_id in pending_messages:
        del pending_messages[message_id]
        print(f"消息 {message_id} 已确认")
```

### Q4: 如何安全地处理用户认证？

**A**: 在握手时验证：

```python
from fastapi import WebSocket, Query
from jose import jwt, JWTError

async def get_current_user(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except JWTError:
        return None

@app.websocket("/ws/chat")
async def websocket_chat(
    websocket: WebSocket,
    token: str = Query(...)
):
    # 验证 Token
    user_id = await get_current_user(token)
    if not user_id:
        await websocket.close(code=1008, reason="认证失败")
        return

    await websocket.accept()
    # ... 其他处理
```

---

## 本章小结

### 核心知识点回顾

| 知识点 | 内容 |
|--------|------|
| WebSocket | 全双工通信协议，适合实时场景 |
| FastAPI WebSocket | `@app.websocket()` 装饰器定义 |
| 连接管理 | 连接池、心跳、断线重连 |
| 消息处理 | JSON 数据收发、广播、私聊 |
| 前端集成 | WebSocket API、自动重连 |

### 与前端知识对比

| 前端 | Python 后端 |
|------|-------------|
| `new WebSocket()` | `@app.websocket()` |
| `ws.send()` | `await websocket.send_text()` |
| `ws.onmessage` | `await websocket.receive_text()` |
| Socket.io | FastAPI WebSocket |
| 自动重连 | 需要自己实现 |

### 下一步

下一章我们将学习 **任务队列与定时任务**：
- 使用 Celery 处理后台任务
- 实现定时任务调度
- 任务重试和错误处理

---

## 练习题

### 基础题

#### 题目 1：简单的 Echo 服务

实现一个 WebSocket Echo 服务，要求：
1. 接收客户端发送的任何消息
2. 在消息前添加 "Echo: " 前缀后返回
3. 当收到 "bye" 时关闭连接
4. 正常关闭时返回状态码 1000

#### 题目 2：在线人数统计

实现一个在线人数统计功能：
1. 维护一个全局在线用户列表
2. 用户连接时通知其他用户
3. 用户断开时更新在线列表
4. 提供获取在线人数的接口

#### 题目 3：心跳检测

实现心跳检测机制：
1. 服务器每 30 秒发送一次 ping
2. 客户端收到后回复 pong
3. 如果 60 秒没有收到 pong，关闭连接
4. 在控制台输出心跳日志

### 进阶题

#### 题目 4：私聊和群聊

实现完整的聊天功能：
1. 支持加入不同房间
2. 同一房间内消息广播
3. 支持 @user 提及用户私聊
4. 显示消息发送时间
5. 显示在线用户列表

#### 题目 5：消息历史记录

实现消息持久化：
1. 使用 SQLite 存储消息
2. 用户加入房间时发送最近 50 条历史消息
3. 消息包含：发送者、内容、时间戳
4. 支持分页加载历史消息

### 挑战题

#### 题目 6：分布式聊天系统

设计一个支持多服务器的聊天系统：
1. 使用 Redis Pub/Sub 实现跨服务器消息广播
2. 实现连接粘性（同一用户连同一服务器）
3. 处理服务器故障时的连接迁移
4. 实现消息去重机制

---

## 练习答案

### 基础题答案

#### 题目 1 答案

```python
from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/ws/echo")
async def echo_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()

            if data.lower() == "bye":
                await websocket.send_text("再见！")
                await websocket.close(code=1000, reason="正常关闭")
                break

            await websocket.send_text(f"Echo: {data}")
    except Exception as e:
        print(f"连接异常: {e}")
        await websocket.close(code=1011, reason=str(e))
```

#### 题目 2 答案

```python
from fastapi import FastAPI, WebSocket
from typing import Dict, Set

app = FastAPI()

# 在线用户集合
online_users: Set[str] = set()
# 用户连接映射
user_connections: Dict[str, WebSocket] = {}

async def broadcast_users():
    """广播在线用户列表"""
    users_list = list(online_users)
    for connection in user_connections.values():
        await connection.send_json({
            "type": "users_update",
            "users": users_list,
            "count": len(users_list)
        })

@app.websocket("/ws/chat/{username}")
async def chat_websocket(websocket: WebSocket, username: str):
    await websocket.accept()

    # 用户上线
    online_users.add(username)
    user_connections[username] = websocket
    await broadcast_users()

    try:
        while True:
            await websocket.receive_text()
    except Exception:
        pass
    finally:
        # 用户下线
        online_users.discard(username)
        if username in user_connections:
            del user_connections[username]
        await broadcast_users()
```

#### 题目 3 答案

```python
from fastapi import FastAPI, WebSocket
import asyncio
from datetime import datetime

app = FastAPI()

@app.websocket("/ws/ping")
async def ping_websocket(websocket: WebSocket):
    await websocket.accept()

    last_pong_time = datetime.now()
    ping_task = None

    async def send_ping():
        while True:
            await asyncio.sleep(30)
            await websocket.send_json({
                "type": "ping",
                "timestamp": datetime.now().isoformat()
            })
            print(f"[{datetime.now()}] 发送 ping")

    async def check_timeout():
        while True:
            await asyncio.sleep(10)
            if (datetime.now() - last_pong_time).total_seconds() > 60:
                print("超时，关闭连接")
                await websocket.close(code=1001, reason="超时")
                break

    ping_task = asyncio.create_task(send_ping())
    timeout_task = asyncio.create_task(check_timeout())

    try:
        while True:
            data = await websocket.receive_json()

            if data.get("type") == "pong":
                last_pong_time = datetime.now()
                print(f"[{datetime.now()}] 收到 pong")

    except Exception as e:
        print(f"连接异常: {e}")
    finally:
        ping_task.cancel()
        timeout_task.cancel()
```

### 进阶题答案

#### 题目 4 答案

```python
from fastapi import FastAPI, WebSocket
from typing import Dict, Set, List
import json
from datetime import datetime

app = FastAPI()

# 房间: {room_id: {username: websocket}}
rooms: Dict[str, Dict[str, WebSocket]] = {}

class ChatRoom:
    def __init__(self):
        self.rooms: Dict[str, Dict[str, WebSocket]] = {}

    async def join(self, room_id: str, username: str, websocket: WebSocket):
        if room_id not in self.rooms:
            self.rooms[room_id] = {}

        self.rooms[room_id][username] = websocket

        # 通知其他人
        await self.broadcast(room_id, {
            "type": "system",
            "content": f"{username} 加入了房间",
            "online_users": list(self.rooms[room_id].keys())
        }, exclude=username)

        # 发送欢迎消息给新用户
        await websocket.send_json({
            "type": "system",
            "content": f"欢迎加入房间 {room_id}",
            "online_users": list(self.rooms[room_id].keys())
        })

    async def leave(self, room_id: str, username: str):
        if room_id in self.rooms and username in self.rooms[room_id]:
            del self.rooms[room_id][username]

            await self.broadcast(room_id, {
                "type": "system",
                "content": f"{username} 离开了房间",
                "online_users": list(self.rooms[room_id].keys())
            })

    async def broadcast(self, room_id: str, message: dict, exclude: str = None):
        if room_id not in self.rooms:
            return

        for user, ws in self.rooms[room_id].items():
            if user != exclude:
                await ws.send_json(message)

    async def send_private(self, room_id: str, from_user: str, to_user: str, content: str):
        if room_id in self.rooms and to_user in self.rooms[room_id]:
            await self.rooms[room_id][to_user].send_json({
                "type": "private",
                "from": from_user,
                "content": content,
                "timestamp": datetime.now().isoformat()
            })

chat = ChatRoom()

@app.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket):
    await websocket.accept()

    # 获取用户信息和房间
    init_data = await websocket.receive_json()
    username = init_data.get("username")
    room_id = init_data.get("room", "general")

    await chat.join(room_id, username, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            content = data.get("content", "")
            timestamp = datetime.now().isoformat()

            # 处理 @提及
            if content.startswith("@"):
                parts = content.split(" ", 1)
                target_user = parts[0][1:]
                private_content = parts[1] if len(parts) > 1 else ""

                await chat.send_private(room_id, username, target_user, private_content)

            # 群聊消息
            else:
                await chat.broadcast(room_id, {
                    "type": "message",
                    "from": username,
                    "content": content,
                    "timestamp": timestamp
                })

    except Exception:
        pass
    finally:
        await chat.leave(room_id, username)
```

#### 题目 5 答案

```python
from fastapi import FastAPI, WebSocket
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# 数据库模型
Base = declarative_base()

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    room_id = Column(String)
    username = Column(String)
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.now)

# 数据库连接
engine = create_engine("sqlite:///chat.db")
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

app = FastAPI()

def get_history(room_id: str, limit: int = 50):
    db = SessionLocal()
    messages = db.query(Message)\
        .filter_by(room_id=room_id)\
        .order_by(Message.timestamp.desc())\
        .limit(limit)\
        .all()
    db.close()
    return [
        {
            "username": m.username,
            "content": m.content,
            "timestamp": m.timestamp.isoformat()
        }
        for m in reversed(messages)
    ]

def save_message(room_id: str, username: str, content: str):
    db = SessionLocal()
    message = Message(room_id=room_id, username=username, content=content)
    db.add(message)
    db.commit()
    db.close()

@app.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket):
    await websocket.accept()

    # 获取初始化信息
    init_data = await websocket.receive_json()
    room_id = init_data.get("room", "general")
    username = init_data.get("username")

    # 发送历史消息
    history = get_history(room_id)
    await websocket.send_json({
        "type": "history",
        "messages": history
    })

    try:
        while True:
            data = await websocket.receive_json()
            content = data.get("content")

            # 保存到数据库
            save_message(room_id, username, content)

            # 广播消息
            await websocket.send_json({
                "type": "message",
                "username": username,
                "content": content,
                "timestamp": datetime.now().isoformat()
            })

    except Exception:
        pass
```

### 挑战题答案

#### 题目 6 答案

```python
from fastapi import FastAPI, WebSocket
import redis
import json
import uuid
from typing import Dict, Set

app = FastAPI()

# Redis 连接
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

# 本地连接: {user_id: websocket}
local_connections: Dict[str, WebSocket] = {}

# 服务器 ID（用于区分不同服务器）
SERVER_ID = str(uuid.uuid4())

class DistributedChat:
    def __init__(self):
        self.subscribers: Set[str] = set()

    async def connect(self, user_id: str, websocket: WebSocket, room_id: str):
        local_connections[user_id] = websocket

        # 订阅 Redis 频道
        channel = f"room:{room_id}"
        if channel not in self.subscribers:
            pubsub = redis_client.pubsub()
            pubsub.subscribe(channel)
            self.subscribers.add(channel)

        # 通知其他服务器
        redis_client.publish(f"room:{room_id}", json.dumps({
            "type": "user_joined",
            "server_id": SERVER_ID,
            "user_id": user_id
        }))

    async def broadcast(self, room_id: str, message: dict, message_id: str = None):
        # 生成唯一消息 ID（用于去重）
        msg_id = message_id or str(uuid.uuid4())

        payload = {
            "id": msg_id,
            "server_id": SERVER_ID,
            "data": message
        }

        # 通过 Redis 广播
        redis_client.publish(f"room:{room_id}", json.dumps(payload))

        # 本地发送
        await self.send_local(room_id, payload)

    async def send_local(self, room_id: str, payload: dict):
        """发送消息到本地连接"""
        message_id = payload.get("id")
        server_id = payload.get("server_id")
        data = payload.get("data")

        for user_id, ws in local_connections.items():
            try:
                # 跳过来自其他服务器的重复消息
                if server_id == SERVER_ID or hasattr(ws, 'processed_messages'):
                    if message_id not in getattr(ws, 'processed_messages', set()):
                        await ws.send_json(data)
                        ws.processed_messages = getattr(ws, 'processed_messages', set())
                        ws.processed_messages.add(message_id)
            except Exception:
                pass

chat = DistributedChat()

@app.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket):
    await websocket.accept()

    init_data = await websocket.receive_json()
    user_id = init_data.get("user_id")
    room_id = init_data.get("room_id")

    await chat.connect(user_id, websocket, room_id)

    try:
        while True:
            data = await websocket.receive_json()
            await chat.broadcast(room_id, {
                "type": "message",
                "from": user_id,
                "content": data.get("content")
            })
    except Exception:
        pass
    finally:
        # 清理连接
        if user_id in local_connections:
            del local_connections[user_id]
```

---

> 下一章：[第17章：任务队列与定时任务](/chapter-17/) - 学习如何处理后台任务！
