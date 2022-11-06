const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    name: {
        type:String, 
        required:[true, 'must provide name'],
        trim:true,
        maxlength:[20, 'cannot be more than 20 characters.'],
    },
    completed:{
        type:Boolean,
        default:false,
    },
    createdBy:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:[true, 'Please provide a user'],
    },
}, {timestamps:true})

module.exports = mongoose.model('Task', TaskSchema);