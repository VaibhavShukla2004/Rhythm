const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

exports.fetchAllUsers = () => {
  return users;
};

exports.fetchUserById = (id) => {
  return users.find(u => u.id == id);
};