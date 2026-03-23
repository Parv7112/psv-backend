import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 220 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    excerpt: { type: String, required: true, trim: true, maxlength: 400 },
    content: { type: String, required: true, trim: true, maxlength: 50000 },
    coverImageUrl: { type: String, trim: true, maxlength: 1000 },
    authorName: { type: String, required: true, trim: true, maxlength: 120 },
    authorAvatarUrl: { type: String, trim: true, maxlength: 1000 },
    readTimeMin: { type: Number, min: 1, max: 120, default: 5 },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

BlogSchema.index({ publishedAt: -1 });
BlogSchema.index({ category: 1, publishedAt: -1 });

export const Blog = mongoose.models.Blog ?? mongoose.model("Blog", BlogSchema);

