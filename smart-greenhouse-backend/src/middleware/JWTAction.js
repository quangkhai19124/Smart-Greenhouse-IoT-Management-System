import jwt from 'jsonwebtoken';
import db from '../models/index'
require('dotenv').config();

const nonSecurePath = ['/login', '/register'];

const createJWT = (payload) => {
    let key = process.env.JWT_SECRET;
    let token = null;
    try {
        token = jwt.sign(payload, key, { expiresIn: process.env.JWT_EXPRIRES_IN })
        return token;
    }
    catch (e) {
        console.log("Error in createJWT: ", e);
        return null;
    }
}

const verifyToken = (token) => {
    let key = process.env.JWT_SECRET;
    let decoded = null;
    try {
        decoded = jwt.verify(token, key)
    }
    catch (e) {
        console.log("Error in verifyToken: ", e)
    }
    return decoded;
}
const extractToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === "Bearer") {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
}
const checkUserJWT = async (req, res, next) => {
    try {
        if (nonSecurePath.includes(req.path)) return next();

        const tokenFromHeader = extractToken(req);
        const tokenFromCookie = req.cookies?.jwt;
        const token = tokenFromHeader || tokenFromCookie;

        if (!token) {
            if (req.user && req.user.email) {
                await db.Users.update(
                    { status: 'UNACTIVE' },
                    { where: { email: req.user.email } }
                );
            }
            return res.status(401).json({ EC: -1, EM: "No token provided", DT: '' });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            if (req.user && req.user.email) {
                await db.Users.update(
                    { status: 'UNACTIVE' },
                    { where: { email: req.user.email } }
                );
            }
            return res.status(403).json({ EC: -1, EM: "Invalid token", DT: '' });
        }

        req.user = decoded;
        req.token = token;
        await db.Users.update(
            { status: 'ACTIVE' },
            { where: { email: decoded.email } }
        );

        next();
    }
    catch (e) {
        console.log("Error in checkUserJWT: ", e);
        return res.status(500).json({
            EC: -1,
            EM: "Server error while verifying user",
            DT: ''
        });
    }
};
const checkPermission = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                EC: -1,
                EM: "Unauthorized",
                DT: ''
            })
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({
                EC: -1,
                EM: 'No permission',
                DT: ''
            });
        }
        next();
    }
}
export default {
    createJWT, verifyToken, checkUserJWT, checkPermission
}