var createError = require("http-errors");
var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var cookieParser = require("cookie-parser");
var morgan = require("morgan");
var winston = require("./config/winston");
var cors = require("cors");

var indexRouter = require("./routes/index");
var dataRouter = require("./routes/data");

var app = express();

app.use(morgan("combined", { stream: winston.stream }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("*", cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", indexRouter);    //not yet used Router
app.use("/data", dataRouter); //data Router get


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  
  winston.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
    );
    
    // render the error page
    res.status(err.status || 500);
    res.send("error");
  });
  
  module.exports = app;
