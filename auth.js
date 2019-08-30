const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const { User } = require('./models');

 const authUser = async (req, res, next) => {
    try{

        let message = null;

        const credentials = auth(req);
        
        if (credentials) {
            
            const user = await User.findOne({ where: {emailAddress: `${credentials.name}`} });
            
            if (user) {

                const authenticated = bcryptjs
                .compareSync(credentials.pass, user.password);
                
                if (authenticated) {
                    console.log(`Authentication successful for username: ${user.username}`);

                    const userDetails = user.toJSON();
                    const { id , firstName, lastName, emailAddress} = userDetails;
                    req.currentUser = {
                        id,
                        firstName,
                        lastName,
                        emailAddress,
                    };

                } else {

                    message = `Authentication failure for username: ${user.emailAddress}`;
                
                }

            } else {

                message = `User not found for username: ${credentials.name}`;
            
            }

        } else {

            message = 'Auth header not found';
        
        }

        if (message) {

            console.warn(message);
            res.status(401).json({ message: 'Access Denied, you need to be logged in' });
        
        } else {

            next();

        }
        
    }catch(err){

        console.warn(err);

    }
};

const  asyncHandler = (cb) => {
    return async (req,res,next)=> {
      try {
        await cb(req,res,next);
      } catch(err){
        res.render('error', {error:err});
      }
    }
  }

module.exports = authUser;