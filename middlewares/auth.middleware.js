//this file is used by songservice

const jwt = require('jsonwebtoken');
// A middleware always takes 3 arguments: req, res, and next
const authMiddleware = (req, res, next) => {
    // 1. Look for the "Authorization: Bearer <token>" header
    const authHeader = req.headers.authorization;//eg "Bearer eyJhbGciOiJIUzI1NiIs..."
    // 2. If there is no token, REJECT the request immediately. The Controller will never even know this request existed.
    if(!authHeader){
        return res.status(401).json({ message: 'No token found'});
    }
// Before verify (encrypted, unreadable)
    const token = authHeader.split(' ')[1];//"Bearer " removed

    try{
        // After verify (decoded, readable)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);//eg(not fully accurate) decoded = {userId: "user123",the jwt secret, iat: 1700000000  // when it was created}
        req.user = decoded;
        next();
    }catch(err){
        return res.status(403).json({ message: 'Invalid Token'});
    }
}

module.exports = authMiddleware;

//In Spring Boot, you've probably used Filters or Interceptors (like OncePerRequestFilter in Spring Security). Their job is to intercept a request before it reaches your @RestController.
//In Express, these are called Middlewares. They act as the "bouncers" at the door of your application.