'use strict';
module.exports = (sequelize, DataTypes) => {
  var tags = sequelize.define('tags', {
    body: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        tags.belongsToMany(models.posts);
      }
    }
  });
  return tags;
};
