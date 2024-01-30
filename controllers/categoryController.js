const Category = require('../models/categoryModel')
const asyncHandler = require('express-async-handler')
const validateMongoDbId = require('../utils/validateMongoDbId')

const createCategory = asyncHandler(async(req,res)=>{
    const {title} = req.body
    try {
        const newCategory = await Category.create({title})
        res.json({
            status:"réussi",
            newCategory
        })
    } catch (error) {
        throw new Error(error)
    }
})
//update category 
const updateCategory = asyncHandler(async(req,res)=>{
    const {id} = req.params
    try {
        const update = await Category.findByIdAndUpdate(
            id,
            {title:req?.body?.title},
            {new:true})
        res.json({
            status:"succés",
            update
        })
    } catch (error) {
        throw new Error(error)
    }
})
const deleteCategory = asyncHandler(async(req,res)=>{
    const {id} = req.params
    try {
        const deleteCat = await Category.findByIdAndDelete(id)
        res.json(deleteCat)
    } catch (error) {
        throw new Error(error)
    }
    
})
const getCategory = asyncHandler(async(req,res)=>{
    const {id} = req.params
    try {
        const getCat = await Category.findById(id)
        res.json(getCat)
    } catch (error) {
        throw new Error(error)
    }
    
})
const getAllCategory = asyncHandler(async(req,res)=>{
    try {
        const getCats = await Category.find()
        res.json(getCats)
    } catch (error) {
        throw new Error(error)
    }
})
module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    getAllCategory,
}