const {User} = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } =  require('../errors')
const {passwordReset, ResetPassword, saltPW} = require('./utility')

const register = async (req, res) =>{
    const {email, password} = req.body
    if(!email || !password){
        res.send('Please enter an email and password.')
    }
    else{
        const checkEmail = await User.findOne({email})
        if(checkEmail){
            res.send('Email exists with another account.')
        }
        else{
            const user = await User.create({email, password})
            .then(function(user){
                console.log('user created', user)
                
                const token = user.createJWT()
                res.json({ token, user, success:true })
            })
            .catch(function(err){
                //console.log(err)
                if(err && err.errors){
                if(err.errors.email)
                    res.send(err.errors.email.message)
                else if(err.errors.password)
                    res.send(err.errors.password.message)
                }
                else{
                    res.send('Something went wrong.')
                }
                
            })
        }
    }
}


const login = async (req, res) =>{
    const {email, password} = req.body
    
    if(!email || !password){
        res.send('Please enter an email and password.')
    }
    else{
        const user = await User.findOne({email})
        if(!user){
            res.send('Invalid Credentials.')
        }
        else if(!user.valid)
            res.send('Please finish registering or contact IT support.')
        else{
            console.log(password)
            const isPasswordCorrect = await user.comparePassword(password)
            if(!isPasswordCorrect){
                res.send('Wrong Password.')
            }
            else{
                const oldReset = await ResetPassword.findOne({email:email})
                if(oldReset){
                    await ResetPassword.deleteOne({email:oldReset.email, _id:oldReset._id})
                }
                //console.log(`Email is: ${email} | Password is ${password}`)
                const token = user.createJWT()
                res.json({ token, email:user.getEmail(), success:true })
            }
        }
    }
}

const getUser = async (req, res) =>{
    const userID = req.user.userID
    if(userID){
        const user = await User.findById({_id:userID});
        res.json({firstName:user.first, lastName:user.last, email:user.email, role:user.role, valid:user.valid, favorites:user.favorites, success:true})
    }
    else{
        res.send('Invalid Credentials.')
    }
}

const resetUserPassword = async (req, res) =>{
    const {email:userEmail, url:resetURL} = req.body
    console.log(userEmail, resetURL)
    if(userEmail, resetURL){
        const user = await User.findOne({email:userEmail});
        if(user){
            const OldReset = await ResetPassword.findOne({email:user.email})
            if(OldReset){
                await ResetPassword.deleteOne({email:OldReset.email, _id:OldReset._id})
                console.log(OldReset)
            }
            const resetID = await ResetPassword.create({email:user.email})
            console.log(resetID)
            passwordReset(resetID.email, resetID._id, resetURL)
            res.json({reset:true, success:true})
        }
        else{
                res.send('Email is not registered.')
        }
        
    }
    else{
        res.send('Invalid Email.')
    }

}

const newUserPassword = async (req, res) =>{
    const { body:{email, password}, params:{id:resetID} } = req
    if(email, password){
        const reset = await ResetPassword.findOne({email:email, _id:resetID})
        if(reset)
        {   
            const user = await User.findOne({email:email})
            .then(async function(user){
                user.password = password;
                await user.save().then(async function(){
                    console.log('User password reset.', user)
                    await ResetPassword.deleteOne({email:email, _id:resetID})
                    res.json({reset:true, success:true})    
                })
                .catch(function(err){
                    //console.log(err)
                    console.log(err)
                    if(err && err.errors){
                    if(err.errors.email)
                        res.send(err.errors.email.message)
                    else if(err.errors.password)
                        res.send(err.errors.password.message)
                    }
                    else{
                        res.send('Something went wrong.')
                    }
                    
                })
            })
            .catch(function(err){
                //console.log(err)
                console.log(err)
                if(err && err.errors){
                if(err.errors.email)
                    res.send(err.errors.email.message)
                else if(err.errors.password)
                    res.send(err.errors.password.message)
                }
                else{
                    res.send('Something went wrong.')
                }
                
            })
        }
        else{
            res.send('Invalid.')
        }
    }
    else{
        res.send('Email and password required.')
    }

}


const modifyUser = async (req, res)=>{
    console.log(req.body)
    const userID = req.user.userID;
    const taskID = req.params.id;
    const {body:{name, completed}} = req;
    
    await User.findOneAndUpdate({_id:userID}, req.body, {new:true, runValidators:true})
    .then((user)=>{
        user.success = true;
        res.json({firstName:user.first, lastName:user.last, email:user.email, role:user.role, valid:user.valid, favorites:user.favorites, success:true });
    })
    .catch((err)=>{
        res.json({error:err, success:false, msg:'Update failed.'})
    })

}

module.exports = {
    register, 
    login,
    getUser,
    resetUserPassword,
    newUserPassword,
    modifyUser,
}