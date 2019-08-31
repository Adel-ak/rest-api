const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');


module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
    // attributes
    id: {
      type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A value for firstName is required',
        },
        notEmpty: {
          msg: 'firstName can not be left empty',
        },
      }
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A value for lastName is required',
        },
        notEmpty: {
          msg: 'lastName can not be left empty',
        },
      }
    },
    emailAddress: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Email address already in use!'
      },
      validate: {
        isEmail: {
          args: true,
          msg: "Please provide a vaild email address "
        },
        notNull: {
          msg: 'Email is required',
        },
        notEmpty: {
          msg: 'Password is required',
        },
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: {
          args:5,
          msg: "Password must be at least 8 char long"
        },
        notNull: {
          msg: 'Password is required',
        },
        notEmpty: {
          msg: 'Password can not be left empty',
        },
      }
    }
  },{
    hooks:{
    
  
  },sequelize});

  User.beforeCreate(user => {
    var salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(user.password, salt);
  })

  User.associate = (models) => {
    User.hasMany(models.Course,{ 
      foreignKey: {
        fieldName: 'userid',
        field: 'userid',
        allowNull: false,
      } 
    });
  };

return User;
}
