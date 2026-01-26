// ========================================
// MOLD3D - Product Detail logic
// ========================================

let productsData = [];

// ========================================
// Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetail();
});

// ========================================
// Load Product Logic
// ========================================
async function loadProductDetail() {
    const container = document.getElementById('productDetailContainer');

    // Get Product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        showProductError('Producto no especificado');
        return;
    }

    try {
        // Load data
        const response = await fetch(`data/products.json?v=${new Date().getTime()}`);
        if (!response.ok) throw new Error('Failed to load products');

        productsData = await response.json();
        const product = productsData.find(p => p.id === productId);

        if (!product) {
            showProductError('Producto no encontrado');
            return;
        }

        // Render Product
        renderProductDetail(product);

        // Update Page Title
        document.title = `${product.name} | MOLD3D.cl`;

    } catch (error) {
        console.error('Error:', error);
        showProductError('Error al cargar la información del producto');
    }
}

// ========================================
// Render Logic
// ========================================
function renderProductDetail(product) {
    const container = document.getElementById('productDetailContainer');

    // Prepare Images (Carousel Logic)
    const images = [product.image];
    if (product.image2) images.push(product.image2);
    if (product.image3) images.push(product.image3);
    if (product.image4) images.push(product.image4);

    let mediaHTML = '';

    if (images.length > 1) {
        // Carousel
        const slidesHTML = images.map((img, index) =>
            `<img src="${img}" alt="${product.name} - ${index + 1}" class="detail-carousel-image" loading="lazy">`
        ).join('');

        const dotsHTML = images.map((_, index) =>
            `<div class="carousel-dot ${index === 0 ? 'active' : ''}" onclick="slideDetailImage(${index})"></div>`
        ).join('');

        // Thumbnails
        const thumbnailsHTML = images.map((img, index) =>
            `<img src="${img}" alt="Thumbnail ${index + 1}" class="detail-thumbnail ${index === 0 ? 'active' : ''}" onclick="slideDetailImage(${index})">`
        ).join('');

        mediaHTML = `
            <div class="detail-media-container">
                <div class="detail-carousel" id="detailCarousel" data-index="0">
                    <div class="detail-carousel-track">
                        ${slidesHTML}
                    </div>
                    <button class="carousel-btn prev" onclick="prevDetailImage()">❮</button>
                    <button class="carousel-btn next" onclick="nextDetailImage()">❯</button>
                    
                    <div class="carousel-dots mobile-only">
                        ${dotsHTML}
                    </div>
                </div>
                <div class="detail-thumbnails desktop-only">
                    ${thumbnailsHTML}
                </div>
            </div>
        `;
    } else {
        // Single Image
        mediaHTML = `
            <div class="detail-media-container">
                <img src="${product.image}" alt="${product.name}" class="detail-main-image">
            </div>
        `;
    }

    // Prepare Variants
    const variantsHTML = product.variants ? createVariantsHTML(product) : '';

    // Full HTML Structure
    container.innerHTML = `
        <div class="product-detail-grid">
            ${mediaHTML}
            
            <div class="product-detail-info">
                <span class="detail-category">${product.category} ${product.subCategory ? '• ' + product.subCategory : ''}</span>
                <h1 class="detail-title">${product.name}</h1>
                <p class="detail-price">${formatPrice(product.price)}</p>
                
                <div class="detail-description">
                    <p>${product.description}</p>
                </div>

                <div class="detail-options">
                    ${variantsHTML}
                </div>

                <div class="detail-actions">
                    <button class="btn btn-primary btn-add-cart-detail" onclick="addToCartFromDetail('${product.id}')">
                        Agregar al Carrito
                    </button>
                    <a href="https://wa.me/56973023478?text=Hola,%20me%20interesa%20el%20producto%20${encodeURIComponent(product.name)}" 
                       class="btn btn-whatsapp" target="_blank">
                       Consultar por WhatsApp
                    </a>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// Helper: Create Variants
// ========================================
function createVariantsHTML(product) {
    if (!product.variants || product.variants.length === 0) return '';

    return product.variants.map((variant, index) => {
        const selectId = `variant-${product.id}-${index}`;
        const optionsHTML = variant.options.map((option, optIndex) =>
            // select first option by default
            `<option value="${option}" ${optIndex === 0 ? 'selected' : ''}>${option}</option>`
        ).join('');

        return `
            <div class="variant-group">
                <label class="variant-label" for="${selectId}">${variant.name}</label>
                <select class="variant-select" id="${selectId}" 
                        data-variant-name="${variant.name}"
                        onchange="updateProductPrice('${product.id}')">
                    ${optionsHTML}
                </select>
            </div>
        `;
    }).join('');
}

// ========================================
// Carousel Logic (Similar to products.js but specific to detail)
// ========================================
window.slideDetailImage = function (index) {
    const carousel = document.getElementById('detailCarousel');
    const track = carousel.querySelector('.detail-carousel-track');
    if (!carousel || !track) return;

    // Slide
    track.style.transform = `translateX(-${index * 100}%)`;
    carousel.setAttribute('data-index', index);

    // Update Dots (Mobile)
    const dots = carousel.querySelectorAll('.carousel-dot');
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[index]) dots[index].classList.add('active');

    // Update Thumbnails (Desktop)
    const thumbs = document.querySelectorAll('.detail-thumbnail');
    thumbs.forEach(thumb => thumb.classList.remove('active'));
    if (thumbs[index]) thumbs[index].classList.add('active');
}

window.nextDetailImage = function () {
    const carousel = document.getElementById('detailCarousel');
    const images = carousel.querySelectorAll('.detail-carousel-image');
    let index = parseInt(carousel.getAttribute('data-index') || 0);

    index++;
    if (index >= images.length) index = 0;

    slideDetailImage(index);
}

window.prevDetailImage = function () {
    const carousel = document.getElementById('detailCarousel');
    const images = carousel.querySelectorAll('.detail-carousel-image');
    let index = parseInt(carousel.getAttribute('data-index') || 0);

    index--;
    if (index < 0) index = images.length - 1;

    slideDetailImage(index);
}

// ========================================
// Dynamic Price Logic
// ========================================
window.updateProductPrice = function (productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product || !product.variantPrices) return;

    // We assume the first variant select maps to the prices for now
    // Or we could try to compose a key from all selects if it was complex matrix
    // Given the request, we just look for the selected value in variantPrices map

    // Find all selected options
    const selects = document.querySelectorAll('.variant-select');

    let newPrice = product.price; // Default

    // Check if any selected option has a price override
    selects.forEach(select => {
        const selectedOption = select.value;
        if (product.variantPrices[selectedOption]) {
            newPrice = product.variantPrices[selectedOption];
        }
    });

    // Update UI
    const priceDisplay = document.querySelector('.detail-price');
    if (priceDisplay) {
        priceDisplay.textContent = formatPrice(newPrice);
        // Visual feedback
        priceDisplay.style.color = 'var(--color-accent)';
        setTimeout(() => priceDisplay.style.color = '', 300);
    }
}

// ========================================
// Add to Cart Logic
// ========================================
window.addToCartFromDetail = function (productId) {
    // Find product
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    // Get Variants
    const variants = {};
    const selects = document.querySelectorAll('.variant-select');

    let finalPrice = product.price;

    selects.forEach(select => {
        const option = select.value;
        variants[select.getAttribute('data-variant-name')] = option;

        // Update price if applicable
        if (product.variantPrices && product.variantPrices[option]) {
            finalPrice = product.variantPrices[option];
        }
    });

    // Create a copy of product with the variant price
    const productToAdd = { ...product, price: finalPrice };

    // Add to Global Cart (cart.js)
    if (window.addToCart) {
        window.addToCart(productToAdd, variants);

        // Feedback
        const btn = document.querySelector('.btn-add-cart-detail');
        const originalText = btn.textContent;
        btn.textContent = '✓ Agregado';
        btn.style.background = 'var(--color-success)';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = ''; // Revert to CSS default (primary)
        }, 1500);
    }
}

function showProductError(msg) {
    document.getElementById('productDetailContainer').innerHTML = `
        <div class="cart-empty">
            <h3>${msg}</h3>
            <a href="products.html" class="btn btn-primary">Volver al catálogo</a>
        </div>
    `;
}
// ========================================
// Auto-Play Logic
// ========================================
let autoSlideInterval;

function startAutoSlide() {
    stopAutoSlide(); // Ensure we don't have multiple intervals
    autoSlideInterval = setInterval(() => {
        window.nextDetailImage();
    }, 4000); // Change image every 4 seconds
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
}

// Hook into render logic to start
const originalRenderProductDetail = renderProductDetail;
renderProductDetail = function (product) {
    originalRenderProductDetail(product);

    // Only start if there are multiple images
    const images = [product.image, product.image2, product.image3, product.image4].filter(i => i);
    if (images.length > 1) {
        startAutoSlide();

        // Pause on interaction
        const carouselContainer = document.querySelector('.detail-media-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', stopAutoSlide);
            carouselContainer.addEventListener('mouseleave', startAutoSlide);
            carouselContainer.addEventListener('touchstart', stopAutoSlide);
            carouselContainer.addEventListener('touchend', startAutoSlide);
        }
    }
}
