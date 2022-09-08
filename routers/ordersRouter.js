const express = require('express');
const {Order} = require('../models/order');
const { OrderItem } = require('../models/order-item');
const router = express.Router();
const mongoose = require('mongoose');



//We retrieve a list order by date (the newest one first),for user we only get the id and the firstName
router.get('/', async (req, res)=>{
    
    let orderList = await Order.find()
    .populate('user', 'firstName').sort({'dateOrdered': - 1})
    .populate({path: 'orderItems', populate : { path: 'product', select:'price' }});

    if(!orderList){
        res.status(500).json({success: false})
    }
    
    res.status(200).json({
        success: true,
        response: orderList
    })
});

router.get('/:id', async (req, res)=>{
    
    let order = await Order.findById(req.params.id)
    .populate('user', 'firstName')
    .populate(
        { 
            path: 'orderItems', populate: 
            {
                path: 'product', populate: 
                { 
                    path: 'category'
                }
            }
        }
    );


    if(!order){
        res.status(500).json({success: false})
    }
    
    res.status(200).json({
        success: true,
        response: order
    })
});


//Modification d statut d'une commande
router.put('/:id', async(req, res)=>{

    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send({
            success: false,
            response: "Cette commande est inconnu"
        })
    }


    let order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status : req.body.status,
            
        },
        {new: true}
    )
    
    ;

    if(!order){
        res.status(500).json({
            success: false,
            response:'Implossible de modifier le statut de cette commande'
        })
    }
    
    res.status(200).json({
        success:true, 
        response: 'Statut de la commande modifée'
    });
});



//Nous recevons du client, des données concernant une commande parmi lesquelles celles des articles
//Or dans notre table commande/order nous ne stockons que les id des articles commandés par l'utilisateurs.
//Nous allons donc préalablement stocker les articles commandées dans la table des articles commandés et enregistrer par la la suite les id de ces articles commandé dans la commande associée
//De cette façon il sera possible pour l'admin plus tard de conaitre qui a commandé quoi
router.post('/', async (req, res)=>{
    

    //On utilise Promise.all() pour grouper les promises dans un array de promises
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem =>{
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        //On sauvegarde chaque article qui figure sur la commande

        newOrderItem = await newOrderItem.save()
        
        return newOrderItem._id;

         
    }))

    const orderItemsIdsResolved = await orderItemsIds ;


    //Prévention de fraude
    //Il y a possibilité pour un utilisateur malveillant de changer le montant total de la commande
    //Pour nous protéger de cela nous calculerons nous même le montant totalgrâce aux informations provenant de notre base de données
    //Pour ces calculs nous nous servons des articles commandés et de leurs quantités

    const totalprices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }))

    const totalPrice = totalprices.reduce((a,b) => a+b, 0);
         const order = new Order({
                orderItems: orderItemsIdsResolved,
                streetNumber: req.body.streetNumber,
                street: req.body.street,
                apartment: req.body.apartment,
                zip: req.body.zip,
                country: req.body.country,
                phone: req.body.phone,
                status: req.body.status,
                totalPrice: totalPrice,
                user: req.body.user
            });
           
             order.save()
            .then(createdOrder =>{
                res.status(201).json({
                    success: true,
                    message: 'Votre commande a été prise en compte'});
            })
            .catch((err)=>{
                res.status(500).json({
                    message: 'Impossible de passer cette commande, re-essayez plus tard',
                    success: false
                });
            })
        
});

//Suppression d'une commande
router.delete('/:id', async(req,res)=>{

    //We verify if the id give in parameter is valid
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send({
            success: false,
            message: "L'id de la commande est inconnu"
        })
    }

    Order.findByIdAndRemove(req.params.id)
    .then(order =>{
        if(order){
            res.status(200).json({
                success: true,
                message: 'La commande a été supprimée'
            });
        }
        else{
            res.status(404).json({
                success: false,
                message: 'La commande est introuvable'
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





//Some routes for statistics


//Getting totals amount of sales
router.get('/get/totalsales', async (req, res) =>{
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalSales :{ $sum : '$totalPrice'}}}
    ])

    if(!totalSales){
        res.status(400).json(
            {
                success: false,
                message: 'Erreur serveur'
            }
        )
    }

    res.status(200).json(
        {
            success: true,
            message: totalSales.pop()
            
        }
    )
})

//Getting the number total of ordered items
router.get('/get/count', async(req, res)=>{
    
    const orderCount = await Order.countDocuments();

    if(!orderCount){
        res.status(500).json({
            success:false,
            message: 'Erreur serveur'
        })
    }
    res.status(200).json(
        {
            success: true,
            message: orderCount
        }
    )
});

//Getting the historic of ordered items
router.get('/get/userorders/:userid', async(req, res)=>{
    
    let userOrderList = await Order.find({user: req.params.userid})
    .populate(
        {
            path: 'orderItems', populate : {
                 path: 'product', populate: {
                     path : 'category'
                    } 
                }
        })

    .sort({'dateOrdered': - 1});
    
    if(!userOrderList){
        res.status(500).json(
            {
                success: false,
                response: 'Impossible de retourner la liste des commandes'
            })
    }
    
    res.status(200).json({
        success: true,
        response: userOrderList
    })
});

module.exports = router;