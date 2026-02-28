import { z } from "zod";

export function errorHandler(err, _req, res, _next) {
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
        fields: err.flatten().fieldErrors,
      },
    });
  }

  const status = typeof err?.status === "number" ? err.status : 500;
  const message =
    status >= 500
      ? "Internal server error"
      : typeof err?.message === "string"
        ? err.message
        : "Request failed";

  // eslint-disable-next-line no-console
  console.error("[backend] error:", err);

  return res.status(status).json({
    ok: false,
    error: {
      code: status >= 500 ? "INTERNAL_ERROR" : "REQUEST_FAILED",
      message,
    },
  });
}

