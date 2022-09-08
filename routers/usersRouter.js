const express = require('express');
const {User}= require('../models/user');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { response } = require('express');
const jwt=require('jsonwebtoken');
const mongoose = require('mongoose');


router.get('/', async(req, res)=>{
    
    const userList = await User.find().select('-passwordHash');

    if(!userList){
        res.status(500).json(
            {
                success: false,
                message: "Erreur lors de l'envois de la liste d'utilisateurs"
            })
    }

    res.status(200).json({
        success: true,
        message: userList
    })
    
})

router.get('/:id', async(req, res)=>{
    
    let user = await User.findById(req.params.id).select('-passwordHash');

    if(!user){
       return  res.status(500).json(
            {
                success: false,
                response: 'Utlisateur introuvable'
            })
    }
    
    res.status(200).json({
        success: true,
        response: user
    });

});

//Admin adding a user
router.post('/', async (req, res)=>{
    
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10) ,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        streetNumber: req.body.streetNumber,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        country: req.body.country

    });

    await user.save()
    .then(user =>{
        res.status(201).json({
            success: true,
            response: 'Compte créé avec succès'
        });
    })
    .catch((err) =>{
        res.status(500).json({
            success: false,
            response: 'Nous rencontrons des problèmes actuellement veuillez re-essayer plus tard',
            err: err
        });
    })

})

//user tying to log to our application
router.post('/login', async (req, res)=>{
    
    const user = await User.findOne({email: req.body.email});


    if(!user){
        return res.status(400).json({
            success: false,
            message: 'Adresse mail inconnue'
        })
    }
    
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash, )){

        const secret = process.env.SECRET;

        const token = jwt.sign(

            //here we give some data trough the token so that we will be able to select yhem on client side
            {
                userId: user._id,
                isAdmin: user.isAdmin
            },
            secret,
            {
                expiresIn: '1d'
            }

        )
        res.status(200).json({
            success: true,
            message: {user: user.email, token: token}
        })
    }
    else{
        res.status(400).json({
            success: false,
            message: 'Mot de passe incorrecte'
        })
    }

})

router.delete('/:id', (req, res)=>{

    //We verify if the id give in parameter is valid
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send({
            success: false,
            message: "L'id du produit est inconnu"
        })
    }

    User.findByIdAndRemove(req.params.id)
    .then(user =>{
        if(user){
            res.status(200).json({
                success: true,
                message: 'Utilisateur a été supprimée'
            });
        }
        else{
            res.status(404).json({
                success: false,
                message: 'Utilisateur inconnu'
            })
        }
    })
    .catch(err =>{
        res.status(400).json({
            success: false,
            message: 'Il semble y avoir une erreur, re-essayez plus tard'
        })
    })
})

//The number of users registered
router.get('/get/count', async (req,res)=>{

    const userCount = await User.countDocuments();

    if(!userCount){
        res.status(500).json({
            success:false,
            message: 'erreur système'
        })
    }
    res.status(200).json(
        {
        success: true,
        message: userCount
        }
    )
})


module.exports = router;