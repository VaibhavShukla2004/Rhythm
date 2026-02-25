const express = require('express');
const app = express();

const PORT = 3000;

app.use(express.json());

const userRoutes = require('./routes/user.routes');

app.use('/user',userRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});