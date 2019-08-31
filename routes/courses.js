const express = require('express');
const authUser = require('../auth')
const { User, Course, sequelize } = require('../models');
const router = express.Router();

const options = {
    include: [{
        model: User,
        attributes: { exclude: ['password','createdAt','updatedAt'] }
    }],
    attributes: { exclude: ['createdAt','updatedAt'] }
};
//Build a Basic Bookcase
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
    const userid = req.currentUser.id;
    const err = new Error;

    
    
    try{
        const course = await Course.findByPk(req.params.id,options);
        //if object is empty throw error
        if(Object.keys(req.body).length === 0){

            err.status = 400;
            err.message = 'No empty objects';
            throw err;
            
        }else if(course === null){

            err.status = 404;
            err.message = 'Courses not found / Unable to update';
            throw err;

        } else {
            
            const courseUserId = course.toJSON().User.id;

            if(userid === courseUserId){

            await Course.update({
                title,
                description,
                estimatedTime,
                materialsNeeded
            },
            {
                where: {
                    id: `${req.params.id}`,
                    userid:`${userid}`
                }
            });

            res.status(204).end();

            } else {

            err.status = 403;
            err.message = 'Unable to update other users\'s courses';
            throw err;

            }
        }
    }catch(err){

        if(err.name === 'SequelizeValidationError'){
            err.message = err.errors.map(val => val.message);
            err.status = 400;
        }

        next(err);
    }
});

router.delete('/courses/:id', authUser, async ( req, res, next ) => {

    try{

        const userid = req.currentUser.id;
        const course = await Course.findByPk(req.params.id,options);
        console.log(`Output => : course`, course);
        const err = new Error;

        if(course === null){

            err.status = 404;
            err.message = 'Courses not found / Unable to delete';
            throw err;

        }else{

            const courseUserId = course.toJSON().User.id;

            if(userid === courseUserId){

                await Course.destroy({
                    where: {
                        id: `${req.params.id}`,
                    }
                });
            
                res.status(204).end();
    
            } else {
    
                err.status = 403;
                err.message = 'Unable to delete other users\'s courses';
                throw err;
    
            }
        }
    } catch(err) {
        next(err);
    }
    
});

module.exports = router;