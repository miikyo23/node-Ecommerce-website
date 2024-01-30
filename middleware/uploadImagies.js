const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs'); // Import the fs module

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-';
    cb(null, uniqueSuffix + file.originalname);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const uploadPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fieldSize: 2000000 },
});

const productImageResize = async (req, res, next) => {
  if (!req.files) return next();

  for (const file of req.files) {
    const imageFileName = `product-${req.params.id}-${Date.now()}.jpeg`;

    const resizedFile = await sharp(file.path)
      .resize(800, 800)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    // Save the resized image to disk
    const imagePath = path.join(__dirname, `../public/images/${imageFileName}`);
    fs.writeFileSync(imagePath, resizedFile);

    // Assign the image file name to req.body.image
    req.body.image = imageFileName;
  }

  next();
};

module.exports = { uploadPhoto, productImageResize };
