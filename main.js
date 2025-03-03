// main.js - Fonctions utilitaires et initialisation générale

// Exécuter au chargement du document
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser les composants Bootstrap
  initBootstrapComponents();
  
  // Mise à jour du compteur du panier
  updateCartCount();
  
  // Gestion de la navigation mobile
  setupMobileNav();
  
  // Initialisation du défilement fluide
  setupSmoothScroll();
  
  // Animations au scroll
  setupScrollAnimations();
  
  // Vérifier si nous sommes sur la page du panier
  if (document.getElementById('cart-items-container')) {
    initCartPage();
  }
});

// Initialiser les composants Bootstrap
function initBootstrapComponents() {
  // Activer tous les tooltips
  const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  if (tooltips.length) {
    [...tooltips].map(tooltip => new bootstrap.Tooltip(tooltip));
  }
  
  // Initialiser la date du jour dans les formulaires
  const dateInputs = document.querySelectorAll('input[type="date"].current-date');
  if (dateInputs.length) {
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
      input.value = today;
    });
  }
}

// Gestion de la navigation mobile
function setupMobileNav() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', 
        mobileToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    });
  }
  
  // Fermer le menu mobile lors du clic sur un lien
  const mobileLinks = document.querySelectorAll('.navbar-nav .nav-link');
  if (mobileLinks.length && navMenu) {
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 992) {
          navMenu.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }
}

// Initialisation du défilement fluide
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Animation des éléments au scroll
function setupScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  const animateOnScroll = () => {
    animatedElements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.2;
      
      if (elementPosition < screenPosition) {
        element.classList.add('animate-fade-in');
      }
    });
  };
  
  // Animer au chargement initial
  animateOnScroll();
  
  // Animer au scroll
  window.addEventListener('scroll', animateOnScroll);
}

// Initialiser la page du panier
function initCartPage() {
  // Configurer la date minimale pour le retrait (demain)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dateField = document.getElementById('pickupDate');
  if (dateField) {
    dateField.min = tomorrow.toISOString().split('T')[0];
    dateField.value = tomorrow.toISOString().split('T')[0];
  }
  
  // Charger les articles du panier
  loadCartItems();
  
  // Mettre à jour le résumé
  updateCartSummary();
  
  // Écouteur pour le bouton de validation
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      const date = document.getElementById('pickupDate').value;
      const time = document.getElementById('pickupTime').value;
      
      if (!date || !time) {
        alert('Veuillez sélectionner une date et une heure de retrait');
        return;
      }
      
      // Ouvrir le modal de validation
      document.getElementById('modalPickupDate').value = date;
      document.getElementById('modalPickupTime').value = time;
      
      const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
      checkoutModal.show();
    });
  }
  
  // Gérer la soumission du formulaire de validation
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Simuler une commande réussie
      const orderNumber = 'CMD-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      
      const pickupLocation = document.getElementById('pickupLocation').value;
      const pickupDate = document.getElementById('modalPickupDate').value;
      const pickupTime = document.getElementById('modalPickupTime').value;
      
      // Formatage de la date pour l'affichage
      const formattedDate = new Date(pickupDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      // Afficher les détails dans le modal de confirmation
      document.getElementById('order-number').textContent = orderNumber;
      
      const locationName = document.querySelector(`#pickupLocation option[value="${pickupLocation}"]`).textContent;
      document.getElementById('pickup-details').textContent = 
        `${locationName}, le ${formattedDate} entre ${pickupTime}`;
      
      // Fermer le modal de checkout
      bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
      
      // Ouvrir le modal de confirmation
      const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
      confirmationModal.show();
      
      // Vider le panier après la commande
      clearCart();
    });
  }
  
  // Gestion des méthodes de paiement
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  const cardPaymentForm = document.getElementById('card-payment-form');
  const mobilePaymentForm = document.getElementById('mobile-payment-form');
  
  if (paymentMethods.length && cardPaymentForm && mobilePaymentForm) {
    paymentMethods.forEach(method => {
      method.addEventListener('change', function() {
        if (this.value === 'card') {
          cardPaymentForm.classList.remove('d-none');
          mobilePaymentForm.classList.add('d-none');
        } else if (this.value === 'mobile') {
          cardPaymentForm.classList.add('d-none');
          mobilePaymentForm.classList.remove('d-none');
        } else {
          cardPaymentForm.classList.add('d-none');
          mobilePaymentForm.classList.add('d-none');
        }
      });
    });
  }
}

