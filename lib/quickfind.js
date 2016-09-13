"use strict";
var system = require('system');
var webpage = require('webpage');
var page = webpage.create();
var leftMargin = 50;
var pageWidth = 1200;
var rectWidth = pageWidth - 2*leftMargin;
var pageHeight = 900;
var type = '.jpg'
page.open(system.args[1], function() {
    page.evaluate(function() {
        document.body.bgColor = 'white';
    });
    page.viewportSize = { width: pageWidth, height: pageHeight };
    page.clipRect = { top: 620, left: leftMargin, width: rectWidth, height: pageHeight };
    page.zoomFactor = 1.2;
    page.render('live' + type);
    phantom.exit();
});