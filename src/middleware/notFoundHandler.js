export function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    error: {
      code: "NOT_FOUND",
      message: `No route for ${req.method} ${req.originalUrl}`,
    },
  });
}

