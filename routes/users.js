const express = require('express');
const authUser = require('../auth')
const router = express.Router();
const { User } = require('../models');

router.get('/users', authUser, (req, res) => {
    const user = req.currentUser;
    res.status(200).json(user);
});

router.post('/users', async (req,res, next) => {

  const { firstName, lastName, emailAddress, password } = req.body;

  try{
    await User.create({
      firstName,
      lastName,
      emailAddress,
      password
    });

    res.location(`/`);
    res.status(201);
    res.end();

  }catch(err){

    err.message = err.errors.map(val => val.message);
    err.status = 400;
    
    next(err);
  }
  
})

module.exports = router;