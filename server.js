const http = require('http');
const cors = require('cors');
const express = require('express');
const {initializeSocket} = require('./config/socket');
const {registerSocketHandlers} = require('./sockets/socket.handler');
const{ startTimerSweeper} = require('./utils/timerManager');
require('dotenv').config();
const { webcrypto } = require('crypto');

if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = webcrypto;
}

const connectDB = require('./config/db');//import

connectDB(); //then run
const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

app.use(cors());

app.use(express.json());

const userRoutes = require('./routes/user.routes');//imports everything that home/routes/user.routes exports
const authRoutes = require('./routes/auth.routes');
const songRoutes = require('./routes/song.routes');
const roomRoutes = require('./routes/room.routes');
const gameRoutes = require('./routes/game.routes');
const aiRoutes = require('./routes/ai.routes');
const profileRoutes = require('./routes/profile.routes');
//middleware Every time a request hits your server, this middleware prints the HTTP Method (like GET or POST) and the URL (like /auth/login) directly into your terminal
const { logger } = require("./middlewares/logger.middleware");
app.use(logger);

app.use('/auth',authRoutes);//if request starts with /auth, it will be handled by authRoutes
app.use('/profile',profileRoutes);
app.use('/ai',aiRoutes);
app.use('/user',userRoutes);
app.use('/song',songRoutes);
app.use('/room',roomRoutes);
app.use('/game',gameRoutes);
const io = initializeSocket(server);
registerSocketHandlers(io);
server.listen(PORT, () => {
    startTimerSweeper();
    console.log(`Server running on port ${PORT}`);//callback function that runs when server starts
}); //here to router,middleware if required,then controller then service and if an error somewhere in the middle then error handled 

//error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

//okay so all of it works on a basic blueprint where the request goes frm one folder to one folder based of function calling. No specific annotations.The req firsst arrives at server.js
