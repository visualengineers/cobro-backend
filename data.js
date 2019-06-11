var express = require('express');
var router = express.Router();

var Validator = require('jsonschema').Validator;
var v = new Validator();
var dataPath = __dirname + '/public/cobro-data';

var fs = require('fs');
var blocks = JSON.parse(fs.readFileSync(dataPath + '/_assets/blocks/blocks.json', 'utf8'));


// define the home page route
router.get('/', function (req, res) {
    res.status(200).send("<h1>Lorem Ipsum</h1>")
})

/* All blocks as array*/
router.get('/blocks', function (req, res, next) {
    res.status(200).json(blocks)
})

/* A block by id "/blocks/3050212" */
router.get('/blocks/:id', function (req, res) {
    const key = req.params.id
    var block = blocks.find(r => r.id == key)
    var svg = encodeURI(fs.readFileSync("./public/cobro-data/_assets/icons/icon_" + key + ".svg", "utf8"))
    svg = JSON.parse('{"svg": "' + svg + '"}')
    Object.assign(block, svg);
    res.status(200).json(block)
})

/* A picture of a block by id and png or svg "/blocks/3050212/svg"  */
router.get('/blocks/:id/:pic', function (req, res) {
    const key = req.params.id
    const pic = req.params.pic
    if (pic == "png" || pic == "svg")
        res.status(200).send(fs.readFileSync(dataPath + "/_assets/icons/icon_" + key + "." + pic, "utf8"))
    else
        res.status(406).send("Not Acceptable")
});

/* All projects as array */
router.get('/projects', function (req, res, next) {
    var items = fs.readdirSync('./public/cobro-data/projects');
    res.status(200).json(items);
})

/* A project by id "/projects/railwaymap" */
router.get('/projects/:id', function (req, res) {
    var key = req.params.id
    var project = JSON.parse(fs.readFileSync(dataPath + "/projects/" + key + "/project.json", "utf8"))
    var key = project.constructionplan
    var cp = JSON.parse(fs.readFileSync(dataPath + "/_constructionplans/" + key + ".json", "utf8"))
    var i, j
    for (i = 0; i < cp.pattern.length; i++) {
        var key = cp.pattern[i]
        var pattern = JSON.parse(fs.readFileSync(dataPath + "/_patterns/" + key + ".json", "utf8"))
        //WHAT substitution 
        for (j = 0; j < pattern.what.length; j++) {
            key = pattern.what[j]
            pattern.what[j] = blocks.find(r => r.id == key)
        }
        //WHY substitution 
        for (j = 0; j < pattern.why.length; j++) {
            key = pattern.why[j]
            pattern.why[j] = blocks.find(r => r.id == key)
        }
        //HOW substitution 
        for (j = 0; j < pattern.how.length; j++) {
            key = pattern.how[j]
            
            var block = blocks.find(r => r.id == key)
            var svg = encodeURI(fs.readFileSync("./public/cobro-data/_assets/icons/icon_" + key + ".svg", "utf8"))
            //var svg = encodeURI('<?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">            <svg version="1.1" id="Ebene_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"                 width="68px" height="68px" viewBox="0 0 68 68" enable-background="new 0 0 68 68" xml:space="preserve">            <path fill="#236666" d="M19.072,25.105h2.651l5.327,16.362h-2.334l-1.179-3.897h-6.322l-1.224,3.897h-2.106L19.072,25.105z                 M20.342,27.031h-0.045l-2.562,8.726h5.236L20.342,27.031z"/>            <path fill="#236666" d="M29.432,41.468V25.105h5.327c2.267,0,3.035,0.77,3.648,1.677c0.565,0.884,0.657,1.858,0.657,2.176                c0,2.039-0.702,3.399-2.81,3.875v0.113c2.334,0.271,3.354,1.677,3.354,3.921c0,4.192-3.059,4.601-4.917,4.601H29.432z                 M31.517,31.994h3.037c1.632-0.021,2.425-1.019,2.425-2.606c0-1.359-0.769-2.47-2.516-2.47h-2.946V31.994z M31.517,39.655h2.946                c2.222,0,3.015-1.587,3.015-2.787c0-2.606-1.61-3.06-3.739-3.06h-2.222V39.655z"/>            <path fill="#236666" d="M50.285,29.616c0.023-0.929-0.046-1.86-0.476-2.38c-0.43-0.521-1.406-0.701-1.837-0.701                c-1.721,0-2.401,1.04-2.47,1.268c-0.068,0.182-0.475,0.589-0.475,3.4v4.374c0,4.012,1.314,4.487,2.923,4.487                c0.635,0,2.561-0.227,2.583-3.423h2.154c0.09,5.166-3.558,5.166-4.625,5.166c-2.038,0-5.167-0.134-5.167-6.479v-4.623                c0-4.623,2.042-5.938,5.258-5.938c3.241,0,4.489,1.678,4.284,4.851H50.285z"/>            <rect x="9" y="9" fill="none" stroke="#236666" stroke-miterlimit="10" width="48.571" height="48.572"/></svg>')
            svg = JSON.parse('{"svg": "' + svg + '"}')
            Object.assign(block, svg);
            
            pattern.how[j] = block
        }
        cp.pattern[i] = pattern
    }

    project.constructionplan = cp


    res.status(200).send(project)

})

