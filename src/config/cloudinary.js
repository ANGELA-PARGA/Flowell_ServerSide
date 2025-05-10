import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
dotenv.config({ path: 'variables.env' });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const uploadImage = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            use_filename: true,
            unique_filename: false,
            resource_type: 'image',
            transformation: [
                {fetch_format: "webp"},
                {quality: "auto"},
                {dpr: "auto"},
                {fetch_format: "auto"},
                {height: 800, width: 800, crop: "limit"}
            ]
        });

        return result.secure_url;  // ✅ Return the uploaded image URL
    } catch (error) {
        console.error('🚨 Cloudinary Upload Error:', error);
        throw new Error('Failed to upload image');
    }
};

export default uploadImage;