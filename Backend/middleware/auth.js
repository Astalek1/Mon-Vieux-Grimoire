const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1]; //recupération du token//
       const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET); // verification du token ave la clé//
       const userId = decodedToken.userId; // extraction identifiant utilisateur //
       req.auth = {
           userId: userId
       };
    next();
   } catch(error) {
       res.status(401).json({ error });
   }
};