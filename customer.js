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

// Load payment settings from localStorage
function loadPaymentSettings() {
    const stored = localStorage.getItem('restaurantPaymentSettings');
    if (stored) {
        return JSON.parse(stored);
    }
    return { timing: 'before', upiId: 'restaurant@paytm' };
}

// Generate QR code for UPI payment
function generateQRCode(amount, upiId) {
    // UPI payment URL format: upi://pay?pa=UPI_ID&pn=MerchantName&am=AMOUNT&cu=INR
    const merchantName = 'Restaurant';
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount.toFixed(2)}&cu=INR`;
    
    // Use QR code API to generate QR code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
    
    return qrCodeUrl;
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

// Get current transaction ID from localStorage
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

// Food items data structure - loaded from localStorage
let menuItems = loadMenuItems();

// Cart data
let cart = [];

// Note: Transaction IDs are now entered manually by customers from their UPI payment receipts

// Listen for storage changes to update menu when admin makes changes
window.addEventListener('storage', function(e) {
    if (e.key === 'restaurantMenuItems') {
        menuItems = loadMenuItems();
        renderMenu();
    }
    if (e.key === 'restaurantPaymentSettings') {
        // Payment settings updated
        const qrSection = document.getElementById('qr-payment-section');
        if (qrSection && qrSection.style.display !== 'none') {
            // If QR is showing, hide it and reset checkout
            qrSection.style.display = 'none';
            const checkoutBtn = document.getElementById('checkout-btn');
            if (checkoutBtn) checkoutBtn.style.display = 'block';
        }
    }
    // Transaction IDs are now entered manually by customers
});

// Also check for changes periodically (for same-tab updates)
setInterval(function() {
    const stored = localStorage.getItem('restaurantMenuItems');
    if (stored) {
        const currentItems = JSON.parse(stored);
        if (JSON.stringify(currentItems) !== JSON.stringify(menuItems)) {
            menuItems = currentItems;
            renderMenu();
        }
    }
    
    // Transaction IDs are entered manually by customers
}, 500);

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load menu items from localStorage
    menuItems = loadMenuItems();
    renderMenu();
    renderCart();
    
    // Hide QR section initially
    const qrSection = document.getElementById('qr-payment-section');
    if (qrSection) {
        qrSection.style.display = 'none';
    }
});

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
    
    // Show notification
    showNotification(`${item.name} added to cart!`);
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
    const qrSection = document.getElementById('qr-payment-section');
    const customerNameInput = document.getElementById('customer-name');
    const tableNumberInput = document.getElementById('table-number');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        checkoutBtn.disabled = true;
        // Hide QR section if cart is empty
        if (qrSection) {
            qrSection.style.display = 'none';
        }
        if (checkoutBtn) {
            checkoutBtn.style.display = 'block';
        }
        // Disable customer info inputs when cart is empty
        if (customerNameInput) {
            customerNameInput.disabled = true;
            customerNameInput.value = '';
        }
        if (tableNumberInput) {
            tableNumberInput.disabled = true;
            tableNumberInput.value = '';
        }
    } else {
        // Enable customer info inputs when cart has items
        if (customerNameInput) {
            customerNameInput.disabled = false;
        }
        if (tableNumberInput) {
            tableNumberInput.disabled = false;
        }
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
            handleCheckout(total);
        }
    };
}

// Handle checkout based on payment timing
function handleCheckout(total) {
    // Validate customer name
    const customerNameInput = document.getElementById('customer-name');
    const customerName = customerNameInput ? customerNameInput.value.trim() : '';
    
    if (!customerName || customerName === '') {
        alert('Please enter your name');
        if (customerNameInput) {
            customerNameInput.focus();
        }
        return;
    }
    
    // Validate table number
    const tableNumberInput = document.getElementById('table-number');
    const tableNumber = tableNumberInput ? tableNumberInput.value.trim() : '';
    
    if (!tableNumber || tableNumber === '' || parseInt(tableNumber) < 1) {
        alert('Please enter a valid table number');
        if (tableNumberInput) {
            tableNumberInput.focus();
        }
        return;
    }
    
    const paymentSettings = loadPaymentSettings();
    const qrSection = document.getElementById('qr-payment-section');
    const checkoutBtn = document.getElementById('checkout-btn');
    const qrCodeContainer = document.getElementById('qr-code');
    const paymentStatus = document.getElementById('payment-status');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    
    if (paymentSettings.timing === 'before') {
        // Pay before order - show QR code
        if (!paymentSettings.upiId) {
            alert('Payment settings not configured. Please contact admin.');
            return;
        }
        
        // Generate QR code
        const qrCodeUrl = generateQRCode(total, paymentSettings.upiId);
        qrCodeContainer.innerHTML = `<img src="${qrCodeUrl}" alt="QR Code for Payment">`;
        
        // Show QR section
        qrSection.style.display = 'block';
        checkoutBtn.style.display = 'none';
        paymentStatus.textContent = 'Scan QR code and complete payment';
        paymentStatus.style.color = '#ffc107';
        
        // Hide transaction ID section initially (will show after payment)
        const transactionInputSection = document.getElementById('transaction-input-section');
        const transactionInput = document.getElementById('payment-transaction-id');
        const transactionError = document.getElementById('transaction-error');
        
        if (transactionInputSection) {
            transactionInputSection.style.display = 'none';
        }
        
        // Remove existing payment completed button if any
        const existingPaymentBtn = document.getElementById('payment-completed-btn');
        if (existingPaymentBtn) {
            existingPaymentBtn.remove();
        }
        
        // Show "Payment Completed" button
        const paymentCompletedBtn = document.createElement('button');
        paymentCompletedBtn.id = 'payment-completed-btn';
        paymentCompletedBtn.className = 'confirm-payment-btn';
        paymentCompletedBtn.textContent = 'I Have Completed Payment';
        paymentCompletedBtn.style.display = 'block';
        paymentCompletedBtn.style.marginTop = '15px';
        paymentCompletedBtn.style.background = 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)';
        
        // Insert before confirm payment button
        if (confirmPaymentBtn && confirmPaymentBtn.parentNode) {
            confirmPaymentBtn.parentNode.insertBefore(paymentCompletedBtn, confirmPaymentBtn);
        }
        
        // Handle payment completed button click
        paymentCompletedBtn.onclick = function() {
            // Show transaction ID section
            if (transactionInputSection) {
                transactionInputSection.style.display = 'block';
            }
            
            // Hide payment completed button
            this.style.display = 'none';
            
            // Update status message
            paymentStatus.textContent = 'Enter your UPI transaction ID from payment receipt';
            paymentStatus.style.color = '#28a745';
            
            // Focus on transaction ID input
            if (transactionInput) {
                transactionInput.focus();
            }
        };
        
        // Show confirm payment button (disabled until transaction ID is entered)
        confirmPaymentBtn.style.display = 'block';
        confirmPaymentBtn.disabled = true;
        
        // Listen for transaction ID input
        if (transactionInput) {
            // Create transaction ID handler function
            const handleTransactionInput = function() {
                const enteredTransactionId = this.value.trim();
                if (enteredTransactionId.length >= 8) {
                    // Valid transaction ID entered
                    this.classList.remove('error');
                    this.classList.add('success');
                    if (transactionError) transactionError.style.display = 'none';
                    confirmPaymentBtn.disabled = false;
                    confirmPaymentBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                } else if (enteredTransactionId.length > 0) {
                    // Transaction ID too short
                    this.classList.add('error');
                    this.classList.remove('success');
                    if (transactionError) {
                        transactionError.textContent = 'Transaction ID seems too short. Please check your payment receipt.';
                        transactionError.style.display = 'block';
                    }
                    confirmPaymentBtn.disabled = true;
                    confirmPaymentBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                } else {
                    // Empty
                    this.classList.remove('error', 'success');
                    if (transactionError) transactionError.style.display = 'none';
                    confirmPaymentBtn.disabled = true;
                    confirmPaymentBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                }
            };
            
            // Remove old listener and add new one
            transactionInput.removeEventListener('input', handleTransactionInput);
            transactionInput.addEventListener('input', handleTransactionInput);
        }
        
        // Set confirm payment button handler
        confirmPaymentBtn.onclick = function() {
            const currentInput = document.getElementById('payment-transaction-id');
            const enteredTransactionId = currentInput ? currentInput.value.trim() : '';
            
            if (!enteredTransactionId || enteredTransactionId.length < 8) {
                alert('Please enter your UPI transaction ID from your payment receipt.');
                if (currentInput) currentInput.focus();
                return;
            }
            
            // Payment verified with transaction ID, complete order
            completeOrder(total, customerName, tableNumber, enteredTransactionId);
        };
        
        // Scroll to QR code
        qrSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        // Pay after order - place order directly
        completeOrder(total, customerName, tableNumber, null);
    }
}

// Complete order
function completeOrder(total, customerName, tableNumber) {
    const orderDetails = cart.map(item => 
        `${item.name} x${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    
    const paymentSettings = loadPaymentSettings();
    const paymentMessage = paymentSettings.timing === 'before' 
        ? '\nPayment: Verified & Completed' 
        : '\nPayment: Pay at counter';
    
    alert(`Order placed successfully!\n\nCustomer Name: ${customerName}\nTable Number: ${tableNumber}\n\nOrder Details:\n${orderDetails}\n\nSubtotal: ₹${subtotal.toFixed(2)}\nTax: ₹${tax.toFixed(2)}\nTotal: ₹${total.toFixed(2)}${paymentMessage}\n\nThank you for your order!`);
    
    // Invalidate transaction ID after use (if pay before was used)
    if (paymentSettings.timing === 'before') {
        localStorage.removeItem('restaurantTransactionId');
        localStorage.removeItem('restaurantTransactionIdExpiry');
    }
    
    // Reset cart and UI
    cart = [];
    const customerNameInput = document.getElementById('customer-name');
    const tableNumberInput = document.getElementById('table-number');
    const transactionInput = document.getElementById('payment-transaction-id');
    const transactionInputSection = document.getElementById('transaction-input-section');
    
    if (customerNameInput) {
        customerNameInput.value = '';
    }
    if (tableNumberInput) {
        tableNumberInput.value = '';
    }
    if (transactionInput) {
        transactionInput.value = '';
        transactionInput.classList.remove('error', 'success');
    }
    if (transactionInputSection) {
        transactionInputSection.style.display = 'none';
    }
    
    renderCart();
    
    // Hide QR section
    const qrSection = document.getElementById('qr-payment-section');
    const checkoutBtn = document.getElementById('checkout-btn');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    const paymentStatus = document.getElementById('payment-status');
    const verificationError = document.getElementById('verification-error');
    const paymentCompletedBtn = document.getElementById('payment-completed-btn');
    
    if (qrSection) qrSection.style.display = 'none';
    if (checkoutBtn) checkoutBtn.style.display = 'block';
    if (confirmPaymentBtn) {
        confirmPaymentBtn.style.display = 'none';
        confirmPaymentBtn.disabled = false;
        confirmPaymentBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    if (paymentCompletedBtn) {
        paymentCompletedBtn.remove();
    }
    if (paymentStatus) paymentStatus.textContent = '';
    if (verificationError) verificationError.style.display = 'none';
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

