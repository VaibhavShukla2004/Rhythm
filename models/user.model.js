const pool = require('../config/db');

exports.createUser = async ({ email, password, name, age, securityAnswer }) => {
  const result = await pool.query(
    `INSERT INTO users (email, password, name, age, security_answer)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, name, age, created_at`,
    [email, password, name, age, securityAnswer]
  );

  return result.rows[0];
};

exports.findAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, email, name, age, created_at FROM users`
  );

  return result.rows;
};

exports.findUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, email, name, age, created_at
     FROM users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

exports.findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  return result.rows[0];
};