const Product = require('../models/productModels')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModels')
const validateMongoDbId = require('../utils/validateMongoDbId')
const slugify = require('slugify');

//create product
const createProduct = asyncHandler(async (req, res) => {
    try {
      const { title, description, price, quantity } = req.body;
  
      if (!title || !description || !price || !quantity) {
        return res.status(400).json({ message: "All fields are required." });
      }
  
      const slug = slugify(title);
  
      // Check if a product with the same slug already exists
      const existingProduct = await Product.findOne({ slug });
      if (existingProduct) {
        return res.status(409).json({ message: "Product with this title already exists." });
      }
  
      const newProduct = await Product.create({
        title,
        description,
        price,
        quantity,
        slug,
      });
  
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

//get all product
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, fields, ...filter } = req.query;
    const queryStr = JSON.stringify(filter).replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const query = Product.find(JSON.parse(queryStr));

    if (sort) {
      const sortBy = sort.split(",").join(" ");
      query.sort(sortBy);
    } else {
      query.sort("-createdAt");
    }

    if (fields) {
      const selectedFields = fields.split(",").join(" ");
      query.select(selectedFields);
    } else {
      query.select("-__v");
    }

    const skip = (page - 1) * limit;
    query.skip(skip).limit(limit);

    const products = await query;

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//get product
const getProduct = asyncHandler(async(req,res)=>{
  const {id} = req.params
  try {
    const findProduct = await Product.findById(id)
    res.json(findProduct)
  } catch (error) {
    throw new Error("Product does not exist")
  }
})
//update product
const updateProduct = asyncHandler(async(req,res)=>{
  const {id} = req.params
  try {
    const updatePro = await Product.findByIdAndUpdate(
      id,
      {
        title: req?.body?.title,
        slug: slugify(req?.body?.title),
        description: req?.body?.description,
        price: req?.body?.price,
        quantity: req?.body?.quantity,
      
      },
      {
        new: true
      }
    )
  res.json(updatePro)
  } catch (error) {
    throw new Error(error)
  }
})

//delate product
const delateProduct = asyncHandler(async(req,res)=>{
  const {id} = req.params
  try {
    const delatePro = await Product.findByIdAndDelete(id)
    res.json(delatePro)
  } catch (error) {
   throw new Error(error) 
  }
  
})
//add to wishlist
const addToWishList = asyncHandler(async (req, res) => {
  try {
    const { prodId } = req.body;
    validateMongoDbId(prodId); // Corrected variable name from "blogId" to "prodId"
    const loginUserId = req?.user?.id;
    const user = await User.findById(loginUserId);

    // Check if the product is already in the wishlist
    const alreadyAdded = user?.wishlist?.includes(prodId);

    if (alreadyAdded) {
      user.wishlist.pull(prodId); // Remove the product from the wishlist
    } else {
      user.wishlist.push(prodId); // Add the product to the wishlist
    }

    // Save the updated user object
    await user.save();

    res.json({ message: 'Wishlist updated successfully.',user });
  } catch (error) {
    throw new Error(error);
  }
});
//rating
const rating = asyncHandler(async (req, res) => {
  const loginUserId = req.user.id;
  const { star, prodId, comment } = req.body;

  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find((rating) => {
      return rating.postedby && rating.postedby.toString() === loginUserId.toString();
    });

    if (alreadyRated) {
      alreadyRated.star = star;
      alreadyRated.comment = comment;
    } else {
      product.ratings.push({
        star: star,
        comment: comment,
        postedby: loginUserId,
      });
    }

    const updatedProduct = await product.save();

    const updatedRatingsSum = updatedProduct.ratings.reduce(
      (sum, rating) => sum + rating.star,
      0
    );

    const updatedTotalRating = Math.round(
      updatedRatingsSum / updatedProduct.ratings.length
    );

    updatedProduct.totalrating = updatedTotalRating;
    await updatedProduct.save();

    res.json(updatedProduct);
  } catch (error) {
    // Handle errors
    throw new Error(error);
  }
});


//get All ratings


module.exports = {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  delateProduct,
  addToWishList,
  rating,
}