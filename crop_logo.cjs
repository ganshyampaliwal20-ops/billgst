const sharp = require('sharp');
sharp('f:/bill/tmp/test_crop.png')
    .trim({ threshold: 40 })
    .toBuffer()
    .then(buffer => {
        return sharp(buffer)
            .resize(800, 800, {
                fit: 'inside'
            })
            .toBuffer()
    })
    .then(buffer => {
        return sharp(buffer)
            .resize(1024, 1024, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .toFile('f:/bill/assets/icon.png')
    })
    .then(() => console.log('Successfully created icon'))
    .catch(e => console.error(e));
