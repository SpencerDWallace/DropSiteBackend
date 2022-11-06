const Task = require('../models/task');
const {User, Favorite} = require('../models/User');
const {StatusCodes} = require('http-status-codes')
const {BadRequestError, NotFoundError} = require('../errors')
const {createCustomError} = require('../errors');

const getAllFavorites = async (req, res) =>{
    const userID = req.user.userID;
    if(userID){
        const user = await User.findOne({_id:userID});
        if(user && user.favorites.length >= 1)
            res.json({favorites:user.favorites, success:true})
        else
            res.json({msg:'Favorites not found.', success:false})
    }
    else{
        res.json({msg:'User not found.', success:false})
    }
}

const addFavorite = async (req, res) =>{
    const item_id = req.body.item_id.toString();
    if(item_id){        
        const user = await User.findById({_id:req.user.userID})
        if(user){
            const matchingItem = user.favorites.filter( favorite => favorite['item_id'] == item_id.toString() )
            if(matchingItem.length == 0)
            {
                const favorite = new Favorite({item_id:item_id});
                user.favorites.push(favorite);
                await User.findOneAndUpdate({_id:req.user.userID}, {favorites:user.favorites})
                .then(()=>{
                    res.json({success:true, msg:"Item added."})
                })
                .catch((err)=>{
                    console.error(err)
                    res.json({success:false, msg:'Error updating data. Please try again.'})
                })
            }
            else{
                const favoritesNoMatching = user.favorites.filter( favorite => favorite['item_id'] != item_id.toString() );
                await User.findOneAndUpdate({_id:req.user.userID}, {favorites:favoritesNoMatching})
                .then(()=>{
                    res.json({success:true, msg:"Item removed."})
                })
                .catch((err)=>{
                    console.error(err)
                    res.json({success:false, msg:'Error updating data. Please try again.'})
                })
            }
        }
        else{
            res.json({success:false, msg:'Error finding user.'})
        }
    }
    else
        res.json({success:false, msg:'Invalid request.'})
}

const getFavorite = async (req, res, next) =>{


}

const deleteFavorite = async (req, res) =>{
    const {id:taskID} = req.params;
    const task = await Task.findOneAndDelete({_id:taskID});
    if(!task)
        res.status(StatusCodes.NOT_FOUND).send(`No task with id : ${taskID}`)
    else
        res.status(StatusCodes.OK).json({ task });
        //res.status(200).json( {task:null, status:'success.'});
}

const updateFavorite = async (req, res) =>{
    const userID = req.user.userID;
    const taskID = req.params.id;
    const {body:{name, completed}} = req
    
    const task = await Task.findOneAndUpdate({_id:taskID, createdBy:userID}, req.body, {new:true, runValidators:true})

    if(!task)
        res.status(StatusCodes.NOT_FOUND).send(`No task with id : ${taskID}`)
    else
        res.status(StatusCodes.OK).json({name:task.name, completed:task.completed, _id:taskID});
}




module.exports = {
    getAllFavorites,
    addFavorite,
    getFavorite,
    updateFavorite,
    deleteFavorite,
}