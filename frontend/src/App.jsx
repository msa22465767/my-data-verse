import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeChat, setActiveChat] = useState('global')
  const [showSidebar, setShowSidebar] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(() => {
    fetch('http://localhost:5000/api/messages')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.log("Error loading messages:", err))
  }, [])

  const handleSend = async () => {
    if (message.trim() !== '') {
      try {
        const response = await fetch('http://localhost:5000/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender: 'You', text: message, type: 'text' })
        })
        const newMsg = await response.json()
        setMessages([...messages, newMsg])
        setMessage('')
      } catch (err) {
        console.error("Error sending message:", err)
      }
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData
        })
        const newMsg = await response.json()
        setMessages([...messages, newMsg])
      } catch (err) {
        console.error("Error uploading file:", err)
      }
    }
  }

  const closeSidebar = () => {
    setShowSidebar(false)
  }

  return (
    <div className="app-container">
      {/* Backdrop Overlay */}
      <div 
        className={`backdrop ${showSidebar ? 'show' : ''}`} 
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div className={`sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="sidebar-header">
          MyDataVerse
        </div>
        <div className="sidebar-menu">
          <div 
            onClick={() => {
              setActiveChat('global')
              closeSidebar()
            }} 
            className={`menu-item ${activeChat === 'global' ? 'active' : ''}`}
          >
            Global Vault
          </div>
          <div 
            onClick={() => {
              setActiveChat('saved')
              closeSidebar()
            }} 
            className={`menu-item ${activeChat === 'saved' ? 'active' : ''}`}
          >
            Saved Messages
          </div>
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="chat-main">
        <div className="chat-header">
          <button 
            onClick={() => setShowSidebar(true)} 
            className="menu-button"
          >
            ☰ Menu
          </button>
          <span>{activeChat === 'global' ? 'Global Storage' : 'Saved Messages'}</span>
        </div>

        <div className="messages-area">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className="message-bubble"
              style={{ 
                alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.sender === 'You' ? '#effdde' : '#ffffff'
              }}
            >
              <div className="message-sender">{msg.sender}</div>
              
              {msg.type === 'file' ? (
                <div>
                  <div className="message-text">File: {msg.text}</div>
                  <a 
                    href={msg.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="file-link"
                  >
                    📎 Download File
                  </a>
                </div>
              ) : (
                <div className="message-text">{msg.text}</div>
              )}

              <div className="message-time">{msg.time}</div>
            </div>
          ))}
        </div>

        <div className="input-footer">
          <label className="attach-button">
            📎 Attach
            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          <input 
            type="text" 
            placeholder="Write a message..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="message-input"
          />
          <button onClick={handleSend} className="send-button">
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
