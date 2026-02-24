const express = require('express');

const app = express();

app.get('/',(req,res) => {
    res.send('<h1>Hello, express js server</h1>');
});

// Example specifying the port and starting the server
const port = process.env.PORT || 3000; // You can use environment variables for port configuration

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});