const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String
    },
    details: {
        type: String
    },
    imageVitrine:{
        type: String
    },
    images:[{
        type: String
    }],
    countInStock: {
        type: Number
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    rating:{
        type: Number,
        default: 0
    },
    reviews:{
        type: Number,
        default: 0
    },
    isFeatured:{
        type: Boolean,
        default: false
    },
    dateCreated:{
        type: Date,
        default: Date.now
    },
    price : {
        type: Number
    },
    adult : {
        type: Boolean
    },
    sexe: {
        type: String
    },
    sizeXS:{
        type: Number
    },
    sizeS:{
        type: Number
    },
    sizeM:{
        type: Number
    },
    sizeL:{
        type: Number
    },
    sizeXL:{
        type: Number
    },
    sizeXXL:{
        type: Number
    },
    topProduct: {
        type: Boolean
    },
    color: {
        type: String
    }
})


//generating virtual field name "id" in order to be more frontend friendly 
/*
    productSchema.virtual('id').get(()=>{
        return this._id.toHexString();
    });

    productSchema.set('toJSON', {
        virtuals:true,
    });
*/

exports.Product = mongoose.model('Product', productSchema);
