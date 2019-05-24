# cobro-backend

Backend for the Construction Kit Browser for Data Visualizations.



## Installing

Clone this repository  to your project directory


you need installed

- node (v12.2.0)

- express (4.17.0)

- JSONschema (1.2.4)

for that you need the npm (6.9.0)

## Start



Start the Server with 

```
node app.js
```

the Server is now able to receive request on "localhost:3000/cobro-data"



## Usage

A detailed documentation which requests exist and which answers the server delivers follows. 

In general, the following requests are processed:
All Response are in JSON (except the Request for the svg and png files) 

Request | Response | Example
---------|---------|-------
**/blocks** | All blocks as array 
/blocks/:id |A block by id   |/blocks/3030512
/blocks/:id/:pic | A picture of a block by id and png or svg| /blocks/3030512/svg
**/projects** | All projects as array
/projects/:id |A project by id | /projects/railwaymap
/projects/:id/:picId | A picture by id by project id | /projects/railwaymap/pic1.png
**/constructionplans** | All constructionplans as an array|
/constructionplans/:id |A constructionplan by id | /constructionplans/cp001
**/patterns** |All patterns as an array |
/patterns/:id | A pattern by id | /patterns/streetmap
**/schema/:id** |A schema by id | /schema/project

