import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../product/models/product.model.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_PRODUCTS_URI);
        console.log("Connected to MongoDB for checking...");
        
        const products = await Product.find({}).limit(5);
        console.log("--- Checking first 5 products ---");
        products.forEach(p => {
            console.log(`Name: ${p.name}`);
            console.log(`Image: '${p.image}'`);
            console.log(`-------------------`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

connectDB();
