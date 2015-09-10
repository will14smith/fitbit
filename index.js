require("babel/register");
Promise.node = function(fn) {
  return new Promise(function (resolve, reject) {
    fn(function (err, result) {
      if(err) reject(err);
      else resolve(result);
    });
  });
}
require('./app');
