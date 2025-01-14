'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('riwayats', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      id_user: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      query: {
        type: Sequelize.TEXT,
        allowNull: false
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
    await queryInterface.addIndex('riwayats', ['id_user']);
    await queryInterface.addIndex('riwayats', ['query']);
    await queryInterface.addIndex('riwayats', ['createdAt']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('riwayats', ['id_user']);
    await queryInterface.removeIndex('riwayats', ['query']);
    await queryInterface.removeIndex('riwayats', ['createdAt']);
    await queryInterface.dropTable('riwayats');
  }
};