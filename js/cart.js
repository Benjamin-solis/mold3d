// ========================================
// MOLD3D - Shopping Cart Management
// ========================================

const CART_STORAGE_KEY = 'mold3d_cart';
const WHATSAPP_NUMBER = '56973023478';

let cart = [];

// ========================================
// Initialize Cart from Local Storage
// ========================================
function initCart() {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (error) {
            console.error('Error loading cart:', error);
            cart = [];
        }
    }
    updateCartDisplay();
}

// ========================================
// Add Item to Cart
// ========================================
function addToCart(product, selectedVariants = {}) {
    // Create unique cart item ID based on product and variants
    const cartItemId = generateCartItemId(product.id, selectedVariants);

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.cartItemId === cartItemId);

    if (existingItemIndex > -1) {
        // Increment quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item
        const cartItem = {
            cartItemId,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            variants: selectedVariants,
            quantity: 1
        };
        cart.push(cartItem);
    }

    saveCart();
    updateCartDisplay();

    console.log('✅ Added to cart:', product.name);
}

// ========================================
// Generate Unique Cart Item ID
// ========================================
function generateCartItemId(productId, variants) {
    const variantsString = Object.entries(variants)
        .sort()
        .map(([key, value]) => `${key}:${value}`)
        .join('|');

    return `${productId}-${variantsString}`;
}

// ========================================
// Update Item Quantity
// ========================================
function updateQuantity(cartItemId, newQuantity) {
    const itemIndex = cart.findIndex(item => item.cartItemId === cartItemId);

    if (itemIndex > -1) {
        if (newQuantity <= 0) {
            removeFromCart(cartItemId);
        } else {
            cart[itemIndex].quantity = newQuantity;
            saveCart();
            updateCartDisplay();
        }
    }
}

// ========================================
// Remove Item from Cart
// ========================================
function removeFromCart(cartItemId) {
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    saveCart();
    updateCartDisplay();
}

// ========================================
// Clear Cart
// ========================================
function clearCart() {
    cart = [];
    saveCart();
    updateCartDisplay();
}

// ========================================
// Save Cart to Local Storage
// ========================================
function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

// ========================================
// Calculate Cart Total
// ========================================
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// ========================================
// Get Cart Item Count
// ========================================
function getCartItemCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// ========================================
// Update Cart Display
// ========================================
function updateCartDisplay() {
    updateCartBadge();
    renderCartItems();
}

// ========================================
// Update Cart Badge
// ========================================
function updateCartBadge() {
    const cartCounts = document.querySelectorAll('.cart-count-display');
    const itemCount = getCartItemCount();

    cartCounts.forEach(el => {
        el.textContent = itemCount;
        el.style.display = itemCount > 0 ? 'flex' : 'none';
    });

    // Animate floating cart
    const floatingCart = document.querySelector('.floating-cart');
    if (floatingCart) {
        floatingCart.classList.remove('pop');
        void floatingCart.offsetWidth; // Trigger reflow
        floatingCart.classList.add('pop');
    }
}

// ========================================
// Render Cart Items
// ========================================
function renderCartItems() {
    const cartContent = document.getElementById('cartContent');

    if (!cartContent) return;

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <h3>Tu carrito está vacío</h3>
                <p class="card-text">Agrega productos desde nuestro catálogo</p>
                <a href="products.html" class="btn btn-primary mt-3">Ver Productos</a>
            </div>
        `;
        return;
    }

    const cartItemsHTML = cart.map(item => createCartItemHTML(item)).join('');
    const total = calculateTotal();

    cartContent.innerHTML = `
        <div class="cart-items">
            ${cartItemsHTML}
        </div>
        
        <div class="cart-summary">
            <div class="cart-total">
                <span class="cart-total-label">Total:</span>
                <span class="cart-total-amount">${formatPrice(total)}</span>
            </div>
            
            <button class="btn btn-whatsapp" style="width: 100%; font-size: 1.1rem; padding: 1.2rem;" onclick="sendWhatsAppOrder()">
                📱 Finalizar Pedido por WhatsApp
            </button>
            
            <button class="btn btn-secondary mt-2" style="width: 100%;" onclick="clearCart()">
                Vaciar Carrito
            </button>
        </div>
    `;

    // Attach event listeners
    attachCartEventListeners();
}

// ========================================
// Create Cart Item HTML
// ========================================
function createCartItemHTML(item) {
    const variantsText = Object.entries(item.variants)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' • ');

    return `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                ${variantsText ? `<p class="cart-item-variants">${variantsText}</p>` : ''}
                <p class="cart-item-price">${formatPrice(item.price)} c/u</p>
            </div>
            
            <div class="cart-item-controls">
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateQuantity('${item.cartItemId}', ${item.quantity - 1})">
                        −
                    </button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.cartItemId}', ${item.quantity + 1})">
                        +
                    </button>
                </div>
                
                <button class="btn-remove" onclick="removeFromCart('${item.cartItemId}')" title="Eliminar">
                    🗑️
                </button>
            </div>
        </div>
    `;
}

// ========================================
// Attach Cart Event Listeners
// ========================================
function attachCartEventListeners() {
    // Event listeners are handled via onclick attributes for simplicity
    // This ensures they work even after dynamic updates
}

// ========================================
// Send WhatsApp Order
// ========================================
function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }

    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Open WhatsApp in new tab
    window.open(whatsappURL, '_blank');

    console.log('📱 Opening WhatsApp with order...');
}

// ========================================
// Generate WhatsApp Message
// ========================================
function generateWhatsAppMessage() {
    const total = calculateTotal();

    let message = `*Hola MOLD3D!* 👋\n\n`;
    message += `Quisiera realizar el siguiente pedido:\n\n`;
    message += `━━━━━━━━━━━━━━━━━━\n\n`;

    cart.forEach((item, index) => {
        message += `*${index + 1}. ${item.name}*\n`;

        // Add variants
        if (Object.keys(item.variants).length > 0) {
            Object.entries(item.variants).forEach(([key, value]) => {
                message += `   • ${key}: ${value}\n`;
            });
        }

        message += `   • Cantidad: ${item.quantity}\n`;
        message += `   • Precio unitario: ${formatPrice(item.price)}\n`;
        message += `   • Subtotal: ${formatPrice(item.price * item.quantity)}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━\n\n`;
    message += `*TOTAL: ${formatPrice(total)}*\n\n`;
    message += `Quedo atento a la confirmación del pedido. ¡Gracias!`;

    return message;
}

// ========================================
// Initialize on Load
// ========================================
initCart();

// Export functions to global scope
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.sendWhatsAppOrder = sendWhatsAppOrder;
window.updateCartDisplay = updateCartDisplay;
