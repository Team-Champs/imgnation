var pg = require('pg');
var express = require('express');
var app = express();
var parser = require('body-parser');
var path = ('path');
var parseConnectionString = require('pg-connection-string');
var sharp = require('sharp');
var multer  = require('multer');
var passport = require ('passport');
var query = require('./query');

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use('/public',express.static(__dirname + '/public'));

// multer setup
var storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, './public/img');
    },
    filename: function(req, file, callback){
        callback(null, file.originalname);
    }
});

var upload = multer({storage: storage});

app.set('view engine', 'ejs');

// ------------------------------------------------------------------------------------------

app.get('*', function(req, res) {
    res.status(404).send('<h1>Page not found!</h1>');
});

var PORT = process.env.PORT || 3333;

app.listen(PORT, function () {
    console.log('Example app listening on port 3333!');
});