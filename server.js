import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Content type mapping
const contentTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

// Simple static file server
async function serveStatic(req, res) {
  try {
    let filePath = join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
    
    // Handle client-side routing by serving index.html for non-file requests
    if (!extname(filePath)) {
      filePath = join(__dirname, 'dist', 'index.html');
    }

    const data = await readFile(filePath);
    const ext = extname(filePath);
    const contentType = contentTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.writeHead(404);
      res.end('File not found');
    } else {
      console.error('Server error:', err);
      res.writeHead(500);
      res.end('Internal server error');
    }
  }
}

// Create HTTP server
const server = createServer(serveStatic);

server.listen(4173, () => {
  console.log('HTTP Server running on port 4173');
});