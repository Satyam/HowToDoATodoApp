const http = require('http');

const port = 8080;

const server = http.createServer()
  .on('request', (req, res) => {
    console.log(`Received request for ${req.url}`);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Hello World\n');
    res.end(`Received request for ${req.url}`);
  })
  .listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
