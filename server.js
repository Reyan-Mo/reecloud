const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;
app.use(express.json());
app.use(express.json());
app.delete('/delete', (req, res) => {
    const { fileName } = req.body;  // Get the file name from the request body
    const filePath = path.join(__dirname, 'uploads', fileName);  // Adjust path to where files are stored

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).send("Error deleting file");
        }
        res.status(200).send("File deleted successfully");
    });
});
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});
app.put('/rename', (req, res) => {
    const { oldName, newName } = req.body;

    console.log(`Old Name: ${oldName}`);
    console.log(`New Name: ${newName}`);

    if (!oldName || !newName) {
        return res.status(400).send('Both oldName and newName are required');
    }

    const oldPath = path.join(__dirname, 'uploads', oldName);
    const newPath = path.join(__dirname, 'uploads', newName);

    console.log(`Old Path: ${oldPath}`);
    console.log(`New Path: ${newPath}`);

    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            console.error(`Error renaming file: ${err.message}`);
            return res.status(500).send(`Error renaming file: ${err.message}`);
        }
        res.send('File renamed successfully');
    });
});

app.get('/homepage', (req, res) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'homepage.html'));
});
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});
// Set up multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Password for access
const PASSWORD = 'Moha@123';

// Middleware for serving static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Verify password route
app.post('/verify-password', (req, res) => {
    const { password } = req.body;
    if (password === PASSWORD) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// File upload route
app.post('/upload', upload.array('files[]', 10), (req, res) => {
    console.log('Files uploaded:', req.files);
    res.json({ message: 'Files uploaded successfully!' });
});

// Route to view uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/files', (req, res) => {
    const uploadsFolder = path.join(__dirname, 'uploads');
    
    fs.readdir(uploadsFolder, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading files');
        }
        
        // Return URLs starting from the root
        const fileUrls = files.map(file => `/uploads/${encodeURIComponent(file)}`);
        res.json(fileUrls);
    });
});
app.get('/files', (req, res) => {
    const uploadsFolder = path.join(__dirname, 'uploads');
    
    fs.readdir(uploadsFolder, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading files');
        }
        
        // Map file names to full URLs
        const fileUrls = files.map(file => `/uploads/${file}`);
        res.json(fileUrls);
    });
});


// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);});