const express = require('express');
const router = express.Router();
const zod = require('zod');
const { User } = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config');
const authMiddleware = require('../middleware');

const signUpSchema = zod.object({
    username: zod.string().min(3, 'Username must be at least 3 characters long').email(),
    password: zod.string().min(6, 'Password must be at least 6 characters long'),
    firstName: zod.string().min(1, 'First name is required'),
    lastName: zod.string().min(1, 'Last name is required'),
})
router.post('/signup', async (req, res) => {
    const body = req.body;
    const { success } = signUpSchema.safeParse(body);
    if(!success){
        return res.json({
            message: 'invalid input'
        });
    }

    const existingUser = await User.findOne({
        username: req.body.username
    });

    if(existingUser){
        return res.status(411).json({
            message: 'User already exists'
        })
    }

    const dbUser = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

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
        token: token
    });
});

const signInSchema = zod.object({
    username: zod.string().min(3, 'Username must be at least 3 characters long').email(),
    password: zod.string().min(6, 'Password must be at least 6 characters long'),
})

router.post('/signin', async (req, res) => {
   const body = req.body;
   const { success } = signInSchema.safeParse(body);
   if(!success){
    res.status(411).json({
        message: "incorrect input"
    });
   }

   const user = await User.findOne({
    username: req.body.username,
    password: req.body.password
   });
   if(user){
      const token = jwt.sign({
         userId: user._id
      }, JWT_SECRET);

      res.json({
        token: token
      });

      return;
   }

   res.status(411).json({
     message: "error logging in"
   });
});

const updateScheme = zod.object({
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
});

router.post('/', authMiddleware, async (req, res) => {
    const body = req.body;
    const { success } = updateScheme.safeParse(body);
    if(!success){
        res.status(411).json({
            message: "error while updating information"
        });
    }

    await User.updateOne(req.body, {
        id: req.userId
    })

    res.json({
        message: "updated successfully"
    });
});

router.get('/bulk', async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    });

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    });
});

module.exports = router;