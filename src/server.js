const http = require('http');
const url = require('url');
const query = require('querystring');
const fs = require('fs');
const apiHandler = require('./apiResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Getting the actual web pages
const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const stylesheet = fs.readFileSync(`${__dirname}/../client/style.css`);

// getIndex()
const getIndex = (rq, rp) => {
  rp.writeHead(200, { 'Content-Type': 'text/html' });
  rp.write(index);
  rp.end();
};

// getStylesheet()
const getStylesheet = (rq, rp) => {
  rp.writeHead(200, { 'Content-Type': 'text/css' });
  rp.write(stylesheet);
  rp.end();
};

// GET URL Struct
const urlStructGET = {
  '/': getIndex,
  '/style.css': getStylesheet,
  '/getUsers': apiHandler.getUsers,
  notFound: apiHandler.notReal,
};

// POST URL Struct
const urlStructPOST = {
  '/addUser': apiHandler.addUser,
  notFound: apiHandler.notReal,
};

// handleGET()
const handleGET = (rq, rp) => {
  // Parsing the URL + Parameters
  const parsedUrl = url.parse(rq.url);
  const params = query.parse(parsedUrl.query);

  if (urlStructGET[parsedUrl.pathname]) {
    urlStructGET[parsedUrl.pathname](rq, rp, params);
  } else {
    urlStructGET.notFound(rq, rp);
  }
};

// handlePOST()
const handlePOST = (rq, rp) => {
  // Parsing the URL
  const parsedUrl = url.parse(rq.url);

  if (urlStructPOST[parsedUrl.pathname]) {
    // Creating the Response copy + a POST body
    const rpCopy = rp;
    const body = [];

    // IF the upload stream gets interrupted...
    rq.on('error', (err) => {
      console.dir(err);
      rpCopy.statusCode = 400;
      rpCopy.end();
    });

    // WHEN new data from the upload stream comes in...
    rq.on('data', (chunk) => {
      body.push(chunk);
    });

    // WHEN the upload stream is done...
    rq.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);
      urlStructPOST[parsedUrl.pathname](rq, rpCopy, bodyParams);
    });
  } else {
    urlStructPOST.notFound(rq, rp);
  }
};

// onRequest()
const onRequest = (request, response) => {
  console.log(`${request.url} + ${request.method}`);

  if (request.method === 'POST') {
    handlePOST(request, response);
  } else {
    handleGET(request, response);
  }
};

// Running the server
http.createServer(onRequest).listen(port);
console.log(`Listening on 127.0.0.1:${port}...`);
