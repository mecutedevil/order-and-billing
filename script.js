// Default menu items
const defaultMenuItems = [
    // Morning items
    { id: 1, name: 'Idly', price: 30, category: 'morning', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop' },
    { id: 2, name: 'Dosa', price: 50, category: 'morning', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop' },
    { id: 3, name: 'Poori', price: 40, category: 'morning', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop' },
    { id: 4, name: 'Pongal', price: 45, category: 'morning', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop' },
    { id: 5, name: 'Sambar Sadham', price: 60, category: 'morning', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop' },
    
    // Lunch items
    { id: 6, name: 'Briyani', price: 150, category: 'lunch', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop' },
    { id: 7, name: 'Chicken Rice', price: 120, category: 'lunch', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop' },
    { id: 8, name: 'Chicken', price: 180, category: 'lunch', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop' },
    { id: 9, name: 'Rice Noodles', price: 80, category: 'lunch', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop' },
    { id: 10, name: 'Chicken Meals', price: 200, category: 'lunch', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop' },
    { id: 11, name: 'Veg Meals', price: 100, category: 'lunch', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop' },
    
    // Dinner items
    { id: 12, name: 'Idly', price: 30, category: 'dinner', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop' },
    { id: 13, name: 'Naan', price: 35, category: 'dinner', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop' },
    { id: 14, name: 'Otti', price: 40, category: 'dinner', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop' },
    { id: 15, name: 'Chicken Gravy Items', price: 160, category: 'dinner', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop' },
    { id: 16, name: 'Dosa', price: 50, category: 'dinner', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop' }
];

// Load menu items from localStorage or use default
function loadMenuItems() {
    const stored = localStorage.getItem('restaurantMenuItems');
    if (stored) {
        return JSON.parse(stored);
    }
    return defaultMenuItems;
}

// Save menu items to localStorage
function saveMenuItems(items) {
    localStorage.setItem('restaurantMenuItems', JSON.stringify(items));
}

// Food items data structure
let menuItems = loadMenuItems();

// Cart data
let cart = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load menu items from localStorage
    menuItems = loadMenuItems();
    renderMenu();
    renderCart();
    // Only render managed items if container exists (admin page)
    const itemsContainer = document.getElementById('items-container');
    if (itemsContainer) {
        renderManagedItems();
    }
    setupEventListeners();
    
    // Initialize payment settings if on admin page
    const savePaymentBtn = document.getElementById('save-payment-settings');
    if (savePaymentBtn) {
        loadPaymentSettingsToForm();
    }
    
    // Display current verification code if exists
    const generateCodeBtn = document.getElementById('generate-verification-code');
    if (generateCodeBtn) {
        displayCurrentVerificationCode();
    }
});

// Load payment settings from localStorage
function loadPaymentSettings() {
    const stored = localStorage.getItem('restaurantPaymentSettings');
    if (stored) {
        return JSON.parse(stored);
    }
    return { timing: 'before', upiId: '' };
}

// Save payment settings to localStorage
function savePaymentSettings(settings) {
    localStorage.setItem('restaurantPaymentSettings', JSON.stringify(settings));
}

// Generate transaction ID (unique for each payment)
function generateTransactionId() {
    // Generate a unique transaction ID: TXN + timestamp + random 6 digits
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const random = Math.floor(100000 + Math.random() * 900000).toString();
    const transactionId = `TXN${timestamp}${random}`;
    return transactionId;
}

// Save transaction ID to localStorage
function saveTransactionId(transactionId) {
    localStorage.setItem('restaurantTransactionId', transactionId);
    // Set expiration time (30 minutes)
    const expiration = Date.now() + (30 * 60 * 1000);
    localStorage.setItem('restaurantTransactionIdExpiry', expiration.toString());
}

// Get current transaction ID
function getTransactionId() {
    const transactionId = localStorage.getItem('restaurantTransactionId');
    const expiry = localStorage.getItem('restaurantTransactionIdExpiry');
    
    if (!transactionId || !expiry) {
        return null;
    }
    
    // Check if transaction ID has expired
    if (Date.now() > parseInt(expiry)) {
        localStorage.removeItem('restaurantTransactionId');
        localStorage.removeItem('restaurantTransactionIdExpiry');
        return null;
    }
    
    return transactionId;
}

// Verify transaction ID entered by customer
function verifyTransactionId(enteredTransactionId) {
    const validTransactionId = getTransactionId();
    if (!validTransactionId) {
        return false;
    }
    
    return enteredTransactionId.trim().toUpperCase() === validTransactionId.toUpperCase();
}

// Setup event listeners
function setupEventListeners() {
    // Form submission (only if form exists - admin page)
    const itemForm = document.getElementById('item-form');
    if (itemForm) {
        itemForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Image URL preview (only if input exists - admin page)
    const itemImage = document.getElementById('item-image');
    if (itemImage) {
        itemImage.addEventListener('input', updateImagePreview);
    }
    
    // Cancel edit button (only if button exists - admin page)
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEdit);
    }
    
    // Payment settings (only if exists - admin page)
    const savePaymentBtn = document.getElementById('save-payment-settings');
    if (savePaymentBtn) {
        savePaymentBtn.addEventListener('click', savePaymentSettingsHandler);
        loadPaymentSettingsToForm();
    }
    
    // Display current transaction ID if exists (admin page)
    displayCurrentTransactionId();
    
    // Check for transaction ID updates periodically
    setInterval(function() {
        displayCurrentTransactionId();
    }, 1000);
}

// Note: Transaction IDs are now auto-generated on customer page when checkout is clicked
// Each payment gets a unique transaction ID

// Display current transaction ID
function displayCurrentTransactionId() {
    const transactionId = getTransactionId();
    const displayDiv = document.getElementById('verification-code-display');
    const transactionIdSpan = document.getElementById('current-verification-code');
    
    if (displayDiv && transactionIdSpan) {
        if (transactionId) {
            transactionIdSpan.textContent = transactionId;
            displayDiv.style.display = 'block';
        } else {
            displayDiv.style.display = 'none';
        }
    }
}

// Load payment settings to form
function loadPaymentSettingsToForm() {
    const settings = loadPaymentSettings();
    const payBefore = document.getElementById('pay-before');
    const payAfter = document.getElementById('pay-after');
    const upiId = document.getElementById('upi-id');
    
    if (payBefore && payAfter) {
        if (settings.timing === 'before') {
            payBefore.checked = true;
        } else {
            payAfter.checked = true;
        }
    }
    
    if (upiId) {
        upiId.value = settings.upiId || '';
    }
}

// Save payment settings handler
function savePaymentSettingsHandler() {
    const payBefore = document.getElementById('pay-before');
    const payAfter = document.getElementById('pay-after');
    const upiId = document.getElementById('upi-id');
    
    if (!payBefore || !payAfter || !upiId) return;
    
    const timing = payBefore.checked ? 'before' : 'after';
    const upiIdValue = upiId.value.trim();
    
    if (timing === 'before' && !upiIdValue) {
        alert('Please enter UPI ID for payment before order');
        return;
    }
    
    const settings = {
        timing: timing,
        upiId: upiIdValue
    };
    
    savePaymentSettings(settings);
    alert('Payment settings saved successfully!');
}

// Render menu items
function renderMenu() {
    const morningMenu = document.getElementById('morning-menu');
    const lunchMenu = document.getElementById('lunch-menu');
    const dinnerMenu = document.getElementById('dinner-menu');
    
    morningMenu.innerHTML = '';
    lunchMenu.innerHTML = '';
    dinnerMenu.innerHTML = '';
    
    menuItems.forEach(item => {
        const menuItem = createMenuItemElement(item);
        
        if (item.category === 'morning') {
            morningMenu.appendChild(menuItem);
        } else if (item.category === 'lunch') {
            lunchMenu.appendChild(menuItem);
        } else if (item.category === 'dinner') {
            dinnerMenu.appendChild(menuItem);
        }
    });
}

// Create menu item element
function createMenuItemElement(item) {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="menu-item-image" onerror="this.src='https://via.placeholder.com/200x150?text=${encodeURIComponent(item.name)}'">
        <div class="menu-item-name">${item.name}</div>
        <div class="menu-item-price">₹${item.price.toFixed(2)}</div>
        <button class="add-to-cart-btn" onclick="addToCart(${item.id})">Add to Cart</button>
    `;
    return div;
}

// Add item to cart
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    const existingItem = cart.find(c => c.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1
        });
    }
    
    renderCart();
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    renderCart();
}

// Update quantity
function updateQuantity(itemId, change) {
    const item = cart.find(c => c.id === itemId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        renderCart();
    }
}

// Render cart
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        checkoutBtn.disabled = true;
    } else {
        cartItems.innerHTML = '';
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/60x60?text=${encodeURIComponent(item.name)}'">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            `;
            cartItems.appendChild(cartItem);
        });
        checkoutBtn.disabled = false;
    }
    
    calculateBilling();
}

// Calculate billing
function calculateBilling() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
    
    // Add checkout functionality
    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.onclick = function() {
        if (cart.length > 0) {
            alert(`Order placed successfully!\nTotal: ₹${total.toFixed(2)}\nThank you for your order!`);
            cart = [];
            renderCart();
        }
    };
}

// Management section functions
function handleFormSubmit(e) {
    e.preventDefault();
    
    const editId = document.getElementById('edit-id').value;
    const name = document.getElementById('item-name').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const category = document.getElementById('item-category').value;
    const image = document.getElementById('item-image').value;
    
    if (editId) {
        // Edit existing item
        const item = menuItems.find(i => i.id === parseInt(editId));
        if (item) {
            item.name = name;
            item.price = price;
            item.category = category;
            item.image = image;
        }
        document.getElementById('edit-id').value = '';
        document.getElementById('submit-btn').textContent = 'Add Item';
        const cancelBtn = document.getElementById('cancel-edit-btn');
        if (cancelBtn) cancelBtn.style.display = 'none';
    } else {
        // Add new item
        const newId = menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1;
        menuItems.push({
            id: newId,
            name: name,
            price: price,
            category: category,
            image: image
        });
    }
    
    // Reset form
    document.getElementById('item-form').reset();
    const preview = document.getElementById('image-preview');
    if (preview) {
        preview.innerHTML = '';
        preview.classList.add('empty');
    }
    
    // Save to localStorage
    saveMenuItems(menuItems);
    
    // Re-render
    renderMenu();
    const itemsContainer = document.getElementById('items-container');
    if (itemsContainer) {
        renderManagedItems();
    }
    
    // Update cart if items were edited
    cart.forEach(cartItem => {
        const menuItem = menuItems.find(m => m.id === cartItem.id);
        if (menuItem) {
            cartItem.name = menuItem.name;
            cartItem.price = menuItem.price;
            cartItem.image = menuItem.image;
        }
    });
    renderCart();
}

function updateImagePreview() {
    const imageInput = document.getElementById('item-image');
    const preview = document.getElementById('image-preview');
    
    if (!imageInput || !preview) return;
    
    const imageUrl = imageInput.value;
    
    if (imageUrl) {
        preview.innerHTML = `<img src="${imageUrl}" alt="Preview" onerror="this.parentElement.innerHTML='<span>Invalid image URL</span>'">`;
        preview.classList.remove('empty');
    } else {
        preview.innerHTML = '';
        preview.classList.add('empty');
    }
}

function editItem(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    const editIdInput = document.getElementById('edit-id');
    const nameInput = document.getElementById('item-name');
    const priceInput = document.getElementById('item-price');
    const categoryInput = document.getElementById('item-category');
    const imageInput = document.getElementById('item-image');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const itemForm = document.getElementById('item-form');
    
    if (!editIdInput || !nameInput || !priceInput || !categoryInput || !imageInput || !submitBtn || !itemForm) return;
    
    editIdInput.value = item.id;
    nameInput.value = item.name;
    priceInput.value = item.price;
    categoryInput.value = item.category;
    imageInput.value = item.image;
    submitBtn.textContent = 'Update Item';
    if (cancelBtn) cancelBtn.style.display = 'block';
    
    updateImagePreview();
    
    // Scroll to form
    itemForm.scrollIntoView({ behavior: 'smooth' });
}

function deleteItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        menuItems = menuItems.filter(i => i.id !== itemId);
        cart = cart.filter(c => c.id !== itemId);
        saveMenuItems(menuItems);
        renderMenu();
        renderManagedItems();
        renderCart();
    }
}

function cancelEdit() {
    const itemForm = document.getElementById('item-form');
    const editIdInput = document.getElementById('edit-id');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const preview = document.getElementById('image-preview');
    
    if (itemForm) itemForm.reset();
    if (editIdInput) editIdInput.value = '';
    if (submitBtn) submitBtn.textContent = 'Add Item';
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (preview) {
        preview.innerHTML = '';
        preview.classList.add('empty');
    }
}

function renderManagedItems() {
    const container = document.getElementById('items-container');
    container.innerHTML = '';
    
    if (menuItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No items to manage</p>';
        return;
    }
    
    menuItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'managed-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="managed-item-image" onerror="this.src='https://via.placeholder.com/60x60?text=${encodeURIComponent(item.name)}'">
            <div class="managed-item-info">
                <div class="managed-item-name">${item.name}</div>
                <div class="managed-item-details">
                    ₹${item.price.toFixed(2)} | ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </div>
            </div>
            <div class="managed-item-actions">
                <button class="action-btn edit-btn" onclick="editItem(${item.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteItem(${item.id})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

