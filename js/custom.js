// ✅ Fully Updated custom.js with Enhanced Features and Working Sliders

// ===========================================
// CART FUNCTIONALITY
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
  const cartCountEls = document.querySelectorAll(".cart-count");

  // Update cart count display
  function updateCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      cartCountEls.forEach(el => {
        if (el) el.innerText = totalItems;
      });
    } catch (error) {
      console.error("Error updating cart count:", error);
    }
  }

  // Show cart notification toast
  function showCartToast(message) {
    const toastEl = document.getElementById("cartToast");
    const toastMsg = document.getElementById("toast-message");
    
    if (toastEl && toastMsg) {
      toastMsg.innerText = message;
      try {
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();
      } catch (error) {
        // Fallback if Bootstrap is not available
        alert(message);
      }
    }
  }

  // Initialize cart count on page load
  updateCartCount();

  // Add to Cart Functionality
  document.querySelectorAll(".addToCart").forEach(button => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      
      try {
        const card = this.closest(".pro-card");
        if (!card) {
          console.error("Product card not found");
          return;
        }

        const name = card.querySelector(".productName")?.innerText?.trim() || "Unnamed Product";
        const priceElement = card.querySelector(".realPrice");
        const price = priceElement?.innerText?.trim() || "₹0";
        const imageElement = card.querySelector(".proImg img");
        const image = imageElement?.src || "";

        const item = { 
          id: Date.now() + Math.random(), // Unique ID
          name, 
          price, 
          image, 
          quantity: 1 
        };

        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        
        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(cartItem => 
          cartItem.name === item.name && cartItem.price === item.price
        );

        if (existingItemIndex > -1) {
          cart[existingItemIndex].quantity += 1;
          showCartToast(`${name} quantity updated in cart!`);
        } else {
          cart.push(item);
          showCartToast(`${name} added to cart!`);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCountInstant();
        
        // Add visual feedback
        this.style.transform = "scale(0.95)";
        setTimeout(() => {
          this.style.transform = "scale(1)";
        }, 150);
        updateCartCountInstant(); // Ensure instant update after cart change

      } catch (error) {
        console.error("Error adding item to cart:", error);
        alert("Error adding item to cart. Please try again.");
      }
    });
  });

  // ===========================================
  // CART PAGE FUNCTIONALITY
  // ===========================================
  const cartItemsEl = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");
  let promoApplied = false;

  if (cartItemsEl && cartTotalEl) {
    
    // Update delivery progress bar
    function updateDeliveryProgress(total) {
      const progressBar = document.getElementById("deliveryProgress");
      const progressText = document.getElementById("progressText");
      
      if (progressBar && progressText) {
        const target = 499;
        const progress = Math.min((total / target) * 100, 100);
        
        if (progressBar) {
          progressBar.style.width = progress + "%";
          progressBar.setAttribute("aria-valuenow", Math.floor(progress));
        }
        
        if (total >= target) {
          progressText.textContent = "🎉 You are eligible for Free Delivery!";
          progressBar.classList.add("bg-success");
          progressBar.classList.remove("bg-warning");
        } else {
          const remaining = target - total;
          progressText.textContent = `Add ₹${remaining} more for Free Delivery!`;
          progressBar.classList.remove("bg-success");
          progressBar.classList.add("bg-warning");
        }
      }
    }

    // Render cart items
    function renderCart() {
      try {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        cartItemsEl.innerHTML = "";
        let total = 0;

        if (cart.length === 0) {
          cartItemsEl.innerHTML = `
            <div class="col-12 text-center py-5">
              <img src="./Images/empty-cart.png" alt="Empty Cart" style="width: 100px; opacity: 0.5;">
              <h4 class="mt-3 text-muted">Your cart is empty</h4>
              <p class="text-muted">Add some products to get started!</p>
            </div>`;
          cartTotalEl.innerText = "₹0";
          return;
        }

        cart.forEach((item, index) => {
          item.quantity = item.quantity || 1;
          const numericPrice = typeof item.price === 'string'
              ? parseInt(item.price.replace(/[^\d]/g, '')) || 0
              : item.price || 0;
          const itemTotal = numericPrice * item.quantity;
          total += itemTotal;

          const itemHTML = `
            <div class="col-12 d-flex align-items-center cartItem mb-3" data-index="${index}">
              <input type="checkbox" class="form-check-input no-focus me-3" id="item-${index}">
              <div class="card border-0 d-flex flex-row align-items-center w-100">
                <img src="${item.image}" class="card-img-top rounded" alt="${item.name}" 
                     style="width: 144px; height: 144px; object-fit: contain;">
                <div class="card-body d-flex justify-content-between align-items-center flex-wrap">
                  <div class="itemInfo">
                    <h6 class="card-title mb-1">${item.name}</h6>
                    <p class="card-text text-muted mb-0">Unit Price: ${item.price}</p>
                    </div>
                  <div class="d-flex align-items-center">
                    <div class="d-flex align-items-center qnt border rounded me-3">
                      <button class="btn quantity-minus no-focus border-0" data-index="${index}" 
                              ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                      <input type="number" class="form-control no-focus text-center border-0 quantity-input" 
                             value="${item.quantity}" min="1" max="99" style="width: 60px;" data-index="${index}">
                      <button class="btn quantity-plus no-focus border-0" data-index="${index}">+</button>
                    </div>
                    <button class="btn no-focus bin-btn border-0" onclick="removeItem(${index})" title="Remove item">
                      <img src="./Images/bin.svg">
                    </button>
                  </div>
                </div>
              </div>
            </div>`;
          cartItemsEl.insertAdjacentHTML("beforeend", itemHTML);
        });

        // Apply promo discount
        if (promoApplied) {
          const discountAmount = Math.min(total * 0.1, 100); // 10% discount, max ₹100
          total = Math.max(total - discountAmount, 0);
        }

        cartTotalEl.innerText = `₹${total.toLocaleString("en-IN")}`;
        updateDeliveryProgress(total);
        
      } catch (error) {
        console.error("Error rendering cart:", error);
        cartItemsEl.innerHTML = `
          <div class="col-12 text-center py-5">
            <p class="text-danger">Error loading cart. Please refresh the page.</p>
          </div>`;
      }
    }

    // Initial cart render
    renderCart();

    // Select All functionality
    const selectAllBtn = document.getElementById("selectAll");
    if (selectAllBtn) {
      selectAllBtn.addEventListener("change", function () {
        const checkboxes = document.querySelectorAll('#cartItems .form-check-input');
        checkboxes.forEach(cb => cb.checked = this.checked);
      });
    }

    // Remove Selected functionality
    const removeSelectedBtn = document.getElementById("removeSelected");
    if (removeSelectedBtn) {
      removeSelectedBtn.addEventListener("click", function () {
        try {
          const cart = JSON.parse(localStorage.getItem("cart")) || [];
          const checkboxes = document.querySelectorAll('#cartItems .form-check-input');
          const newCart = cart.filter((_, i) => !checkboxes[i]?.checked);
          
          localStorage.setItem("cart", JSON.stringify(newCart));
          updateCartCount();
          renderCart();
          
          const removedCount = cart.length - newCart.length;
          if (removedCount > 0) {
            showCartToast(`${removedCount} item(s) removed from cart!`);
          }
        } catch (error) {
          console.error("Error removing selected items:", error);
        }
      });
    }

    // Promo Code functionality
    const applyPromoBtn = document.getElementById("applyPromo");
    if (applyPromoBtn) {
      applyPromoBtn.addEventListener("click", function () {
        const promoCodeInput = document.getElementById("promoCode");
        const promoMessage = document.getElementById("promoMessage");
        
        if (!promoCodeInput) return;
        
        const promoCode = promoCodeInput.value.trim().toUpperCase();
        const validPromoCodes = ["SAVE10", "DISCOUNT10", "WELCOME10"];
        
        if (validPromoCodes.includes(promoCode)) {
          promoApplied = true;
          if (promoMessage) {
            if (promoMessage) {
              promoMessage.style.display = "block";
              promoMessage.textContent = "✅ Promo code applied! 10% discount activated.";
            }
            promoMessage.className = "alert alert-success mt-2";
          }
          localStorage.setItem("promoCode", promoCode);
          showCartToast("Promo code applied successfully!");
        } else {
          promoApplied = false;
          if (promoMessage) {
            if (promoMessage) {
              promoMessage.style.display = "block";
              promoMessage.textContent = "❌ Invalid promo code. Try SAVE10 for 10% off!";
            }
            promoMessage.className = "alert alert-danger mt-2";
          }
          localStorage.removeItem("promoCode");
        }
        renderCart();
      });
    }

    // Quantity Update functionality
    cartItemsEl.addEventListener("click", function (e) {
      const index = parseInt(e.target.dataset.index);
      if (isNaN(index)) return;

      try {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (!cart[index]) return;

        if (e.target.classList.contains("quantity-minus") && cart[index].quantity > 1) {
          cart[index].quantity--;
        } else if (e.target.classList.contains("quantity-plus") && cart[index].quantity < 99) {
          cart[index].quantity++;
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        renderCart();
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    });

    // Handle direct quantity input
    cartItemsEl.addEventListener("change", function (e) {
      if (e.target.classList.contains("quantity-input")) {
        const index = parseInt(e.target.dataset.index);
        if (isNaN(index)) return;

        try {
          const newQty = Math.max(1, Math.min(99, parseInt(e.target.value) || 1));
          const cart = JSON.parse(localStorage.getItem("cart")) || [];
          
          if (cart[index]) {
            cart[index].quantity = newQty;
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartCount();
            renderCart();
          }
        } catch (error) {
          console.error("Error updating quantity:", error);
        }
      }
    });
  }
});

