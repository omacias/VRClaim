'use strict';

var env = require('../config/Enviroment').envParams();
var busboy = require('connect-busboy');
var uuidV4 = require('uuid/v4');
var path = require('path')
var fs = require('fs');
var service = require('../services/DBoperations').dbOperations();
var validFormats = ['.jpeg','.jpg','.png','.JPEG','.JPG','.PNG'];

exports.listen = function(app){
  app.use(busboy());
  uploadService(app);
  searchUrlForClaim(app);
};

function searchUrlForClaim(app) {
  app.get('/search/:claimNumber', function(req, res){
    if(req.params.claimNumber == null) {
      res.status(400)
      return res.json(getJsonResponse("400", "Claim number is required ", null));
    }

    //search by claim number
    var objImage = service.search(req.params.claimNumber);
    if(objImage) {
      return res.json(getJsonResponse("200", "Found!", objImage.urlVR));
    }else {
      res.status(404);
      return res.json(getJsonResponse("404", "Not found!", null));
    }
  });
}

function uploadService(app) {
  app.put('/upload/:claimNumber', function(req, res){
    if(req.params.claimNumber == null) {
      res.status(400)
      return res.json(getJsonResponse("400", "Claim number is required ", null));
    }

    if(!authentication(req)){
      res.status(401);
      return res.json(getJsonResponse("401", "Unauthorized", null));
    }

    try {
      req.pipe(req.busboy);
      req.busboy.on('file', function (fieldname, file, filename) {
          console.log("Uploading: " + filename);
          var ext = path.extname(filename);
          var name = uuidV4() + ext;
          if(validFormats.indexOf(ext) == -1) {
            console.log("Invalid image format: " + ext);
            res.status(400)
            return res.json(getJsonResponse("400", "Invalid image format, valids are: " + validFormats.join(' '), null))
          }
          var fstream = fs.createWriteStream("./vrview-google/images/" + name);
          file.pipe(fstream);
          fstream.on('close', function () {
              console.log("Upload success: " + name);
              var url = req.protocol + '://' + req.get('host') + "/vrclaim/?image=images\\" + name;

              //delete last image assigned, if applies
              var objImage = service.search(req.params.claimNumber);
              if(objImage) {
                var pathImage = "./vrview-google/images/"+objImage.imageName;
                console.log("Deleting " + pathImage);
                fs.unlink("./vrview-google/images/"+objImage.imageName);
              }
              //insert new url reference
              service.save(url, name, req.params.claimNumber);

              res.json(getJsonResponse("200", "Success", url));
          });
      });
    } catch (e) {
      res.status(500);
      res.json(getJsonResponse("500", "An error happened", null));
    }
  });
}

function getJsonResponse(status, message, url) {
  return {"code":status, "message": message, "url": url};
}

function authentication(request){
  console.log("Validating user access...");
  var base64 = new Buffer(env.userWS+":"+env.passwordWS).toString('base64');
  var auth = request.get('Authorization').replace('Basic ', '');
  if(base64 === auth) {
    console.log("Access granted!");
    return true;
  }else{
    console.log("Access denied!");
    return false
  }
}
