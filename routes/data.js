var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var winston = require("../config/winston");

var dataPath = "./public/cobro-data";
var ip = "127.0.0.1";
var port = "3000";
var rooturl = "http://" + ip + ":" + port + "/cobro-data";

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })


var fs = require("fs");
const blocks = JSON.parse(
  fs.readFileSync(dataPath + "/_assets/blocks/blocks.json", "utf8")
);

/**
 *
 * @param {int} id id of the block
 * @param {string} format which information shoud be included: all / plain / svg / png
 */
function GetBlock(id, format) {
  var block;
  if (format == "svg") {
    try {
      block = fs.readFileSync(
        dataPath + "/_assets/icons/icon_" + id + "." + format,
        "utf8"
      );
    } catch (error) {
      winston.error(error);
    } finally {
      return block;
    }
  } else if (format == "png") {
    try {
      block = fs.readFileSync(
        dataPath + "/_assets/icons/icon_" + id + "." + format,
        "utf8"
      );
      block = rooturl + "/_assets/icons/icon_" + id + ".png";
    } catch (error) {
      winston.error(error);
    } finally {
      return block;
    }
  } else if (format == "plain") {
    try {
      block = blocks.find(r => r.id == id);
    } catch (error) {
      winston.error(error);
    } finally {
      return block;
    }
  } else if (format == "complete") {
    try {
      var svg = encodeURI(GetBlock(id, "svg"));
      svg = JSON.parse('{"svg": "' + svg + '"}');
      var plainblock = GetBlock(id, "plain");
      if (plainblock) block = Object.assign(svg, plainblock);
      else return null;
    } catch (error) {
      winston.error(error);
      return null;
    } finally {
      return block;
    }
  } else {
    return null;
  }
}

/**
 *
 * @param {string} id id of the project
 * @param {string} format which information shoud be included: complete / default or blocks / plain / constructionplans / patterns / pictures
 */
function GetProject(id, format) {
  var project;
  var cp;
  var key;
  var i, j;

  if (
    (format == "complete") |
    (format == "default") |
    (format == "plain") |
    (format == "constructionplans") |
    (format == "patterns") |
    (format == "pictures")
  ) {
    try {
      project = JSON.parse(
        fs.readFileSync(dataPath + "/projects/" + id + "/project.json", "utf8")
      );
      if (format == "pictures") project = project.thumbnail;
      if (format != "plain") {
        key = project.constructionplan;
        cp = JSON.parse(
          fs.readFileSync(
            dataPath + "/_constructionplans/" + key + ".json",
            "utf8"
          )
        );
        if (format != "constructionplans") {
          for (i = 0; i < cp.pattern.length; i++) {
            var key = cp.pattern[i];
            var pattern = JSON.parse(
              fs.readFileSync(dataPath + "/_patterns/" + key + ".json", "utf8")
            );
            if (format != "patterns") {
              //WHAT substitution
              for (j = 0; j < pattern.what.length; j++) {
                key = pattern.what[j];
                pattern.what[j] = GetBlock(key, "plain");
              }
              //WHY substitution
              for (j = 0; j < pattern.why.length; j++) {
                key = pattern.why[j];
                pattern.why[j] = GetBlock(key, "plain");
              }
              //HOW substitution
              for (j = 0; j < pattern.how.length; j++) {
                key = pattern.how[j];
                if (format == "complete")
                  pattern.how[j] = GetBlock(key, "complete");
                else pattern.how[j] = GetBlock(key, "plain");
              }
            }
            cp.pattern[i] = pattern;
          }
        }
        project.constructionplan = cp;
      }
    } catch (error) {
      winston.error(error);
      return null;
    } finally {
      return project;
    }
  } else {
    return null;
  }
}
/*
function WritePattern(el){
    try {
        var filePath = dataPath + "/_patterns/"+el.id+".json";
        fs.appendFile(filePath, el)
    } catch (error) {
        console.log(error)
    }
}*/

// define the home page route
router.get("/", function(req, res) {
  res.status(200).send("<h1>Lorem Ipsum</h1>");
});

/* All blocks as array*/
router.get("/blocks", function(req, res, next) {
  res.status(200).send(blocks);
});

/* A block by id "/blocks/3050212" */
router.get("/blocks/:id", function(req, res) {
  try {
    var block = GetBlock(req.params.id, "complete");
  } catch (error) {
    winston.error(error);
    res.status(404).send("Not Found");
  } finally {
    if (block) res.status(200).json(block);
    else res.status(404).send("Not Found");
  }
});

/* A block by id and format (plain/svg/png) "/blocks/3050212/svg"  */
router.get("/blocks/:id/:format", function(req, res) {
  const key = req.params.id;
  const format = req.params.format;

  try {
    var block = GetBlock(key, format);
  } catch (error) {
    winston.error(error);
    res.status(404).send("Not Found");
  } finally {
    if (block) {
      if (format == "png") res.status(200).send(block);
      else res.status(200).json(block);
    } else res.status(404).send("Not Found");
  }
});

/* All projects as array */
router.get("/projects", function(req, res, next) {
  try {
    var items = fs.readdirSync(dataPath + "/projects");
  } catch (error) {
    winston.error(error);
    res.status(404).send("Not Found");
  } finally {
    if (items) res.status(200).json(items);
  }
});

/* A project by id "/projects/railwaymap" */
router.get("/projects/:id", function(req, res) {
  var key = req.params.id;
  try {
    var project = GetProject(key, "default");
  } catch (error) {
    winston.error("Project " + key + " Not Found " + error);
    res.status(404).send("Not Found");
  } finally {
    if (project) res.status(200).send(project);
    else res.status(404).send("Not Found");
  }
});

