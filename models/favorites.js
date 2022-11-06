const mongoose = require('mongoose');

const FavoritesSchema = new mongoose.Schema({
    name: {
        type:String, 
        required:[true, 'must provide name'],
        trim:true,
        maxlength:[20, 'cannot be more than 20 characters.'],
    },
    createdBy:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:[true, 'Please provide a user'],
    },
}, {timestamps:true})

module.exports = mongoose.model('Favorites', FavoritesSchema);