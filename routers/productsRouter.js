const express = require('express');
const {Product}= require('../models/product');
const {Category}= require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');


//Extensions de fichiers autorisées
const FILE_TYPE_MAP = {

    'image/png':'png',
    'image/jpg':'jpg',
    'image/jpeg':'jpeg',

}

const storage = multer.diskStorage({

    //Here we define the error when trying to load another file than an image
    destination: function (req, file, cb) {

        isValid = FILE_TYPE_MAP[file.mimetype];

        let uploadError = new Error('Image invalide');

        if(isValid){
            uploadError = null
        }

      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        
      const extension = FILE_TYPE_MAP[file.mimetype];
      const fileName = file.originalname.split(' ').join('-');
      cb(null, `${fileName}-${Date.now()}.${extension}`  )
    }
  })
  
const uploadOptions = multer({ storage: storage })

//Get list of products
router.get('/', async(req, res)=>{
    
    let filter ={};
    if(req.query.categories){
        filter = {category : req.query.categories.split(',')}
    }

    const productList = await Product.find(filter).populate('category');

    if(!productList){
        res.status(500).json({
            success:false,
            message: ""
        })
    }
    res.status(200).json({
        success : true,
        message : productList
    })
})

//Get a product by his id
//This function retrieve 
//--->a product is there is one corresponding to the given id 
//--->an array of all colors corresponding to the same reference product
router.get('/:id', async(req, res)=>{

    //We verify if the id give in parameter for category is valid
    const product = await Product.findById(req.params.id).populate('category');

    if(!product){
        res.status(500).json({
            success:false,
            message: 'Produit introuvable'
        })
    }


    res.status(200).json({
        success:true,
        message: product
    })
})

//Get products belongs to a category
router.get('/category/:categoryId', async(req, res)=>{

        //We verify if the id give in parameter for category is valid

    if(!mongoose.isValidObjectId(req.params.categoryId)){
        return res.status(400).json({
            success: false,
            message: "Catégorie inexistante, contactez URGEMMENT le webmaster"
        })
    }

    let category = await Category.findById(req.params.categoryId);

    if(!category){
        return res.status(500).json({
            success: false,
            message: "Catégorie inconnue, contactez le webmaster"
        })
    }

    const productList = await Product.find({category : req.params.categoryId}).populate('category');

    if(!productList){
        return res.status(500).json({
            success:false,
            message: 'Produits introuvables'
        })
    }
    res.status(200).json({
        success: true,
        message: productList
    })

})


//Dans le cadre d'une modification de produit il faut gérer également une modification d'image
//Si une image a déjà été enregistrée et qu'elle n'est pas sujette à la modification on garde l'ancienneet si oui on garde la nouvelle
router.put('/:id', uploadOptions.fields([{ name: 'imageVitrine'},{ name: 'images'}]), async(req, res)=>{


    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send({
            success: false,
            message: "L'id du produit est inconnu"
        })
    }

    const category = Category.findById(req.body.category);
    if(!category){
            return res.status(400).send({
                success: false,
                message: 'la catégorie indiquée est inconnue'
            })
    }

    
    const product = Product.findById(req.params.id);
    if(!product){
            return res.status(400).send({
                success: false,
                message: 'Produit inconnue'
            })
    }


    //We verify if we have an incomming file on imageVitrine
    const file = req.files['imageVitrine'];
    let imageVitrinePath ;
    if(file){

        const fileName = file[0].filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
       
        imageVitrinePath = `${basePath}${fileName}`
        
    }

    const files = req.files['images'];
    let filesNames = [] ;

    if(files){
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
        files.forEach( file =>{
            const fileName = file.filename;
            filesNames.push( basePath+fileName);
        })
    }

    if(!imageVitrinePath && filesNames.length < 1 ){
        console.log("not boths")

        var updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body
            },
            {new: true}
        )
    }

    if(imageVitrinePath && filesNames.length < 1){
        console.log("only vitrine")

        var updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                imageVitrine:imageVitrinePath
            },
            {new: true}
        )
    }

    if(!imageVitrinePath && filesNames.length > 1){
        console.log("only images")
        console.log(filesNames)
        var updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                images: filesNames
            },
            {new: true}
        )
    }

    if(imageVitrinePath && filesNames.length > 1){
        console.log("boths")

        var updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                imageVitrine:imageVitrinePath,
                images: filesNames
            },
            {new: true}
        )
    }


    if(!updatedProduct){
        res.status(500).json({success: false,message:'Implossible de modifier ce produit'})
    }
    
    res.status(200).json({success:true, message: 'Produit modifée'});

    
});

