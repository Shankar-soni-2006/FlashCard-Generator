import multer from 'multer'

const ALLOWED_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
const MAX_SIZE = 4 * 1024 * 1024 // 4MB (Vercel body limit is ~4.5MB)

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true)
    else cb(Object.assign(new Error('Please upload a valid PNG, JPG, JPEG or WEBP image.'), { status: 400 }))
  },
})
