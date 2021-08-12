'use strict';

const XMLHttpRequest = require("xhr2");

module.exports = function(region) {
  let xhr = new XMLHttpRequest;
  xhr.open("GET", "https://starblast.io/simstatus.json", !0);
  xhr.send(null);
  return new Promise(function (resolve, reject) {
    xhr.onload = function () {
      if (200 === xhr.status) {
        let server = JSON.parse(xhr.responseText).filter(server => server.modding && server.location === region).sort((a,b) => a.usage.cpu - b.usage.cpu)[0];
        if (!server) reject(new Error("Could not find any servers with the specified region"));
        else {
          let data = server.address.split(":");
          resolve({ip: data[0], port: data[1]})
        }
      }
    }
    xhr.onerror = function () {
      reject(new Error("Failed to connect to the database"))
    }
  })
}
