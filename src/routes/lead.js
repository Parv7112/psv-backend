import { Router } from "express";
import { z } from "zod";
import { Contact } from "../models/Contact.js";

const CreateLeadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  service: z.string().trim().max(80).optional().or(z.literal("")),
  budget: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(4000),
  source: z.string().trim().max(120).optional().or(z.literal("")),
});

function normalizeOptional(value) {
  if (value === undefined) return undefined;
  const trimmed = typeof value === "string" ? value.trim() : value;
  return trimmed === "" ? undefined : trimmed;
}

export const leadRouter = Router();

leadRouter.post("/", async (req, res, next) => {
  try {
    const parsed = CreateLeadSchema.parse(req.body ?? {});

    const lead = await Contact.create({
      name: parsed.name,
      email: parsed.email,
      company: normalizeOptional(parsed.company),
      phone: normalizeOptional(parsed.phone),
      service: normalizeOptional(parsed.service),
      budget: normalizeOptional(parsed.budget),
      message: parsed.message,
      source: normalizeOptional(parsed.source),
    });

    res.status(201).json({
      ok: true,
      lead: {
        id: lead._id.toString(),
        createdAt: lead.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

