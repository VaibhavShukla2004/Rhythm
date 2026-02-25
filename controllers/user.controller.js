const userService = require('../services/user.service');

const getUsers = (req,res) => {
    const users = userService.fetchAllUsers();
    res.json(users);
}

const getUserById = (req,res) => {
    const id = req.params.id;
    const user = userService.fetchUserById(id);

    if(!user){
        return res.status(400).json({ message: 'User not found'});
    }

    res.json(user);
}

module.exports = {getUsers, getUserById};