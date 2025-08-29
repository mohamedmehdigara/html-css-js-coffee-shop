document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const contactFormMessage = document.getElementById('form-message');
    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterMessage = document.getElementById('newsletter-message');
    const menuItemsContainer = document.getElementById('menu-items');
    const eventsContainer = document.getElementById('events-container');
    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const closeCartModal = document.getElementById('close-cart-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');
    const checkoutButton = document.getElementById('checkout-button');
    const checkoutMessage = document.getElementById('checkout-message');
    const loyaltyPointsElement = document.getElementById('loyalty-points');
    const loyaltyTierElement = document.getElementById('loyalty-tier');
    const pointsProgressElement = document.getElementById('points-progress');
    const pointsStatusElement = document.getElementById('points-status');
    const rewardsListElement = document.getElementById('rewards-list');
    const historyListElement = document.getElementById('history-list');
    const noHistoryMessage = document.getElementById('no-history-message');
    const redeemMessage = document.getElementById('redeem-message');

    // Loyalty Program data
    const TIERS = [
        { name: 'Bronze', threshold: 0, next: 100 },
        { name: 'Silver', threshold: 100, next: 500 },
        { name: 'Gold', threshold: 500, next: Infinity }
    ];

    const REWARDS = [
        { id: 1, name: 'Free Espresso Shot', cost: 20 },
        { id: 2, name: 'Free Drip Coffee', cost: 50 },
        { id: 3, name: 'Free Latte', cost: 100 },
        { id: 4, name: 'Free Pastry', cost: 120 }
    ];

    // Initialize loyalty points from local storage
    let loyaltyPoints = parseInt(localStorage.getItem('loyaltyPoints')) || 0;
    // Initialize redemption history from local storage
    let redemptionHistory = JSON.parse(localStorage.getItem('redemptionHistory')) || [];

    const menu = [
        { id: 1, name: 'Espresso', price: 3.00, description: 'A strong, concentrated coffee, the perfect pick-me-up.' },
        { id: 2, name: 'Latte', price: 4.50, description: 'Espresso with steamed milk and a thin layer of foam.' },
        { id: 3, name: 'Cappuccino', price: 4.50, description: 'Equal parts espresso, steamed milk, and milk foam.' },
        { id: 4, name: 'Americano', price: 3.50, description: 'Espresso shots diluted with hot water.' },
        { id: 5, name: 'Mocha', price: 5.00, description: 'A rich mix of chocolate, espresso, and steamed milk.' },
        { id: 6, name: 'Drip Coffee', price: 2.50, description: 'Our daily brew, with a rotating selection of beans.' }
    ];
    
    const events = [
        { id: 1, name: 'Live Acoustic Night', date: 'October 25, 2024', time: '7:00 PM', description: 'Enjoy soothing live music from local artist, Jane Doe.' },
        { id: 2, name: 'Coffee Tasting Workshop', date: 'November 8, 2024', time: '6:30 PM', description: 'Learn to distinguish flavors and aromas of different beans from around the world.' },
        { id: 3, name: 'Board Game Night', date: 'November 22, 2024', time: '6:00 PM', description: 'Bring your friends and your favorite board games for a fun-filled evening.' }
    ];

    let cart = {};

    // Loyalty Program Functions
    const updateLoyaltyUI = () => {
        loyaltyPointsElement.textContent = loyaltyPoints;
        
        let currentTier = TIERS[0];
        for (const tier of TIERS) {
            if (loyaltyPoints >= tier.threshold) {
                currentTier = tier;
            }
        }
        loyaltyTierElement.textContent = `${currentTier.name} Tier`;

        const nextTier = TIERS.find(t => t.threshold > loyaltyPoints);
        if (nextTier) {
            const progress = ((loyaltyPoints - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100;
            pointsProgressElement.style.width = `${Math.min(progress, 100)}%`;
            pointsStatusElement.textContent = `You need ${nextTier.threshold - loyaltyPoints} more points to reach the ${nextTier.name} Tier!`;
        } else {
            pointsProgressElement.style.width = `100%`;
            pointsStatusElement.textContent = `You are a top-tier ${currentTier.name} customer!`;
        }
        
        renderRewards();
        renderHistory();
    };

    const renderRewards = () => {
        rewardsListElement.innerHTML = '';
        REWARDS.forEach(reward => {
            const isRedeemable = loyaltyPoints >= reward.cost;
            const rewardItem = document.createElement('div');
            rewardItem.className = `flex items-center justify-between p-4 rounded-lg border ${isRedeemable ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`;
            rewardItem.innerHTML = `
                <div class="flex-1 text-left">
                    <h4 class="font-semibold">${reward.name}</h4>
                    <p class="text-sm text-gray-500">${reward.cost} points</p>
                </div>
                <button data-id="${reward.id}" class="redeem-btn bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed" ${!isRedeemable ? 'disabled' : ''}>
                    Redeem
                </button>
            `;
            rewardsListElement.appendChild(rewardItem);
        });
    };

    rewardsListElement.addEventListener('click', (event) => {
        const button = event.target.closest('.redeem-btn');
        if (button) {
            const rewardId = parseInt(button.dataset.id);
            const rewardToRedeem = REWARDS.find(r => r.id === rewardId);
            if (rewardToRedeem && loyaltyPoints >= rewardToRedeem.cost) {
                loyaltyPoints -= rewardToRedeem.cost;
                localStorage.setItem('loyaltyPoints', loyaltyPoints);
                
                const now = new Date();
                const historyItem = {
                    name: rewardToRedeem.name,
                    date: now.toLocaleString()
                };
                redemptionHistory.push(historyItem);
                localStorage.setItem('redemptionHistory', JSON.stringify(redemptionHistory));

                redeemMessage.textContent = `Congratulations! You have redeemed "${rewardToRedeem.name}".`;
                redeemMessage.className = 'mt-4 text-center text-green-600 font-bold block';
                updateLoyaltyUI();
                setTimeout(() => {
                    redeemMessage.classList.add('hidden');
                }, 3000);
            } else {
                redeemMessage.textContent = 'Not enough points to redeem this reward.';
                redeemMessage.className = 'mt-4 text-center text-red-600 font-bold block';
                setTimeout(() => {
                    redeemMessage.classList.add('hidden');
                }, 3000);
            }
        }
    });

    const renderHistory = () => {
        historyListElement.innerHTML = '';
        if (redemptionHistory.length === 0) {
            noHistoryMessage.classList.remove('hidden');
        } else {
            noHistoryMessage.classList.add('hidden');
            redemptionHistory.forEach(item => {
                const historyItem = document.createElement('li');
                historyItem.className = 'flex justify-between items-center p-4 bg-white rounded-lg shadow-sm';
                historyItem.innerHTML = `
                    <span class="font-semibold">${item.name}</span>
                    <span class="text-sm text-gray-500">${item.date}</span>
                `;
                historyListElement.appendChild(historyItem);
            });
        }
    };

    // Render menu items
    const renderMenu = () => {
        menuItemsContainer.innerHTML = '';
        menu.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300';
            menuItem.innerHTML = `
                <h3 class="text-xl font-bold text-gray-900 mb-2">${item.name}</h3>
                <p class="text-gray-600 mb-4">${item.description}</p>
                <div class="flex justify-between items-center">
                    <span class="font-bold text-gray-900">$${item.price.toFixed(2)}</span>
                    <button data-id="${item.id}" class="add-to-cart-btn bg-gray-900 text-white font-semibold py-2 px-4 rounded-full text-sm hover:bg-gray-700 transition-colors duration-300">
                        Add to Cart
                    </button>
                </div>
            `;
            menuItemsContainer.appendChild(menuItem);
        });
    };
    
    // Render events
    const renderEvents = () => {
        eventsContainer.innerHTML = '';
        events.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300';
            eventItem.innerHTML = `
                <h3 class="text-xl font-bold text-gray-900 mb-2">${event.name}</h3>
                <p class="text-gray-600 mb-2"><strong>Date:</strong> ${event.date}</p>
                <p class="text-gray-600 mb-4"><strong>Time:</strong> ${event.time}</p>
                <p class="text-gray-600">${event.description}</p>
            `;
            eventsContainer.appendChild(eventItem);
        });
    };

    // Render cart items
    const renderCart = () => {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let count = 0;

        for (const itemId in cart) {
            const item = cart[itemId];
            total += item.price * item.quantity;
            count += item.quantity;
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'flex justify-between items-center';
            cartItemElement.innerHTML = `
                <div class="flex-1">
                    <h4 class="font-semibold">${item.name}</h4>
                    <p class="text-sm text-gray-500">$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button data-id="${item.id}" data-action="decrease" class="cart-qty-btn bg-gray-200 text-gray-800 rounded-full w-6 h-6 flex items-center justify-center">-</button>
                    <span class="font-semibold">${item.quantity}</span>
                    <button data-id="${item.id}" data-action="increase" class="cart-qty-btn bg-gray-200 text-gray-800 rounded-full w-6 h-6 flex items-center justify-center">+</button>
                    <button data-id="${item.id}" data-action="remove" class="remove-from-cart-btn text-red-600 hover:text-red-800 transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        }

        cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
        cartCountElement.textContent = count;
        if (count > 0) {
            cartCountElement.classList.remove('hidden');
        } else {
            cartCountElement.classList.add('hidden');
        }
    };

    // Add item to cart
    menuItemsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('.add-to-cart-btn');
        if (button) {
            const itemId = parseInt(button.dataset.id);
            const itemToAdd = menu.find(item => item.id === itemId);
            if (itemToAdd) {
                if (cart[itemId]) {
                    cart[itemId].quantity++;
                } else {
                    cart[itemId] = { ...itemToAdd, quantity: 1 };
                }
                renderCart();
                cartModal.style.display = 'flex';
            }
        }
    });

    // Handle cart quantity changes and removal
    cartItemsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (button) {
            const itemId = parseInt(button.dataset.id);
            const action = button.dataset.action;

            if (action === 'increase') {
                cart[itemId].quantity++;
            } else if (action === 'decrease') {
                cart[itemId].quantity--;
                if (cart[itemId].quantity <= 0) {
                    delete cart[itemId];
                }
            } else if (action === 'remove') {
                delete cart[itemId];
            }
            renderCart();
        }
    });

    // Handle checkout
    checkoutButton.addEventListener('click', () => {
        if (Object.keys(cart).length > 0) {
            checkoutMessage.textContent = 'Order placed successfully! Thank you for your purchase.';
            checkoutMessage.classList.remove('hidden');
            
            // Calculate points based on total purchase amount
            let total = 0;
            for (const itemId in cart) {
                total += cart[itemId].price * cart[itemId].quantity;
            }
            const pointsEarned = Math.floor(total);
            loyaltyPoints += pointsEarned;
            localStorage.setItem('loyaltyPoints', loyaltyPoints);
            updateLoyaltyUI();

            cart = {};
            renderCart();
            setTimeout(() => {
                cartModal.style.display = 'none';
                checkoutMessage.classList.add('hidden');
            }, 3000);
        }
    });

    // Modal functionality
    cartButton.addEventListener('click', () => {
        cartModal.style.display = 'flex';
    });
    closeCartModal.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Contact and Newsletter forms
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        contactFormMessage.textContent = 'Thank you for your message! We will get back to you shortly.';
        contactFormMessage.className = 'mt-4 text-center text-green-600 font-bold block';
        contactForm.reset();
    });

    newsletterForm.addEventListener('submit', (event) => {
        event.preventDefault();
        newsletterMessage.textContent = 'You have successfully subscribed to our newsletter!';
        newsletterMessage.className = 'mt-4 text-green-400 font-bold block';
        newsletterForm.reset();
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Initial render
    renderMenu();
    renderEvents();
    renderCart();
    updateLoyaltyUI();
});
