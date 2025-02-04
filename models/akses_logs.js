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
    ip_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    indexes: [
      {
        unique: true,
        fields: ['id_user', 'ip_address', 'createdAt'],
        name: 'akses_logs_daily_unique'
      }
    ]
  });
  return AksesLogs;
};