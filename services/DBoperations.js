'use strict';

var JsonDB = require("node-json-db");
var env = require('../config/Enviroment').envParams();

var db = new JsonDB(env.database.name, true, false);

exports.dbOperations = function(){
  return {
    save: saveFunction,
    search: searchFunction,
    getAll: getAllFunction
  };
};

var saveFunction = function(url, imageName, claim) {
  db.push("/URLClaim/Claim"+claim, {claimNumber: claim, imageName: imageName, urlVR: url});
}

var searchFunction = function(claim) {
  try {
    var data = db.getData("/URLClaim/Claim"+claim);
    return data;
  } catch(error) {
    console.error(error.message);
    return null;
  }
}

var getAllFunction = function() {
  try {
    var data = db.getData("/URLClaim");
    return data;
  } catch(error) {
    console.error(error.message);
    return null;
  }
}
