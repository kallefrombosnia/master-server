module.exports = permit = (authLevel) =>{

    // return a middleware
    return (req, res, next) => {

        if (req.user && authLevel === req.user.auth_level)

            next(); // role is allowed, so continue on the next middleware

        else {

            return req.user.auth_level !== 'user' ? res.redirect('/dashboard') : res.redirect('/');
            
        }
    }
}




