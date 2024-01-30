const fs = require('fs');
const asyncHandler = require('express-async-handler');
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require('../utils/cloudinary');
const Product = require('../models/productModels')// Update with the path to your Product model

const uploadImages = asyncHandler(async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ status: 'fail', message: 'No files were uploaded.' });
    }

    const uploader = (path) => cloudinaryUploadImg(path);
    const urls = [];

    for (const file of Object.values(req.files)) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push(newpath);
      fs.unlinkSync(path);
    }

    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }

    // Assuming you have an "images" field in your Product model to store image URLs
    product.images = urls.map((url) => ({
      public_id: url.asset_id, // Assuming cloudinaryUploadImg returns "asset_id"
      url: url.url,
    }));

    await product.save();

    res.json({ status: 'success', images: urls });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error uploading images' });
  }
});

const deleteImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { imageId } = req.body; // Assuming you pass the image ID to delete in the request body

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }

    // Find the index of the image to delete based on the imageId
    const imageIndex = product.images.findIndex((img) => img.public_id === imageId);

    if (imageIndex === -1) {
      return res.status(404).json({ status: 'fail', message: 'Image not found.' });
    }

    // Remove the image at the specified index
    product.images.splice(imageIndex, 1);

    await product.save();

    // Delete the image from Cloudinary if needed (optional)

    res.json({ status: 'success', message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error deleting image' });
  }
});

module.exports = {
  uploadImages,
  deleteImages,
};
