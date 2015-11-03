/**
 * Main entry point for the static site generation.
 */

var Metalsmith = require('metalsmith');


Metalsmith(__dirname)
    .destination('./build')
    .build()
	
	