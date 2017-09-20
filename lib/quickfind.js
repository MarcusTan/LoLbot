"use strict";
var system = require('system');
var webpage = require('webpage');
var fs = require('fs');
var output = 'output.html';
        // fs.write(output, document.getElementsByTagName("BODY")[0], 'w');

var page = webpage.create();
var leftMargin = 50;
var pageWidth = 1200;
var rectWidth = pageWidth - 2*leftMargin;
var pageHeight = 910;
var type = '.png'
page.open(system.args[1], function(status) {
    console.log(system.args);
    console.log(status);
    
    page.evaluate(function() {
        document.body.bgColor = 'white';
        console.log(document.getElementsByTagName("BODY")[0]);
    });
    page.viewportSize = { width: pageWidth, height: pageHeight };
    page.clipRect = { top: 630, left: leftMargin, width: rectWidth, height: pageHeight };
    page.zoomFactor = 1.2;
    // wait for the layout to load...
    window.setTimeout(function () {
        page.render('live' + type);
        phantom.exit();
    }, 1000);
});