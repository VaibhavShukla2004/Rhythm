const authService = require('../services/auth.service');
//// A controller function in Express always takes 'req' (request) and 'res' (response)
const register = async (req, res) => {
  const { email, password, name, age, securityAnswer } = req.body;

  const user = await authService.register({//we need to figure out error logic for this
    email,
    password,
    name,
    age,
    securityAnswer
  });

  res.status(201).json(user);//runs if everything successful, status 201 created and data object user converted into json and returned to "clients"
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


//In Spring Boot, this is exactly what your @RestController classes do. A controller's job is to read the incoming request, call a Service to do the heavy lifting, and then return an HTTP response (like 200 OK or 400 Bad Request).

