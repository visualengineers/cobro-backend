'use strict';
const express = require('express');
const serverless = require('serverless-http');
const cors = require("cors");
const app = express();
const bodyParser = require('body-parser');

var data = require("../data")

app.use(express.static(__dirname + '/public'));
app.use('*',cors())

app.use(bodyParser.json());
app.use('/.netlify/functions/server', data);  // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
