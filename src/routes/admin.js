import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { signAdminToken } from "../middleware/adminAuth.js";
import { Admin } from "../models/Admin.js";

const AdminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const AdminRegisterSchema = z.object({
  name: z.string().trim().min(2).max(120).optional().or(z.literal("")),
  email: z.string().trim().email(),
  password: z.string().min(8).max(120),
});

export const adminRouter = Router();

adminRouter.post("/register", async (req, res, next) => {
  try {
    const parsed = AdminRegisterSchema.parse(req.body ?? {});
    const existing = await Admin.findOne({ email: parsed.email.toLowerCase() }).lean().exec();
    if (existing) {
      return res.status(409).json({
        ok: false,
        error: { code: "EMAIL_EXISTS", message: "Admin with this email already exists" },
      });
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const admin = await Admin.create({
      name: parsed.name?.trim() || undefined,
      email: parsed.email.toLowerCase(),
      passwordHash,
    });

    const token = signAdminToken();
    return res.status(201).json({
      ok: true,
      token,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (err) {
    return next(err);
  }
});

adminRouter.post("/login", async (req, res, next) => {
  try {
    const parsed = AdminLoginSchema.parse(req.body ?? {});
    const dbAdmin = await Admin.findOne({ email: parsed.email.toLowerCase() }).exec();
    if (dbAdmin) {
      const isPasswordMatch = await bcrypt.compare(parsed.password, dbAdmin.passwordHash);
      if (!isPasswordMatch) {
        return res.status(401).json({
          ok: false,
          error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
        });
      }
      const token = signAdminToken();
      return res.status(200).json({
        ok: true,
        token,
        admin: {
          id: dbAdmin._id.toString(),
          email: dbAdmin.email,
          name: dbAdmin.name,
        },
      });
    }

    // Fallback to env-based admin credentials for first-time bootstrap
    const isEmailMatch = parsed.email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
    const isPasswordMatch = parsed.password === env.ADMIN_PASSWORD;
    if (!isEmailMatch || !isPasswordMatch) {
      return res.status(401).json({
        ok: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
      });
    }

    const token = signAdminToken();
    return res.status(200).json({ ok: true, token });
  } catch (err) {
    return next(err);
  }
});

