const express = require('express');
const router = express.Router();

router.get('/',(req,res) => {
    res.send('This is Users path');
});

router.get('/vaibhav',(req,res) => {
    res.send('Users/vaibhav');
});

module.exports = router;