router.post('/', uploadOptions.fields([{ name: 'imageVitrine'},{ name: 'images'}]), async(req, res)=>{

    //We verify if the id give in body for category is valid
    const category = Category.findById(req.body.category);
    if(!category){
        return res.status(400).send({
            success: false,
            message: 'la catégorie indiquée est inconnue'
        })
    }

    
    //We verify if we have an incomming file on imageVitrine
    const file = req.files['imageVitrine'][0];
    if(!file){
        return res.status(400).send({
            success: false,
            response: 'Image vitrine manquante'
        })
    }
    
    //We verify if we have incomming files from front-end on images variable
    const files = req.files['images'];
    if(!files){
        return res.status(400).send({
            success: false,
            response: 'Images manquantes'
        })
    }



    const fileName = req.files['imageVitrine'][0].filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
       
    const filesNames = [];
    files.forEach( file =>{
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
        filesNames.push( basePath+fileName);

    })

    const product = new Product(
        {
            name : req.body.name,
            details: req.body.details,
            price: req.body.price,
            imageVitrine: `${basePath}${fileName}`,
            images: filesNames,
            adult: req.body.adult,
            countInStock: req.body.countInStock,
            category: req.body.category,
            sexe: req.body.sexe,
            isFeatured: req.body.isFeatured,
            category: req.body.category,
            topProduct: req.body.topProduct,
            color: req.body.color,
            sizeXS: req.body.sizeXS,
            sizeS: req.body.sizeS,
            sizeM: req.body.sizeM,
            sizeL: req.body.sizeL,
            sizeXL: req.body.sizeXL,
            sizeXXL: req.body.sizeXXL
        });

    
    product.save()
    .then(createdProduct =>{

        res.status(201).json(
            {
                success:true,
                message: "L'article "+createdProduct.name+" est créé avec succès"
            })
    })
    .catch((err)=>{
        console.log(err)

        res.status(500).json({
            message: 'Il semble y avoir une erreur, re-essayez plus tard',
            success: false
        });
    })
    
})

router.delete('/:id', async(req,res)=>{

    //We verify if the id give in parameter is valid
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send({
            success: false,
            message: "L'id du produit est inconnu"
        })
    }

    //We verify if the id give in body for category is valid
    const category = Category.findById(req.body.category);
    
    if(!category){
            return res.status(400).send({
                success: false,
                message: 'la catégorie indiquée est inconnue'
            })
    }



    Product.findByIdAndRemove(req.params.id)
    .then(produit =>{
        if(produit){
            res.status(200).json({
                success: true,
                message: 'Le produit a été supprimée'
            });
        }
        else{
            res.status(404).json({
                success: false,
                message: 'Le produit est introuvable'
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

//Get the number of products
router.get('/get/count', async(req, res)=>{
    
    const productCount = await Product.countDocuments();

    if(!productCount){
        res.status(500).json(
            {
                success:false,
                message: 'Erreur serveur'
            }
        )
    }
    res.status(200).json(
        {
            success: true,
            message: productCount
        }
    )
});

//Get the showcased products
router.get('/get/featured', async(req, res)=>{
    
    const products = await Product.find({topProduct: true}).limit(7);

    if(!products){
        res.status(500).json({
            success:false,
            message: 'Erreur système'
        })
    }
    res.status(200).json({
        success: true,
        message: products})
});


//Ajout des images présentants le produit
//L'ajout de ces images sera ultérieure à la création d'un produit il s'agira donc d'une modification
router.put('/gallery/:id', uploadOptions.array('images'), async(req, res)=>{

    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send({
            success: false,
            message: "L'id du produit est inconnu"
        })
    }

    let imagesPaths =[];
    const files= req.files;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

    if(files){
        files.map(file =>{
            imagesPaths.push(`${basePath}${file.filename}`)
        })
    }


    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        {new: true}
        )

        if(!product){
            res.status(500).json({success: false,message:'Impossible de rajouter ces images'})
        }
        
        res.status(200).json({success:true, message: 'Images de gallery ajoutée'});
    })



module.exports = router;