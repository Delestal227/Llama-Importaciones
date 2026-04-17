const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://dazimportadora.com.ar';
const PRODUCTS_URL = `${BASE_URL}/productos/?per_page=100`;
const OUTPUT_FILE = path.join(__dirname, 'productos_daz.json');

// Delay helper to be respectful to the server
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeAllProducts() {
  console.log('🚀 Iniciando scraper de Daz Importadora...');
  console.log(`📦 URL base: ${PRODUCTS_URL}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  const allProducts = [];
  let currentPage = 1;
  let totalPages = 1;

  try {
    // First, navigate to get total pages
    console.log('\n📄 Obteniendo información de paginación...');
    await page.goto(PRODUCTS_URL, { waitUntil: 'networkidle', timeout: 90000 });
    await page.waitForSelector('.products', { timeout: 30000 });

    // Get total pages from pagination
    const paginationLinks = await page.$$eval('.woocommerce-pagination .page-numbers a, .wd-pagination .page-numbers a, nav.woocommerce-pagination ul li a', links => {
      const pageNumbers = links
        .map(a => {
          const match = a.href.match(/page\/(\d+)/);
          return match ? parseInt(match[1]) : null;
        })
        .filter(n => n !== null);
      return pageNumbers;
    });

    if (paginationLinks.length > 0) {
      totalPages = Math.max(...paginationLinks);
    }

    // Also try to get from the results count text
    const resultsText = await page.textContent('.woocommerce-result-count').catch(() => '');
    const totalMatch = resultsText.match(/de\s+(\d+)/);
    const totalProducts = totalMatch ? parseInt(totalMatch[1]) : 'desconocido';

    console.log(`📊 Total de páginas: ${totalPages}`);
    console.log(`📊 Total de productos estimado: ${totalProducts}`);

    // Scrape each page
    for (currentPage = 1; currentPage <= totalPages; currentPage++) {
      const pageUrl = currentPage === 1 ? PRODUCTS_URL : `${BASE_URL}/productos/page/${currentPage}/?per_page=100`;
      console.log(`\n🔍 Scraping página ${currentPage}/${totalPages}: ${pageUrl}`);

      if (currentPage > 1) {
        await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 90000 });
      }

      // Wait for products to load
      await page.waitForSelector('.products .product, .products .product-grid-item', { timeout: 30000 });

      // Scroll down to trigger lazy loading of images
      await autoScroll(page);

      // Small delay after scrolling
      await delay(3000);

      // Extract products from this page
      const pageProducts = await page.evaluate(() => {
        const products = [];
        const productElements = document.querySelectorAll('.products .product');

        productElements.forEach(el => {
          try {
            // Product name
            const titleEl = el.querySelector('.wd-entities-title a, .woocommerce-loop-product__title, h3 a, h2 a');
            const name = titleEl ? titleEl.textContent.trim() : '';

            // Product URL
            const productUrl = titleEl ? titleEl.href : '';

            // Price - handle regular and sale prices
            let price = '';
            let regularPrice = '';
            let salePrice = '';

            const priceContainer = el.querySelector('.price');
            if (priceContainer) {
              // Check if on sale
              const delEl = priceContainer.querySelector('del .woocommerce-Price-amount');
              const insEl = priceContainer.querySelector('ins .woocommerce-Price-amount');

              if (delEl && insEl) {
                // On sale
                regularPrice = delEl.textContent.trim().replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.');
                salePrice = insEl.textContent.trim().replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.');
                price = salePrice;
              } else {
                // Regular price
                const amountEl = priceContainer.querySelector('.woocommerce-Price-amount');
                if (amountEl) {
                  price = amountEl.textContent.trim().replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.');
                }
              }
            }

            // Image URL - handle lazy loading
            const imgEl = el.querySelector('.product-image-link img, .wd-product-img-link img, .attachment-woocommerce_thumbnail');
            let imageUrl = '';
            if (imgEl) {
              imageUrl = imgEl.getAttribute('data-lazy-src')
                || imgEl.getAttribute('data-src')
                || imgEl.getAttribute('data-original')
                || imgEl.src || '';

              // Try to get full size image from srcset
              const srcset = imgEl.getAttribute('data-lazy-srcset') || imgEl.getAttribute('srcset') || '';
              if (srcset) {
                const srcsetParts = srcset.split(',').map(s => s.trim());
                const largest = srcsetParts[srcsetParts.length - 1];
                if (largest) {
                  const srcUrl = largest.split(' ')[0];
                  if (srcUrl && !srcUrl.includes('data:image')) {
                    imageUrl = srcUrl;
                  }
                }
              }

              // Filter out placeholder/base64 images
              if (imageUrl.includes('data:image') || imageUrl.includes('placeholder')) {
                imageUrl = imgEl.src || '';
              }
            }

            // Categories
            const categoryEls = el.querySelectorAll('.wd-product-cats a, .product-categories a');
            const categories = Array.from(categoryEls).map(a => ({
              name: a.textContent.trim(),
              url: a.href
            }));

            // Brand
            const brandEl = el.querySelector('.wd-product-brands-links a, .wd-product-brands a');
            const brand = brandEl ? brandEl.textContent.trim() : '';

            // SKU
            const skuEl = el.querySelector('.wd-product-sku span:last-child');
            const sku = skuEl ? skuEl.textContent.trim() : '';

            // Stock status
            const stockEl = el.querySelector('.wd-product-stock, .stock');
            const stockStatus = stockEl ? stockEl.textContent.trim() : '';

            // Sale badge
            const badgeEl = el.querySelector('.onsale, .product-label');
            const badge = badgeEl ? badgeEl.textContent.trim() : '';

            if (name) {
              products.push({
                name,
                price,
                regularPrice: regularPrice || price,
                salePrice: salePrice || null,
                onSale: !!salePrice,
                imageUrl,
                productUrl,
                categories: categories.map(c => c.name),
                categoriesDetail: categories,
                brand,
                sku,
                stockStatus,
                badge
              });
            }
          } catch (err) {
            // Skip products that fail to parse
          }
        });

        return products;
      });

      console.log(`   ✅ ${pageProducts.length} productos encontrados en página ${currentPage}`);
      allProducts.push(...pageProducts);

      // Respectful delay between pages
      if (currentPage < totalPages) {
        await delay(2000);
      }
    }
  } catch (error) {
    console.error(`\n❌ Error en página ${currentPage}:`, error.message);
  } finally {
    await browser.close();
  }

  // Organize by category
  console.log('\n📂 Organizando productos por categoría...');
  const productsByCategory = organizeByCategory(allProducts);

  // Build final output
  const output = {
    metadata: {
      source: BASE_URL,
      scrapedAt: new Date().toISOString(),
      totalProducts: allProducts.length,
      totalPages: totalPages,
      totalCategories: Object.keys(productsByCategory).length
    },
    categorias: productsByCategory,
    allProducts: allProducts
  };

  // Save to JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n💾 Datos guardados en: ${OUTPUT_FILE}`);
  console.log(`📊 Total de productos scrapeados: ${allProducts.length}`);
  console.log(`📂 Total de categorías: ${Object.keys(productsByCategory).length}`);

  // Print category summary
  console.log('\n📋 Resumen por categoría:');
  Object.entries(productsByCategory)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([cat, prods]) => {
      console.log(`   ${cat}: ${prods.length} productos`);
    });

  return output;
}

