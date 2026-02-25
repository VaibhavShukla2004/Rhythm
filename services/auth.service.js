const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

exports.register = async ({ email, password, name, age, securityAnswer }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userModel.createUser({
    email,
    password: hashedPassword,
    name,
    age,
    securityAnswer
  });

  return user;
};

exports.login = async (email, password) => {
  const user = await userModel.findUserByEmail(email);
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return token;
};