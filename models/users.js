'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.hasMany(models.Links, {
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      Users.hasMany(models.Riwayat, {
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      Users.hasMany(models.ShareLink, {
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      Users.hasMany(models.RiwayatLink, {
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      Users.hasMany(models.Feedbacks, {
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      Users.hasMany(models.AksesLogs, {
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Users.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      nama: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      googleId: {
        type: DataTypes.STRING,
        unique: true,
      },
      authProvider: {
        type: DataTypes.ENUM('local', 'google'),
        defaultValue: 'local',
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('admin', 'user', 'umum'),
        defaultValue: 'umum',
        allowNull: false,
      },
      unit: {
        type: DataTypes.ENUM('IPDS', 'Sosial', 'Distribusi', 'Produksi', 'Neraca', 'Umum')
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
    },
    {
      sequelize,
      modelName: 'Users',
      tableName: 'users',
    }
  );

  return Users;
};
