const sharp = require('sharp');
sharp('f:/bill/public/logo.png')
    .trim()
    .resize(750, 750, { // 750 max dimension
        fit: 'inside'
    })
    .toBuffer()
    .then(buffer => {
        // Get the resized info
        sharp(buffer)
            .resize(1024, 1024, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .toFile('f:/bill/assets/icon.png')
            .then(() => {
                console.log('Icon resized and padded correctly to 1024x1024 with inner image large');
            })
    })
    .catch(err => {
        console.error(err);
    });
