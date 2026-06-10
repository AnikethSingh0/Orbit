// src/seed.js
require('dotenv').config(); // To read your MONGO_URI
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const User = require('./models/user'); // Adjust this path to exactly match your User model

const seedDatabase = async () => {
    try {
        // 1. Connect to MongoDB Atlas
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas');

        // 2. Generate 100 Fake Users in Memory
        const fakeUsers = [];
        for (let i = 0; i < 100; i++) {
            fakeUsers.push({
                name: faker.person.fullName(),
                username: faker.internet.username().toLowerCase(),
                email: faker.internet.email(),
                password: 'password123', // Hardcoding a simple password so you can easily log into these accounts if needed
                bio: faker.person.bio(), // Optional: if you have a bio field
                avatar: faker.image.avatar() // Optional: Generates a random profile picture URL
            });
        }

        // 3. Bulk Insert into MongoDB
        await User.insertMany(fakeUsers);
        console.log('🎉 Successfully injected 100 fake users!');

        // 4. Disconnect safely
        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        mongoose.connection.close();
        process.exit(1);
    }
};

seedDatabase();