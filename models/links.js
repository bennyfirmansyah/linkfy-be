'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Links extends Model {
    static associate(models) {
      Links.belongsTo(models.Users, {
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
      Links.hasMany(models.RiwayatLink, {
        foreignKey: 'id_link',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      Links.hasMany(models.ShareLink, {
        foreignKey: 'id_link',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }
  Links.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    id_user: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    judul: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gambar: {
      type: DataTypes.STRING,
    },
    deskripsi: {
      type: DataTypes.TEXT,
    },
    visibilitas: {
      type: DataTypes.ENUM('public', 'private'),
      defaultValue: 'public',
    },
    kategori: {
      type: DataTypes.ENUM('IPDS', 'Sosial', 'Distribusi', 'Produksi', 'Neraca', 'Umum'),
      allowNull: false,
    },
    vector: {
      type: DataTypes.JSONB,
    },
    vector_metadata: {
      type: DataTypes.JSONB,
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
    modelName: 'Links',
    tableName: 'links',
  });
  return Links;
};