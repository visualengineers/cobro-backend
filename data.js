var express = require('express');
var router = express.Router();

var Validator = require('jsonschema').Validator;
var v = new Validator();

var fs = require('fs');
var blocks = JSON.parse(fs.readFileSync('./public/data/_assets/blocks/blocks.json', 'utf8'));


// define the home page route
router.get('/', function (req, res) {
    res.send("<h1>Lorem Ipsum</h1>")
})

/* All blocks as array*/
router.get('/blocks', function (req, res, next) {
    res.json(blocks)
})

/* A block by id "/blocks/3030512" */
router.get('/blocks/:id', function (req, res) {
    const key = req.params.id
    res.json(blocks.find(r => r.id == key))
})
/* A picture of a block by id and png or svg "/blocks/3030512/svg"  */
router.get('/blocks/:id/:pic', function (req, res) {
    const key = req.params.id
    const pic = req.params.pic
    if (pic == "png" || pic == "svg")
        res.send(fs.readFileSync("./public/data/_assets/icons/icon_" + key + "." + pic, "utf8"))
    else
        res.status(406).send("Not Acceptable")
});

/* All projects as array */
router.get('/projects', function (req, res, next) {
    var items = fs.readdirSync('./public/data/projects');
    res.json(items);
})

/* A project by id "/projects/railwaymap" */
router.get('/projects/:id', function (req, res) {
    const key = req.params.id
    var instance = JSON.parse(fs.readFileSync("./public/data/projects/" + key + "/project.json", "utf8"))
    var schema = JSON.parse(fs.readFileSync('./public/data/_schema/project.schema.json', 'utf8'))
    if (v.validate(instance, schema).valid)
        res.send(instance)
    else
        res.send(err)
})


/* A picture by id by project id "/projects/railwaymap/pic1.png" */
router.get('/projects/:id/:picId', function (req, res) {
    const key = req.params.id
    const pic = req.params.picId
    //pic = fs.readFileSync("./public/data/projects/" + key +"/"+ pic, "utf8")
    res.send(fs.readFileSync("./public/data/projects/" + key + "/" + pic, "base64"))
    //res.status(404).send("file not found")
});

/* All constructionplans as an array "/constructionplans" */
router.get('/constructionplans', function (req, res) {
    var temp = fs.readdirSync('./public/data/_constructionplans', "utf8", true);
    var items = []
    var i
    for (i = 0; i < temp.length; i++) {
        temp[i] = temp[i].split(".")
        if (temp[i][1] == "json")
            items.push(temp[i][0])
    }
    res.json(items);
});

/*A constructionplan by id "/constructionplans/cp001" */
router.get('/constructionplans/:id', function (req, res) {
    const key = req.params.id
    res.json(JSON.parse(fs.readFileSync("./public/data/_constructionplans/" + key + ".json", "utf8")))
});

/* All patterns as an array "/patterns" */
router.get('/patterns', function (req, res) {
    var temp = fs.readdirSync('./public/data/_patterns', "utf8", true);
    var items = []
    var i
    for (i = 0; i < temp.length; i++) {
        temp[i] = temp[i].split(".")
        if (temp[i][1] == "json")
            items.push(temp[i][0])
    }
    res.json(items);
});

/*A pattern by id "/patterns/streetmap" */
router.get('/patterns/:id', function (req, res) {
    const key = req.params.id
    res.json(JSON.parse(fs.readFileSync("./public/data/_patterns/" + key + ".json", "utf8")))
});

/* A schema by id "/schema/projects" */
router.get('/schema/:id', function (req, res) {
    const key = req.params.id
    res.json(JSON.parse(fs.readFileSync("./public/data/_schema/" + key + ".schema.json", "utf8")))
})

module.exports = router;