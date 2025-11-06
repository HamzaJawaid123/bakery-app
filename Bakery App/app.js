// --- Cart Management Functions ---
const getCart = () => {
    try {
        const cart = localStorage.getItem('bakeryCart');
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        console.error("Could not parse cart from localStorage", e);
        return [];
    }
};

const saveCart = (cart) => {
    localStorage.setItem('bakeryCart', JSON.stringify(cart));
    updateCartIcon();
};

// UPDATED addToCart function to pull info directly from parameters
const addToCart = (productId, productName, productPrice) => {
    let cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Add new item using data passed from HTML
        cart.push({ 
            id: productId, 
            quantity: 1, 
            name: productName, 
            price: productPrice 
        });
    }

    saveCart(cart);
    alert(`Added ${productName} to cart!`);
};

const updateCartItem = (productId, newQuantity) => {
    let cart = getCart();
    
    if (newQuantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    } else {
        const item = cart.find(item => item.id === productId);
        if (item) {
            // Ensure quantity is an integer
            item.quantity = parseInt(newQuantity);
        }
    }

    saveCart(cart);
    // Reload cart page after update
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }
};

const updateCartIcon = () => {
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartLinks = document.querySelectorAll('.cart-link');
    
    cartLinks.forEach(link => {
        link.innerHTML = `🛒 (${totalItems})`;
    });
};

// --- Cart Page Rendering (Mostly Unchanged) ---

const renderCartPage = () => {
    const cartList = document.querySelector('.cart-items-list');
    const summaryDetails = document.querySelector('.checkout-summary .summary-details');
    const checkoutBtn = document.querySelector('.checkout-summary .primary-btn');

    if (!cartList || !summaryDetails || !checkoutBtn) return;

    const cart = getCart();
    let subtotal = 0;
    const deliveryFee = 350; // Flat fee in PKR
    const phoneNumber = '03222292155';

    // 1. Render Cart Items
    const summaryTitle = '<h2>Order Summary</h2>';
    
    if (cart.length === 0) {
        cartList.innerHTML = summaryTitle + '<p style="text-align:center; padding: 20px;">Your cart is empty! <a href="menu.html">Start shopping.</a></p>';
        summaryDetails.innerHTML = '';
        checkoutBtn.style.display = 'none';
        return;
    }
    
    let cartItemsHTML = '';
    let whatsappMessage = "Hello Royal Sweet! I'd like to place an order:%0A"; // Start of WhatsApp message
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        cartItemsHTML += `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p class="id-tag">ID: ${item.id}</p>
                    <p class="price">PKR ${itemTotal.toLocaleString('en-IN')}</p>
                </div>
                <div class="item-controls">
                    <label>Qty:</label>
                    <input type="number" value="${item.quantity}" min="1" onchange="updateCartItem('${item.id}', this.value)">
                    <button class="remove-btn" onclick="updateCartItem('${item.id}', 0)">Remove</button>
                </div>
            </div>
        `;
        whatsappMessage += `- ${item.name} (Qty: ${item.quantity})%0A`;
    });
    
    cartList.innerHTML = summaryTitle + cartItemsHTML + '<a href="menu.html" class="btn secondary-btn" style="width: 100%; text-align: center; margin-top: 15px;">← Continue Shopping</a>';
    
    // 2. Render Totals
    const grandTotal = subtotal + deliveryFee;
    whatsappMessage += `%0AOrder Total: PKR ${grandTotal.toLocaleString('en-IN')}%0A%0A`;
    whatsappMessage += "My delivery details are [Please type your name and address here].";

    summaryDetails.innerHTML = `
        <p>Subtotal:</p><span>PKR ${subtotal.toLocaleString('en-IN')}</span>
        <p>Delivery Fee (Flat Rate):</p><span>PKR ${deliveryFee.toLocaleString('en-IN')}</span>
        <p class="total">Grand Total:</p><span class="total">PKR ${grandTotal.toLocaleString('en-IN')}</span>
    `;

    // 3. Update Checkout Button to WhatsApp
    checkoutBtn.style.display = 'block';
    checkoutBtn.innerHTML = `Order via WhatsApp (PKR ${grandTotal.toLocaleString('en-IN')})`;
    
    // Set WhatsApp link for the button
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;
    checkoutBtn.onclick = (e) => {
        e.preventDefault(); // Prevent form submission
        window.open(whatsappLink, '_blank');
    };
};


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    updateCartIcon();

    const path = window.location.pathname;
    
    // Only run cart rendering on the cart page
    if (path.includes('cart.html')) {
        renderCartPage();
    }
    // No need for renderProducts here since HTML is static
});