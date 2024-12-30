const express = require('express');
const multer = require('multer');
const Product = require('../models/product');

const router = express.Router();

// Multer setup for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// Add Product
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price } = req.body;
        const product = new Product({
            name,
            description,
            price,
            imageUrl: `/uploads/${req.file.filename}`,
        });
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ error: 'Error adding product' });
    }
});

// Get All Products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching products' });
    }
});


// Delete Product by ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Optional: Remove the image file from the uploads folder
        const fs = require('fs');
        const imagePath = `./uploads/${product.imageUrl.split('/uploads/')[1]}`;
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await product.deleteOne();
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting product' });
    }
});


module.exports = router;
