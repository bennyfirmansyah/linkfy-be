const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        nama: 'Muhammad Fariz',
        email: 'admin@gmail.com',
        password: await bcrypt.hash('123', 10),
        role: 'admin',
        googleId: null,
        authProvider: 'local',
        unit: 'IPDS',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        nama: 'Muhammad Daffa',
        email: 'mfarizbtsa@gmail.com',
        password: await bcrypt.hash('123', 10),
        role: 'user',
        googleId: null,
        authProvider: 'local',
        unit: 'Umum',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        nama: 'Muhammad Riziki',
        email: 'user2@gmail.com',
        password: await bcrypt.hash('123', 10),
        role: 'user',
        googleId: null,
        authProvider: 'local',
        unit: 'Sosial',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: ['admin', 'user1', 'user2'],
    });
  }
};
