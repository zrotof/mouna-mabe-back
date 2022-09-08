const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    passwordHash:{
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
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
    }

    
})

//generating virtual field name "id" in order to be more frontend friendly 
/*

userSchema.virtual('id').get(()=>{
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals:true,
});

*/

exports.User = mongoose.model('User', userSchema);
