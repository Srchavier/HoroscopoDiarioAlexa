const AWS = require('aws-sdk');
const api = require('api.js');


const s3SigV4Client = new AWS.S3({
    signatureVersion: 'v4'
});

module.exports.getS3PreSignedUrl = function getS3PreSignedUrl(s3ObjectKey) {

    const bucketName = process.env.S3_PERSISTENCE_BUCKET;
    const s3PreSignedUrl = s3SigV4Client.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: s3ObjectKey,
        Expires: 60*1 // the Expires is capped for 1 minute
    });
    console.log(`Util.s3PreSignedUrl: ${s3ObjectKey} URL ${s3PreSignedUrl}`);
    return s3PreSignedUrl;

}

module.exports.getFactory =  function getFactory(endpoint) {
    console.log(endpoint)
    return api.get(endpoint);
}


module.exports.postFactory =  function getFactory(endpoint, object) {
    return api.post(endpoint, object);
}

module.exports.randomNumber =  function randomNumber() {  
    return Math.floor(Math.random() * (100 - 1) + 1); 
}  