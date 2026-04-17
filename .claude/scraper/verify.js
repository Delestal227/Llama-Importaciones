const d = require('./productos_daz.json');
const p = d.allProducts;

console.log('=== RESUMEN FINAL ===');
console.log('Total productos:', p.length);
console.log('Con precio:', p.filter(x => x.price).length);
console.log('Con imagen:', p.filter(x => x.imageUrl && !x.imageUrl.includes('data:')).length);
console.log('Con categoria:', p.filter(x => x.categories.length > 0).length);
console.log('Con marca:', p.filter(x => x.brand).length);
console.log('En oferta:', p.filter(x => x.onSale).length);
console.log('Categorias:', Object.keys(d.categorias).length);

const size = (Buffer.byteLength(JSON.stringify(d)) / 1024 / 1024).toFixed(2);
console.log('\nTamano archivo:', size, 'MB');

console.log('\n=== MUESTRA 5 PRODUCTOS ===');
p.slice(0, 5).forEach((x, i) => {
  console.log((i + 1) + '. ' + x.name);
  console.log('   Precio: $' + x.price + ' | Marca: ' + (x.brand || 'N/A'));
  console.log('   Cats: ' + x.categories.join(', '));
  console.log('   Img: ' + (x.imageUrl ? x.imageUrl.substring(0, 90) + '...' : 'SIN IMAGEN'));
  console.log('');
});