function updateCartCountInstant() {
  try {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.querySelectorAll(".cart-count").forEach(el => {
      el.innerText = totalItems;
    });
  } catch (error) {
    console.error("Error updating cart count:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updateCartCountInstant();
});

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

// Remove Item Function
function removeItem(index) {
  try {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const removedItem = cart[index];
    
    if (removedItem) {
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      
      // Update cart count and refresh page
      const cartCountEls = document.querySelectorAll(".cart-count");
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      cartCountEls.forEach(el => {
        if (el) el.innerText = totalItems;
      });
      
      location.reload();
    }
  } catch (error) {
    console.error("Error removing item:", error);
    alert("Error removing item. Please refresh the page.");
  }
}

// ===========================================
// CHECKOUT PAGE FUNCTIONALITY (MODIFIED)
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
  const orderSummaryDiv = document.getElementById("orderSummary"); // Renamed to avoid conflict with the concept of order summary
  
  if (orderSummaryDiv) { // Only run if on checkout page
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const promoCode = localStorage.getItem("promoCode");
      let subtotal = 0;
      let discount = 0;

      // Clear existing content
      orderSummaryDiv.innerHTML = "";

      if (cart.length === 0) {
        orderSummaryDiv.innerHTML = `
          <div class="text-center py-4">
            <p class="text-muted">Your cart is empty</p>
            <a href="index.html" class="btn btn-primary">Continue Shopping</a>
          </div>`;
        // Disable place order button if cart is empty
        const placeOrderBtn = document.getElementById("placeOrderBtn");
        if (placeOrderBtn) placeOrderBtn.disabled = true;
        return;
      }

      // Render cart items
      cart.forEach(item => {
        const itemQuantity = item.quantity || 1;
        const unitPrice = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
        const itemTotal = unitPrice * itemQuantity;
        subtotal += itemTotal;

        orderSummaryDiv.innerHTML += `
          <div class="d-flex align-items-center mb-3 pb-3 border-bottom checkoutProductList">
            <img src="${item.image}" alt="${item.name}" 
                 style="width:144px;height:144px; object-fit:contain; padding: 10px; border-radius: 8px;" class="me-3">
            <div class="">
              <h6 class="mb-1">${item.name}</h6><br>
              <small>₹${itemTotal.toLocaleString("en-IN")}</small>
            </div>
          </div>`;
      });

      // Calculate discount
      if (promoCode === "SAVE10" || promoCode === "DISCOUNT10" || promoCode === "WELCOME10") {
        discount = Math.min(subtotal * 0.1, 100); // 10% discount, max ₹100
      }

      // Calculate shipping
      const shipping = subtotal >= 499 ? 0 : 100;
      const finalTotal = Math.max(subtotal - discount, 0) + shipping; // Renamed to finalTotal for clarity

      // Add order summary
      orderSummaryDiv.innerHTML += `
        <div class="mt-4 p-3 bg-light rounded totalCart">
          <div class="d-flex justify-content-between mb-2">
            <span>Subtotal (${cart.length} items):</span>
            <span>₹${subtotal.toLocaleString("en-IN")}</span>
          </div>
          ${discount > 0 ? `
            <div class="d-flex justify-content-between mb-2 text-success">
              <span>Discount (${promoCode}):</span>
              <span>-₹${discount.toLocaleString("en-IN")}</span>
            </div>` : ''}

          <div class="d-flex justify-content-between mb-2">
            <span>Shipping:</span>
            <span class="${shipping === 0 ? 'text-success' : ''}">${shipping === 0 ? 'FREE' : '₹' + shipping}</span>
          </div>
          <hr>
          <div class="d-flex justify-content-between h5 total">
            <span>Total:</span>
            <span>₹${finalTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>`;

      // Place order functionality (MODIFIED)
      const placeOrderBtn = document.getElementById("placeOrderBtn");
      if (placeOrderBtn) {
        placeOrderBtn.addEventListener("click", function () {
          try {
            const selectedPaymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
            if (!selectedPaymentMethodEl) {
              alert('Please select a payment method before placing your order.');
              return;
            }

            // Basic form validation for shipping/billing details (you might want to enhance this)
            const countrySelect = document.getElementById('countrySelect');
            const emailInput = document.querySelector('.newsletters input[type="text"]');
            const firstNameInput = document.querySelector('.name .f-name input');
            const lastNameInput = document.querySelector('.name .l-name input');
            const streetAddressInput = document.querySelector('.Address input[placeholder="Street Address"]');
            const townCityInput = document.querySelector('.town input');
            const postalCodeInput = document.querySelector('.postal input');

            if (!emailInput.value.trim() || !countrySelect.value || !firstNameInput.value.trim() || 
                !lastNameInput.value.trim() || !streetAddressInput.value.trim() ||
                !townCityInput.value.trim() || !postalCodeInput.value.trim()) {
                alert('Please fill in all required billing and contact details.');
                return;
            }
            if (!/^\d{6}$/.test(postalCodeInput.value.trim())) {
              alert('Please enter a valid 6-digit Postal Code.');
              return;
            }
            // Basic email validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
              alert('Please enter a valid email address.');
              return;
            }

            const paymentMethod = selectedPaymentMethodEl.value;

            // Generate a simple Order ID
            const orderId = '#TAILORA' + Date.now().toString().slice(-9) + Math.floor(Math.random() * 100); // Example: TAILORA + last 9 digits of timestamp + random 2 digits

            // Get current date
            const today = new Date();
            const orderDate = today.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }); // e.g., "July 10, 2025"

            // Estimate delivery date (e.g., 5-8 days from now)
            const deliveryStart = new Date(today);
            deliveryStart.setDate(today.getDate() + 5);
            const deliveryEnd = new Date(today);
            deliveryEnd.setDate(today.getDate() + 8);
            const estimatedDelivery = `${deliveryStart.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })} - ${deliveryEnd.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}`;


            // Store order details for confirmation page in sessionStorage
            const orderDetails = {
              orderId: orderId,
              paymentMethod: paymentMethod,
              orderDate: orderDate,
              estimatedDelivery: estimatedDelivery,
              items: cart, // Pass the actual cart items
              subtotal: subtotal,
              discount: discount,
              shipping: shipping,
              total: finalTotal
            };
            sessionStorage.setItem('lastOrderDetails', JSON.stringify(orderDetails));

            // Redirect to confirmation page
            window.location.href = "confirmation.html";

          } catch (error) {
            console.error("Error placing order:", error);
            alert("Error placing order. Please try again.");
          }
        });
      }
    } catch (error) {
      console.error("Error loading checkout:", error);
      orderSummaryDiv.innerHTML = `
        <div class="text-center py-4">
          <p class="text-danger">Error loading order summary. Please try again.</p>
        </div>`;
    }
  }
});
// ===========================================
// ORDER CONFIRMATION PAGE LOGIC
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
    const orderItemsContainer = document.getElementById('orderItemsContainer');
    const orderTotalAmount = document.getElementById('orderTotalAmount');

    // Only run this code on the confirmation page
    if (orderItemsContainer && orderTotalAmount) {
        const lastOrderDetailsString = localStorage.getItem('lastOrderDetails');

        if (lastOrderDetailsString) {
            try {
                const orderDetails = JSON.parse(lastOrderDetailsString);

                if (orderDetails && orderDetails.items && orderDetails.items.length > 0) {
                    orderItemsContainer.innerHTML = ''; // Clear any existing content

                    orderDetails.items.forEach(item => {
                        const itemHtml = `
                            <div class="list-group-item d-flex justify-content-between align-items-center mb-2">
                                <div class="d-flex align-items-center">
                                    <img src="${item.image || 'Images/placeholder.jpg'}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 15px; border-radius: 5px;">
                                    <div>
                                        <h6 class="mb-0">${item.name}</h6>
                                        <small class="text-muted">Quantity: ${item.quantity}</small>
                                    </div>
                                </div>
                                <span class="fw-bold">$${(parseInt(item.price.replace(/[^\d]/g, '')) * item.quantity).toFixed(2)}</span>
                            </div>
                        `;
                        orderItemsContainer.insertAdjacentHTML('beforeend', itemHtml);
                    });

                    // Display total amount
                    orderTotalAmount.textContent = `$${orderDetails.total.toFixed(2)}`; // Use orderDetails.total

                    // Optional: Clear the last order details from localStorage after displaying
                    // localStorage.removeItem('lastOrderDetails');

                } else {
                    orderItemsContainer.innerHTML = '<p class="text-center">No order items found.</p>';
                }
            } catch (error) {
                console.error("Error parsing order details from localStorage:", error);
                orderItemsContainer.innerHTML = '<p class="text-center text-danger">Error loading order details.</p>';
            }
        } else {
            orderItemsContainer.innerHTML = '<p class="text-center">No recent order found.</p>';
        }
    }
});

