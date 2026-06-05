import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [savedMessages, setSavedMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeChat, setActiveChat] = useState('global');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const messagesEndRef = useRef(null);
  
  // ⚠️ LIVE PUSH KARNE KE LIYE RENDER LINK WAPAS DAALO
const BACKEND_URL = "https://my-data-verse.onrender.com"; 

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, savedMessages]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  // Fetch global messages
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/messages`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error("Error fetching messages:", err));
    
    // Load saved messages from localStorage
    const saved = localStorage.getItem('savedMessages');
    if (saved) {
      setSavedMessages(JSON.parse(saved));
    }
    
    // Polling for real-time (temporary)
    const interval = setInterval(() => {
      if (activeChat === 'global') {
        fetch(`${BACKEND_URL}/api/messages`)
          .then(res => res.json())
          .then(data => setMessages(data));
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [BACKEND_URL, activeChat]);

  // Save messages to localStorage whenever savedMessages changes
  useEffect(() => {
    localStorage.setItem('savedMessages', JSON.stringify(savedMessages));
  }, [savedMessages]);

  // Send message to global chat
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const tempMessage = { 
      text: input, 
      sender: 'You', 
      temp: true,
      time: new Date().toLocaleTimeString(),
      id: Date.now()
    };
    
    if (activeChat === 'global') {
      setMessages([...messages, tempMessage]);
    }
    setInput('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, sender: 'You' })
      });

      if (response.ok) {
        const newMessage = await response.json();
        if (activeChat === 'global') {
          setMessages(prev => prev.filter(m => !m.temp).concat(newMessage));
        }
      }
    } catch (error) {
      alert("Message send failed!");
      if (activeChat === 'global') {
        setMessages(prev => prev.filter(m => !m.temp));
      }
    }
  };

  // Save message to Saved Messages
  const saveToSavedMessages = (message) => {
    const savedMessage = {
      ...message,
      savedAt: new Date().toLocaleString(),
      originalChat: 'global',
      id: Date.now()
    };
    setSavedMessages([savedMessage, ...savedMessages]);
    alert('Message saved to Saved Messages!');
  };

  // Delete from saved messages
  const deleteSavedMessage = (id) => {
    setSavedMessages(savedMessages.filter(msg => msg.id !== id));
  };

  // Get current messages based on active chat
  const getCurrentMessages = () => {
    if (activeChat === 'global') {
      return messages;
    } else {
      return savedMessages;
    }
  };

  // Handle chat selection
  const handleChatSelect = (chat) => {
    setActiveChat(chat);
    setSidebarOpen(false);
    setMobileChatOpen(true);
  };

  // Go back to sidebar on mobile
  const handleBack = () => {
    setMobileChatOpen(false);
  };

  return (
    <div className="telegram-container">
      {/* Backdrop Overlay for mobile sidebar */}
      <div 
        className={`backdrop ${sidebarOpen ? 'show' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      />

      {/* Left Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''} ${mobileChatOpen ? 'hidden-mobile' : ''}`}>
        <div className="sidebar-header">
          <div className="avatar">
            <span>✨</span>
          </div>
          <div className="header-info">
            <h3>MyDataVerse</h3>
            <p>Telegram Clone</p>
          </div>
        </div>
        
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search chats..." 
          />
        </div>

        <div className="chat-list">
          <div 
            className={`chat-item ${activeChat === 'global' ? 'active' : ''}`}
            onClick={() => handleChatSelect('global')}
          >
            <div className="chat-avatar global">🌐</div>
            <div className="chat-info">
              <h4>Global Vault</h4>
              <p>{messages.length} messages</p>
            </div>
          </div>
          
          <div 
            className={`chat-item ${activeChat === 'saved' ? 'active' : ''}`}
            onClick={() => handleChatSelect('saved')}
          >
            <div className="chat-avatar saved">⭐</div>
            <div className="chat-info">
              <h4>Saved Messages</h4>
              <p>{savedMessages.length} saved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Chat Window */}
      <div className={`chat-window ${mobileChatOpen ? 'show-mobile' : ''}`}>
        <div className="chat-header">
          <div className="header-left">
            <button 
              className="menu-toggle" 
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            {mobileChatOpen && (
              <button 
                className="back-button" 
                onClick={handleBack}
              >
                ←
              </button>
            )}
          </div>
          <div className="chat-info">
            <h3>{activeChat === 'global' ? '🌐 Global Vault' : '⭐ Saved Messages'}</h3>
            <span className="status">
              {activeChat === 'global' ? 'online' : `${savedMessages.length} saved items`}
            </span>
          </div>
          <div className="header-actions">
            <button className="action-btn">⋮</button>
          </div>
        </div>

        <div className="messages-container">
          {getCurrentMessages().length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">
                {activeChat === 'global' ? '💬' : '📌'}
              </div>
              <h4>No messages yet</h4>
              <p>
                {activeChat === 'global' 
                  ? 'Be the first to send a message!' 
                  : 'Save important messages from Global Vault to see them here'}
              </p>
            </div>
          ) : (
            getCurrentMessages().map((msg, index) => (
              <div 
                key={msg.id || index} 
                className={`message-group ${msg.sender === 'You' ? 'sent' : 'received'}`}
              >
                {msg.sender !== 'You' && activeChat === 'global' && (
                  <div className="message-avatar">
                    {msg.sender?.charAt(0) || '👤'}
                  </div>
                )}
                <div className="message-bubble">
                  {msg.sender !== 'You' && activeChat === 'global' && (
                    <div className="sender-name">{msg.sender || 'Anonymous'}</div>
                  )}
                  <div className="message-text">{msg.text}</div>
                  <div className="message-footer">
                    <span className="message-time">
                      {msg.time || msg.savedAt || new Date().toLocaleTimeString()}
                    </span>
                    {activeChat === 'global' && msg.sender === 'You' && (
                      <button 
                        className="save-button"
                        onClick={() => saveToSavedMessages(msg)}
                        title="Save to Saved Messages"
                      >
                        📌 Save
                      </button>
                    )}
                    {activeChat === 'saved' && (
                      <button 
                        className="delete-button"
                        onClick={() => deleteSavedMessage(msg.id)}
                        title="Delete from saved"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {isTyping && activeChat === 'global' && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Someone is typing...</span>
          </div>
        )}

        <form onSubmit={sendMessage} className="input-container">
          <button type="button" className="attach-btn" title="Attach file">
            📎
          </button>
          <input 
            type="text" 
            placeholder={activeChat === 'global' ? "Write a message..." : "Saved messages are read-only"}
            value={input}
            disabled={activeChat === 'saved'}
            onChange={(e) => {
              setInput(e.target.value);
              if (activeChat === 'global') {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 1000);
              }
            }}
          />
          <button type="button" className="emoji-btn" title="Emoji">
            😊
          </button>
          <button 
            type="submit" 
            className="send-btn" 
            disabled={activeChat === 'saved'}
            title={activeChat === 'saved' ? "Can't send in saved messages" : "Send message"}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;