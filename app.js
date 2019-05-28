var express = require("express")
var cors = require("cors")
var app = express()

var data = require("./data")

app.use(express.static('public'))
app.use('*',cors())
app.use('/data', data)

app.listen(3000, function () {
    console.log("Server running on port 3000")
});