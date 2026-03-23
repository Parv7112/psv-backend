import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAdminToken() {
  return jwt.sign({ role: "admin" }, env.ADMIN_JWT_SECRET, { expiresIn: "7d" });
}

export function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: { code: "UNAUTHORIZED", message: "Missing admin token" },
    });
  }

  try {
    const payload = jwt.verify(token, env.ADMIN_JWT_SECRET);
    if (!payload || typeof payload !== "object" || payload.role !== "admin") {
      return res.status(401).json({
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Invalid admin token" },
      });
    }
    return next();
  } catch {
    return res.status(401).json({
      ok: false,
      error: { code: "UNAUTHORIZED", message: "Admin session expired or invalid" },
    });
  }
}

