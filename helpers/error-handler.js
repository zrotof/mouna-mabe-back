function errorHandler(err, req, res, next){

    if(err.name === 'UnauthorizedError'){
        return res.status(401).json({message: "L'utilisateur ne peut effectuer cette action"})
    }

    if(err.name === 'ValidationError'){
        return res.status(401).json({message:err});
    }

    return res.status(500).json({message:err})
}

module.exports = errorHandler;