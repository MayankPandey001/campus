// Real-time Chat System for Study Groups
class ChatSystem {
  constructor() {
    this.currentGroup = 'Math Study Group';
    this.groups = {
      'Math Study Group': [],
      'Physics Enthusiasts': [],
      'Chemistry Lab Partners': [],
      'Computer Science Club': [],
      'History Buffs': []
    };
    this.users = {};
    this.socket = null;
    this.initializeChat();
  }

  initializeChat() {
    this.loadMessageHistory();
    this.simulateWebSocket();
    this.setupEventListeners();
    this.updateUserPresence();
  }

  simulateWebSocket() {
    // Simulate WebSocket connection for real-time messaging
    this.socket = {
      emit: (event, data) => {
        console.log('Socket emit:', event, data);
        this.handleSocketEvent(event, data);
      },
      on: (event, callback) => {
        this.socketEvents = this.socketEvents || {};
        this.socketEvents[event] = callback;
      }
    };

    // Simulate connection
    setTimeout(() => {
      this.socket.emit('connect');
      this.socket.emit('join group', { group: this.currentGroup });
    }, 1000);
  }

  handleSocketEvent(event, data) {
    switch(event) {
      case 'new message':
        this.receiveMessage(data);
        break;
      case 'user joined':
        this.handleUserJoined(data);
        break;
      case 'user left':
        this.handleUserLeft(data);
        break;
    }
  }

  setupEventListeners() {
    // Group selection
    document.querySelectorAll('.group-item').forEach(item => {
      item.addEventListener('click', (e) => {
        this.switchGroup(e.target.textContent.trim());
      });
    });

    // Send message on button click
    const sendBtn = document.querySelector('.chat-input-container .neon-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage());
    }

    // Send message on Enter key
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    // File upload
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }
  }

  switchGroup(groupName) {
    this.currentGroup = groupName;

    // Update active group in UI
    document.querySelectorAll('.group-item').forEach(item => {
      item.classList.remove('active');
      if (item.textContent.trim() === groupName) {
        item.classList.add('active');
      }
    });

    // Load and display messages for this group
    this.displayMessages(groupName);

    // Join the group via socket
    this.socket.emit('join group', { group: groupName });

    // Update chat window title
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
      chatWindow.setAttribute('data-group', groupName);
    }
  }

  sendMessage() {
    const input = document.getElementById('message-input');
    const fileInput = document.getElementById('file-input');

    if (!input || (!input.value.trim() && !fileInput?.files[0])) {
      return;
    }

    const message = {
      id: Date.now(),
      group: this.currentGroup,
      user: this.getCurrentUser(),
      text: input.value.trim(),
      timestamp: new Date().toISOString(),
      type: fileInput?.files[0] ? 'file' : 'text'
    };

    if (fileInput?.files[0]) {
      message.fileName = fileInput.files[0].name;
      message.fileSize = fileInput.files[0].size;
    }

    // Add message to local storage
    this.groups[this.currentGroup].push(message);
    this.saveMessageHistory();

    // Display message
    this.displayMessage(message);

    // Send via socket
    this.socket.emit('send message', message);

    // Clear input
    input.value = '';
    if (fileInput) fileInput.value = '';

    // Scroll to bottom
    this.scrollToBottom();
  }

  receiveMessage(message) {
    // Add to group messages if not already present
    if (!this.groups[message.group].find(m => m.id === message.id)) {
      this.groups[message.group].push(message);
      this.saveMessageHistory();

      // Display if current group
      if (message.group === this.currentGroup) {
        this.displayMessage(message);
        this.scrollToBottom();
      }
    }
  }

  displayMessage(message) {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.user === this.getCurrentUser() ? 'sent' : 'received'}`;
    messageDiv.setAttribute('data-message-id', message.id);

    let content = '';
    if (message.type === 'file') {
      content = `
        <div class="file-message">
          <i class="fas fa-file"></i>
          <div>
            <p><strong>${message.user}:</strong></p>
            <p>${message.fileName} (${this.formatFileSize(message.fileSize)})</p>
            <button onclick="chatSystem.downloadFile('${message.id}')">Download</button>
          </div>
        </div>
      `;
    } else {
      content = `<p><strong>${message.user}:</strong> ${message.text}</p>`;
    }

    messageDiv.innerHTML = content;
    chatWindow.appendChild(messageDiv);

    // Add timestamp
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = this.formatTime(message.timestamp);
    messageDiv.appendChild(timeDiv);
  }

  displayMessages(groupName) {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return;

    // Clear current messages
    chatWindow.innerHTML = '';

    // Display group messages
    const messages = this.groups[groupName] || [];
    messages.forEach(message => {
      this.displayMessage(message);
    });

    this.scrollToBottom();
  }

  handleUserJoined(data) {
    this.showNotification(`${data.user} joined ${data.group}`, 'info');
    this.updateUserPresence();
  }

  handleUserLeft(data) {
    this.showNotification(`${data.user} left ${data.group}`, 'info');
    this.updateUserPresence();
  }

  updateUserPresence() {
    // Simulate user presence
    const onlineUsers = ['Alice', 'Bob', 'Charlie', 'Diana'];
    const presenceDiv = document.getElementById('online-users');
    if (presenceDiv) {
      presenceDiv.innerHTML = onlineUsers.map(user =>
        `<div class="user-presence">
          <div class="presence-indicator online"></div>
          <span>${user}</span>
        </div>`
      ).join('');
    }
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.showNotification('File size too large. Maximum 10MB allowed.', 'error');
        event.target.value = '';
        return;
      }

      this.showNotification(`File "${file.name}" ready to send.`, 'info');
    }
  }

  downloadFile(messageId) {
    // Simulate file download
    this.showNotification('Download started...', 'info');
    setTimeout(() => {
      this.showNotification('File downloaded successfully!', 'success');
    }, 2000);
  }

  getCurrentUser() {
    return localStorage.getItem('campusverseLoggedInUser')
      ? JSON.parse(localStorage.getItem('campusverseLoggedInUser')).name
      : 'Anonymous';
  }

  formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  scrollToBottom() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }

  showNotification(message, type = 'info') {
    if (window.showNotification) {
      window.showNotification(message, type);
    }
  }

  loadMessageHistory() {
    const saved = localStorage.getItem('campusverseChatHistory');
    if (saved) {
      this.groups = JSON.parse(saved);
    }
  }

  saveMessageHistory() {
    localStorage.setItem('campusverseChatHistory', JSON.stringify(this.groups));
  }
}

// Initialize chat system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.chatSystem = new ChatSystem();
});
