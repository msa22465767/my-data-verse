const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
// Is line se hamara backend uploads folder ki files ko download karne ki permission deta hai
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

const db = new sqlite3.Database(path.join(__dirname, 'telegram.db'), (err) => {
    if (!err) {
        console.log("Database connected successfully! ✅");
        db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender TEXT, text TEXT, time TEXT, type TEXT, fileUrl TEXT)');
    }
});

app.get('/api/messages', (req, res) => {
    db.all("SELECT * FROM messages ORDER BY id ASC", [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

app.post('/api/messages', (req, res) => {
    const { sender, text, type } = req.body;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    db.run("INSERT INTO messages (sender, text, time, type, fileUrl) VALUES (?, ?, ?, ?, ?)", [sender, text, time, type, ''], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ id: this.lastID, sender, text, time, type, fileUrl: '' });
    });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    
    const sender = 'You';
    const text = req.file.originalname;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const type = 'file';
    const fileUrl = 'http://localhost:5000/uploads/' + req.file.filename;

    db.run("INSERT INTO messages (sender, text, time, type, fileUrl) VALUES (?, ?, ?, ?, ?)", [sender, text, time, type, fileUrl], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ id: this.lastID, sender, text, time, type, fileUrl });
    });
});

app.listen(PORT, () => {
    console.log('Backend Server running on port 5000 🚀');
});