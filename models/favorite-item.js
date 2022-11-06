const mongoose = require('mongoose');

const FavoriteItem = new mongoose.Schema({
    item_id:{
        type:String,
        unique:true,
    }
});


module.exports = FavoriteItem;