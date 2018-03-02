var pg = require('pg');
var parseConnectionString = require('pg-connection-string');

var connectionString;

if(process.env.DATABASE_URL){
  connectionString = process.env.DATABASE_URL
} else {
  connectionString = 'postgres://' +
  process.env.POSTGRES_USER +':'+
  process.env.POSTGRES_PASSWORD+'@localhost/imgnation';
}

const pool = new pg.Pool(typeof connectionString === 'string' ? parseConnectionString.parse(connectionString) : connectionString);
//export the adapter function
module.exports = function(queryString, queryParameters, onComplete) {
 //normalize parameters, allowing only passing a query string and an optional `onComplete` handler
 if (typeof queryParameters == 'function') {
   onComplete = queryParameters;
   queryParameters = [];
 }
 //everything else is almost the same as before, replacing hard-coded strings and arrays with parameters
 pool.connect(function(err, client, done) {
   if (err) {
     console.log(`error: connection to database failed. connection string: "${connectionString}" ${err}`);
     if (client) {
       done(client);
     }
     //check if `onComplete` exists before calling
     if (onComplete) {
       onComplete(err);
     }
     return;
   }
   client.query(queryString, queryParameters, function(err, result, pool) {
     if (err) {
       console.log(queryString);
       done(client);
       console.log(`error: query failed: "${queryString}", "${queryParameters}", ${err}`);
     }
     else {
       done();
     }
     //check if `onComplete` exists before calling
     if (onComplete) {
       onComplete(err, result);
     }
   });
 });
};
