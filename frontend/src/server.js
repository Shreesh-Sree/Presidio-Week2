import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, '../public')));

// Fallback all routes to index.html for SPA feel
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Frontend Dashboard is running on port ${PORT}`);
  console.log(` Open: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
