const Brand = require('../models/brandModel')
const asyncHandler = require('express-async-handler')
const validateMongoDbId = require('../utils/validateMongoDbId')

const createBrand = asyncHandler(async(req,res)=>{
    const {name} = req.body
    try {
        const newBrand = await Brand.create({name})
        res.json({
            status:"réussi",
            newBrand
        })
    } catch (error) {
        throw new Error(error)
    }
})
//update category 
const updateBrand = asyncHandler(async(req,res)=>{
    const {id} = req.params
    try {
        const update = await Brand.findByIdAndUpdate(
            id,
            {name:req?.body?.name},
            {new:true})
        res.json({
            status:"succés",
            update
        })
    } catch (error) {
        throw new Error(error)
    }
})
const deleteBrand = asyncHandler(async(req,res)=>{
    const {id} = req.params
    try {
        const deleteBrand = await Brand.findByIdAndDelete(id)
        res.json(deleteBrand)
    } catch (error) {
        throw new Error(error)
    }
    
})
const getBrand = asyncHandler(async(req,res)=>{
    const {id} = req.params
    try {
        const getBrand = await Brand.findById(id)
        res.json(getBrand)
    } catch (error) {
        throw new Error(error)
    }
    
})
const getAllBrand = asyncHandler(async(req,res)=>{
    try {
        const getBrand = await Brand.find()
        res.json(getBrand)
    } catch (error) {
        throw new Error(error)
    }
})
module.exports = {
    createBrand,
    updateBrand,
    deleteBrand,
    getBrand,
    getAllBrand,
}