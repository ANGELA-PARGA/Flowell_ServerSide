require('dotenv').config({ path: 'variables.env' });
const cloudinary = require('cloudinary')


cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

(async () => {
    const results = await cloudinary.uploader.upload('./images')
    console.log(results) 
    const url = cloudinary.url(results.public_id, {
        transformation:[
            {
                quality:'auto',
                fetch_format: 'auto'
            }
        ]
    }) 
    console.log(url)  
})();