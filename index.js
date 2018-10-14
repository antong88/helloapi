//Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

const unifiedServer = (req, res) => {
  //Get the url from the request object and parse it.
  const parsedUrl = url.parse(req.url, true);

  //Extract the path from the url.
  const path = parsedUrl.pathname;
  const trimedPath = path.replace(/^\/+|\/+$/g,'');

  //Get the query string as an object.
  const queryStringObject = parsedUrl.query;

  //Get the HTTP method.
  const method = req.method.toLowerCase();

  //Get the request's headers
  const headers = req.headers;

  const decode = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', data => {
    buffer += decode.write(data);
  });

  req.on('end', () => {
    buffer += decode.end();

    //Look for the passed handler in the router object.
    const chosenHandler = typeof router[trimedPath] !== 'undefined' ? router[trimedPath] : handlers.notFound;
    const data = {
      'method': method,
      'path': path,
      'queryStringObject': queryStringObject,
      'headers': headers,
      'payload': buffer
    };

    //invoke the chosen handler.
    chosenHandler(data, (statusCode, returnObject) => {
      //Use the status code returned by the handler of the default one.
      statusCode = typeof statusCode == 'number' ? statusCode : 200;

      //Use the retiurned object or default.
      returnObject = typeof returnObject == 'object' ? returnObject : {};

      //Convert the object to string.
      const parsedString = JSON.stringify(returnObject);

      //Return the response.
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(parsedString);
      console.log('Response', statusCode, parsedString);
    });
  });
};

//Declare the handlers
const handlers = {};

//hello handler
handlers.hello = (data, callback) => {
  callback(200, {'message':'Welcome to my API.'});
};

//notFound handler
handlers.notFound = (data, callback) => {
  callback(404, {'message': 'Not found.'});
};

//declare the router
const router = {
  'hello': handlers.hello
};


const httpServer = http.createServer((req, res) =>{
  unifiedServer(req, res);
});

httpServer.listen(config.httpPort, () => {
  console.log('Server is listening to port '  + config.httpPort);
});
