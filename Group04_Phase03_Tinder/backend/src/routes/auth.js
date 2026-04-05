const express = require("express");
const bcrypt = require("bcrypt");
const { query } = require("../db");
const { ROLE_VALUES, signToken } = require("../middleware/auth");

const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, full_name, phone, role } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: "email, password, full_name are required" });
    }
    const finalRole = role && ROLE_VALUES.includes(role) ? role : "owner";

    const existing = await query("SELECT user_id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const insertRes = await query(
      `INSERT INTO users (email, password_hash, role, full_name, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, email, role, full_name, phone`,
      [email, passwordHash, finalRole, full_name, phone || null]
    );

    const user = insertRes.rows[0];
    const token = signToken({ user_id: user.user_id, role: user.role, email: user.email });

    return res.status(201).json({ token, user });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Failed to register user" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const result = await query(
      "SELECT user_id, email, password_hash, role, full_name, phone FROM users WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      console.log("Login failed: no user with email", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      console.log("Login failed: invalid password for email", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken({ user_id: user.user_id, role: user.role, email: user.email });
    delete user.password_hash;

    return res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Failed to login" });
  }
});

module.exports = { authRouter };

