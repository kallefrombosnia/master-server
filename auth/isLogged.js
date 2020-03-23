module.exports = isLogged = (req, res, next) => {
    if(!req.user){
        next()
    }else{
        return res.redirect('/');
    }
}