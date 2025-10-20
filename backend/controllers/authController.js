const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const APP_URL = process.env.APP_URL || "http://192.168.15.67:3000";

// Configure nodemailer (use your SMTP config)
const transporter = nodemailer.createTransport({
  host: "smtp.iosrisk.com.br", // Replace with your Locaweb SMTP host
  port: 587, // Or 465 for SSL
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER, // Your Locaweb email
    pass: process.env.EMAIL_PASS, // Your Locaweb password
  },
  tls: {
    rejectUnauthorized: false, // Sometimes needed for self-signed certs
  },
});

// Registration without email confirmation
exports.signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hash,
      name,
      confirmed: true,
      confirmationToken: null,
    });

    // Opcional: retornar token para login imediato
    // const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET);
    // return res.status(201).json({ message: "Usuário criado com sucesso.", token });

    res.status(201).json({ message: "Usuário criado com sucesso." });
  } catch (err) {
    res.status(400).json({ error: "Erro ao criar usuário", details: err });
  }
};

// Login with JWT (confirmation no longer required)
exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Senha inválida" });

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET
    ); // no expiresIn
    res.json({ token });
  } catch {
    res.status(400).json({ error: "Erro ao autenticar" });
  }
};

// (Opcional) manter o handler confirm apenas para compatibilidade
exports.confirm = async (_req, res) => {
  return res.json({ message: "Confirmação de e-mail desativada." });
};

// Password reset request
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Usuário não encontrado" });
    const resetToken = jwt.sign({ email }, JWT_SECRET);
    user.resetPasswordToken = resetToken;
    user.resetPasswordSentAt = new Date();
    await user.save();

    const resetUrl = `${APP_URL}/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Redefinição de senha",
      html: `<p>Clique para redefinir sua senha: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res.json({ message: "Email de redefinição enviado." });
  } catch {
    res.status(400).json({ error: "Erro ao solicitar redefinição" });
  }
};

// Password reset
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const { email } = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email, resetPasswordToken: token });
    if (!user) return res.status(400).json({ error: "Token inválido" });
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordSentAt = null;
    await user.save();
    res.json({ message: "Senha redefinida com sucesso." });
  } catch {
    res.status(400).json({ error: "Token inválido" });
  }
};

// Email notification for changes (example: email change)
exports.updateEmail = async (req, res) => {
  const { userId } = req; // from auth middleware
  const { newEmail } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { email: newEmail },
      { new: true }
    );
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: newEmail,
      subject: "Seu email foi alterado",
      html: `<p>Seu email foi alterado para: ${newEmail}</p>`,
    });
    res.json({ message: "Email atualizado e notificado." });
  } catch {
    res.status(400).json({ error: "Erro ao atualizar email" });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "-password -confirmationToken -resetPasswordToken"
    );
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json({ user });
  } catch {
    res.status(400).json({ error: "Erro ao buscar usuário" });
  }
};

exports.getUsers = async (req, res) => {
  const users = await User.find({}, "-password");
  res.json({ users });
};

exports.postUsers = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Dados obrigatórios faltando" });
  }
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ error: "Email já cadastrado" });
  }
  const user = await User.create({ name, email, password, role });
  res.status(201).json({ user });
};

exports.deleteUsers = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
  res.json({ success: true });
};
