const express = require('express');
const {Category} = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

//Extensions de fichiers autorisées
const FILE_TYPE_MAP = {
    'image/png':'png',
    'image/jpg':'jpg',
    'image/jpeg':'jpeg'
}

const storage = multer.diskStorage({

    //Here we define the error when trying to load another than an image
    destination: function (req, file, cb) {

        isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Image invalide');

        if(isValid){
            uploadError = null;
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


router.get('/', async(req, res)=>{
    
    let categoryList = await Category.find();

    if(!categoryList){
       return res.status(500).json(
            {
                success: false,
                message : 'Catégorie inconnue, contactez le webmaster'})
    }
    
    res.status(200).json(
        {
            success: true,
            message : categoryList
        });
});

router.get('/get/names', async(req, res)=>{
    
    let categoryList = await Category.find().select('name');

    if(!categoryList){
        res.status(500).json(
            {
                success: false,
                message: "Veuillez ressayer plus tard"})
            }
    
    res.status(200).json(
        {
            success: true,
            message: categoryList
        })
    });

router.get('/:id', async(req, res)=>{
    
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).json({
            success: false,
            message: "Catégorie inexistante, contactez URGEMMENT le webmaster"
        })
    }

    let category = await Category.findById(req.params.id);

    if(!category){
        return res.status(500).json({
            success: false,
            message: "Catégorie inconnue, contactez le webmaster"
        })
    }
    
    res.status(200).json({
        success: true,
        message: category
    });
});

router.put('/:id', uploadOptions.single('image'), async(req, res)=>{
    

    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send({
            success: false,
            response: "Cette catégorie est inconnue"
        })
    }

    const file = req.file;

    let fileName ='';
    let basePath ='';

    let updatedData = '' ;

    if(!file ){

        const bool = true; 

        updatedData ={
            name : req.body.name,
            withManySize: req.body.withManySize,
        }

    }
    else{

        fileName = req.file.filename;
        basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
       
        updatedData ={
            name : req.body.name,
            image: `${basePath}${fileName}`,
            withManySize: req.body.withManySize,

        }
    }

    let category = await Category.findByIdAndUpdate(
        req.params.id,
        updatedData
        );

    if(!category){

       return res.status(500).json({success: false,message:'implossible de modifier cette catégorie'})
    }

    res.status(200).json({success:true, message: 'catégorie '+category.name+' modifée'});
});

router.post('/', uploadOptions.single('image'), async (req, res)=>{

    const file = req.file;

    if(!file){
        return res.status(400).send({
            success: false,
            message: 'image manquante'
        })
    }

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
       
    
    const category = new Category({
        name : req.body.name,
        image: `${basePath}${fileName}`,
        withManySize: req.body.withManySize,
    });

    await category.save()
    .then(createdCategory =>{
        res.status(201).json({
            success: true,
            message: 'Catégorie '+createdCategory.name+' créée avec succès'});
    })
    .catch((err)=>{
        res.status(500).json({
            message: 'Impossible de créer cette catégorie, re-essayez plus tard',
            success: false
        });
    })
});

router.delete('/:id', async(req,res)=>{

    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send({
            success: false,
            response: "Cette catégorie est inconnue"
        })
    }

    Category.findByIdAndRemove(req.params.id)
    .then(category =>{
        if(category){
            res.status(200).json({
                success: true,
                message: 'La catégorie a été supprimée'
            });
        }
        else{
            res.status(404).json({
                success: false,
                message: 'La catégorie est introuvable'
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


module.exports = router;
