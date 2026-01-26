// ========================================
// MOLD3D - Products Management
// ========================================

let productsData = [];
let currentCategory = 'Todos';
let currentSubCategory = 'Todos';

// ========================================
// Load Products from JSON
// ========================================
async function loadProducts() {
    try {
        // Add timestamp to prevent caching
        const response = await fetch(`data/products.json?v=${new Date().getTime()}`);
        if (!response.ok) {
            throw new Error('Failed to load products');
        }

        productsData = await response.json();
        renderCategoryFilters(productsData);
        // Initially hide subcategories or render if needed (usually hidden for 'Todos')
        renderSubCategoryFilters(productsData);
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

    // Filter products based on current category and subcategory
    let filteredProducts = products;

    // 1. Filter by Main Category
    if (currentCategory !== 'Todos') {
        filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
    }

    // 2. Filter by SubCategory (only if not 'Todos')
    if (currentSubCategory !== 'Todos') {
        filteredProducts = filteredProducts.filter(p => p.subCategory === currentSubCategory);
    }

    if (!filteredProducts || filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">📦</div>
                <h3>No hay productos disponibles</h3>
                <p class="card-text">Intenta con otra categoría.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');

    // Add event listeners to "Add to Cart" buttons
    // attachAddToCartListeners(); // NOT NEEDED IN CATALOG ANYMORE

    // Re-initialize reveal animations for newly added products
    if (typeof window.revealElements === 'function') {
        setTimeout(() => window.revealElements(), 100);
    }
}

// ========================================
// Create Product Card HTML
// ========================================
// ========================================
// Create Product Card HTML (Simplified for Catalog)
// ========================================
function createProductCard(product) {
    // We only show the main image here.
    // The carousel logic is moved to product-detail.js

    return `
        <a href="product-detail.html?id=${product.id}" class="product-card reveal" data-product-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
            
            <div class="product-info">
                <span class="product-category">
                    ${product.category} ${product.subCategory ? '• ' + product.subCategory : ''}
                </span>
                <h3 class="product-name">${product.name}</h3>
                
                <div class="product-footer">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    <button class="btn btn-primary btn-sm">
                        Ver Detalles
                    </button>
                </div>
            </div>
        </a>
    `;
}

// No variants or carousel logic needed here anymore

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

// ========================================
// Render Category Filters
// ========================================
function renderCategoryFilters(products) {
    const filtersContainer = document.getElementById('categoryFilters');

    // Extract unique categories
    const categories = ['Todos', ...new Set(products.map(p => p.category))];

    filtersContainer.innerHTML = categories.map(category => `
        <button class="category-btn ${category === currentCategory ? 'active' : ''}" 
                onclick="filterProducts('${category}')">
            ${category}
        </button>
    `).join('');
}

// ========================================
// Render SubCategory Filters
// ========================================
function renderSubCategoryFilters(products) {
    const subFiltersContainer = document.getElementById('subCategoryFilters');

    // If 'Todos' is selected for main category, we usually don't show subcategories
    // OR we could show all subcategories. Let's hide them for simplicity unless a category is picked
    // AND that category has subcategories.

    // Logic: 
    // 1. Get products for current category
    const categoryProducts = currentCategory === 'Todos'
        ? products
        : products.filter(p => p.category === currentCategory);

    // 2. Extract subcategories
    const subCategories = [...new Set(categoryProducts
        .map(p => p.subCategory)
        .filter(sub => sub) // Remove undefined/null/empty
    )];

    // 3. If no subcategories found, hide container
    if (subCategories.length === 0) {
        subFiltersContainer.style.display = 'none';
        subFiltersContainer.innerHTML = '';
        return;
    }

    // 4. Show container and render buttons
    subFiltersContainer.style.display = 'flex'; // or block/grid depending on CSS
    const allSubCategories = ['Todos', ...subCategories];

    subFiltersContainer.innerHTML = allSubCategories.map(subCat => `
        <button class="subcategory-btn ${subCat === currentSubCategory ? 'active' : ''}" 
                onclick="filterSubCategory('${subCat}')">
            ${subCat}
        </button>
    `).join('');
}

// ========================================
// Filter Products Action (Main Category)
// ========================================
function filterProducts(category) {
    currentCategory = category;
    currentSubCategory = 'Todos'; // Reset subcategory when changing main category

    // Update active button state style for main categories
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        if (btn.textContent.trim() === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Render Subcategories for the new main category
    renderSubCategoryFilters(productsData);

    // Re-render products
    renderProducts(productsData);
}

// ========================================
// Filter SubCategory Action
// ========================================
function filterSubCategory(subCategory) {
    currentSubCategory = subCategory;

    // Update active button state style for subcategories
    const buttons = document.querySelectorAll('.subcategory-btn');
    buttons.forEach(btn => {
        if (btn.textContent.trim() === subCategory) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Re-render products
    renderProducts(productsData);
}

// Export functions
window.loadProducts = loadProducts;
window.productsData = productsData;
window.filterProducts = filterProducts;
window.filterSubCategory = filterSubCategory;
