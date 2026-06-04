import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeChat, setActiveChat] = useState('global');
  const messagesEndRef = useRef(null);
  
  // ⚠️ CHANGE THIS TO YOUR BACKEND URL
  const BACKEND_URL = "http://192.168.x.x:5000"; // Laptop IP daalo
  // const BACKEND_URL = "https://your-render-backend.onrender.com"; // Jab Render fix ho jaye

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/messages`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error("Error:", err));
    
    // Polling for real-time (temporary until Socket.io)
    const interval = setInterval(() => {
      fetch(`${BACKEND_URL}/api/messages`)
        .then(res => res.json())
        .then(data => setMessages(data));
    }, 2000);
    
    return () => clearInterval(interval);
  }, [BACKEND_URL]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const tempMessage = { text: input, sender: 'You', temp: true };
    setMessages([...messages, tempMessage]);
    setInput('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, sender: 'You' })
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => prev.filter(m => !m.temp).concat(newMessage));
      }
    } catch (error) {
      alert("Message send failed!");
      setMessages(prev => prev.filter(m => !m.temp));
    }
  };

  return (
    <div className="telegram-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="avatar">✨</div>
          <h3>MyDataVerse</h3>
        </div>
        
        <div className="search-bar">
          <input type="text" placeholder="Search chats..." />
        </div>

        <div className="chat-list">
          <div 
            className={`chat-item ${activeChat === 'global' ? 'active' : ''}`}
            onClick={() => setActiveChat('global')}
          >
            <div className="chat-avatar">🌐</div>
            <div className="chat-info">
              <h4>Global Vault</h4>
              <p>Tap to start messaging...</p>
            </div>
          </div>
          
          <div className="chat-item">
            <div className="chat-avatar">⭐</div>
            <div className="chat-info">
              <h4>Saved Messages</h4>
              <p>Your private space</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="chat-window">
        <div className="chat-header">
          <div className="chat-info">
            <h3>Global Vault</h3>
            <span className="status">online</span>
          </div>
        </div>

        <div className="messages-container">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message-group ${msg.sender === 'You' ? 'sent' : 'received'}`}
            >
              {msg.sender !== 'You' && (
                <div className="message-avatar">🤖</div>
              )}
              <div className="message-bubble">
                {msg.sender !== 'You' && (
                  <div className="sender-name">{msg.sender}</div>
                )}
                <div className="message-text">{msg.text}</div>
                <div className="message-time">
                  {new Date().toLocaleTimeString()}
                  {msg.sender === 'You' && ' ✓'}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {isTyping && (
          <div className="typing-indicator">
            Someone is typing...
          </div>
        )}

        <form onSubmit={sendMessage} className="input-container">
          <button type="button" className="attach-btn">📎</button>
          <input 
            type="text" 
            placeholder="Write a message..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setIsTyping(true);
              setTimeout(() => setIsTyping(false), 1000);
            }}
          />
          <button type="button" className="emoji-btn">😊</button>
          <button type="submit" className="send-btn">➤</button>
        </form>
      </div>
    </div>
  );
}

export default App;
