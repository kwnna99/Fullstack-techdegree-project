'use strict';

const e = require('express');
const express = require('express');
const bcrypt = require('bcrypt');
const { authenticateUser } = require('./middleware/auth-user');
const {asyncHandler}=require('./middleware/async-handler');
const course = require('./models/course');
// Construct a router instance.
const router = express.Router();
const User = require('./models').User;
const Course = require('./models').Course;


// Route that returns the authenticated user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.json({
        id:user.id,
        firstName:user.firstName,
        lastName:user.lastName,
        emailAddress: user.emailAddress,
    });
  }));
  
// Route that creates a new user.
router.post('/users', asyncHandler(async (req,res) => {
    const user=req.body;
    await User.create(user);
    res.location('/').status(201).end();
}));

//Route that returns all courses
router.get('/courses',asyncHandler(async (req,res)=>{
    const courses = await Course.findAll({
        attributes: [
            "id",
            "description",
            "title",
            "userId",
            "materialsNeeded",
            "estimatedTime",
        ],
        include: [
            {
                model: User,
                attributes: {
                    exclude: ["createdAt", "updatedAt", "password"],
                },
            },
        ],
    });
    res.status(200).json(courses);
}));

//Route that returns the course with that ID
router.get("/courses/:id",asyncHandler(async (req, res,next) => {
    const course = await Course.findByPk(req.params.id, {
        attributes: [
            "id",
            "description",
            "title",
            "userId",
            "materialsNeeded",
            "estimatedTime",
        ],
        include: [
            {
                model: User,
                attributes: {
                    exclude: ["createdAt", "updatedAt", "password"],
                },
            },
        ],
    });
    if(course){
        res.status(200).json(course);
    }else{
        res.status(404).json({'msg':'Course not found!'});
    }
    })
);

//Route that creates a course
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    const courseInfo= req.body;
    const course= await Course.create(courseInfo);
    res.location(`/${course.id}`).status(201).end();
}
));

//Route that updates a course if the user is the owner
router.put('/courses/:id',authenticateUser,asyncHandler(async(req,res)=>{
    const courseInfo=req.body;
    const user = req.currentUser;
    let course= await Course.findByPk(req.params.id);
    if(course){
        if(course.userId===user.id){
            await course.update(courseInfo);
            res.status(204).end();
        }else{
            res.status(403).json({'msg':'Not Authorized!'});
        }
    }else{
        res.status(404).json({'msg':'Course not found!'});
    }
}));

//Route that deletes the course if a user is the owner
router.delete('/courses/:id',authenticateUser,asyncHandler(async(req,res)=>{
    const courseInfo=req.body;
    const user = req.currentUser;
    let course= await Course.findByPk(req.params.id);
    if(course){
        if(course.userId===user.id){
            await course.destroy();
            res.status(204).end();
        }else{
            res.status(403).json({'msg':'Not Authorized!'});
        }
    }else{
        res.status(404).json({'msg':'Course not found!'});
    }
}));

  module.exports = router;
