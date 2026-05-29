// Final Shopping Cart System for CampusVerse Marketplace
class CartSystem {
  constructor() {
    this.cart = [];
    this.cartCounter = 0;
    this.initializeCart();
  }

  initializeCart() {
    this.loadCart();
    this.updateCartCounter();
    this.setupEventListeners();
    this.setupCartPage();
  }

  setupEventListeners() {
    // Add to cart buttons - handle both data attributes and DOM extraction
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
        e.preventDefault();
        const button = e.target.classList.contains('add-to-cart-btn') ? e.target : e.target.closest('.add-to-cart-btn');

        // Try to get product data from button's data-product attribute first
        const productData = button.getAttribute('data-product');
        if (productData) {
          try {
            const product = JSON.parse(productData);
            this.addToCartFromData(product);
          } catch (error) {
            console.error('Error parsing product data:', error);
            this.showNotification('Error adding item to cart', 'error');
          }
        } else {
          // Fallback to extracting from DOM
          const productCard = button.closest('.product-card');
          if (productCard) {
            this.addToCart(productCard);
          }
        }
      }
    });

    // Clear cart button
    document.addEventListener('click', (e) => {
      if (e.target.id === 'clear-cart' || e.target.closest('#clear-cart')) {
        this.clearCart();
      }
    });

    // Checkout button
    document.addEventListener('click', (e) => {
      if (e.target.id === 'checkout-btn' || e.target.closest('#checkout-btn')) {
        this.showPaymentModal();
      }
    });

    // Payment form submission
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'payment-form') {
        e.preventDefault();
        this.handlePayment();
      }
    });

    // Close payment modal
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('close-modal') || e.target.closest('.close-modal')) {
        this.closePaymentModal();
      }
    });
  }

  addToCart(productCard) {
    const product = this.extractProductInfo(productCard);
    const existingItem = this.cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
      this.showNotification(`${product.name} quantity updated in cart!`, 'info');
    } else {
      product.quantity = 1;
      this.cart.push(product);
      this.showNotification(`${product.name} added to cart!`, 'success');
    }

    this.saveCart();
    this.updateCartCounter();
    this.updateNavbarCartCounter();
  }

  addToCartFromData(productData) {
    const existingItem = this.cart.find(item => item.id === productData.id);

    if (existingItem) {
      existingItem.quantity += 1;
      this.showNotification(`${productData.name} quantity updated in cart!`, 'info');
    } else {
      productData.quantity = 1;
      this.cart.push(productData);
      this.showNotification(`${productData.name} added to cart!`, 'success');
    }

    this.saveCart();
    this.updateCartCounter();
    this.updateNavbarCartCounter();
  }

  extractProductInfo(productCard) {
    const name = productCard.querySelector('h3')?.textContent || 'Unknown Product';
    const priceText = productCard.querySelector('.price')?.textContent || '$0.00';
    const price = parseFloat(priceText.replace('$', ''));
    const seller = productCard.querySelector('.seller')?.textContent.replace('Sold by: ', '') || 'Unknown Seller';
    const image = productCard.querySelector('.product-image i')?.className || 'fas fa-box';

    return {
      id: Date.now() + Math.random(),
      name,
      price,
      seller,
      image,
      timestamp: new Date().toISOString()
    };
  }

  removeFromCart(itemId) {
    const itemIndex = this.cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      const item = this.cart[itemIndex];
      this.cart.splice(itemIndex, 1);
      this.saveCart();
      this.updateCartCounter();
      this.updateNavbarCartCounter();
      this.showNotification(`${item.name} removed from cart!`, 'info');
      this.renderCartPage();
      return true;
    }
    return false;
  }

  updateQuantity(itemId, newQuantity) {
    if (newQuantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    const item = this.cart.find(item => item.id === itemId);
    if (item) {
      item.quantity = newQuantity;
      this.saveCart();
      this.updateCartCounter();
      this.updateNavbarCartCounter();
      this.showNotification(`Quantity updated for ${item.name}!`, 'info');
      this.renderCartPage();
    }
  }

  getCartTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getCartItemsCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  updateCartCounter() {
    this.cartCounter = this.getCartItemsCount();
    console.log('Cart counter updated:', this.cartCounter); // Debug log
  }

  updateNavbarCartCounter() {
    const counterElements = document.querySelectorAll('.cart-counter');
    console.log('Found cart counter elements:', counterElements.length); // Debug log

    counterElements.forEach(counter => {
      counter.textContent = this.cartCounter;
      counter.style.display = this.cartCounter > 0 ? 'inline-block' : 'none';

      // Add visual feedback
      if (this.cartCounter > 0) {
        counter.style.transform = 'scale(1.1)';
        setTimeout(() => {
          counter.style.transform = 'scale(1)';
        }, 200);
      }
    });

    // Also update any cart badges
    const cartBadges = document.querySelectorAll('.cart-badge, .cart-count');
    cartBadges.forEach(badge => {
      badge.textContent = this.cartCounter;
      badge.style.display = this.cartCounter > 0 ? 'block' : 'none';
    });
  }

  saveCart() {
    localStorage.setItem('campusverseCart', JSON.stringify(this.cart));
    console.log('Cart saved:', this.cart); // Debug log
  }

  loadCart() {
    const savedCart = localStorage.getItem('campusverseCart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      console.log('Cart loaded:', this.cart); // Debug log
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartCounter();
    this.updateNavbarCartCounter();
    this.showNotification('Cart cleared!', 'info');
    this.renderCartPage();
  }

  showNotification(message, type = 'info') {
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      // Fallback notification
      console.log(`Cart Notification (${type}): ${message}`);
      // Create a simple notification
      this.createNotification(message, type);
    }
  }

  createNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
      color: white;
      border-radius: 5px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  setupCartPage() {
    // Initialize cart page if we're on it
    if (document.getElementById('cart-items')) {
      this.renderCartPage();
    }
  }

  renderCartPage() {
    const cartContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartSummary = document.getElementById('cart-summary');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!cartContainer) return;

    if (this.cart.length === 0) {
      cartContainer.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart" style="font-size: 4rem; color: var(--text-secondary); margin-bottom: 20px;"></i>
          <h3>Your cart is empty</h3>
          <p>Add some items from the marketplace to get started!</p>
          <a href="marketplace-fixed.html" class="neon-btn">Continue Shopping</a>
        </div>
      `;
      if (cartTotal) cartTotal.textContent = '$0.00';
      if (cartSummary) cartSummary.style.display = 'none';
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    cartContainer.innerHTML = this.cart.map(item => `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="cart-item-image">
          <i class="${item.image}"></i>
        </div>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p class="cart-item-seller">Sold by: ${item.seller}</p>
          <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-controls">
            <button class="quantity-btn" onclick="window.cartSystem.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn" onclick="window.cartSystem.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
          </div>
          <p class="cart-item-subtotal">$${(item.price * item.quantity).toFixed(2)}</p>
        </div>
        <button class="remove-btn" onclick="window.cartSystem.removeFromCart('${item.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');

    const total = this.getCartTotal();
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
    if (cartSummary) cartSummary.style.display = 'block';
    if (checkoutBtn) checkoutBtn.disabled = false;
  }

  showPaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
      modal.classList.add('show');
      this.updateOrderReview();
    }
  }

  closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  updateOrderReview() {
    const orderItems = document.getElementById('order-items');
    const paymentTotal = document.getElementById('payment-total');

    if (orderItems && paymentTotal) {
      const summary = this.getCheckoutSummary();
      orderItems.innerHTML = summary.items.map(item =>
        `<p>${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</p>`
      ).join('');
      paymentTotal.textContent = `$${summary.total.toFixed(2)}`;
    }
  }

  async handlePayment() {
    const form = document.getElementById('payment-form');
    if (!form) return;

    const formData = new FormData(form);
    const paymentData = {
      cardNumber: formData.get('card-number') || document.getElementById('card-number')?.value,
      expiryDate: formData.get('expiry-date') || document.getElementById('expiry-date')?.value,
      cvv: formData.get('cvv') || document.getElementById('cvv')?.value,
      cardName: formData.get('card-name') || document.getElementById('card-name')?.value,
      email: formData.get('email') || document.getElementById('email')?.value
    };

    await this.processPayment(paymentData);
  }

  getCheckoutSummary() {
    const subtotal = this.getCartTotal();
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    return {
      items: this.cart,
      subtotal,
      tax,
      shipping,
      total
    };
  }

  async processPayment(paymentData) {
    this.showPaymentStatus('Processing payment...', 'info');

    try {
      // Step 1: Validate payment data
      await this.delay(500);
      this.showPaymentStatus('Validating payment information...', 'info');

      if (!this.validatePaymentData(paymentData)) {
        throw new Error('Invalid payment information provided');
      }

      // Step 2: Connect to payment gateway
      await this.delay(800);
      this.showPaymentStatus('Connecting to payment gateway...', 'info');

      // Step 3: Process payment
      await this.delay(1000);
      this.showPaymentStatus('Processing payment securely...', 'info');

      // Step 4: Simulate payment gateway response
      const paymentResult = await this.simulatePaymentGateway(paymentData);

      if (paymentResult.success) {
        this.showPaymentStatus('Payment successful! Generating order...', 'success');

        // Complete the order
        await this.delay(500);
        this.completeOrder(paymentData);

        return {
          success: true,
          orderId: paymentResult.orderId,
          transactionId: paymentResult.transactionId
        };
      } else {
        throw new Error(paymentResult.message || 'Payment processing failed');
      }
    } catch (error) {
      this.showPaymentStatus(`Payment failed: ${error.message}`, 'error');
      this.showNotification(`Payment failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  validatePaymentData(data) {
    const { cardNumber, expiryDate, cvv, cardName, email } = data;

    // Basic validation
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) return false;
    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) return false;
    if (!cvv || cvv.length < 3) return false;
    if (!cardName || cardName.length < 2) return false;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;

    return true;
  }

  async simulatePaymentGateway(data) {
    // Simulate realistic payment processing with different outcomes
    const random = Math.random();

    // Simulate different failure scenarios
    if (random < 0.05) {
      return { success: false, message: 'Network error - please try again' };
    } else if (random < 0.1) {
      return { success: false, message: 'Insufficient funds' };
    } else if (random < 0.15) {
      return { success: false, message: 'Card expired' };
    } else if (random < 0.2) {
      return { success: false, message: 'Invalid CVV' };
    } else {
      return {
        success: true,
        orderId: 'CV' + Date.now(),
        transactionId: 'txn_' + Math.random().toString(36).substr(2, 9)
      };
    }
  }

  completeOrder(paymentData) {
    const orderData = {
      orderId: 'CV' + Date.now(),
      items: [...this.cart],
      paymentInfo: { ...paymentData, cardNumber: '**** **** **** ' + paymentData.cardNumber.slice(-4) },
      total: this.getCheckoutSummary().total,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('campusverseOrders') || '[]');
    orders.push(orderData);
    localStorage.setItem('campusverseOrders', JSON.stringify(orders));

    // Clear cart
    this.clearCart();

    // Show success message
    this.showNotification('Order placed successfully!', 'success');

    // Show order confirmation
    setTimeout(() => {
      this.showOrderConfirmation(orderData);
    }, 1000);
  }

  showOrderConfirmation(orderData) {
    const confirmationHtml = `
      <div style="text-align: center; padding: 40px; background: var(--bg-primary); min-height: 100vh; display: flex; flex-direction: column; justify-content: center;">
        <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--accent-green); margin-bottom: 20px;"></i>
        <h2 style="color: var(--neon-cyan); margin-bottom: 20px;">Order Confirmed!</h2>
        <div style="background: var(--bg-secondary); padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Order ID:</strong> ${orderData.orderId}</p>
          <p style="margin: 10px 0;"><strong>Total:</strong> $${orderData.total.toFixed(2)}</p>
          <p style="margin: 10px 0;"><strong>Items:</strong> ${orderData.items.length}</p>
        </div>
        <p style="color: var(--text-secondary); margin-bottom: 30px;">Thank you for your purchase! A confirmation email has been sent.</p>
        <a href="marketplace-fixed.html" class="neon-btn" style="padding: 15px 30px; font-size: 1.1rem;">Continue Shopping</a>
      </div>
    `;

    document.body.innerHTML = confirmationHtml;
  }

  showPaymentStatus(message, type) {
    const statusElement = document.getElementById('payment-status');
    if (statusElement) {
      statusElement.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i> ${message}`;
      statusElement.className = `payment-status ${type}`;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize cart system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cartSystem = new CartSystem();
  console.log('✅ Cart system initialized successfully!');
  console.log('📊 Initial cart count:', window.cartSystem.cartCounter);
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);
