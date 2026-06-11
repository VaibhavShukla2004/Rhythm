//check server.js end
exports.logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);//prints ef get,post and url for which requested
  //calls next() to pass the request along to wherever it was supposed to go.
  next();
};