'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('akses_logs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      id_user: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      session_id: {
        type: Sequelize.UUID,
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
    await queryInterface.addIndex('akses_logs', ['id_user']);
    await queryInterface.addIndex('akses_logs', ['session_id']);
    await queryInterface.addIndex('akses_logs', ['createdAt']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('akses_logs', ['id_user']);
    await queryInterface.removeIndex('akses_logs', ['session_id']);
    await queryInterface.removeIndex('akses_logs', ['createdAt']);
    await queryInterface.dropTable('akses_logs');
  }
};