const db = require("../db/db");

async function create(userData) {
  const [newUser] = await db("users")
    .insert(userData)
    .returning(["id", "username", "email"]);

  if (typeof newUser.id === "object" && newUser.id.id) {
    newUser.id = newUser.id.id;
  }
  return newUser;
}

async function findByEmail(email) {
  const user = await db("users").where("email", email).first();
  if (user && typeof user.id === "object" && user.id.id) {
    user.id = user.id.id;
  }
  return user;
}

module.exports = { create, findByEmail };
