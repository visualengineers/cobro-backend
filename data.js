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

/* All blocks */
router.get('/blocks', function (req, res, next) {
    res.json(blocks)
})

/* A block by id "/blocks/3030512" */
router.get('/blocks/:id', function (req, res) {
    const key = req.params.id
    res.json(blocks.find(r => r.id == key))
})

/* All projects */
router.get('/projects', function (req, res, next) {
    var items = fs.readdirSync('./public/data/projects');
    res.json(items);
})

/* A project by id "/projects/railwaymap" */
router.get('/projects/:id', function (req, res) {
    const key = req.params.id
    var p = JSON.parse(fs.readFileSync("./public/data/projects/" + key + "/project.json", "utf8"))
    var schema = JSON.parse(fs.readFileSync('./public/data/_schema/project.schema.json', 'utf8'))
    if(v.validate(p,schema).valid)
        res.json(p)
    else
        res.send(err)
})

module.exports = router;