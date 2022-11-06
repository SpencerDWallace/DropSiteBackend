const {User} = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } =  require('../errors')
const {adminCreate, saltPW} = require('./utility')
var crypto = require("crypto");

const create = async (req, res) =>{
    const {email, role, url} = req.body
    const id = req.user.userID
    if(!email)
        res.send('Please enter an email')
    else if(!role)
        res.send('Please enter a role value')
    else if(!id)
        res.send('Invalid credentials.')
    else if(!url)
        res.send('Must have url for completing registration. Please contact your IT support.')
    else{
        const checkEmail = await User.findOne({email})
        if(checkEmail){
            res.send('Email exists with another account.')
        }
        else{
            const admin = await User.findOne({_id:id, role:{$gte:2}})
            if(admin){
                const password = await crypto.randomBytes(6).toString('hex');
                const user = await User.create({email, password, role, valid:false})
                .then(function(user){
                console.log(user._id);
                adminCreate(email, password, user._id, url);
                res.json({success:true})    
                }).catch(function(err){
                    //console.log(err)
                    if(err && err.errors){
                    if(err.errors.email)
                        res.send(err.errors.email.message)
                    else if(err.errors.password)
                        res.send(err.errors.password.message)
                    else if(err.errors)
                        res.send(err.errors.role.message)
                    }
                    else{
                        res.send('Something went wrong.')
                    }
                    
                })
            }
            else{
                res.send('Invalid credentials.')
            } 
        }
    }
}

const validate = async (req, res) =>{
    const { body:{email, password, newPassword}, params:{id:resetID} } = req
    console.log(email + " " + password + " " + newPassword + " " + resetID)
    if(email && password && newPassword && resetID){
        const user = await User.findOne({email:email, _id:resetID})
            .then(async function(user){
                console.log(user)
                if(!await user.comparePassword(password)){
                    res.send('Invalid Password.')
                    next();
                }
                user.password = newPassword;
                if(!user.valid)
                    user.valid = true;
                else
                    res.send('User has already initialized account.');               
                await user.save().then(function(){
                    console.log('User password reset.', user)
                    res.json({success:true})    
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
        if(!email || !password)
            res.send('Email and password required.')
        else if(!resetID)
            res.send('Invalid credentials.')
        else if(!newPassword)
            res.send('Please enter a new password.')
    }
}

const getEmployees = async (req, res)=>{
    let validAuthorization = true;
    await User.findOne({_id:req.user.userID}).then((admin)=>{
        if(admin.role < 2){
            validAuthorization = false;
            res.json({msg:'Invalid Authorization', success:false});
        }
    })
    if(!validAuthorization)
        return; 
        
    await User.find({role:{$gte:1}}).then((employees) =>{
        const result = employees.map(({ email }) => email);
        console.log(result);
        res.json({employees:result, success:true});
    })
    .catch((err)=>{
        res.json({msg:'Unable to retrieve employees', success:true});
    });

    // res.json({firstName:user.first, lastName:user.last, email:user.email, role:user.role, valid:user.valid, favorites:user.favorites, success:true})
}

const modifyEmployee = async (req, res)=>{
    console.log(req.user)
    let validAuthorization = true;
    await User.findOne({_id:req.user.userID}).then((admin)=>{
        if(admin.role < 2){
            validAuthorization = false;
            res.json({msg:'Invalid Authorization', success:false});
        }
    })
    if(!validAuthorization)
        return; 

    const { body:{action, email, newEmail, role} } = req
    const user = {action, email, newEmail, role}
    console.log(user);
    switch(action){
        case 'changeEmail' : await changeEmail(email, newEmail, res)
        break;
        case 'changeRole' : await changeRole(email, role, res)
        break;
        case 'delete' : await deleteEmployee(email, res)
        break;
        default: res.json({msg:'Invalid action requested', success:false});
    }

}

const changeEmail = async (email, newEmail, res)=>{
    if(!email || !newEmail || email === newEmail){
        res.json({msg:'Invalid email', success:false});
        return;
    }

    await User.findOne({email:email})
    .then(async function(user){
        await User.findOneAndUpdate({_id:user._id}, {email:newEmail})
        res.json({msg:'Email Updated!', success:true});
        return;
    })
    .catch(function(err){
        //console.log(err)
        console.log(err)
        if(err && err.errors){
        if(err.errors.email)
            res.json({msg:err.errors.email.message, success:false});
        else if(err.errors.password)
            res.json({msg:err.errors.password.message, success:false});
        }
        else
            res.json({msg:'Something went wrong.', success:false});
    })

}

const changeRole = async (email, role, res)=>{
    if(role < 1 || role > 2){
        res.json({msg:'Invalid Role.', success:false});
        return;
    }
    await User.findOne({email:email})
    .then(async function(user){
        if(role === user.role){
            res.json({msg:'User Already Has This Role.', success:false});
            return;
        }
        await User.findOneAndUpdate({_id:user._id}, {role:role})
        res.json({msg:'Role Updated!', success:true});
        return;
    })
    .catch(function(err){
        //console.log(err)
        console.log(err)
        if(err && err.errors){
        if(err.errors.email)
            res.json({msg:err.errors.email.message, success:false});
        else if(err.errors.password)
            res.json({msg:err.errors.password.message, success:false});
        }
        else
            res.json({msg:'Something went wrong.', success:false});
    })

}

const deleteEmployee = async (email, res)=>{
    await User.findOneAndDelete({email:email})
    .then(async function(user){
        res.json({msg:`User with email: ${user.email} was deleted`, success:true});
        return;
    })
    .catch(function(err){
        //console.log(err)
        console.log(err)
        if(err && err.errors){
        if(err.errors.email)
            res.json({msg:err.errors.email.message, success:false});
        else if(err.errors.password)
            res.json({msg:err.errors.password.message, success:false});
        }
        else
            res.json({msg:'Something went wrong.', success:false});
    })
}

module.exports = {
    create,
    validate,
    getEmployees,
    modifyEmployee,
}