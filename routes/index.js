var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.send("Lorem Ipsum [TODO] this is the entry Level. nothing to see here");
});

module.exports = router;