//format: complete / default / plain / constructionplans / patterns /pictures
router.get("/projects/:id/:format", function(req, res, next) {
  var key = req.params.id;
  var format = req.params.format;
  var project;
  try {
    if (format == "blocks") format = "default";
    project = GetProject(key, format);
  } catch (error) {
    winston.error(error);
    res.status(404).send("Not Found");
  } finally {
    if (project) res.status(200).send(project);
    else res.status(404).send("Not Found");
  }
});

/* A picture by id by project id "/projects/railwaymap/pic1.png" */
router.get("/projects/:id/pictures/:picId", function(req, res, next) {
  const key = req.params.id;
  const pic = req.params.picId;
  try {
    var imgurl = rooturl + "/projects/" + key + "/" + pic;
    var img = fs.readFileSync(
      dataPath + "/projects/" + key + "/" + pic,
      "base64"
    );
  } catch (error) {
    winston.error("Picture: " + pic + " in " + key + " Not Found " + error);
    res.status(404).send("Not Found");
  } finally {
    if (img) {
      res.status(200).json(imgurl);
    }
  }
});

/* All constructionplans as an array "/constructionplans" */
router.get("/constructionplans", function(req, res) {
  var items = [];
  var i;
  try {
    var temp = fs.readdirSync(dataPath + "/_constructionplans", "utf8", true);
    for (i = 0; i < temp.length; i++) {
      temp[i] = temp[i].split(".");
      if (temp[i][1] == "json") items.push(temp[i][0]);
    }
  } catch (error) {
    winston.error(error);
    res.status(404).send("Not Found");
  } finally {
    if (items) res.status(200).json(items);
    else res.status(404).send("Not Found");
  }
});

/*A constructionplan by id "/constructionplans/cp001" */
router.get("/constructionplans/:id", function(req, res) {
  const key = req.params.id;
  try {
    var cp = JSON.parse(
      fs.readFileSync(dataPath + "/_constructionplans/" + key + ".json", "utf8")
    );
  } catch (error) {
    winston.error(key + " Not Found " + error);
    res.status(404).send("Not Found");
  } finally {
    if (cp) res.status(200).json(cp);
  }
});

/* All patterns as an array "/patterns" */
router.get("/patterns", function(req, res) {
  var items = [];
  var i;
  try {
    var temp = fs.readdirSync(dataPath + "/_patterns", "utf8", true);
    for (i = 0; i < temp.length; i++) {
      temp[i] = temp[i].split(".");
      if (temp[i][1] == "json") items.push(temp[i][0]);
    }
  } catch (error) {
    winston.error(error);
    res.status(404).send("Not Found");
  } finally {
    if (items) res.status(200).json(items);
    else res.status(404).send("Not Found");
  }
});

/*A pattern by id "/patterns/streetmap" */
router.get("/patterns/:id", function(req, res) {
  const key = req.params.id;
  try {
    var pattern = JSON.parse(
      fs.readFileSync(dataPath + "/_patterns/" + key + ".json", "utf8")
    );
  } catch (error) {
    winston.error(key + " Not Found " + error);
    res.status(404).send("Not Found");
  } finally {
    if (pattern) res.status(200).json(pattern);
  }
});

/* All schemas as an array "/schemas" */
router.get("/schemas", function(req, res) {
  try {
    var temp = fs.readdirSync(dataPath + "/_schema", "utf8", true);
    var items = [];
    var i;
    for (i = 0; i < temp.length; i++) {
      temp[i] = temp[i].split(".");
      if (temp[i][1] == "schema") items.push(temp[i][0]);
    }
  } catch (error) {
    winston.error(error);
    res.status(404).send("Not Found");
  } finally {
    if (items) res.status(200).json(items);
    else res.status(404).send("Not Found");
  }
});

/* A schema by id "/schemas/project" */
router.get("/schemas/:id", function(req, res) {
  const key = req.params.id;
  try {
    var schema = JSON.parse(
      fs.readFileSync(dataPath + "/_schema/" + key + ".schema.json", "utf8")
    );
  } catch (error) {
    winston.error(key + " Not Found " + error);
    res.status(404).send("Not Found");
  } finally {
    if (schema) res.status(200).json(schema);
  }
});

router.post("/addpattern", function(req, res) {
  try {
    const filePath = dataPath + "/_patterns/"+req.body.id+".json";
    fs.appendFile(filePath,JSON.stringify(req.body),function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
    winston.info(req.body.id +".json created")
    res.status(201).send("Data recived");
  } catch (error) {
    winston.error(error)
    console.log(error)
    res.status(500).send("Not Found");
  }
});

router.post("/addconstructionplan", function(req, res) {
    try {
        const key = req.body.id
        const filePath = dataPath + "/_constructionplans/"+key+".json";
      fs.appendFile(filePath,JSON.stringify(req.body),function (err) {
          if (err) throw err;
          console.log('Saved!');
        });
      winston.info(req.body.id +".json created")
      res.status(201).send("Data recived");
    } catch (error) {
      winston.error(error)
      console.log(error)
      res.status(500).send("Not Found");
    }
  });

  router.post("/addproject", function(req, res) {
    try {
      const filePath = dataPath + "/_patterns/project.json";
      const dir = dataPath+"/projects/"+req.body.id;
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
      fs.appendFile(filePath,JSON.stringify(req.body),function (err) {
          if (err) throw err;
          console.log('Saved!');
          winston.info("project "+req.body.id+" created")
        });
     
      res.status(201).send("Data recived");
    } catch (error) {
      winston.error(error)
      console.log(error)
      res.status(500).send("Not Found");
    }
  });

module.exports = router;
