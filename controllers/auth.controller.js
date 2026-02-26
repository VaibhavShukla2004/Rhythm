const authService = require('../services/auth.service');

const register = async (req, res) => {
  const { email, password, name, age, securityAnswer } = req.body;

  const user = await authService.register({
    email,
    password,
    name,
    age,
    securityAnswer
  });

  res.status(201).json(user);
};

const login = async (req,res) => {
    const { email, password } = req.body;
    try {
        const token = await authService.login(email, password);
        if(!token){
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        res.json({ token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { register, login };