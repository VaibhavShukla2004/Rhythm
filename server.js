const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const userRoutes = require('./routes/user.routes');

app.use('/user',userRoutes);

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