'use strict';
module.exports = (sequelize, DataTypes) => {
  var posts = sequelize.define('posts', {
    img_link: DataTypes.STRING,
    description: DataTypes.STRING,
    tags: DataTypes.ARRAY(DataTypes.INTEGER)
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        posts.hasMany(models.comments);
        posts.hasMany(models.tags);
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
