const Task = require('../models/task');
const {StatusCodes} = require('http-status-codes')
const {BadRequestError, NotFoundError} = require('../errors')
const {createCustomError} = require('../errors');

const getAllTasks = async (req, res) =>{
    const tasks = await Task.find({createdBy:req.user.userID}).sort('createdAt')
    res.status(StatusCodes.OK).json({ tasks:tasks });
}

const createTask = async (req, res) =>{
    req.body.createdBy = req.user.userID
    const task = await Task.create(req.body);
    res.status(StatusCodes.OK).json(task);
}

const getTask = async (req, res, next) =>{
    const { user:{userID}, params:{id:taskID} } = req
    const task = await Task.findOne({_id:taskID, createdBy:userID});
    
    if(!task)
        res.status(StatusCodes.NOT_FOUND).send(`No task with id : ${taskID}`)
    else
        res.status(StatusCodes.OK).json({ task });
}

const deleteTask = async (req, res) =>{
    const {id:taskID} = req.params;
    const task = await Task.findOneAndDelete({_id:taskID});
    if(!task)
        res.status(StatusCodes.NOT_FOUND).send(`No task with id : ${taskID}`)
    else
        res.status(StatusCodes.OK).json({ task });
        //res.status(200).json( {task:null, status:'success.'});
}

const updateTask = async (req, res) =>{
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
    getAllTasks,
    createTask,
    getTask,
    updateTask,
    deleteTask,
}