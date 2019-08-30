const express = require('express');
const authUser = require('../auth')
const { User, Course } = require('../models');
const router = express.Router();

const options = {
    include: [{
        model: User,
        attributes: { exclude: ['password','createdAt','updatedAt'] }
    }],
    attributes: { exclude: ['createdAt','updatedAt'] }
};

router.get('/courses',async ( req, res ) => {
    const allCourses = await Course.findAll(options);
    res.status(200).json(allCourses);
});

router.get('/courses/:id',async ( req, res, next ) => {
    let err = {};
    const courses = await Course.findByPk(req.params.id,options);
    if(courses == null){
        err.message = 'Course not found'
        err.status = 404;
        next(err);
    }else{
        res.status(200).json(courses);
    } 
    
});

router.post('/courses', authUser, async ( req, res, next ) => {
    const { title, description, estimatedTime, materialsNeeded } = req.body;
    const userid = req.currentUser.id
    
    try{

        await Course.create({
            title,
            description,
            estimatedTime,
            materialsNeeded,
            userid
        });

        res.location(`${req.originalUrl}/${req.currentUser.id}`);
        res.status(201);
        res.end();

    }catch(err){
            
        err.message = err.errors.map(val => val.message);
        err.status = 400;
        
        next(err);
    }
});

router.put('/courses/:id', authUser, async ( req, res, next ) => {
    const { title, description, estimatedTime, materialsNeeded } = req.body;
    console.log(req.body);
    
    const userid = req.currentUser.id
    try{
        
        await Course.update({
            title,
            description,
            estimatedTime,
            materialsNeeded,
            userid
        },
        {
        where: {
            id: `${req.params.id}`
        }
        });

        res.status(204).end();

    }catch(err){
    console.log(`Output => : err`, err);

        err.message = err.errors.map(val => val.message);
        err.status = 400;
        
        next(err);
    }
});

router.delete('/courses/:id', authUser, async ( req, res ) => {
    
    await Course.destroy({
        where: {
            id: `${req.params.id}`,
            userid:`${req.currentUser.id}`
        }
    });

    res.status(204).end();
});

module.exports = router;