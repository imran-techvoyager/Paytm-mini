const express = require('express');
const router = express.Router();
const zod = require('zod');
const { User } = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config');

const signUpSchema = zod.object({
    username: zod.string().min(3, 'Username must be at least 3 characters long'),
    password: zod.string().min(6, 'Password must be at least 6 characters long'),
    firstName: zod.string().min(1, 'First name is required'),
    lastName: zod.string().min(1, 'Last name is required'),
})
router.post('/signup', (req, res) => {
    const body = req.body;
    const { success } = signUpSchema.safeParse(body);
    if(!success){
        return res.json({
            message: 'invalid input'
        });
    }

    const user = User.findOne({
        username: body.username
    });

    if(user._id){
        return res.json({
            message: 'User already exists'
        })
    }

    const dbUser = User.create(body);
    const token = jwt.sign({
        userId: dbUser._id
    }, JWT_SECRET);

    if(!dbUser){
        return res.json({
            message: 'Error creating user'
        });
    }
    return res.json({
        message: 'User created successfully',
        token
    });
});

module.exports = router;