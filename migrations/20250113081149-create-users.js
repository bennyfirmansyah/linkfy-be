'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      nama: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      googleId: {
        type: Sequelize.STRING,
        unique: true
      },
      authProvider: {
        type: Sequelize.ENUM('local', 'google'),
        defaultValue: 'local',
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'user', 'umum'),
        defaultValue: 'umum',
        allowNull: false
      },
      unit: {
        type: Sequelize.ENUM('IPDS', 'Sosial', 'Distribusi', 'Produksi', 'Neraca', 'Umum')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};