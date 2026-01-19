// ========================================
// MOLD3D - Products Management
// ========================================

let productsData = [];

// ========================================
// Load Products from JSON
// ========================================
async function loadProducts() {
    try {
        const response = await fetch('data/products.json');
        if (!response.ok) {
            throw new Error('Failed to load products');
        }

        productsData = await response.json();
        renderProducts(productsData);

        console.log(`✅ Loaded ${productsData.length} products`);
    } catch (error) {
        console.error('❌ Error loading products:', error);
        showProductsError();
    }
}

// ========================================
// Render Products Grid
// ========================================
function renderProducts(products) {
    const productsGrid = document.getElementById('productsGrid');

    if (!products || products.length === 0) {
        productsGrid.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">📦</div>
                <h3>No hay productos disponibles</h3>
                <p class="card-text">Estamos actualizando nuestro catálogo.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');

    // Add event listeners to "Add to Cart" buttons
    attachAddToCartListeners();

    // Re-initialize reveal animations for newly added products
    if (typeof window.revealElements === 'function') {
        setTimeout(() => window.revealElements(), 100);
    }
}

// ========================================
// Create Product Card HTML
// ========================================
function createProductCard(product) {
    const variantsHTML = product.variants ? createVariantsHTML(product) : '';

    return `
        <div class="product-card reveal" data-product-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
            
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                
                ${variantsHTML}
                
                <div class="product-footer">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    <button class="btn btn-primary btn-add-cart" data-product-id="${product.id}">
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// Create Variants HTML
// ========================================
function createVariantsHTML(product) {
    if (!product.variants || product.variants.length === 0) {
        return '';
    }

    const variantsHTML = product.variants.map((variant, index) => {
        const selectId = `variant-${product.id}-${index}`;
        const optionsHTML = variant.options.map(option =>
            `<option value="${option}">${option}</option>`
        ).join('');

        return `
            <div class="variant-group">
                <label class="variant-label" for="${selectId}">${variant.name}</label>
                <select class="variant-select" id="${selectId}" data-variant-name="${variant.name}">
                    ${optionsHTML}
                </select>
            </div>
        `;
    }).join('');

    return `<div class="product-variants">${variantsHTML}</div>`;
}

// ========================================
// Add to Cart Event Listeners
// ========================================
function attachAddToCartListeners() {
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.getAttribute('data-product-id');
            const product = productsData.find(p => p.id === productId);

            if (product) {
                const selectedVariants = getSelectedVariants(productId);
                addToCart(product, selectedVariants);

                // Visual feedback
                showAddToCartFeedback(e.target);
            }
        });
    });
}

// ========================================
// Get Selected Variants
// ========================================
function getSelectedVariants(productId) {
    const productCard = document.querySelector(`[data-product-id="${productId}"]`);
    const variantSelects = productCard.querySelectorAll('.variant-select');

    const variants = {};
    variantSelects.forEach(select => {
        const variantName = select.getAttribute('data-variant-name');
        variants[variantName] = select.value;
    });

    return variants;
}

// ========================================
// Visual Feedback for Add to Cart
// ========================================
function showAddToCartFeedback(button) {
    const originalText = button.textContent;
    button.textContent = '✓ Agregado';
    button.style.background = 'var(--color-success)';

    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 1500);
}

// ========================================
// Error Display
// ========================================
function showProductsError() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = `
        <div class="cart-empty">
            <div class="cart-empty-icon">⚠️</div>
            <h3>Error al cargar productos</h3>
            <p class="card-text">Por favor, intenta recargar la página.</p>
            <button class="btn btn-primary mt-2" onclick="location.reload()">
                Recargar
            </button>
        </div>
    `;
}

// Export functions
window.loadProducts = loadProducts;
window.productsData = productsData;
