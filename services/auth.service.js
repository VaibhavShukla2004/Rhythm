const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const Profile = require("../models/profile.model");
exports.register = async ({ email, password, name, age, securityAnswer }) => {
  //exports.register same as module.exports
  const hashedPassword = await bcrypt.hash(password, 10); //It first encrypts the plain-text password. The 10 is the "salt rounds"

  const user = await userModel.create({
    //await used to interract w any external resource/dependency
    email, //this means creating key email=email
    password: hashedPassword,
    name,
    age,
    securityAnswer,
  });

  await Profile.create({
    userId: user._id,
  });
  return user;
};

exports.login = async (email, password) => {
  const user = await userModel.findOne({ email });
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;
  // / 3. Generate a JWT Token
  const token = jwt.sign(
    { userId: user._id }, //// Payload (data to store in the token).ALso check docs page 6.
    process.env.JWT_SECRET, //// Your secret key from the .env file.so verifying(happens at the auth middleware) is basically matching decoded info with the info encoded at login, to do all this we need to unlock the token using the jwt secret key
    { expiresIn: "7d" }, // Expiration time
  );

  return token;
};

//if we didnt implement jwt--The server would have to do the heavy work of hashing and verifying your password against the database on every single click(hardcoded by us). If we dont harcode this,then no security at all. An attacker using postman can directly send request to anything of ours,and they wouldnt need authentication using jwt
