const path = require('path');
const fs = require('fs');
const { db } = require('../config/database');
const { logAudit } = require('./adminController');

// Public & Admin: Get All Published Pastor Posters & Posts
exports.getPosts = (req, res) => {
  db.all('SELECT * FROM posts ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// Admin: Upload Resized Poster Image (with magic-byte validation and size restriction)
exports.uploadImage = (req, res) => {
  try {
    const { image, filename } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided.' });
    }

    // Support base64 data URI format (e.g. data:image/webp;base64,...)
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;

    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    // 1. Enforce strict max size: 5 MB
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (buffer.length > MAX_SIZE_BYTES) {
      return res.status(400).json({ error: 'Image exceeds maximum allowable file size of 5 MB.' });
    }

    if (buffer.length < 12) {
      return res.status(400).json({ error: 'Invalid or truncated image file payload.' });
    }

    // 2. Validate Image Magic Bytes (File Signatures)
    let verifiedExtension = null;

    // Check JPEG (FF D8 FF)
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      verifiedExtension = 'jpg';
    }
    // Check PNG (89 50 4E 47)
    else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      verifiedExtension = 'png';
    }
    // Check WebP (RIFF .... WEBP)
    else if (
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
      verifiedExtension = 'webp';
    }

    if (!verifiedExtension) {
      return res.status(400).json({
        error: 'Invalid file format. Only authentic JPEG, PNG, and WebP images are permitted.'
      });
    }

    const safeName = filename
      ? filename.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/\.[^/.]+$/, '')
      : 'poster';
    const uniqueFilename = `${safeName}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${verifiedExtension}`;
    const uploadsDir = path.join(__dirname, '../../uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const targetPath = path.join(uploadsDir, uniqueFilename);
    fs.writeFileSync(targetPath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;

    if (req.admin) {
      logAudit(req.admin.username, 'UPLOAD_POSTER_IMAGE', `Uploaded verified ${verifiedExtension.toUpperCase()} poster: ${uniqueFilename}`);
    }

    res.status(201).json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
      sizeBytes: buffer.length,
      format: verifiedExtension,
      message: 'Poster image uploaded and saved successfully.'
    });
  } catch (err) {
    console.error('Image Upload Error:', err);
    res.status(500).json({ error: 'Failed to process and store image.', details: err.message });
  }
};

// Admin: Publish New Pastor Poster / Post
exports.createPost = (req, res) => {
  const { title, author, category, content, image_url, is_featured } = req.body;

  if (!title || !content || !image_url) {
    return res.status(400).json({ error: 'Title, Content, and Image URL are required.' });
  }

  const sql = `
    INSERT INTO posts (title, author, category, content, image_url, is_featured)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    title,
    author || 'Pastor Zerfu',
    category || 'sermon_poster',
    content,
    image_url,
    is_featured !== undefined ? is_featured : 1
  ], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    logAudit(req.admin.username, 'PUBLISH_PASTOR_POST', `Published post: "${title}"`);
    res.status(201).json({ success: true, message: 'Pastor poster / post published successfully.', id: this.lastID });
  });
};

// Admin: Update Pastor Poster / Post
exports.updatePost = (req, res) => {
  const id = req.params.id;
  const { title, author, category, content, image_url, is_featured } = req.body;

  const sql = `
    UPDATE posts
    SET title = COALESCE(?, title),
        author = COALESCE(?, author),
        category = COALESCE(?, category),
        content = COALESCE(?, content),
        image_url = COALESCE(?, image_url),
        is_featured = COALESCE(?, is_featured)
    WHERE id = ?
  `;

  db.run(sql, [
    title,
    author,
    category,
    content,
    image_url,
    is_featured,
    id
  ], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    logAudit(req.admin.username, 'UPDATE_POST', `Updated post #${id}`);
    res.json({ success: true, message: 'Post updated successfully.' });
  });
};

// Admin: Delete Pastor Poster / Post
exports.deletePost = (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM posts WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    logAudit(req.admin.username, 'DELETE_POST', `Deleted post #${id}`);
    res.json({ success: true, message: 'Post deleted successfully.' });
  });
};
