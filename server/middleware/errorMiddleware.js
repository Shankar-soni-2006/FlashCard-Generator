export function errorMiddleware(err, _req, res, _next) {
  console.error(err)
  const status = err.status || err.statusCode || (err.name === 'MulterError' ? 400 : 500)
  res.status(status).json({ success: false, message: err.message || 'Internal server error' })
}
