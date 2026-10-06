const sharp = require('sharp');
sharp('f:/bill/public/logo.png')
  .resize(600, 600, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  })
  .extend({
    top: 212,
    bottom: 212,
    left: 212,
    right: 212,
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  })
  .toFile('f:/bill/assets/icon.png')
  .then(() => {
     console.log('Icon padded successfully!');
  })
  .catch(err => {
     console.error(err);
  });

