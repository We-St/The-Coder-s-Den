/**
 * Main entry point for the static site generation.
 */

var Metalsmith = require('metalsmith'),
    markdown   = require('metalsmith-markdown'),
    templates  = require('metalsmith-templates'),
    Handlebars = require('handlebars'),
    fs         = require('fs'),
    collections = require('metalsmith-collections'),
    permalinks  = require('metalsmith-permalinks'),
    metallic = require('metalsmith-metallic');

Handlebars.registerPartial('header', fs.readFileSync(__dirname + '/templates/partials/header.hbt').toString());
Handlebars.registerPartial('footer', fs.readFileSync(__dirname + '/templates/partials/footer.hbt').toString());
Handlebars.registerPartial('sidebar', fs.readFileSync(__dirname + '/templates/partials/sidebar.hbt').toString());


var plugin = function(files, metalsmith, done) {
    console.log(files);
    done();
};


Metalsmith(__dirname)
    .use(collections({
        pages: {
            pattern: 'content/pages/*.md'
        },
        posts: {
            pattern: 'content/posts/*.md',
            sortBy: 'date',
            reverse: true
        }
    }))
    .use(markdown())
    .use(metallic())
    .use(permalinks({
        pattern: ':collection/:title'
    }))
    .use(templates('handlebars'))
    .destination('./build')
    .use(plugin)
    .build(function (err) {
        if(err) {
            return console.error(err);
        }
        console.info('Buld finished successfully');
    });


