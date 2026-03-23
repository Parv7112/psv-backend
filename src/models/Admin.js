import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 254 },
    passwordHash: { type: String, required: true, minlength: 20, maxlength: 300 },
    name: { type: String, trim: true, maxlength: 120 },
  },
  { timestamps: true }
);

AdminSchema.index({ email: 1 }, { unique: true });

export const Admin = mongoose.models.Admin ?? mongoose.model("Admin", AdminSchema);

