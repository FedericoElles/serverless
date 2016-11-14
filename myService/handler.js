/**
 * Test via
 * serverless invoke local --function hello --path  event.json
 * 
 *  - files are automatically overwritten
 */

'use strict';
var AWS = require('aws-sdk'); 

var s3 = new AWS.S3(); 

module.exports.hello = (event, context, callback) => {
  var response = {
    statusCode: 200
  };
  
  // learn: event  = json
  console.log('evnt', event, event.key1);


  var region = 'us-west1';

  var params = {
    Bucket: 'familynavi', 
    Key: 'myKey',
    ACL: 'public-read', 
    Body: 'Hello!'
  };
  params.Key = 'txt/'+new Date().getTime() + '.txt';

  var url = ' https://s3.amazonaws.com/'+params.Bucket+'/' + params.Key;

  response.body = JSON.stringify({
      message: 'Uploaded ' + params.Key + ' to Bucket ' + params.Bucket + ' with Body ' + params.Body + ' accessible at ' + url,
      input: event
  }); 



  s3.putObject(params, (err, data) => {

      if (err) {       
          console.log(err)
          response.statusCode = 400;
      } else {
          console.log("Successfully uploaded data to " + url);   
      }

      callback(null, response);

   }); 


  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
