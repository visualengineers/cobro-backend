var express = require('express');
var router = express.Router();

var Validator = require('jsonschema').Validator;
var v = new Validator();
var dataPath = __dirname + '/public/cobro-data';

var fs = require('fs');
const blocks = JSON.parse(fs.readFileSync(dataPath + '/_assets/blocks/blocks.json', 'utf8'));

router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now(), 'Req: ' + req.originalUrl) // Prototyp Logging
    next()
})

/**
 * 
 * @param {int} id id of the block
 * @param {string} format which information shoud be included: all / plain / svg / png
 */
function GetBlock(id, format) {
    var block
    if (format == 'png' || format == 'svg') {
        try {
            block = fs.readFileSync(dataPath + '/_assets/icons/icon_' + id + '.' + format, 'utf8')
        } finally {
            return block
        }
    }
    else if (format == 'plain') {
        try {
            block = blocks.find(r => r.id == id)
        } finally {
            return block
        }
    }
    else if (format == 'all') {
        try {
            var svg = encodeURI(GetBlock(id, 'svg'))
            svg = JSON.parse('{"svg": "' + svg + '"}')
            var plainblock = GetBlock(id, 'plain')
            if (plainblock)
                block = Object.assign(svg, plainblock)
            else
                return null
        } catch (error) {
            return null
        } finally {
            return block
        }
    }
    else {
        return null
    }
}

/**
 * 
 * @param {string} id id of the project
 * @param {string} format which information shoud be included: all / plain or picId
 */
function GetProject(id, format) {
    var project
    var cp
    var key
    var i, j

    if (format == 'all' | format == 'plain') {
        try {
            project = JSON.parse(fs.readFileSync(dataPath + '/projects/' + id + '/project.json', 'utf8'))
            if (format == 'all') {
                key = project.constructionplan
                cp = JSON.parse(fs.readFileSync(dataPath + '/_constructionplans/' + key + '.json', 'utf8'))
                for (i = 0; i < cp.pattern.length; i++) {
                    var key = cp.pattern[i]
                    var pattern = JSON.parse(fs.readFileSync(dataPath + '/_patterns/' + key + '.json', 'utf8'))
                    //WHAT substitution 
                    for (j = 0; j < pattern.what.length; j++) {
                        key = pattern.what[j]
                        pattern.what[j] = GetBlock(key, 'plain')
                    }
                    //WHY substitution 
                    for (j = 0; j < pattern.why.length; j++) {
                        key = pattern.why[j]
                        pattern.why[j] = GetBlock(key, 'plain')
                    }
                    //HOW substitution 
                    for (j = 0; j < pattern.how.length; j++) {
                        key = pattern.how[j]
                        pattern.how[j] = GetBlock(key, 'plain')
                    }
                    cp.pattern[i] = pattern
                }
                project.constructionplan = cp
            }
        } catch (error) {
            return null
        }
        finally {
            return project
        }
    }

}


// define the home page route
router.get('/', function (req, res) {
    res.status(200).send('<h1>Lorem Ipsum</h1>')
})

/* All blocks as array*/
router.get('/blocks', function (req, res, next) {
    res.status(200).json(blocks)
})

/* A block by id "/blocks/3050212" */
router.get('/blocks/:id', function (req, res) {
    var block = GetBlock(req.params.id, 'all')
    if (block == null) {
        res.status(404).json('Not Found')
    }
    else {
        res.status(200).json(block)
    }
})

/* A block by id and format (plain/svg/png) "/blocks/3050212/svg"  */
router.get('/blocks/:id/:format', function (req, res) {
    const key = req.params.id
    const format = req.params.format

    var block = GetBlock(key, format)
    if (block)
        res.status(200).send(block)
    else
        res.status(406).send('Not Acceptable')
});

/* All projects as array */
router.get('/projects', function (req, res, next) {
    var items = fs.readdirSync(dataPath + '/projects');
    res.status(200).json(items);
})

/* A project by id "/projects/railwaymap" */
router.get('/projects/:id', function (req, res) {
    var key = req.params.id
    try {
        var project = GetProject(key, 'all')
    } catch (error) {
        res.status(404).send('Not Found')
    } finally {
        res.status(200).send(project)
    }
})

/* A picture by id by project id "/projects/railwaymap/pic1.png" */
router.get('/projects/:id/:picId', function (req, res) {
    const key = req.params.id
    const pic = req.params.picId
    try {
        var img = fs.readFileSync(dataPath + '/projects/' + key + '/' + pic, 'base64')
    } catch (error) {
        res.status(404).send('Not Found')
    }
    finally {
        if (img)
            res.status(200).send(img)
    }
});

/* All constructionplans as an array "/constructionplans" */
router.get('/constructionplans', function (req, res) {
    var temp = fs.readdirSync(dataPath + '/_constructionplans', 'utf8', true);
    var items = []
    var i
    for (i = 0; i < temp.length; i++) {
        temp[i] = temp[i].split('.')
        if (temp[i][1] == 'json')
            items.push(temp[i][0])
    }
    res.status(200).json(items);
});

/*A constructionplan by id "/constructionplans/cp001" */
router.get('/constructionplans/:id', function (req, res) {
    const key = req.params.id
    try {
        var cp = JSON.parse(fs.readFileSync(dataPath + '/_constructionplans/' + key + '.json', 'utf8'))
    } catch (error) {
        res.status(404).send('Not Found')
    } finally {
        res.status(200).json(cp)
    }
});

/* All patterns as an array "/patterns" */
router.get('/patterns', function (req, res) {
    var temp = fs.readdirSync(dataPath + '/_patterns', 'utf8', true);
    var items = []
    var i
    for (i = 0; i < temp.length; i++) {
        temp[i] = temp[i].split('.')
        if (temp[i][1] == 'json')
            items.push(temp[i][0])
    }
    res.status(200).json(items);
});

/*A pattern by id "/patterns/streetmap" */
router.get('/patterns/:id', function (req, res) {
    const key = req.params.id
    try {
        var pattern = JSON.parse(fs.readFileSync(dataPath + '/_patterns/' + key + '.json', 'utf8'))
    } catch (error) {
        res.status(404).send('Not Found')
    } finally {
        if (pattern)
            res.status(200).json(pattern)
    }
});

/* All schemas as an array "/schemas" */
router.get('/schemas', function (req, res) {
    try {
        var temp = fs.readdirSync(dataPath + '/_schema', 'utf8', true);
        var items = []
        var i
        for (i = 0; i < temp.length; i++) {
            temp[i] = temp[i].split('.')
            if (temp[i][1] == 'schema')
                items.push(temp[i][0])
        }
    }
    catch (error) {
        res.status(404).json('Not Found');
    }
    finally {
        res.status(200).json(items);
    }
});

/* A schema by id "/schemas/project" */
router.get('/schemas/:id', function (req, res) {
    const key = req.params.id
    try {
        var schema = JSON.parse(fs.readFileSync(dataPath + '/_schema/' + key + '.schema.json', 'utf8'))
    } catch (error) {
        res.status(404).json('Not Found')
    } finally {
        res.status(200).json(schema)
    }
})

module.exports = router;