// ===========================================
// PAYMENT GATEWAY FUNCTIONALITY (Existing, keep for checkout.html)
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
  // Payment method selection
  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
  paymentRadios.forEach(radio => {
    radio.addEventListener('change', function () {
      // Hide all payment detail sections
      document.querySelectorAll('#cardDetails, #upiDetails, #netbankingDetails, #codDetails').forEach(section => {
        if (section) section.style.display = 'none';
      });

      // Show selected payment method details
      const selectedSection = document.getElementById(this.id + 'Details');
      if (selectedSection) {
        if (selectedSection) selectedSection.style.display = 'block';
      }
    });
  });
});// <-- Add this closing brace to properly end the previous event listener

// ===========================================
// ORDER CONFIRMATION PAGE FUNCTIONALITY (NEW SECTION)
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
  const orderIdEl = document.getElementById('orderId');
  const paymentMethodEl = document.getElementById('paymentMethod');
  const orderDateEl = document.getElementById('orderDate');
  const estimatedDeliveryEl = document.getElementById('estimatedDelivery');
  const invoiceDownloadBtn = document.getElementById('invoiceDownloadBtn');
  const confirmedOrderItemsEl = document.getElementById('confirmedOrderItems');
  const finalOrderTotalEl = document.getElementById('finalOrderTotal');

  // Check if we are on the order confirmation page by checking for specific elements
  if (orderIdEl && confirmedOrderItemsEl) {
    try {
      const orderDetails = JSON.parse(sessionStorage.getItem('lastOrderDetails'));

      if (orderDetails) {
        orderIdEl.innerText = orderDetails.orderId;
        paymentMethodEl.innerText = orderDetails.paymentMethod;
        orderDateEl.innerText = orderDetails.orderDate;
        estimatedDeliveryEl.innerText = orderDetails.estimatedDelivery;
        finalOrderTotalEl.innerText = `₹${orderDetails.total.toLocaleString("en-IN")}`;

        // Populate product list
        confirmedOrderItemsEl.innerHTML = ""; // Clear existing content
        orderDetails.items.forEach(item => {
          const itemQuantity = item.quantity || 1;
          const unitPrice = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
          const itemTotal = unitPrice * itemQuantity;

          confirmedOrderItemsEl.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center py-3">
                <div class="d-flex align-items-center">
                    <img src="${item.image}" alt="${item.name}" 
                         style="width: 80px; height: 80px; object-fit: contain; margin-right: 15px; border-radius: 5px; border: 1px solid #eee;">
                    <div>
                        <h6 class="my-0">${item.name}</h6>
                        <small class="text-muted">Unit Price: ${item.price}</small>
                    </div>
                </div>
                <span class="fw-bold">₹${itemTotal.toLocaleString("en-IN")} x ${itemQuantity}</span>
            </li>
          `;
        });

        // Invoice download button functionality (placeholder)
        if (invoiceDownloadBtn) {
          invoiceDownloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Invoice download initiated for Order ID: ' + orderDetails.orderId + '\n(This would typically trigger a PDF download from your server)');
          });
        }

        // Clear the cart and promo code after successfully displaying the order confirmation
        localStorage.removeItem("cart");
        localStorage.removeItem("promoCode");
        updateCartCount(); // Update cart count in navigation
        sessionStorage.removeItem('lastOrderDetails'); // Clear the session storage after use

        // Add class to body to trigger fade-in
        document.body.classList.add('loaded');

      } else {
        // If no order details found, redirect back to home or show an error
        console.warn("No order details found in sessionStorage. Redirecting to home or showing error.");
        orderIdEl.innerText = 'N/A';
        paymentMethodEl.innerText = 'N/A';
        orderDateEl.innerText = 'N/A';
        estimatedDeliveryEl.innerText = 'N/A';
        confirmedOrderItemsEl.innerHTML = '<li class="list-group-item text-center text-danger">No order details found. Please go back to the <a href="index.html">homepage</a> or <a href="cart.html">cart</a> to place an order.</li>';
        finalOrderTotalEl.innerText = '₹0.00';
        document.body.classList.add('loaded'); // Still show page even if empty
      }
    } catch (error) {
      console.error("Error loading order confirmation details:", error);
      orderIdEl.innerText = 'Error';
      paymentMethodEl.innerText = 'Error';
      orderDateEl.innerText = 'Error';
      estimatedDeliveryEl.innerText = 'Error';
      confirmedOrderItemsEl.innerHTML = '<li class="list-group-item text-center text-danger">Error loading order details. Please refresh the page.</li>';
      finalOrderTotalEl.innerText = '₹0.00';
      document.body.classList.add('loaded');
    }
  }
});



// ===========================================
// IMAGE GALLERY (GLightbox)
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
  try {
    if (typeof GLightbox !== 'undefined') {
      const lightbox = GLightbox({
        selector: '.glightbox',
        touchNavigation: true,
        loop: true,
        autoplayVideos: true
      });
      console.log("GLightbox initialized");
    }
  } catch (error) {
    console.error("Error initializing GLightbox:", error);
  }
});

// ===========================================
// FILE UPLOAD FUNCTIONALITY
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const preview = document.getElementById('preview');
  const dragText = document.getElementById('dragText');
  const browseBtn = document.getElementById('browseBtn');
  const actionButtons = document.getElementById('actionButtons');
  const placeholderImage = 'Images/image-placeholder.png';

  if (dropZone && fileInput && preview) {
    
    function handleFile(file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, GIF, or WebP).');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
        if (dragText) dragText.style.display = 'none';
        if (browseBtn) browseBtn.style.display = 'none';
        if (actionButtons) actionButtons.classList.remove('d-none');
        preview.classList.add('uploaded');
      };
      reader.readAsDataURL(file);
    }

    fileInput.addEventListener('change', function () {
      const file = this.files[0];
      if (file) handleFile(file);
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    });

    // Global functions for file actions
    window.changeImage = function() {
      fileInput.click();
    };

    window.removeImage = function() {
      preview.src = placeholderImage;
      if (dragText) dragText.style.display = 'block';
      if (browseBtn) browseBtn.style.display = 'inline-block';
      if (actionButtons) actionButtons.classList.add('d-none');
      fileInput.value = '';
      preview.classList.remove('uploaded');
    };
  }
});

// ===========================================
// COUNTRY DROPDOWN FUNCTIONALITY
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
  const dropdownItems = document.querySelectorAll('.dropdown-item[data-flag]');
  const dropdownButton = document.getElementById('countryDropdown');

  if (dropdownButton && dropdownItems.length > 0) {
    dropdownItems.forEach(item => {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        const flag = this.getAttribute('data-flag');
        const country = this.textContent.trim();
        
        if (flag) {
          dropdownButton.innerHTML = `<img src="${flag}" alt="${country}" style="width: 20px; height: 15px; margin-right: 5px;">${country}`;
        }
      });
    });
  }
});

// ===========================================
// ZIP CODE FUNCTIONALITY
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
  
  // Global function for zip code selection
  window.selectZip = function(zip) {
    const selectedZipEl = document.getElementById('selectedZip');
    if (selectedZipEl) {
      selectedZipEl.innerText = zip;
    }
    
    // Close modal if Bootstrap is available
    const zipModal = document.getElementById('zipModal');
    if (zipModal && typeof bootstrap !== 'undefined') {
      const modal = bootstrap.Modal.getInstance(zipModal);
      if (modal) modal.hide();
    }
  };

  // Global function for manual zip code update
  window.updateZip = function() {
    const manualZipInput = document.getElementById('manualZip');
    const selectedZipEl = document.getElementById('selectedZip');
    
    if (!manualZipInput || !selectedZipEl) return;
    
    const manualZip = manualZipInput.value.trim();
    
    if (/^\d{6}$/.test(manualZip)) {
      selectedZipEl.innerText = manualZip;
      
      // Close modal if Bootstrap is available
      const zipModal = document.getElementById('zipModal');
      if (zipModal && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(zipModal);
        if (modal) modal.hide();
      }
    } else {
      alert('Please enter a valid 6-digit ZIP code.');
    }
  };
});

// ===========================================
// SEARCH FUNCTIONALITY
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
  const searchToggle = document.getElementById('searchToggle');
  const mobileSearchBar = document.getElementById('mobileSearchBar');

  if (searchToggle && mobileSearchBar) {
    searchToggle.addEventListener('click', function (e) {
      e.preventDefault();
      // Toggle visibility
      if (mobileSearchBar.style.display === "none" || mobileSearchBar.style.display === "") {
        mobileSearchBar.style.display = "block";
        document.getElementById('searchInput').focus();
      } else {
        mobileSearchBar.style.display = "none";
      }
    });
  }
});

// ===========================================
// PERFORMANCE OPTIMIZATION
// ===========================================

// Lazy load images

// ===========================================
// SHOP PAGE FILTER FUNCTIONALITY (FIXED FOR MOBILE & DESKTOP)
// ===========================================
function getFilterValues() {
  // Use mobile filters if mobile panel is open, else desktop
  const mobilePanel = document.getElementById('mobileFilterPanel');
  const isMobileActive = mobilePanel && mobilePanel.classList.contains('show');
  if (isMobileActive) {
    return {
      petType: document.querySelector('input[name="petTypeRadioMobile"]:checked')?.value,
      category: document.querySelector('input[name="productCategoryRadioMobile"]:checked')?.value,
      brand: document.querySelector('input[name="brandRadioMobile"]:checked')?.value,
      age: document.querySelector('input[name="ageSuitabilityRadioMobile"]:checked')?.value,
      offers: document.querySelector('input[name="offersDiscountsRadioMobile"]:checked')?.value,
      inStock: document.getElementById('inStockCheckMobile')?.checked,
      price: parseInt(document.getElementById('priceRangeMobile')?.value, 10)
    };
  } else {
    return {
      petType: document.querySelector('input[name="petTypeRadio"]:checked')?.value,
      category: document.querySelector('input[name="productCategoryRadio"]:checked')?.value,
      brand: document.querySelector('input[name="brandRadio"]:checked')?.value,
      age: document.querySelector('input[name="ageSuitabilityRadio"]:checked')?.value,
      offers: document.querySelector('input[name="offersDiscountsRadio"]:checked')?.value,
      inStock: document.getElementById('inStockCheck')?.checked,
      price: parseInt(document.getElementById('priceRange')?.value, 10)
    };
  }
}

function filterProducts(products) {
  const filters = getFilterValues();
  return products.filter(p => {
    let match = true;
    if (filters.petType && filters.petType !== 'All' && p.petType !== filters.petType) match = false;
    if (filters.category && filters.category !== 'All' && p.category !== filters.category) match = false;
    if (filters.brand && filters.brand !== 'All' && p.brand !== filters.brand) match = false;
    if (filters.age && filters.age !== 'All' && p.ageSuitability !== filters.age) match = false;
    if (filters.offers && filters.offers !== 'All' && !p.offers.includes(filters.offers)) match = false;
    if (filters.inStock && !p.inStock) match = false;
    if (filters.price && p.price > filters.price) match = false;
    return match;
  });
}
function setupProductFilters() {
  // Listen for changes on both desktop and mobile filter inputs
  const filterInputs = document.querySelectorAll(
    'input[name="petTypeRadio"], input[name="productCategoryRadio"], input[name="brandRadio"], input[name="ageSuitabilityRadio"], input[name="offersDiscountsRadio"], #inStockCheck, #priceRange, input[name="petTypeRadioMobile"], input[name="productCategoryRadioMobile"], input[name="brandRadioMobile"], input[name="ageSuitabilityRadioMobile"], input[name="offersDiscountsRadioMobile"], #inStockCheckMobile, #priceRangeMobile'
  );
  filterInputs.forEach(input => {
    input.addEventListener('change', () => {
      syncFilters();
      const filtered = filterProducts(products);
      renderProducts(filtered);
    });
    // Also trigger filter on click for instant response
    input.addEventListener('click', () => {
      syncFilters();
      const filtered = filterProducts(products);
      renderProducts(filtered);
    });
  });
  // Reset button for both desktop and mobile
  document.querySelectorAll('.reset-btn').forEach(resetBtn => {
    resetBtn.addEventListener('click', function(e) {
      e.preventDefault();
      // Desktop
      if (document.querySelector('#petTypeAll')) document.querySelector('#petTypeAll').checked = true;
      if (document.querySelector('#categoryAll')) document.querySelector('#categoryAll').checked = true;
      if (document.querySelector('#brandAll')) document.querySelector('#brandAll').checked = true;
      if (document.querySelector('#ageAll')) document.querySelector('#ageAll').checked = true;
      if (document.querySelector('#offersAll')) document.querySelector('#offersAll').checked = true;
      if (document.getElementById('inStockCheck')) document.getElementById('inStockCheck').checked = false;
      if (document.getElementById('priceRange')) document.getElementById('priceRange').value = 10000;
      // Mobile
      if (document.querySelector('#petTypeAllMobile')) document.querySelector('#petTypeAllMobile').checked = true;
      if (document.querySelector('#categoryAllMobile')) document.querySelector('#categoryAllMobile').checked = true;
      if (document.querySelector('#brandAllMobile')) document.querySelector('#brandAllMobile').checked = true;
      if (document.querySelector('#ageAllMobile')) document.querySelector('#ageAllMobile').checked = true;
      if (document.querySelector('#offersAllMobile')) document.querySelector('#offersAllMobile').checked = true;
      if (document.getElementById('inStockCheckMobile')) document.getElementById('inStockCheckMobile').checked = false;
      if (document.getElementById('priceRangeMobile')) document.getElementById('priceRangeMobile').value = 10000;
      syncFilters();
      renderProducts(products);
    });
  });
}

function syncFilters() {
  const mobilePanel = document.getElementById('mobileFilterPanel');
  const isMobileActive = mobilePanel && mobilePanel.classList.contains('show');
  const filterGroups = [
    { desktop: 'petTypeRadio', mobile: 'petTypeRadioMobile' },
    { desktop: 'productCategoryRadio', mobile: 'productCategoryRadioMobile' },
    { desktop: 'brandRadio', mobile: 'brandRadioMobile' },
    { desktop: 'ageSuitabilityRadio', mobile: 'ageSuitabilityRadioMobile' },
    { desktop: 'offersDiscountsRadio', mobile: 'offersDiscountsRadioMobile' }
  ];

  if (isMobileActive) {
    // Sync from mobile to desktop
    filterGroups.forEach(group => {
      const mobileChecked = document.querySelector(`input[name="${group.mobile}"]:checked`);
      if (mobileChecked) {
        document.querySelectorAll(`input[name="${group.desktop}"]`).forEach(input => {
          input.checked = (input.value === mobileChecked.value);
        });
      }
    });
    // Sync inStock and price range
    const inStockMobile = document.getElementById('inStockCheckMobile');
    const inStockDesktop = document.getElementById('inStockCheck');
    if (inStockMobile && inStockDesktop) {
      inStockDesktop.checked = inStockMobile.checked;
    }
    const priceMobile = document.getElementById('priceRangeMobile');
    const priceDesktop = document.getElementById('priceRange');
    if (priceMobile && priceDesktop) {
      priceDesktop.value = priceMobile.value;
    }
  } else {
    // Sync from desktop to mobile
    filterGroups.forEach(group => {
      const desktopChecked = document.querySelector(`input[name="${group.desktop}"]:checked`);
      if (desktopChecked) {
        document.querySelectorAll(`input[name="${group.mobile}"]`).forEach(input => {
          input.checked = (input.value === desktopChecked.value);
        });
      }
    });
    // Sync inStock and price range
    const inStockDesktop = document.getElementById('inStockCheck');
    const inStockMobile = document.getElementById('inStockCheckMobile');
    if (inStockDesktop && inStockMobile) {
      inStockMobile.checked = inStockDesktop.checked;
    }
    const priceDesktop = document.getElementById('priceRange');
    const priceMobile = document.getElementById('priceRangeMobile');
    if (priceDesktop && priceMobile) {
      priceMobile.value = priceDesktop.value;
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  renderProducts(products);
  setupProductFilters();
});
// =============================
// PRODUCT DATA & RENDERING
// =============================
// (products array declaration kept only once, duplicate removed)

// PRODUCT DATA & RENDERING
// =============================
const products = [
  {
    id: 1,
    name: "WhiskerWood Hideaway – Premium Wooden Cat House",
    petType: "Cat",
    descrip: "A cozy, stylish wooden retreat that gives your cat the comfort and privacy they crave — perfect for lounging, napping, or hiding from humans.",
    category: "Accessories",
    brand: "ULTRA",
    price: 2500,
    mrp: 7099,
    ageSuitability: "Adult",
    inStock: true,
    offers: ["On Sale"],
    img: "Images/pro1.png",
    rating: 5,
    reviewCount: 20
  },
  {
    id: 2,
    name: "SmartBowl AutoFeeder – Automatic Pet Food Dispenser",
    petType: "Dog",
    descrip: "A cozy, stylish wooden retreat that gives your cat the comfort and privacy they crave — perfect for lounging, napping, or hiding from humans.",
    category: "Food",
    brand: "Rodion",
    price: 3900,
    mrp: 5099,
    ageSuitability: "Adult",
    inStock: true,
    offers: ["New Customer Offer"],
    img: "Images/pro2.png",
    rating: 5,
    reviewCount: 7
  },
  {
    id: 3,
    name: "Natural Balance-Broth Coated Kibble (pack of 2)",
    petType: "Cat",
    descrip: "A cozy, stylish wooden retreat that gives your cat the comfort and privacy they crave — perfect for lounging, napping, or hiding from humans.",
    category: "Food",
    brand: "Rodion",
    price: 999,
    mrp: 1099,
    ageSuitability: "All",
    inStock: true,
    offers: ["New Customer Offer"],
    img: "Images/pro3.png",
    rating: 5,
    reviewCount: 2
  },
  {
    id: 4,
    name: "Vita Seeds-Natural Blend with added vitamins",
    petType: "Bird",
    category: "Food",
    descrip: "A cozy, stylish wooden retreat that gives your cat the comfort and privacy they crave — perfect for lounging, napping, or hiding from humans.",
    brand: "NO FILDE",
    price: 300,
    mrp: 599,
    ageSuitability: "All",
    inStock: true,
    offers: ["New Customer Offer"],
    img: "Images/pro4.png",
    rating: 5,
    reviewCount: 100
  },
   {
    id: 5,
    name: "Dried Soldierworms 2.2 Oz Reptile Food",
    petType: "Bird",
    descrip: "A cozy, stylish wooden retreat that gives your cat the comfort and privacy they crave — perfect for lounging, napping, or hiding from humans.",
    category: "Food",
    brand: "Whekraft",
    price: 300,
    mrp: 599,
    ageSuitability: "All",
    inStock: true,
    offers: ["New Customer Offer"],
    img: "Images/pro5.png",
    rating: 5,
    reviewCount: 20
  },
  {
    id: 6,
    name: " Small Java Wood Multi Branch Perch For Birds",
    petType: "Bird",
    descrip: "A cozy, stylish wooden retreat that gives your cat the comfort and privacy they crave — perfect for lounging, napping, or hiding from humans.",
    category: "Accessories",
    brand: "Whekraft",
    price: 390,
    mrp: 509,
    ageSuitability: "All",
    inStock: true,
    offers: ["New Customer Offer"],
    img: "Images/pro-6.png",
    rating: 5,
    reviewCount: 11
  },
    {
    id: 7,
    name: "Fiesta Healthy Toppings Papaya Bits Bird Treat",
    petType: "Bird",
    descrip: "A delicious and nutritious treat made with real papaya bits for your feathered friend.",
    category: "Accessories",
    brand: "Rodion",
    price: 390,
    mrp: 509,
    ageSuitability: "All",
    inStock: true,
    offers: ["New Customer Offer"],
    img: "Images/pro-7.png",
    rating: 5,
    reviewCount: 11
  },
    {
    id: 8,
    name: "Higgins Vita Seed Natural Blend Parrot FoodSmall Java Wood Multi Branch Perch For Birds",
    petType: "Bird",
    descrip: "A cozy, stylish wooden retreat that gives your cat the comfort and privacy they crave — perfect for lounging, napping, or hiding from humans.",
    category: "Food",
    brand: "Ultra",
    price: 250,
    mrp: 499,
    ageSuitability: "All",
    inStock: true,
    offers: ["New Customer Offer"],
    img: "Images/pro-8.png",
    rating: 5,
    reviewCount: 11
  },
    {
    id: 9,
    name: "Exotic Environments Sunken Orb Floral Aquarium Ornament",
    petType: "Fish",
    descrip: "A cozy, stylish wooden retreat that gives your cat the comfort and privacy they crave — perfect for lounging, napping, or hiding from humans.",
    category: "Accessories",
    brand: "Whekraft",
    price: 390,
    mrp: 509,
    ageSuitability: "All",
    inStock: true,
    offers: ["New Customer Offer"],
    img: "Images/pro-9.png",
    rating: 5,
    reviewCount: 11
  },
  // ...add more products as needed
];

function renderProducts(productArray) {
  const container = document.getElementById("productCards");
  if (!container) return;
  container.innerHTML = "";
  if (productArray.length === 0) {
    container.innerHTML = '<div class="col-12 text-center py-5"><h4 class="text-muted">No products found.</h4></div>';
    return;
  }
  productArray.forEach(product => {
    container.innerHTML += `
      <div class="pro-card col">
        <div class="proImg">
          <img src="${product.img}" alt="${product.name}" class="img-fluid">
        </div>
        <div class="proDetails">
          <div class="reviewrating">
            <div class="star-rating">
              ${'<span>★</span>'.repeat(product.rating)}
            </div>
            <p class="reviewCount">(${product.reviewCount})</p>
          </div>
          <h3 class="productName">${product.name}</h3>
          <div class="price d-flex">
            <p class="mrp text-decoration-line-through">₹${product.mrp}</p>
            <p class="realPrice">₹${product.price}</p>
          </div>
        </div>
        <div class="action-btns position-absolute z-3 pro-hover-position">
          <ul class="action-flex d-flex flex-column">
                  <li class="btn addToWishlist z-3 border-0" title="Add to wishlist">
                  <img src="Images/favorite-like.svg" alt="Add to wishlist">
                </li>
                <li class="btn product-details z-3 border-0" data-product-id="${product.id}" data-bs-toggle="tooltip" data-bs-placement="left"
                  title="Click for details" data-bs-custom-class="custom-tooltip">
                  <img src="Images/pro-details.svg" alt="">
                </li>
                <li class="btn addToCart z-3 border-0" data-bs-toggle="tooltip" data-bs-placement="left"
                  data-bs-custom-class="custom-tooltip" title="Add to cart">
                  <img src="Images/shopping-bag.svg" alt="">
                </li>
                </ul>
        </div>
      </div>
    `;
  });
  // Re-attach Add to Cart event listeners after rendering
  document.querySelectorAll(".addToCart").forEach(button => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      try {
        const card = this.closest(".pro-card");
        if (!card) {
          console.error("Product card not found");
          return;
        }
        const name = card.querySelector(".productName")?.innerText?.trim() || "Unnamed Product";
        const priceElement = card.querySelector(".realPrice");
        const price = priceElement?.innerText?.trim() || "₹0";
        const imageElement = card.querySelector(".proImg img");
        const image = imageElement?.src || "";
        const item = {
          id: Date.now() + Math.random(),
          name,
          price,
          image,
          quantity: 1
        };
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItemIndex = cart.findIndex(cartItem =>
          cartItem.name === item.name && cartItem.price === item.price
        );
        if (existingItemIndex > -1) {
          cart[existingItemIndex].quantity += 1;
          if (typeof showCartToast === "function") showCartToast(`${name} quantity updated in cart!`);
        } else {
          cart.push(item);
          if (typeof showCartToast === "function") showCartToast(`${name} added to cart!`);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        if (typeof updateCartCount === "function") updateCartCount(); // Ensure cart count updates everywhere
        this.style.transform = "scale(0.95)";
        setTimeout(() => {
          this.style.transform = "scale(1)";
        }, 150);
        updateCartCountInstant(); // Ensure instant update after cart change
      } catch (error) {
        console.error("Error adding item to cart:", error);
        alert("Error adding item to cart. Please try again.");
      }
    });
  });
  // Attach wishlist event listeners after rendering
  attachWishlistListeners();
}


// ===========================================
// WISHLIST FUNCTIONALITY (NEW SECTION)
// ===========================================

// Function to show a toast message (re-using the existing showCartToast or creating a new one)
function showWishlistToast(message) {
    const toastEl = document.getElementById("cartToast"); // Re-using cartToast for simplicity
    const toastMsg = document.getElementById("toast-message");
    
    if (toastEl && toastMsg) {
      toastMsg.innerText = message;
      try {
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();
      } catch (error) {
        alert(message); // Fallback
      }
    }
}

// Use event delegation for wishlist functionality
function attachWishlistListeners() {
  document.body.addEventListener("click", function (e) {
    const button = e.target.closest(".addToWishlist");
    if (!button) return;
    e.preventDefault();
    try {
      const card = button.closest(".pro-card");
      if (!card) {
        console.error("Product card not found for wishlist");
        return;
      }
      const name = card.querySelector(".productName")?.innerText?.trim() || "Unnamed Product";
      const priceElement = card.querySelector(".realPrice");
      const price = priceElement?.innerText?.trim() || "₹0";
      const imageElement = card.querySelector(".proImg img");
      const image = imageElement?.src || "";
      const item = { 
        id: Date.now() + Math.random(), // Unique ID for wishlist item
        name, 
        price, 
        image
      };
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      // Check if item already exists in wishlist
      const existingItemIndex = wishlist.findIndex(wishlistItem => 
        wishlistItem.name === item.name && wishlistItem.price === item.price
      );
      if (existingItemIndex > -1) {
        showWishlistToast(`${name} is already in your wishlist!`);
      } else {
        wishlist.push(item);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        showWishlistToast(`${name} added to wishlist!`);
        updateWishlistCount();
        // Add visual feedback
        button.style.transform = "scale(0.95)";
        setTimeout(() => {
          button.style.transform = "scale(1)";
        }, 150);
      }
    } catch (error) {
      console.error("Error adding item to wishlist:", error);
      alert("Error adding item to wishlist. Please try again.");
    }
  });
}


// ===========================================
// PRODUCT DETAILS REDIRECT FUNCTIONALITY
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
  // Event delegation for product details button
  document.body.addEventListener("click", function (e) {
    const btn = e.target.closest(".btn.product-details");
    if (btn) {
      e.preventDefault();
      // Try to get product id from data attribute
      const productId = btn.getAttribute("data-product-id");
      let productDetails = null;
      if (productId) {
        // Find the product in the products array
        const prodIdNum = parseInt(productId, 10);
        if (Array.isArray(products)) {
          productDetails = products.find(p => p.id === prodIdNum);
        }
      }
      // Fallback: if not found, use DOM extraction (for static HTML)
      if (!productDetails) {
        const card = btn.closest(".pro-card");
        if (!card) return;
        const name = card.querySelector(".productName")?.innerText?.trim() || "Unnamed Product";
        const price = card.querySelector(".realPrice")?.innerText?.trim() || "₹0";
        const mrp = card.querySelector(".mrp")?.innerText?.trim() || "";
        const image = card.querySelector(".proImg img")?.src || "";
        productDetails = { name, price, mrp, image };
      }
      if (productDetails) {
        sessionStorage.setItem("selectedProduct", JSON.stringify(productDetails));
        window.location.href = "product-details.html";
      }
    }
  });
});

// Initial render
renderProducts(products);

// ===========================================
// MOBILE FILTER PANEL FUNCTIONALITY
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
  const mobileFilterBtn = document.getElementById("mobileFilterBtn");
  const mobileFilterPanel = document.getElementById("mobileFilterPanel");
  if (mobileFilterBtn && mobileFilterPanel) {
    mobileFilterBtn.addEventListener("click", function () {
      if (typeof bootstrap !== "undefined") {
        const offcanvas = new bootstrap.Offcanvas(mobileFilterPanel);
        offcanvas.show();
      } else {
        mobileFilterPanel.style.display = "block";
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Attach wishlist listeners for static cards on index.html
  if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/" || window.location.pathname === "\\") {
    attachWishlistListeners();
  }
});

// ===========================================
// WISHLIST PAGE RENDERING
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.endsWith("wishlist.html")) {
    const wishlistContainer = document.getElementById("wishlistContainer");
    const emptyMsg = document.getElementById("emptyWishlistMsg");
    function renderWishlist() {
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      wishlistContainer.innerHTML = "";
      if (wishlist.length === 0) {
        if (wishlistContainer) wishlistContainer.style.display = "none";
        if (emptyMsg) emptyMsg.style.display = "block";
        return;
      }
      if (wishlistContainer) wishlistContainer.style.display = "flex";
      if (emptyMsg) emptyMsg.style.display = "none";
      wishlist.forEach((item, idx) => {
        wishlistContainer.innerHTML += `
          <div class="col">
            <div class="card p-3 border-0 h-100  wishlist-card d-flex flex-lg-row flex-column justify-content-between align-items-center">
              <img src="${item.image}" class="card-img-top wishlist-img" alt="${item.name}" style="object-fit:contain;max-height:140px;max-width:140px">
              <div class="card-body d-flex justify-content-between align-items-center wishlist-details ">
                <h5 class="card-title wishlist-productName">${item.name}</h5>
                <p class="card-text wishlist-price">${item.price}</p>
                <p class="stock-product">${item.stock ? item.stock : "Instock"}</p>
                <div class="d-flex gap-2 mt-2">
                <button class="btn shopNow move-to-cart" data-idx="${idx}">Move to Cart</button>
                <button class="btn  remove-wishlist" data-idx="${idx}"><img src="./Images/bin.svg"></button>                  
                </div>
              </div>
            </div>
          </div>
        `;
      });
      // Attach remove/move listeners
      wishlistContainer.querySelectorAll(".remove-wishlist").forEach(btn => {
        btn.addEventListener("click", function () {
          const idx = parseInt(this.getAttribute("data-idx"));
          const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
          wishlist.splice(idx, 1);
          localStorage.setItem("wishlist", JSON.stringify(wishlist));
          updateWishlistCount();
          renderWishlist();
        });
      });
      wishlistContainer.querySelectorAll(".move-to-cart").forEach(btn => {
        btn.addEventListener("click", function () {
          const idx = parseInt(this.getAttribute("data-idx"));
          const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
          const item = wishlist[idx];
          if (item) {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const existingIdx = cart.findIndex(c => c.name === item.name && c.price === item.price);
            if (existingIdx > -1) {
              cart[existingIdx].quantity = (cart[existingIdx].quantity || 1) + 1;
            } else {
              cart.push({ ...item, quantity: 1 });
            }
            localStorage.setItem("cart", JSON.stringify(cart));
            wishlist.splice(idx, 1);
            localStorage.setItem("wishlist", JSON.stringify(wishlist));
            renderWishlist();
            updateWishlistCount();
            showCartToast(`${item.name} moved to cart!`);
            updateCartCountInstant();
          }
        });
      });
    }
    renderWishlist();
  }
});

// ===========================================
// AUTO-APPLY CATEGORY FILTER FROM QUERY STRING ON SHOP PAGE
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.endsWith("shop.html")) {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    if (category) {
      // Desktop filter
      const desktopRadio = document.querySelector(`input[name='productCategoryRadio'][value='${category}']`);
      if (desktopRadio) {
        desktopRadio.checked = true;
      }
      // Mobile filter
      const mobileRadio = document.querySelector(`input[name='productCategoryRadioMobile'][value='${category}']`);
      if (mobileRadio) {
        mobileRadio.checked = true;
      }
      syncFilters();
      const filtered = filterProducts(products);
      renderProducts(filtered);
    }
  }
});

// ===========================================
// AUTO-APPLY PET TYPE FILTER FROM QUERY STRING ON SHOP PAGE
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.endsWith("shop.html")) {
    const params = new URLSearchParams(window.location.search);
    const petType = params.get("petType");
    if (petType) {
      // Desktop filter
      const desktopRadio = document.querySelector(`input[name='petTypeRadio'][value='${petType}']`);
      if (desktopRadio) {
        desktopRadio.checked = true;
      }
      // Mobile filter
      const mobileRadio = document.querySelector(`input[name='petTypeRadioMobile'][value='${petType}']`);
      if (mobileRadio) {
        mobileRadio.checked = true;
      }
      // Ensure both filters are synced and products are rendered
      setTimeout(function() {
        syncFilters();
        const filtered = filterProducts(products);
        renderProducts(filtered);
      }, 0);
    }
  }
});

// ===========================================
// PRODUCT DETAILS PAGE FUNCTIONALITY
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.endsWith("product-details.html")) {
    // Get product details from sessionStorage
    const product = JSON.parse(sessionStorage.getItem("selectedProduct"));
    if (!product) return;

    // Set product name, price, mrp, descrip, rating, review count
    document.getElementById("productName").innerText = product.name || "";
    document.getElementById("productPrice").innerText = product.price || "";
    document.getElementById("productMrp").innerText = product.mrp || "";
    document.getElementById("productDescription").innerText = product.descrip || "";
    // Optionally, set rating/review count if available
    if (product.rating) {
      document.getElementById("productRating").innerHTML = '<span class="text-warning">' + '★'.repeat(product.rating) + '</span>';
    }
    if (product.reviewCount) {
      document.getElementById("productReviewCount").innerText = `(${product.reviewCount})`;
    }

    // Main image
    const sliderFor = document.querySelector(".slider-for");
    if (sliderFor && product.image) {
      sliderFor.innerHTML = `<img src="${product.image}" alt="${product.name}" class="img-fluid rounded">`;
    }
    // Thumbnails (if available)
    const sliderNav = document.querySelector(".slider-nav");
    if (sliderNav && product.image) {
      sliderNav.innerHTML = `<img src="${product.image}" alt="${product.name}" class="img-thumbnail me-2" style="width:80px;">`;
    }

    // Add to Cart
    document.getElementById("addToCartBtn").addEventListener("click", function () {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingIdx = cart.findIndex(c => c.name === product.name && c.price === product.price);
      if (existingIdx > -1) {
        cart[existingIdx].quantity = (cart[existingIdx].quantity || 1) + 1;
        showCartToast(`${product.name} quantity updated in cart!`);
      } else {
        cart.push({ ...product, quantity: 1 });
        showCartToast(`${product.name} added to cart!`);
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCountInstant();
    });

    // Add to Wishlist
    document.getElementById("addToWishlistBtn").addEventListener("click", function () {
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const existingIdx = wishlist.findIndex(w => w.name === product.name && w.price === product.price);
      if (existingIdx > -1) {
        showWishlistToast(`${product.name} is already in your wishlist!`);
      } else {
        wishlist.push(product);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        showWishlistToast(`${product.name} added to wishlist!`);
      }
    });
  }
});


const currentStatus = "Shipped";

  const steps = ["Order Placed", "Packed", "Shipped", "Out for Delivery", "Delivered"];
  const currentIndex = steps.indexOf(currentStatus);

  for (let i = 0; i <= currentIndex; i++) {
    const step = document.getElementById(`step-${i + 1}`);
    if (step) step.classList.add("active");
  }

  const progressBar = document.getElementById("tracking-progress");
  const progressPercent = (currentIndex) / (steps.length - 1) * 100;
  if (progressBar) progressBar.style.width = progressPercent + "%";

// --- Wishlist Count Update ---
function updateWishlistCount() {
  try {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const totalItems = wishlist.length;
    document.querySelectorAll(".wishlist-count").forEach(el => {
      el.innerText = totalItems;
    });
  } catch (error) {
    console.error("Error updating wishlist count:", error);
  }
}
document.addEventListener("DOMContentLoaded", function () {
  updateWishlistCount();
});



