var express = require("express");
var app = express();

var data = require("./data")

app.use(express.static('public'));
app.use('/data', data);

app.listen(3000, function () {
    console.log("Server running on port 3000");
});