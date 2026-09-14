const CART_KEY = 'miecommerce-cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatPrice(price) {
  return `$${price.toLocaleString('es-AR')}`;
}

function updateCartCount(cart = getCart()) {
  const count = cart.reduce((total, product) => total + product.quantity, 0);
  document.querySelectorAll('.cart-count').forEach((element) => {
    element.textContent = count;
  });
}

function addToCart(button) {
  const cart = getCart();
  const product = cart.find((item) => item.id === button.dataset.productId);

  if (product) {
    product.quantity += 1;
  } else {
    cart.push({
      id: button.dataset.productId,
      name: button.dataset.productName,
      price: Number(button.dataset.productPrice),
      quantity: 1
    });
  }

  saveCart(cart);
  updateCartCount(cart);
  button.textContent = 'Agregado';
  window.setTimeout(() => {
    button.textContent = 'Agregar al carrito';
  }, 1200);
}

function renderCart() {
  const list = document.getElementById('cart-list');
  if (!list) return;

  const cart = getCart();
  if (cart.length === 0) {
    list.innerHTML = '<p class="empty-cart">Tu carrito está vacío. <a href="index.html">Explora nuestros productos</a>.</p>';
    document.getElementById('cart-subtotal').textContent = '$0';
    document.getElementById('cart-total').textContent = '$0';
    document.getElementById('checkout-button').disabled = true;
    return;
  }

  list.innerHTML = cart.map((product) => `
    <article class="cart-item">
      <div>
        <h3>${product.name}</h3>
        <p>${product.quantity} x ${formatPrice(product.price)}</p>
      </div>
      <strong>${formatPrice(product.price * product.quantity)}</strong>
      <button type="button" class="remove-product" data-remove-id="${product.id}">Quitar</button>
    </article>
  `).join('');

  const total = cart.reduce((sum, product) => sum + product.price * product.quantity, 0);
  document.getElementById('cart-subtotal').textContent = formatPrice(total);
  document.getElementById('cart-total').textContent = formatPrice(total);
  document.getElementById('checkout-button').disabled = false;
}

document.addEventListener('click', (event) => {
  const addButton = event.target.closest('.add-to-cart');
  const removeButton = event.target.closest('.remove-product');

  if (addButton) addToCart(addButton);
  if (removeButton) {
    const cart = getCart().filter((product) => product.id !== removeButton.dataset.removeId);
    saveCart(cart);
    updateCartCount(cart);
    renderCart();
  }
});

document.getElementById('payment-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const payment = new FormData(event.currentTarget).get('payment');
  const paymentNames = {
    tarjeta: 'tarjeta',
    transferencia: 'transferencia bancaria',
    efectivo: 'pago en efectivo'
  };
  document.getElementById('checkout-message').textContent = `Elegiste ${paymentNames[payment]}. El pedido está listo para continuar.`;
});

updateCartCount();
renderCart();