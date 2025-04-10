const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ errorMessage: "Все поля обязательны" });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ errorMessage: "Пользователь с таким email уже существует" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    console.log("newUser:", newUser);
    console.log("typeof newUser.id:", typeof newUser.id);

    const userId =
      typeof newUser.id === "object" && newUser.id.id
        ? newUser.id.id
        : newUser.id;

    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token, user: { ...newUser, id: userId } });
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    return res.status(500).json({ errorMessage: "Внутренняя ошибка сервера" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ errorMessage: "Email и пароль обязательны" });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res
        .status(400)
        .json({ errorMessage: "Неверные email или пароль" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ errorMessage: "Неверные email или пароль" });
    }

    const userId =
      typeof user.id === "object" && user.id.id ? user.id.id : user.id;
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token, user: { ...user, id: userId } });
  } catch (error) {
    console.error("Ошибка авторизации:", error);
    return res.status(500).json({ errorMessage: "Внутренняя ошибка сервера" });
  }
};

module.exports = { register, login };
