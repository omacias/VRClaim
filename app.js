'use strict';

var express = require('express');
var bodyParser  = require('body-parser');
var app = express();
var imageApi = require('./webServices/imageApi');
var env = require('./config/Enviroment').envParams();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

interceptor();

app.use('/vrclaim',  express.static(__dirname + '/vrview-google'));

imageApi.listen(app)

startServer();

function startServer(){
  var port = process.env.PORT ? process.env.PORT : 3000;
  app.listen(port, function(){
    console.log('VRClaim started on port '+port);
  });
}

function interceptor() {
  //interceptor*******************
  app.use(function(req, res, next) {
    res.removeHeader("X-Powered-By");
    res.setHeader('Access-Control-Allow-Origin', env.accessControlAllowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT');
    next();
  });
  //******************************
}
