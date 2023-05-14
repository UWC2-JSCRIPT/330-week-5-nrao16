const { Router } = require("express");
const bcrypt = require('bcrypt');
const router = Router();
const jwtToken = require('jsonwebtoken');

const userDAO = require('../daos/user');
const isAuthorized = require('./auth')

// signup
router.post("/signup", async (req, res, next) => {
    const user = req.body;
    if (!user || JSON.stringify(user) === '{}' || !user.email || !user.password) {
        res.status(400).send('user email and password are required');
    } else {
        try {
            const userExists = await userDAO.getUser(user.email);
            if (userExists) {
                res.status(409).send('User email already signed up.')
            } else {
                const hashedPassword = await bcrypt.hash(user.password, 4);
                await userDAO.createUser({ email: user.email, password: hashedPassword.toString(), roles: ['user'] });
                res.status(200).send(`Signed up user email ${user.email}`);
            }
        } catch (e) {
            next(e);
        }
    }
});

// login to get a jwt token
router.post("/", async (req, res, next) => {
    const user = req.body;
    if (!user || JSON.stringify(user) === '{}' || !user.email || !user.password) {
        res.status(400).send('user email and password required');
    } else {
        try {
            const saveduser = await userDAO.getUser(user.email);
            console.log(`saveduser=${JSON.stringify(saveduser)}`);

            const isPasswordMatch = await bcrypt.compare(user.password, saveduser.password);

            if (isPasswordMatch) {
                // create a jwt token with user email, _id, and roles
                const token = jwtToken.sign({
                    _id: saveduser._id,
                    email: saveduser.email,
                    roles: saveduser.roles
                }, 'secret');;

                console.log(token);
                res.json({ token: token });
            } else {
                res.status(401).send('Invalid password');
            }
        } catch (e) {
            res.status(401).send(e.message);
        }
    }
});

// password update
router.post("/password", isAuthorized, async (req, res, next) => {
    const { password } = req.body;
    const decodedUser = req.user;
    if (!password) {
        res.status(400).send('password is required');
    } else {
        try {
            const hashedPassword = await bcrypt.hash(password, 4);
            console.log(`---- _id:${decodedUser._id}`);
            const updatedUser = await userDAO.updateUserPassword(decodedUser._id, hashedPassword.toString());
            if (updatedUser.matchedCount > 0) {
                res.status(200).send('Password updated');
            } else {
                res.json(updatedUser);
            }
        } catch (e) {
            next(e);
        }
    }
});

module.exports = router;


