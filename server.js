const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');//import

connectDB();//then run
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/user.routes');//imports everything that home/routes/user.routes exports
const authRoutes = require('./routes/auth.routes');
const songRoutes = require('./routes/song.routes');

app.use('/auth',authRoutes);//if request starts with /auth, it will be handled by authRoutes
app.use('/user',userRoutes);
app.use('/song',songRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);//callback function that runs when server starts
}); 

//error handling
app.use((err,req,res,next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong' });
});

//middleware Every time a request hits your server, this middleware prints the HTTP Method (like GET or POST) and the URL (like /auth/login) directly into your terminal
const { logger } = require('./middlewares/logger.middleware');
app.use(logger);

//okay so all of it works on a basic blueprint where the request goes frm one folder to one folder based of function calling. No specific annotations.The req firsst arrives at server.js