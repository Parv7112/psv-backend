import mongoose from "mongoose";

export async function connectMongo(mongoUri) {
  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });

  // eslint-disable-next-line no-console
  console.log("[backend] connected to MongoDB");
}

