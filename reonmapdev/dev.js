var express = require('express')
var path = require('path')
var http = require('http');
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var errorHandler = require('errorhandler');
var numCPUs = require('os').cpus().length;


var app = express()
// console.log(__dirname);
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/'));

app.get('/', function (req, res) {
  res.sendFile('inddex.html',{ root: path.join(__dirname, '/views') })
});

var server = app.listen(9988, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
});
