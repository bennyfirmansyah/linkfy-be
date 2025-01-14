'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RiwayatLink extends Model {
    static associate(models) {
      RiwayatLink.belongsTo(models.Riwayat, {
        foreignKey: 'id_riwayat',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      RiwayatLink.belongsTo(models.Links, {
        foreignKey: 'id_link',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }
  RiwayatLink.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    id_riwayat: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'riwayats',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    id_link: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'links',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'RiwayatLink',
    tableName: 'riwayat_links',
  });
  return RiwayatLink;
};