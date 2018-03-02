'use strict';
module.exports = (sequelize, DataTypes) => {
  var comments = sequelize.define('comments', {
    body: DataTypes.STRING,
    postId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        comments.belongsTo(models.users, {
          delete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        comments.belongsTo(models.posts, {
          delete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });
  return comments;
};
