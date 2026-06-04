import React, { useState, useEffect } from 'react'

function App() {
  const [activeChat, setActiveChat] = useState('global')
  const [showSidebar, setShowSidebar] = useState(true)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])

  // 1. Laptop ke Database se purane saare messages load karna
  useEffect(() => {
    fetch('http://localhost:5000/api/messages')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.log("Error loading messages:", err))
  }, [])

  // 2. Text message send karke database me save karna
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

  // 3. File upload karke database aur laptop ki hard disk me save karna
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

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, padding: 0, fontFamily: 'sans-serif', backgroundColor: '#e7ebf0', overflow: 'hidden' }}>
      
      {/* LEFT SIDEBAR */}
      <div style={{ width: '30%', minWidth: '250px', backgroundColor: '#ffffff', borderRight: '1px solid #dadada', display: showSidebar ? 'flex' : 'none', flexDirection: 'column' }}>
        <div style={{ backgroundColor: '#507da2', color: 'white', padding: '15px', fontSize: '20px', fontWeight: 'bold' }}>
          MyDataVerse
        </div>
        <div style={{ flex: 1, padding: '10px' }}>
          <div onClick={() => setActiveChat('global')} style={{ padding: '15px', borderRadius: '8px', cursor: 'pointer', backgroundColor: activeChat === 'global' ? '#f2f6fa' : 'transparent', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
            Global Vault
          </div>
          <div onClick={() => setActiveChat('saved')} style={{ padding: '15px', borderRadius: '8px', cursor: 'pointer', backgroundColor: activeChat === 'saved' ? '#f2f6fa' : 'transparent', fontWeight: 'bold', color: '#333' }}>
            Saved Messages
          </div>
        </div>
      </div>

      {/* RIGHT CHAT WINDOW */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f4f4f5' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '15px 20px', borderBottom: '1px solid #dadada', fontWeight: 'bold', fontSize: '18px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => setShowSidebar(!showSidebar)} style={{ padding: '5px 10px', background: '#507da2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            Menu
          </button>
          <span>{activeChat === 'global' ? 'Global Storage' : 'Saved Messages'}</span>
        </div>

        {/* Messages display list */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start', backgroundColor: msg.sender === 'You' ? '#effdde' : '#ffffff', padding: '10px 15px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', maxWidth: '70%' }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#549cdd', marginBottom: '3px' }}>{msg.sender}</div>
              
              {msg.type === 'file' ? (
                <div>
                  <span>File: {msg.text}</span>
                  <br />
                  <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '5px', color: '#507da2', fontWeight: 'bold', textDecoration: 'none' }}>
                    Download File
                  </a>
                </div>
              ) : (
                <div>{msg.text}</div>
              )}

              <div style={{ fontSize: '10px', color: '#999', textAlign: 'right', marginTop: '3px' }}>{msg.time}</div>
            </div>
          ))}
        </div>

        {/* Input Footer */}
        <div style={{ padding: '15px', backgroundColor: '#ffffff', borderTop: '1px solid #dadada', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ padding: '10px 15px', backgroundColor: '#f0f0f0', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', color: '#555' }}>
            Attach
            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          <input 
            type="text" 
            placeholder="Write a message..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cccccc', fontSize: '15px', outline: 'none' }}
          />
          <button onClick={handleSend} style={{ padding: '12px 24px', backgroundColor: '#507da2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Send
          </button>
        </div>
      </div>

    </div>
  )
}

export default App