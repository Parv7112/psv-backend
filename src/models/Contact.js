import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    company: { type: String, trim: true, maxlength: 160 },
    phone: { type: String, trim: true, maxlength: 40 },
    service: { type: String, trim: true, maxlength: 80 },
    budget: { type: String, trim: true, maxlength: 80 },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    source: { type: String, trim: true, maxlength: 120 },
  },
  { timestamps: true }
);

export const Contact = mongoose.models.Contact ?? mongoose.model("Contact", ContactSchema);

