'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AksesLogs extends Model {
    static associate(models) {
      AksesLogs.belongsTo(models.Users, {
        foreignKey: 'id_user',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }
  AksesLogs.init({
    id : {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    id_user: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    session_id: {
      type: DataTypes.UUID,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'AksesLogs',
    tableName: 'akses_logs',
  });
  return AksesLogs;
};