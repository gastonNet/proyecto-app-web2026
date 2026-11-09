/* =====================================================
   CARRITO DE COMPRAS
   -----------------------------------------------------
   Se carga en index.html, producto.html y carrito.html.
   Hace cuatro cosas:
   1. Guarda los productos elegidos en localStorage.
   2. Actualiza el contador del carrito en el navbar.
   3. Escucha los botones "Agregar al carrito".
   4. Renderiza la página del carrito (cantidades, total y pago).
   ===================================================== */

const CART_STORAGE_KEY = "mi-ecommerce-cart";

/* -----------------------------------------------------
   Utilidades
   ----------------------------------------------------- */

const formatPrice = (amount) =>
  `$${Number(amount).toLocaleString("es-AR")}`;

// Lee el carrito y siempre devuelve un array válido.
const readCart = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));

    if (!Array.isArray(stored)) {
      return [];
    }

    return stored
      .filter((item) => item && item.id !== undefined && item.name)
      .map((item) => ({
        id: String(item.id),
        name: String(item.name),
        price: Number(item.price) || 0,
        quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
      }));
  } catch {
    // Si el valor guardado está corrupto, empezamos con el carrito vacío.
    return [];
  }
};

const writeCart = (cart) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

/* -----------------------------------------------------
   Operaciones sobre el carrito
   ----------------------------------------------------- */

const addProductToCart = ({ id, name, price, quantity = 1 }) => {
  const cart = readCart();
  const productId = String(id);
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: productId,
      name,
      price: Number(price) || 0,
      quantity,
    });
  }

  writeCart(cart);
};

const changeQuantity = (productId, delta) => {
  const cart = readCart();
  const item = cart.find((entry) => entry.id === String(productId));

  if (!item) {
    return;
  }

  item.quantity += delta;

  // Si la cantidad llega a cero, el producto se elimina.
  const updatedCart =
    item.quantity > 0
      ? cart
      : cart.filter((entry) => entry.id !== String(productId));

  writeCart(updatedCart);
};

const removeProduct = (productId) => {
  writeCart(readCart().filter((entry) => entry.id !== String(productId)));
};

const clearCart = () => writeCart([]);

const getCartCount = () =>
  readCart().reduce((total, item) => total + item.quantity, 0);

const getCartTotal = () =>
  readCart().reduce((total, item) => total + item.quantity * item.price, 0);

/* -----------------------------------------------------
   UI: contador del navbar
   ----------------------------------------------------- */

const updateCartBadge = () => {
  const count = getCartCount();

  document.querySelectorAll(".cart-count").forEach((badge) => {
    badge.textContent = String(count);
  });

  document.querySelectorAll(".cart-link").forEach((link) => {
    const label = count === 1 ? "1 producto" : `${count} productos`;
    link.setAttribute("aria-label", `Carrito, ${label}`);
  });
};

// Aviso breve en el botón que se usó para agregar el producto.
const showAddedFeedback = (button) => {
  const originalLabel = button.textContent;

  button.textContent = "Agregado ✓";
  button.disabled = true;

  window.setTimeout(() => {
    button.textContent = originalLabel;
    button.disabled = false;
  }, 1200);
};

/* -----------------------------------------------------
   UI: página del carrito
   ----------------------------------------------------- */

const buildCartItem = (item) => {
  const article = document.createElement("article");
  const info = document.createElement("div");
  const title = document.createElement("h3");
  const unitPrice = document.createElement("p");
  const controls = document.createElement("div");
  const decreaseButton = document.createElement("button");
  const quantityLabel = document.createElement("span");
  const increaseButton = document.createElement("button");
  const subtotal = document.createElement("strong");
  const removeButton = document.createElement("button");

  article.className = "cart-item";

  title.textContent = item.name;
  unitPrice.textContent = `${formatPrice(item.price)} c/u`;

  controls.className = "cart-item-controls";

  decreaseButton.type = "button";
  decreaseButton.dataset.cartAction = "decrease";
  decreaseButton.dataset.productId = item.id;
  decreaseButton.textContent = "−";
  decreaseButton.setAttribute(
    "aria-label",
    `Restar una unidad de ${item.name}`
  );

  quantityLabel.textContent = String(item.quantity);

  increaseButton.type = "button";
  increaseButton.dataset.cartAction = "increase";
  increaseButton.dataset.productId = item.id;
  increaseButton.textContent = "+";
  increaseButton.setAttribute(
    "aria-label",
    `Sumar una unidad de ${item.name}`
  );

  controls.append(decreaseButton, quantityLabel, increaseButton);
  info.append(title, unitPrice, controls);

  subtotal.textContent = formatPrice(item.price * item.quantity);

  removeButton.type = "button";
  removeButton.className = "remove-product";
  removeButton.dataset.cartAction = "remove";
  removeButton.dataset.productId = item.id;
  removeButton.textContent = "Eliminar";
  removeButton.setAttribute(
    "aria-label",
    `Eliminar ${item.name} del carrito`
  );

  article.append(info, subtotal, removeButton);
  return article;
};

