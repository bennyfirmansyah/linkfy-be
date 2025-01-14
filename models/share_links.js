'use strict';
const { 
  Model 
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ShareLink extends Model {
    static associate(models) {
      // Define associations here
      ShareLink.belongsTo(models.Users, {
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      ShareLink.belongsTo(models.Links, {
        foreignKey: 'id_link',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  ShareLink.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
      },
      id_user: {
        type: DataTypes.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_link: {
        type: DataTypes.UUID,
        references: {
          model: 'links',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'ShareLink',
      tableName: 'share_links',
    }
  );

  return ShareLink;
};
