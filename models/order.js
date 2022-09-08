const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required:true
    }],
    streetNumber:{
        type: String,
        default: ''
    },
    street:{
        type: String,
        default: ''
    },
    apartment:{
        type: String,
        default: ''
    },
    zip:{
        type: Number,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    phone:{
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'Pending'
    },
    totalPrice:{
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dateOrdered: {
        type: Date,
        default: Date.now
    }
})

exports.Order = mongoose.model('Order', orderSchema);
