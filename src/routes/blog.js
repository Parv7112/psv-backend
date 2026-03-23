import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Blog } from "../models/Blog.js";
import { requireAdminAuth } from "../middleware/adminAuth.js";

const CreateBlogSchema = z.object({
  title: z.string().trim().min(5).max(180),
  category: z.string().trim().min(2).max(80),
  excerpt: z.string().trim().min(20).max(400),
  content: z.string().trim().min(60).max(50000),
  coverImageUrl: z.string().trim().url().max(1000).optional().or(z.literal("")),
  authorName: z.string().trim().min(2).max(120),
  authorAvatarUrl: z.string().trim().url().max(1000).optional().or(z.literal("")),
  readTimeMin: z.coerce.number().int().min(1).max(120).default(5),
  publishedAt: z.string().datetime().optional(),
});
const UpdateBlogSchema = CreateBlogSchema.partial();

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 220);
}

async function buildUniqueSlug(title) {
  const baseSlug = slugify(title);
  let candidate = baseSlug;
  let counter = 1;
  while (await Blog.exists({ slug: candidate })) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
  return candidate;
}

export const blogRouter = Router();

blogRouter.get("/", async (req, res, next) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const filter = category ? { category } : {};
    const blogs = await Blog.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean()
      .exec();

    return res.status(200).json({ ok: true, blogs });
  } catch (err) {
    return next(err);
  }
});

blogRouter.get("/:slug", async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim().toLowerCase();
    const blog = await Blog.findOne({ slug }).lean().exec();
    if (!blog) {
      return res.status(404).json({
        ok: false,
        error: { code: "NOT_FOUND", message: "Blog not found" },
      });
    }
    return res.status(200).json({ ok: true, blog });
  } catch (err) {
    return next(err);
  }
});

blogRouter.post("/", requireAdminAuth, async (req, res, next) => {
  try {
    const parsed = CreateBlogSchema.parse(req.body ?? {});
    const slug = await buildUniqueSlug(parsed.title);

    const blog = await Blog.create({
      title: parsed.title,
      slug,
      category: parsed.category,
      excerpt: parsed.excerpt,
      content: parsed.content,
      coverImageUrl: parsed.coverImageUrl || undefined,
      authorName: parsed.authorName,
      authorAvatarUrl: parsed.authorAvatarUrl || undefined,
      readTimeMin: parsed.readTimeMin,
      publishedAt: parsed.publishedAt ? new Date(parsed.publishedAt) : new Date(),
    });

    return res.status(201).json({ ok: true, blog });
  } catch (err) {
    return next(err);
  }
});

blogRouter.put("/:id", requireAdminAuth, async (req, res, next) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        ok: false,
        error: { code: "INVALID_ID", message: "Invalid blog id" },
      });
    }

    const parsed = UpdateBlogSchema.parse(req.body ?? {});
    const existing = await Blog.findById(id).exec();
    if (!existing) {
      return res.status(404).json({
        ok: false,
        error: { code: "NOT_FOUND", message: "Blog not found" },
      });
    }

    if (typeof parsed.title === "string" && parsed.title.trim() !== existing.title) {
      existing.slug = await buildUniqueSlug(parsed.title);
      existing.title = parsed.title;
    }
    if (typeof parsed.category === "string") existing.category = parsed.category;
    if (typeof parsed.excerpt === "string") existing.excerpt = parsed.excerpt;
    if (typeof parsed.content === "string") existing.content = parsed.content;
    if (typeof parsed.coverImageUrl === "string") existing.coverImageUrl = parsed.coverImageUrl || undefined;
    if (typeof parsed.authorName === "string") existing.authorName = parsed.authorName;
    if (typeof parsed.authorAvatarUrl === "string") existing.authorAvatarUrl = parsed.authorAvatarUrl || undefined;
    if (typeof parsed.readTimeMin === "number") existing.readTimeMin = parsed.readTimeMin;
    if (typeof parsed.publishedAt === "string") existing.publishedAt = new Date(parsed.publishedAt);

    await existing.save();
    return res.status(200).json({ ok: true, blog: existing });
  } catch (err) {
    return next(err);
  }
});

blogRouter.delete("/:id", requireAdminAuth, async (req, res, next) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        ok: false,
        error: { code: "INVALID_ID", message: "Invalid blog id" },
      });
    }

    const deleted = await Blog.findByIdAndDelete(id).lean().exec();
    if (!deleted) {
      return res.status(404).json({
        ok: false,
        error: { code: "NOT_FOUND", message: "Blog not found" },
      });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

