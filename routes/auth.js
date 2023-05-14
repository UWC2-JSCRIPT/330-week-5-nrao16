const jwt = require('jsonwebtoken');
const userDAO = require('../daos/user');

const isAdmin = async (req, res, next) => {
    if (!req.roles?.includes('admin')) {
        res.status(401).send('Not an admin user');
    }
    else {
        next();
    }
}

// middleware function to check for valid bearer token
const isAuthorized = async (req, res, next) => {
    const reqHeader = req?.headers?.authorization;
    const bearerToken = reqHeader?.indexOf('Bearer ') != -1 ? reqHeader?.substring(reqHeader?.indexOf('Bearer ') + 7) : "";

    if (!bearerToken) {
        res.status(401).send('Bearer token required');
    } else {
        console.log(`bearerToken-${bearerToken}`);
        // get userId, email, roles from jwt token
        const decodedUser =(jwt.decode(bearerToken));
        console.log(`decodedUser-${JSON.stringify(decodedUser)}`);
        const userExists = userDAO.getUser(decodedUser?._id)
        if (!decodedUser || !userExists) {
            res.status(401).send('Invalid Bearer token');
        }
        else {
            req.user = {_id: decodedUser._id, email: decodedUser.email, roles : decodedUser.roles};
            next();
        }
    }
};

module.exports = isAuthorized;