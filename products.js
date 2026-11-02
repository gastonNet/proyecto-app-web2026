const traerProductsSupabse = async () => {
  const url = "https://xxxuxvwzjcaxuwxrjomq.supabase.co/rest/v1/products";
  const options = {
    method: "GET",
    headers: {
      "apikey": "sb_publishable_2TVOIBk4c8yyjaXJtBwmfQ_En_h4_lW",
      "Authorization": "Bearer sb_publishable_2TVOIBk4c8yyjaXJtBwmfQ_En_h4_lW",
      "Content-Type": "application/json",
      }
    }

    return fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`No se pudo cargar Products (${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        // Aquí puedes procesar los datos si es necesario
        return data;
      })
      .catch((error) => {
        console.error("Error al cargar la solicitud de Supabase:", error);
        throw error;
      })
};

document.addEventListener("DOMContentLoaded", async () => {
  const productList = document.getElementById("product-list");
  const filterForm = document.querySelector("#filters form");

  if (!productList) {
    return;
  }

  try {
    const products = await traerProductsSupabse();
    
    const resultsMessage = document.createElement("p");
    resultsMessage.setAttribute("role", "status");
    resultsMessage.setAttribute("aria-live", "polite");
    productList.after(resultsMessage);

    const renderProducts = (productsToRender) => {
      productList.replaceChildren();

      productsToRender.forEach((product) => {
        const item = document.createElement("li");
        const article = document.createElement("article");
        const titleId = `producto-${product.idName}-titulo`;
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

      resultsMessage.textContent = productsToRender.length === 0
        ? "No se encontraron productos con esos filtros."
        : `Se encontraron ${productsToRender.length} productos.`;
    };

    renderProducts(products);

    if (filterForm) {
      filterForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const category = filterForm.elements.namedItem("categoria").value;
        const minPriceValue = filterForm.elements.namedItem("precio-min").value;
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
});
