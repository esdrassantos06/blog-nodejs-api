import logger from '../config/logger.js';


const authenticateApiKey = (req, res, next) =>{
    if(req.method === "GET" && !req.path.includes('/admin/')) {
        return next();
    }

    const authHeader = req.headers.authorization;
    const API_KEY = process.env.API_KEY;

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.error(`Unauthorized access attempt: ${req.ip} - ${req.method} ${req.path}`);
        return res.status(401).json({
             message: 'Unauthorized. Missing or invalid token.' 
            });
    }

    const token = authHeader.split(' ')[1];

    if(token !== API_KEY){
        logger.warn(`Acess attempt with invalid token: ${req.ip} - ${req.method} ${req.path}`);
        return res.status(401).json({
            message: 'Unauthorized. Invalid token.'
        });
    }
    next();
}

export default authenticateApiKey;