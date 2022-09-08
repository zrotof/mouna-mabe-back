const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    
    name: {
        type: String,
        require: true
    },
    image: {
        type: String,
        require: true
    },
    withManySize: {
        type: Boolean,
        require: true
    }
})

exports.Category = mongoose.model('Category', categorySchema);