function organizeByCategory(products) {
  const categorized = {};

  products.forEach(product => {
    if (product.categories.length === 0) {
      // Products without category go to "Sin Categoría"
      if (!categorized['Sin Categoría']) {
        categorized['Sin Categoría'] = [];
      }
      categorized['Sin Categoría'].push(product);
    } else {
      // Add product to each of its categories
      product.categories.forEach(categoryName => {
        if (!categorized[categoryName]) {
          categorized[categoryName] = [];
        }
        categorized[categoryName].push({
          name: product.name,
          price: product.price,
          regularPrice: product.regularPrice,
          salePrice: product.salePrice,
          onSale: product.onSale,
          imageUrl: product.imageUrl,
          productUrl: product.productUrl,
          brand: product.brand,
          sku: product.sku,
          stockStatus: product.stockStatus,
          badge: product.badge
        });
      });
    }
  });

  // Sort categories alphabetically
  const sorted = {};
  Object.keys(categorized).sort((a, b) => a.localeCompare(b, 'es')).forEach(key => {
    sorted[key] = categorized[key];
  });

  return sorted;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          // Scroll back to top
          window.scrollTo(0, 0);
          resolve();
        }
      }, 150);
    });
  });
}

// Run the scraper
scrapeAllProducts()
  .then(() => {
    console.log('\n🎉 ¡Scraping completado exitosamente!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 Error fatal:', err);
    process.exit(1);
  });
