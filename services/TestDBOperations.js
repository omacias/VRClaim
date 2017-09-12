'use strict';

var service = require('./DBoperations').dbOperations();


service.save("http://test.com/imagen1.jpg", "imagen1.jpg", "7000002");

console.log(service.search("7000002"));

service.getAll();