/* A picture by id by project id "/projects/railwaymap/pic1.png" */
router.get('/projects/:id/:picId', function (req, res) {
    const key = req.params.id
    const pic = req.params.picId
    //pic = fs.readFileSync(dataPath + "/projects/" + key +"/"+ pic, "utf8")
    res.status(200).send(fs.readFileSync(dataPath + "/projects/" + key + "/" + pic, "base64"))
    //res.status(404).send("file not found")
});

/* All constructionplans as an array "/constructionplans" */
router.get('/constructionplans', function (req, res) {
    var temp = fs.readdirSync('./public/cobro-data/_constructionplans', "utf8", true);
    var items = []
    var i
    for (i = 0; i < temp.length; i++) {
        temp[i] = temp[i].split(".")
        if (temp[i][1] == "json")
            items.push(temp[i][0])
    }
    res.status(200).json(items);
});

/*A constructionplan by id "/constructionplans/cp001" */
router.get('/constructionplans/:id', function (req, res) {
    const key = req.params.id
    res.status(200).json(JSON.parse(fs.readFileSync(dataPath + "/_constructionplans/" + key + ".json", "utf8")))
});

/* All patterns as an array "/patterns" */
router.get('/patterns', function (req, res) {
    var temp = fs.readdirSync('./public/cobro-data/_patterns', "utf8", true);
    var items = []
    var i
    for (i = 0; i < temp.length; i++) {
        temp[i] = temp[i].split(".")
        if (temp[i][1] == "json")
            items.push(temp[i][0])
    }
    res.status(200).json(items);
});

/*A pattern by id "/patterns/streetmap" */
router.get('/patterns/:id', function (req, res) {
    const key = req.params.id
    res.status(200).json(JSON.parse(fs.readFileSync(dataPath + "/_patterns/" + key + ".json", "utf8")))
});

/* All schemas as an array "/schemas" */
router.get('/schemas', function (req, res) {
    var temp = fs.readdirSync('./public/cobro-data/_schema', "utf8", true);
    var items = []
    var i
    for (i = 0; i < temp.length; i++) {
        temp[i] = temp[i].split(".")
        if (temp[i][1] == "schema")
            items.push(temp[i][0])
    }
    res.status(200).json(items);
});

/* A schema by id "/schemas/project" */
router.get('/schemas/:id', function (req, res) {
    const key = req.params.id
    res.status(200).json(JSON.parse(fs.readFileSync(dataPath + "/_schema/" + key + ".schema.json", "utf8")))
})

module.exports = router;