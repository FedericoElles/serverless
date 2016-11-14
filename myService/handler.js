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


module.exports.hello = (event, context, callback) => {
  var response = {
    statusCode: 200
  };
  
  // learn: event  = json

  var region = 'us-west1';

  var params = {
    Bucket: event.bucket || 'familynavi', 
    Key: event.folder + '/' + event.file,
    ACL: 'public-read'
  };

  //support text files
  if (event.text){
      params.Body = event.text;
      params.ContentType = 'text/plain';
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

  //params.Key = 'txt/'+new Date().getTime() + '.txt';


  response.body = JSON.stringify({
      message: 'Uploaded ' + params.Key + ' to Bucket ' + params.Bucket + ' with Body of ' + params.Body.length + ' bytes',
      url: 'https://s3.amazonaws.com/'+params.Bucket+'/' + params.Key
  }); 



  s3.putObject(params, (err, data) => {

      if (err) {       
          console.log(err)
          response.statusCode = 400;
      } else {
          console.log("Successfully uploaded data to " + response.body.url);   
      }

      callback(null, response);

   }); 


  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
