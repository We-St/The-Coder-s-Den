/**
 * Test server for serving local files
 **/

var express = require('express');
var app = express();

app.use(express.static('build'));

var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Test server listening at http://%s:%s', host, port);
});
