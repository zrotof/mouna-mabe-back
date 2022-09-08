const expresJWT = require('express-jwt');


function authJwt(){
    const secret = process.env.SECRET;
    const apiUrl=  process.env.API_URL;
    return expresJWT({
        secret,
        algorithms: ['HS256'],
        //is revoked is use to e sure that a user as a role admin or not asuming to do spéciphics options
        isRevoked: isRevoked
    })
    .unless({

        //On défini les routes qui n'ont pas besoin d'authentification pour envoyer de résultat par appel http
        //Pour ce faire on utilise des regex pour spécifier le chemin racine de ces routes
        path:[
            
            {url: /\/public\/uploads(.*)/ , methods: ['GET', 'OPTIONS']},
            {url: /\/eshop\/mouana\/api\/v1\/products(.*)/ , methods: ['GET', 'OPTIONS']},
            {url: /\/eshop\/mouana\/api\/v1\/categories(.*)/ , methods: ['GET', 'OPTIONS']},

            `${apiUrl}/users/login`,
            './public/uploads'

        ]
    })
}

async function isRevoked(res, payload, done){

    //is a user isnot admin we revoke the action
    if(!payload.isAdmin){
        done(null, true) 
    }

    //otherwise we permit
    done()
}

module.exports = authJwt;