const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { bool } = require('joi');


const ROLE = {
    ADMIN: 'admin',
    EMPLOYEE: 'employee',
    USER: 'user'
}

const FavoriteItem = new mongoose.Schema({
    item_id:{
        type:String,
        unique:true,
    }
});

const UserSchema = new mongoose.Schema({
    first:{
        type:String,
        default:"",
    },
    last:{
        type:String,
        default:"",
    },
    email:{type:String,
    required:[true, 'Please provide an email.'],
    match:[
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please provide a valid email.'
        ],
    unique:true,
    },
    password:{
        type:String,
        required:[true, 'Please provide a password.'],
        minlength:[5, 'Password must be at least 5 characters'],
    },
    role:{
        type:Number,
        default: 0,
        get: v => Math.round(v),
        set: v => Math.round(v),
        min: [0, "role must be greater than 0"],
        max: [2, "role must be less than 3"],
    },
    valid:{
        type:Boolean,
        default:true,
    },
    favorites:[FavoriteItem]

});

UserSchema.pre('save', async function(){
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.pre('findOneAndUpdate', function(next){
    this.options.runValidators = true;
    next();
});

UserSchema.methods.getEmail = function(){
    return this.email
}

UserSchema.methods.createJWT = function(){
    return jwt.sign({userID:this._id, username:this.username}, process.env.JWT_SECRET, {expiresIn:process.env.JWT_LIFETIME})
}

UserSchema.methods.comparePassword = async function(candidatePassword){
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
}

const User = mongoose.model('User', UserSchema)
const Favorite = mongoose.model('Favorite', FavoriteItem)

module.exports = 
{
    User,
    Favorite,
}