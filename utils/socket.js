import utils from './utils.js'
// socket.io客户端封装
let socket = null;
let userId = null;

const socketClient = {
  /**
   * 初始化WebSocket连接
   * @param {string} url - 服务器地址（不含命名空间）
   * @param {number} userId - 用户ID
   */
  init(url, uid) {
    userId = uid;
    
    // 如果已存在连接，先断开
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    
    // 创建新连接（使用命名空间 /chat）
    socket = window.io(url + '/chat', {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { 
        token:utils.getStorage('token') 
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity
    });
    
    console.log('WebSocket初始化完成，命名空间: /chat');
  },
  
  /**
   * 发送消息
   * @param {string} event - 事件名
   * @param {object} data - 消息数据
   */
  send(event, data) {
    if (socket) {
      console.log(`📤 WebSocket发送消息: event=${event}, data=${JSON.stringify(data)}`);
      socket.emit(event, data);
    } else {
      console.error('WebSocket未连接');
    }
  },
  
  /**
   * 监听事件
   * @param {string} event - 事件名
   * @param {function} callback - 回调函数
   */
  on(event, callback) {
    if (socket) {
      socket.on(event, callback);
    }
  },
  
  /**
   * 取消监听事件
   * @param {string} event - 事件名
   * @param {function} callback - 回调函数（可选）
   */
  off(event, callback) {
    if (socket) {
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.off(event);
      }
    }
  },
  
  /**
   * 断开连接
   */
  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },
  
  /**
   * 获取连接状态
   * @returns {boolean}
   */
  isConnected() {
    return socket && socket.connected;
  }
};

export default socketClient;