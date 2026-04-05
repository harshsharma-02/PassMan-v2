const path = require("path");
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { MongoClient, ObjectId } = require("mongodb");
const bodyparser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET || "passman-dev-secret-change-me";
const SALT_ROUNDS = 10;
const RESET_TTL_MS = 60 * 60 * 1000;

const url = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "PassMan";

const client = new MongoClient(url);
const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(bodyparser.json());
app.use(cors());

function isSmtpConfigured() {
  const host = String(process.env.SMTP_HOST || "").trim();
  const user = String(process.env.SMTP_USER || "").trim();
  const pass = String(process.env.SMTP_PASS || "").trim();
  return Boolean(host && user && pass);
}

async function sendPasswordResetEmail(to, resetUrl) {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP is not configured");
  }
  const host = String(process.env.SMTP_HOST).trim();
  const user = String(process.env.SMTP_USER).trim();
  const pass = String(process.env.SMTP_PASS).trim();
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const secure =
    String(process.env.SMTP_SECURE || "").toLowerCase() === "true" ||
    smtpPort === 465;
  const from =
    String(process.env.SMTP_FROM || "").trim() || `"PassMan" <${user}>`;

  const text = `Choose a new password (link expires in 1 hour):\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`;
  const html = `<p>Choose a new password (link expires in 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p style="color:#666;font-size:12px">If you did not request this, you can ignore this email.</p>`;

  const transporter = nodemailer.createTransport({
    host,
    port: smtpPort,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject: "Reset your PassMan password",
    text,
    html,
  });
}

function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Sign in required" });
  }
  const token = h.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

async function main() {
  await client.connect();
  const db = client.db(dbName);
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db
    .collection("passwordResetTokens")
    .createIndex({ tokenHash: 1 }, { unique: true });
  await db
    .collection("passwordResetTokens")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const okMessage =
      "If an account exists for that email, we sent reset instructions.";
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!isSmtpConfigured()) {
      return res.status(503).json({
        error:
          "Password reset email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env.",
      });
    }
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.json({ message: okMessage });
    }
    await db
      .collection("passwordResetTokens")
      .deleteMany({ userId: user._id.toString() });
    const plainToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);
    await db.collection("passwordResetTokens").insertOne({
      tokenHash,
      userId: user._id.toString(),
      expiresAt,
    });
    const base = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${base.replace(/\/$/, "")}/?reset=${encodeURIComponent(plainToken)}`;
    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch (err) {
      console.error(err);
      await db.collection("passwordResetTokens").deleteOne({ tokenHash });
      return res
        .status(500)
        .json({ error: "Could not send reset email. Try again later." });
    }
    res.json({ message: okMessage });
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const token = String(req.body.token || "");
    const newPassword = req.body.password;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        error: "Valid reset link and new password (min 6 characters) required",
      });
    }
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const entry = await db.collection("passwordResetTokens").findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });
    if (!entry) {
      return res
        .status(400)
        .json({ error: "Invalid or expired reset link. Request a new one." });
    }
    let oid;
    try {
      oid = new ObjectId(entry.userId);
    } catch {
      return res.status(400).json({ error: "Invalid reset data" });
    }
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const upd = await db
      .collection("users")
      .updateOne({ _id: oid }, { $set: { passwordHash } });
    if (upd.matchedCount === 0) {
      return res.status(400).json({ error: "Account not found" });
    }
    await db
      .collection("passwordResetTokens")
      .deleteMany({ userId: entry.userId });
    res.json({ message: "Password updated. You can sign in." });
  });

  app.post("/api/auth/register", async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = req.body.password;
    if (!email || !password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Valid email and password (min 6 chars) required" });
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    try {
      const result = await db.collection("users").insertOne({
        email,
        passwordHash,
        createdAt: new Date(),
      });
      const token = jwt.sign(
        { userId: result.insertedId.toString(), email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.json({ token, user: { id: result.insertedId.toString(), email } });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: "Email already registered" });
      }
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = req.body.password;
    const user = await db.collection("users").findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user._id.toString(), email: user.email } });
  });

  app.get("/api/auth/me", authMiddleware, (req, res) => {
    res.json({ user: { id: req.userId, email: req.userEmail } });
  });

  app.get("/api/passwords", authMiddleware, async (req, res) => {
    const items = await db
      .collection("passwords")
      .find({ userId: req.userId })
      .toArray();
    res.json(items);
  });

  app.post("/api/passwords", authMiddleware, async (req, res) => {
    const { site, username, password, id } = req.body;
    if (!site || !username || !password || !id) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const doc = { site, username, password, id, userId: req.userId };
    const result = await db.collection("passwords").insertOne(doc);
    res.send({ success: true, result });
  });

  app.delete("/api/passwords", authMiddleware, async (req, res) => {
    try {
      const { id } = req.body;
      const result = await db
        .collection("passwords")
        .deleteOne({ id, userId: req.userId });
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
