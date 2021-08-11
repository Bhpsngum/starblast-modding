'use strict';

module.exports = function(data) {
  if (isNaN(data)) return 0;
  let stats = [];
  for (let i = 0; i < 8; i++) {
    stats.push(15 & data); // equivalent to data % 16
    data = data >> 4 // equivalent to data = data / 16
  }
  return stats
}
