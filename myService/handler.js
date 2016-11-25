/**
 * Test via
 * serverless invoke local --function hello --path  event.json
 * 
 *  - files are automatically overwritten
 */

'use strict';
var AWS = require('aws-sdk'); 

var tools = require('./tools');
var s3 = new AWS.S3(); 

/**
 *  Test serverless invoke local --function uploadURI  --path  event.2.json  -l true
 * 
 */
module.exports.uploadURI = (event, context, callback) => {
    var response = {};
    var params = {
        Bucket: event.bucket || 'familynavi', 
        Key: event.folder + '/' + event.file,
        ACL: 'public-read',
        Expires: 60
    };
    s3.getSignedUrl('putObject', params, function (err, url) {
        console.log('The URL is', url);
        if (err){
            response.message = 'An error has occured';
            response.err = err;
            response.statusCode = 400;
        } else {
            response.statusCode = 200;
            response.url = url;
        }
        callback(null, response);

    });
};

module.exports.hello = (event, context, callback) => {
  var response = {
    statusCode: 200
  };
  
  // learn: event  = json or binary file

  var region = 'us-west1';

  var params = {
    Bucket: event.bucket || 'familynavi', 
    Key: event.folder + '/' + event.file,
    ACL: 'public-read'
  };

  //support binary files
//   if (typeof event === 'string'){    
//     console.log('type', event.substr(0,10));  
//     params.Body = new Buffer(event, "binary");
//     params.Key = 'binary/' + Math.round(Math.random()*1000000);
//     if (event.substr(0,10).indexOf('PNG') > -1){
//         params.Key += '.png';
//         params.ContentType = 'image/png';
//     }
//   }


  //support text files
  if (event.text){
      params.Body = event.text;
      params.ContentType = 'text/plain';
  }


  //support jsont files
  if (event.json){
      params.Body = JSON.stringify(event.json);
      params.ContentType = 'application/json';
  }

  //support images
  if (event.base64){
      var imageBuffer = tools.decodeBase64Image(event.base64);
      console.log('filetype', imageBuffer.type);
      params.ContentType = imageBuffer.type;
      //if png make sure file ending is png
      if (imageBuffer.type === 'image/png'){
          if (params.Key.substr(-3) !== 'png'){
              params.Key += '.png';
          }
      }
      params.Body = imageBuffer.data;
  }

  response.body = JSON.stringify({
      message: 'Uploaded ' + params.Key + ' to Bucket ' + params.Bucket + ' with Body of ' + params.Body.length + ' bytes',
      url: 'https://s3.amazonaws.com/'+params.Bucket+'/' + params.Key
  }); 



  s3.putObject(params, (err, data) => {

      if (err) {       
          console.log(err);
          response.message = 'An error has occured';
          delete response.url;
          response.err = err;
          response.statusCode = 400;
      } else {
          console.log("Successfully uploaded data to " + 'https://s3.amazonaws.com/'+params.Bucket+'/' + params.Key);   
      }

      callback(null, response);

   }); 


  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
