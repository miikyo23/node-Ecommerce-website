const Blog = require('../models/blogModel')
const User = require('../models/userModels')
const validateMongoDbId = require('../utils/validateMongoDbId')
const asyncHandler = require('express-async-handler')

//create blog
const createBlog = asyncHandler(async(req,res)=>{
    try {
        const newblog = await Blog.create(req.body)
        res.json({
            status:"success",
            newblog
        })
    } catch (error) {
        throw new Error(error)
    }
})
//update Blog
const updateBlog = asyncHandler(async(req,res)=>{
    const {id} = req.params
    validateMongoDbId(id)
    try {
        const update = await Blog.findByIdAndUpdate(
        id,req.body,
        {
            new:true
        }
        )
    res.json(update)
    } catch (error) {
        throw new Error(error)
    }
})
//get all blogs
const getAllBlog = asyncHandler(async(req,res)=>{
    try {
        const getBlogs = await Blog.find()
        res.json(getBlogs)
    } catch (error) {
        throw new Error(error)
    }
})
//get blog
const getBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const getBlog = await Blog.findById(id)
        .populate("likes")
        .populate("disLikes");
      const updateViews = await Blog.findByIdAndUpdate(
        id,
        {
          $inc: { numViews: 1 },
        },
        { new: true }
      );
      res.json(getBlog);
    } catch (error) {
      throw new Error(error);
    }
  });
  
//delete blog
const deleteBlog = asyncHandler(async(req,res)=>{
    const {id} = req.params
    validateMongoDbId(id)
    try {
        const delate = await Blog.findByIdAndDelete(id)
        res.json({
            status:"succés",
            delate
        })
    } catch (error) {
        throw new Error(error)
    }
})
//likeBlog
const toggleLikeDislike = asyncHandler(async (req, res) => {
    try {
      const { blogId } = req.body;
      validateMongoDbId(blogId);
  
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found.' });
      }
  
      const loginUserId = req?.user?.id;
      const alreadyDisliked = blog?.disLikes?.includes(loginUserId);
      if (alreadyDisliked) {
        // Remove the user's ID from dislikes and set isDisliked to false
        blog.disLikes.pull(loginUserId);
        blog.isDisliked = false;
      } else if (blog.isLiked) {
        // Remove the user's ID from likes and set isLiked to false
        blog.likes.pull(loginUserId);
        blog.isLiked = false;
      } else {
        // Add the user's ID to likes and set isLiked to true
        blog.likes.push(loginUserId);
        blog.isLiked = true;
      }
  
      const updatedBlog = await blog.save();
      res.json(updatedBlog);
    } catch (error) {
      console.error('Error liking/disliking blog:', error);
      res.status(500).json({ error: 'Error liking/disliking blog.' });
    }
  });

module.exports = {
    createBlog,
    updateBlog,
    getAllBlog,
    getBlog,
    deleteBlog,
    toggleLikeDislike,
}