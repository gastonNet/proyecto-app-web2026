/* La URL y la clave pública viven en supabase-config.js,
   que se carga antes que este archivo. */

const traerProductsSupabse = async (productId) => {
  const url = new URL(SUPABASE_PRODUCTS_URL);
  if (productId !== undefined) {
    url.searchParams.set("id", `eq.${productId}`);
    url.searchParams.set("select", "*");
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      apikey: SUPABASE_CONFIG.publishableKey,
      Authorization: `Bearer ${SUPABASE_CONFIG.publishableKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`No se pudo cargar Products (${response.status})`);
  }

  return response.json();
};

document.addEventListener("DOMContentLoaded", async () => {
  const productList = document.getElementById("product-list");
  const featuredList = document.getElementById("featured-product-list");
  const filterForm = document.querySelector("#filters form");

  if (productList) {
    try {
      const products = await traerProductsSupabse();
      if (featuredList) {
        products.slice(0, 3).forEach((product) => {
          const item = document.createElement("li");
          const article = document.createElement("article");
          const figure = document.createElement("figure");
          const image = document.createElement("img");
          const imageLink = document.createElement("a");
          const title = document.createElement("h3");
          const productUrl = `producto.html?id=${encodeURIComponent(product.id)}`;

          article.setAttribute("aria-label", product.name);

          image.src = product.image;
          image.alt = product.imageAlt || product.name;
          image.width = 600;
          image.height = 500;

          // Overlay con nombre + precio que aparece al hacer hover
          const overlay = document.createElement("span");
          const overlayName = document.createElement("span");
          const overlayPrice = document.createElement("span");
          overlay.className = "featured-card__overlay";
          overlayName.className = "featured-card__name";
          overlayName.textContent = product.name;
          overlayPrice.className = "featured-card__price";
          overlayPrice.textContent =
            `$${Number(product.price).toLocaleString("es-AR")}`;
          overlay.append(overlayName, overlayPrice);

          // La imagen y el overlay van dentro del enlace: todo es clicable
          imageLink.className = "featured-card";
          imageLink.href = productUrl;
          imageLink.setAttribute("aria-label", `Ver ${product.name}`);
          imageLink.append(image, overlay);
          figure.append(imageLink);

          // Título accesible (oculto visualmente, el nombre vive en el overlay)
          title.className = "sr-only";
          title.textContent = product.name;

          article.append(figure, title);
          item.append(article);
          featuredList.append(item);
        });
      }

      const resultsMessage = document.createElement("p");
      resultsMessage.setAttribute("role", "status");
      resultsMessage.setAttribute("aria-live", "polite");
      productList.after(resultsMessage);

      const renderProducts = (productsToRender) => {
        productList.replaceChildren();

        productsToRender.forEach((product) => {
          const item = document.createElement("li");
          const article = document.createElement("article");
          const titleId = `producto-${product.id}-titulo`;
          const figure = document.createElement("figure");
          const image = document.createElement("img");
          const imageLink = document.createElement("a");
          const title = document.createElement("h3");
          const titleLink = document.createElement("a");
          const description = document.createElement("p");
          const price = document.createElement("p");
          const priceLabel = document.createElement("strong");
          const details = document.createElement("p");
          const detailsLink = document.createElement("a");
          const addToCart = document.createElement("button");
          const productUrl = `producto.html?id=${encodeURIComponent(product.id)}`;

          article.id = `producto-${product.id}`;
          article.setAttribute("aria-labelledby", titleId);
          image.src = product.image;
          image.alt = product.imageAlt || product.name;
          image.width = 600;
          image.height = 500;
          imageLink.href = productUrl;
          imageLink.setAttribute("aria-label", `Ver ${product.name}`);
          imageLink.append(image);
          figure.append(imageLink);

          title.id = titleId;
          titleLink.href = productUrl;
          titleLink.textContent = product.name;
          title.append(titleLink);

          description.textContent = product.description || "";
          priceLabel.textContent =
            `Precio: $${Number(product.price).toLocaleString("es-AR")}`;
          price.append(priceLabel);

          detailsLink.href = productUrl;
          detailsLink.textContent = "Ver producto";
          details.append(detailsLink);

          addToCart.type = "button";
          addToCart.className = "add-to-cart";
          addToCart.dataset.productId = product.id;
          addToCart.dataset.productName = product.name;
          addToCart.dataset.productPrice = product.price;
          addToCart.textContent = "Agregar al carrito";

          article.append(figure, title, description, price, details, addToCart);
          item.append(article);
          productList.append(item);
        });

        resultsMessage.textContent = productsToRender.length === 0
          ? "No se encontraron productos con esos filtros."
          : `Se encontraron ${productsToRender.length} productos.`;
      };

      renderProducts(products);

      if (filterForm) {
        // Lee los tres filtros y pinta solo los productos que coinciden.
        const applyFilters = () => {
          const category = filterForm.elements.namedItem("categoria").value;
          const minPriceValue =
            filterForm.elements.namedItem("precio-min").value;
          const minPrice = minPriceValue === "" ? null : Number(minPriceValue);
          const onlyNew = filterForm.elements.namedItem("nuevo").checked;

          const filteredProducts = products.filter((product) => {
            const matchesCategory =
              category === "todas" || product.categoria === category;
            const matchesMinPrice =
              minPrice === null || product.price >= minPrice;
            const matchesNew = !onlyNew || product.nuevo;

            return matchesCategory && matchesMinPrice && matchesNew;
          });

          renderProducts(filteredProducts);
        };

        // "input" cubre el checkbox, el select y el teclado del precio.
        filterForm.addEventListener("input", applyFilters);
        // "change" como respaldo: dispara al salir del campo o con flechas.
        filterForm.addEventListener("change", applyFilters);

        // El Enter dentro del campo de precio no debe recargar la página.
        filterForm.addEventListener("submit", (event) => {
          event.preventDefault();
          applyFilters();
        });

        // Botón "Limpiar filtros": vuelve todo al estado inicial.
        const clearButton = document.getElementById("clear-filters-button");
        clearButton?.addEventListener("click", () => {
          filterForm.reset();
          applyFilters();
        });
      }
    } catch (error) {
      console.error("Error al cargar la lista de productos:", error);

      const errorMessage = document.createElement("p");
      errorMessage.setAttribute("role", "alert");
      errorMessage.textContent =
        "No se pudieron cargar los productos. Intenta nuevamente más tarde.";
      productList.after(errorMessage);
    }
  }

  const productDetails = document.getElementById("product-details");
  if (productDetails) {
    const statusMessage = document.getElementById("product-status");
    const productId = new URLSearchParams(window.location.search).get("id");

    if (!productId) {
      statusMessage.textContent = "No se indicó qué producto querés ver.";
      return;
    }

    try {
      const products = await traerProductsSupabse(productId);
      const product = products[0];

      if (!product) {
        statusMessage.textContent = "No se encontró el producto solicitado.";
        return;
      }

      productDetails.querySelector("#producto-imagen").src = product.image || "";
      productDetails.querySelector("#producto-imagen").alt =
        product.imageAlt || product.name;
      productDetails.querySelector("#producto-categoria").textContent =
        product.categoria || "Producto";
      productDetails.querySelector("#producto-titulo").textContent = product.name;
      productDetails.querySelector("#producto-precio").textContent =
        `Precio: $${Number(product.price).toLocaleString("es-AR")}`;
      productDetails.querySelector("#producto-descripcion").textContent =
        product.description || "Sin descripción disponible.";
      productDetails.querySelector("#producto-id").value = product.id;
      productDetails.querySelector("#producto-precio-valor").value =
        product.price;
      document.getElementById("producto-breadcrumb").textContent = product.name;
      document.title = `${product.name} - TechStore Online`;

      statusMessage.hidden = true;
      productDetails.hidden = false;
    } catch (error) {
      console.error("Error al cargar el producto:", error);
      statusMessage.textContent =
        "No se pudo cargar el producto. Intenta nuevamente más tarde.";
    }
  }
});
