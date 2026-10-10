document.addEventListener("DOMContentLoaded", async () => {
  const productList = document.getElementById("product-list");

  if (!productList) {
    return;
  }

  try {
    const response = await fetch("products.json");

    if (!response.ok) {
      throw new Error(`No se pudo cargar products.json (${response.status})`);
    }

    const products = await response.json();

    products.forEach((product) => {
      const item = document.createElement("li");
      const article = document.createElement("article");
      const titleId = `producto-${product.id}-titulo`;
      const figure = document.createElement("figure");
      const image = document.createElement("img");
      const title = document.createElement("h3");
      const titleLink = document.createElement("a");
      const description = document.createElement("p");
      const price = document.createElement("p");
      const priceLabel = document.createElement("strong");
      const details = document.createElement("p");
      const detailsLink = document.createElement("a");
      const addToCart = document.createElement("button");

      article.id = `producto-${product.id}`;
      article.setAttribute("aria-labelledby", titleId);
      image.src = product.image;
      image.alt = product.imageAlt;
      image.width = 600;
      image.height = 500;
      figure.append(image);

      title.id = titleId;
      titleLink.href = product.titleUrl;
      titleLink.textContent = product.name;
      title.append(titleLink);

      description.textContent = product.description;
      priceLabel.textContent = `Precio: $${product.price.toLocaleString("es-AR")}`;
      price.append(priceLabel);

      detailsLink.href = product.detailsUrl;
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
  } catch (error) {
    console.error("Error al cargar la lista de productos:", error);

    const errorMessage = document.createElement("p");
    errorMessage.setAttribute("role", "alert");
    errorMessage.textContent = "No se pudieron cargar los productos. Intenta nuevamente más tarde.";
    productList.after(errorMessage);
  }
});
