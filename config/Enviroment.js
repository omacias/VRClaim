'use strict';

var env = require('./env.json');

var enviroment = process.env.NODE_ENV ? process.env.NODE_ENV : "local"
console.log("Running enviroment: " + enviroment);
env = env[enviroment];

exports.envParams = function() {
  return env;
};
