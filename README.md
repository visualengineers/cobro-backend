# cobro-backend

Backend for the Construction Kit Browser for Data Visualizations.



## Installing

Clone this repository  to your project directory

```
$ git clone --recurse-submodules <repository_url>
```

or

```
$ git clone <repository_url>
$ git submodule update --init
```

you need installed

- node (v12.2.0)
- npm (6.9.0)

Execute `npm install` in repository to install dependencies (e.g. express, JSONschema)

## Start

Start the Server with 

```
SET DEBUG=cobro-backend:* | npm run devstart
```
or

```
SET DEBUG=cobro-backend:* | npm start
```


the Server is now able to receive request on "localhost:3000/data"

## Usage

A detailed documentation which requests exist and which answers the server delivers follows. 

In general, the following requests are processed:
All Response are in JSON (except the Request for the svg and png files) 

Request | Response | Example
---------|---------|-------
**/blocks** | All blocks as array 
/blocks/:id |A block by id   |/blocks/3050212
/blocks/:id/:format | A block by id and a format (complete/plain/svg/png) | /blocks/3050212/svg
**/projects** | All projects as array
/projects/:id |A project by id | /projects/railwaymap
/projects/:id/:format|A project by id and a format (complete/default/plain/constructionplans/patterns)| /projects/railwaymap/plain
/projects/:id/pictures|All pictures as an array for a project id | /projects/railwaymap/pictures
/projects/:id/pictures/:picId | A picture by id by project id | /projects/railwaymap/pictures/pic1.png
**/constructionplans** | All constructionplans as an array|
/constructionplans/:id |A constructionplan by id | /constructionplans/cp001
**/patterns** |All patterns as an array |
/patterns/:id | A pattern by id | /patterns/streetmap
**/schemas** |All schemas as an array | /schemas
/schemas/:id |A schema by id | /schemas/project

With */projects/:id/complete* and */blocks/:id/complete*, in addition to the standard information, the "svgs" of the blocks are also sent via JSON. This requires encoding the string with [encodeURI()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI), which can be decoded with [decodeURI()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURI).
