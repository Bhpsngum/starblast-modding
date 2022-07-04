const http = require('http');
const https = require('https');

module.exports = function URLFetcher (URL) {
    return new Promise(function (resolve, reject) {
        let fetcher = URL.startsWith("https://") ? https : http;
        fetcher.get(URL, function (res) {
          const { statusCode } = res;
          const contentType = res.headers['content-type'];
  
          let error;
          // Any 2xx status code signals a successful response but
          // here we're only checking for 200.
          if (Math.trunc(statusCode / 100) != 2) {
            res.resume();
            reject(new Error("Failed to fetch the file at URL '" + URL + "'. Resource status code: "+ statusCode))
          }
  
          let rawData = '';
  
          res.setEncoding('utf8');
          res.on('data', (chunk) => { rawData += chunk; });
          res.on('end', function () {
            resolve(rawData)
          });
        }).on('error', reject)
      })
}