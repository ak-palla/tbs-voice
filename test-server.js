const { createServer } = require('http');

console.log('Starting basic HTTP server...');

const server = createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Test server working\n');
});

server.listen(3001, () => {
  console.log('✅ Test server ready on http://localhost:3001');
});