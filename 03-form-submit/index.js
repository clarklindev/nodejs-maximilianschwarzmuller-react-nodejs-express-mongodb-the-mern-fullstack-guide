// basic web server
const http = require('http');

const server = http.createServer((req, res) => {
  console.log('incoming request');
  console.log(req.method, req.url);

  if (req.method === 'POST') {
    let body = '';

    // when done parsing
    req.on('end', () => {
      console.log(body);
      const userName = body.split('=')[1];
      res.end(`<h1>userName: ${userName}`);
    });

    //when data is incoming..
    req.on('data', (chunk) => {
      body += chunk;
    });
  } else {
    // res.end('success');
    res.setHeader('Content-Type', 'text/html');
    res.end(
      `<form method="POST"><input type="text" name="username">
    <button type="submit">create user</button>
    </form>`
    );
  }
});

server.listen(3000);
