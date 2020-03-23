const jwt = require('jsonwebtoken');


const generateToken = (res, id, auth_level) => {

  const token = jwt.sign({id, 
                          auth_level
                        }, process.env.JWT_KEY, {
    expiresIn: '7d'
  });

  return res.cookie('token', token, {
    expires: new Date(Date.now() + 1000 * 60 * 15),
    secure: false, 
    httpOnly: true,
  });
};

module.exports = generateToken