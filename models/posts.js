'use strict';
module.exports = (sequelize, DataTypes) => {
  var posts = sequelize.define('posts', {
    img_link: DataTypes.STRING,
    description: DataTypes.STRING,
    tags: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        posts.hasMany(models.comments);
        posts.hasMany(models.tags);
        posts.hasOne(models.user);
        posts.belongsTo(models.user, {
          delete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });

      }
    }
  });
  return posts;
};
