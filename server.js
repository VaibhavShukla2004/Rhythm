const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/user.routes');
const authRouthes = require('./routes/auth.routes');
const songRoutes = require('./routes/song.routes');

app.use('/auth',authRouthes);
app.use('/user',userRoutes);
app.use('/song',songRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

//error handling
app.use((err,req,res,next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong' });
});

//middleware
const { logger } = require('./middlewares/logger.middleware');
app.use(logger);