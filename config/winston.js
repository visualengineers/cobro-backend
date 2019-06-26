var winston = require('winston')

/**
 * set level to 
 * 0: error
 * 1: warn
 * 2: info
 * 3: verbose
 * 4: debug
 * 5: silly
 */

const combinedlevel = process.env.NODE_LOGGING_LEVEL || 'info'
var consolelevel = 'info'

var options = {
  file_error: {
    level: 'error',
    filename: './logs/error.log',
    handleExceptions: true,
    json: true,
    colorize: false,
  },
  file_combined: {
  level: combinedlevel,
  filename: './logs/combined.log',
  handleExceptions: true,
  json: true,
  colorize: false,
},
  console: {
    level: consolelevel,
    handleExceptions: true,
    json: false,
    colorize: true,
  },
}

var logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file_error),
    new winston.transports.File(options.file_combined),
    new winston.transports.Console(options.console)
  ],
  exitOnError: false, // do not exit on handled exceptions
})

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function (message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
}

module.exports = logger;