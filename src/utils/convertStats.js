module.exports = function(data) {
  if (isNaN(data)) return 0;
  let stats = [];
  for (let i = 0; i < 8; i++) {
    stats.push(data % 16); // equivalent to 15&data
    data = data / 16 // equivalent to data = data >> 4
  }
  return stats
}