// Charger les éléments du panier
function loadCartItems() {
  const cartItemsContainer = document.getElementById('cart-items-container');
  const emptyCartMessage = document.getElementById('empty-cart');
  const cartItemsSection = document.getElementById('cart-items');
  
  if (!cartItemsContainer) return;
  
  const cart = getCart();
  
  // Afficher le message "panier vide" si nécessaire
  if (cart.length === 0) {
    emptyCartMessage.classList.remove('d-none');
    cartItemsSection.classList.add('d-none');
    
    // Désactiver le bouton de validation
    document.getElementById('checkout-btn').disabled = true;
    return;
  }
  
  // Sinon, afficher les produits
  emptyCartMessage.classList.add('d-none');
  cartItemsSection.classList.remove('d-none');
  
  // Activer le bouton de validation
  document.getElementById('checkout-btn').disabled = false;
  
  // Vider le conteneur avant de le remplir
  cartItemsContainer.innerHTML = '';
  
  // Ajouter chaque produit
  cart.forEach(item => {
    const tr = document.createElement('tr');
    
    // Calculer le total de la ligne
    const itemTotal = item.price * item.quantity;
    
    // Unité (si spécifiée)
    const unitText = item.unit ? `/${item.unit}` : '';
    
    tr.innerHTML = `
      <td>
        <div class="d-flex align-items-center">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img rounded me-3">
          <div>
            <h6 class="mb-0">${item.name}</h6>
          </div>
        </div>
      </td>
      <td>${formatPrice(item.price)}${unitText}</td>
      <td>
        <div class="input-group quantity-control">
          <button class="btn btn-sm btn-outline-secondary quantity-btn decrease-btn" type="button" data-id="${item.id}">-</button>
          <input type="number" class="form-control form-control-sm text-center quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
          <button class="btn btn-sm btn-outline-secondary quantity-btn increase-btn" type="button" data-id="${item.id}">+</button>
        </div>
      </td>
      <td class="fw-bold">${formatPrice(itemTotal)}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger remove-item" data-id="${item.id}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    
    cartItemsContainer.appendChild(tr);
  });
  
  // Ajouter les écouteurs d'événements pour les boutons de quantité
  setupCartEventListeners();
}

// Mettre à jour le résumé du panier
function updateCartSummary() {
  const subtotalEl = document.getElementById('subtotal');
  const serviceFeeEl = document.getElementById('service-fee');
  const totalEl = document.getElementById('total');
  
  if (!subtotalEl || !serviceFeeEl || !totalEl) return;
  
  const cart = getCart();
  
  // Calculer le sous-total
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculer les frais de service (exemple: 2% du sous-total)
  const serviceFee = subtotal * 0.02;
  
  // Calculer le total
  const total = subtotal + serviceFee;
  
  // Mettre à jour les affichages
  subtotalEl.textContent = formatPrice(subtotal);
  serviceFeeEl.textContent = formatPrice(serviceFee);
  totalEl.textContent = formatPrice(total);
}

// Mettre en place les écouteurs d'événements pour le panier
function setupCartEventListeners() {
  // Boutons pour diminuer la quantité
  document.querySelectorAll('.decrease-btn').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      const input = document.querySelector(`.quantity-input[data-id="${productId}"]`);
      let quantity = parseInt(input.value);
      
      if (quantity > 1) {
        quantity--;
        input.value = quantity;
        updateCartItemQuantity(productId, quantity);
      }
    });
  });
  
  // Boutons pour augmenter la quantité
  document.querySelectorAll('.increase-btn').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      const input = document.querySelector(`.quantity-input[data-id="${productId}"]`);
      let quantity = parseInt(input.value);
      
      quantity++;
      input.value = quantity;
      updateCartItemQuantity(productId, quantity);
    });
  });
  
  // Champs de saisie de quantité
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', function() {
      const productId = this.getAttribute('data-id');
      let quantity = parseInt(this.value);
      
      // S'assurer que la quantité est au moins 1
      if (quantity < 1) {
        quantity = 1;
        this.value = 1;
      }
      
      updateCartItemQuantity(productId, quantity);
    });
  });
  
  // Boutons de suppression
  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      removeCartItem(productId);
    });
  });
  
  // Bouton pour vider le panier
  const clearCartBtn = document.getElementById('clear-cart');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', function() {
      if (confirm('Êtes-vous sûr de vouloir vider votre drive ?')) {
        clearCart();
      }
    });
  }
}

// Récupérer le panier depuis le localStorage
function getCart() {
  const cart = localStorage.getItem('hage-drive-cart');
  return cart ? JSON.parse(cart) : [];
}

// Sauvegarder le panier dans le localStorage
function saveCart(cart) {
  localStorage.setItem('hage-drive-cart', JSON.stringify(cart));
  updateCartCount();
}

// Ajouter un produit au panier
function addToCart(productId, quantity = 1) {
  const cart = getCart();
  const product = getProductById(parseInt(productId));
  
  if (!product) return;
  
  // Vérifier si le produit est déjà dans le panier
  const existingItemIndex = cart.findIndex(item => item.id === parseInt(productId));
  
  if (existingItemIndex !== -1) {
    // Mettre à jour la quantité si le produit existe déjà
    cart[existingItemIndex].quantity += parseInt(quantity);
  } else {
    // Ajouter un nouveau produit au panier
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: parseInt(quantity),
      unit: product.unit || ''
    });
  }
  
  saveCart(cart);
}

// Mettre à jour la quantité d'un produit
function updateCartItemQuantity(productId, quantity) {
  const cart = getCart();
  const itemIndex = cart.findIndex(item => item.id === parseInt(productId));
  
  if (itemIndex !== -1) {
    cart[itemIndex].quantity = parseInt(quantity);
    saveCart(cart);
    updateCartSummary();
  }
}

// Supprimer un produit du panier
function removeCartItem(productId) {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.id !== parseInt(productId));
  saveCart(updatedCart);
  loadCartItems();
  updateCartSummary();
}

// Vider le panier
function clearCart() {
  localStorage.removeItem('hage-drive-cart');
  updateCartCount();
  loadCartItems();
  updateCartSummary();
}

// Mettre à jour le compteur du panier
function updateCartCount() {
  const cart = getCart();
  const cartCountElements = document.querySelectorAll('.cart-count');
  
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  cartCountElements.forEach(element => {
    element.textContent = itemCount;
    
    // Cacher le badge si le panier est vide
    if (itemCount === 0) {
      element.classList.add('d-none');
    } else {
      element.classList.remove('d-none');
    }
  });
}

// Fonction utilitaire pour formater les prix
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
}