const buildEmptyCart = () => {
  const paragraph = document.createElement("p");
  const link = document.createElement("a");

  paragraph.className = "empty-cart";
  link.href = "index.html";
  link.textContent = "Ver productos";

  paragraph.append("Tu carrito está vacío. ", link);
  return paragraph;
};

const renderCartPage = () => {
  const cartList = document.getElementById("cart-list");

  // En las demás páginas no existe este elemento.
  if (!cartList) {
    return;
  }

  const cart = readCart();

  cartList.replaceChildren();
  if (cart.length === 0) {
    cartList.append(buildEmptyCart());
  } else {
    cart.forEach((item) => cartList.append(buildCartItem(item)));
  }

  const formattedTotal = formatPrice(getCartTotal());
  document.getElementById("cart-subtotal").textContent = formattedTotal;
  document.getElementById("cart-total").textContent = formattedTotal;

  document.getElementById("checkout-button").disabled = cart.length === 0;
};

// Actualiza todo lo que depende del carrito en la página actual.
const refreshCartUI = () => {
  updateCartBadge();
  renderCartPage();
};

// Después de re-renderizar, devuelve el foco al botón que se usó.
const restoreCartFocus = (cartAction, productId) => {
  const button = document.querySelector(
    `[data-cart-action="${cartAction}"][data-product-id="${productId}"]`
  );

  if (button) {
    button.focus();
  }
};

/* -----------------------------------------------------
   Eventos
   ----------------------------------------------------- */

document.addEventListener("click", (event) => {
  // Botón "Agregar al carrito" del listado de productos.
  const addButton = event.target.closest(".add-to-cart");

  if (addButton) {
    addProductToCart({
      id: addButton.dataset.productId,
      name: addButton.dataset.productName,
      price: addButton.dataset.productPrice,
    });
    refreshCartUI();
    showAddedFeedback(addButton);
    return;
  }

  // Botones de cantidad y eliminar dentro de carrito.html.
  const cartButton = event.target.closest("[data-cart-action]");

  if (!cartButton) {
    return;
  }

  const { cartAction, productId } = cartButton.dataset;

  if (cartAction === "increase") {
    changeQuantity(productId, 1);
  }

  if (cartAction === "decrease") {
    changeQuantity(productId, -1);
  }

  if (cartAction === "remove") {
    removeProduct(productId);
  }

  refreshCartUI();
  restoreCartFocus(cartAction, productId);
});

document.addEventListener("DOMContentLoaded", () => {
  // Formulario de la ficha de producto (producto.html).
  const addForm = document.getElementById("add-to-cart-form");

  if (addForm) {
    const message = document.getElementById("add-to-cart-message");
    const quantityInput = document.getElementById("cantidad");
    const productIdInput = document.getElementById("producto-id");
    const productPriceInput = document.getElementById("producto-precio-valor");
    const productTitle = document.getElementById("producto-titulo");

    addForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const productId = productIdInput.value;
      const quantity = Math.max(1, parseInt(quantityInput.value, 10) || 1);

      // El producto todavía no terminó de cargar.
      if (!productId) {
        message.textContent = "Espera a que cargue el producto.";
        message.classList.add("is-error");
        return;
      }

      addProductToCart({
        id: productId,
        name: productTitle.textContent,
        price: Number(productPriceInput.value),
        quantity,
      });

      message.classList.remove("is-error");
      message.textContent = `Se agregó "${productTitle.textContent}" al carrito.`;
      refreshCartUI();
    });
  }

  // Formulario de pago de carrito.html.
  const paymentForm = document.getElementById("payment-form");

  if (paymentForm) {
    const checkoutMessage = document.getElementById("checkout-message");

    paymentForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const count = getCartCount();
      const total = getCartTotal();

      if (count === 0) {
        return;
      }

      // No hay pasarela de pago: solo simulamos la compra.
      clearCart();
      refreshCartUI();
      checkoutMessage.textContent =
        `Compra simulada: ${count} ${count === 1 ? "producto" : "productos"} ` +
        `por ${formatPrice(total)}. ¡Gracias por tu compra!`;
    });
  }

  refreshCartUI();
});
