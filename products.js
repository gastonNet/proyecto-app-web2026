document.addEventListener("DOMContentLoaded", async () => {
  const productList = document.getElementById("product-list");
/* Aqui si no encuentra la lista, termina la funcion. Asi evita intentar agregar productos
a un elemento inexistente */
  if (!productList) {
    return;
  }
/* fetch("products.json") pide los datos al servidor. await espera la respuesta antes de continuar.
 Si la respuesta indica un error, el código lanza una excepción con el estado HTTP. */
  try {
    const response = await fetch("products.json");

    if (!response.ok) {
      throw new Error(`No se pudo cargar products.json (${response.status})`);
    }
/* response.json() interpreta el contenido del archivo como JSON.
 El resultado, guardado en products, es una lista de objetos, uno por producto. */
    const products = await response.json();
/* Recorre la lista de productos y crea elementos HTML para cada uno */
/* Crea elementos para cada producto */
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
/* Completa los datos de imagen y accesibilidad
Asigna a la tarjeta un id basado en el identificador del producto y la asocia con su título mediante aria-labelledby.
También configura la imagen con su dirección, texto alternativo y dimensiones.
*/
      article.id = `producto-${product.id}`;
      article.setAttribute("aria-labelledby", titleId);
      image.src = product.image;
      image.alt = product.imageAlt;
      image.width = 600;
      image.height = 500;
      figure.append(image);
      /* Agrega nombre, descripción y precio
El título y los enlaces toman sus valores del producto. La descripción se escribe en el párrafo correspondiente.
 El precio se muestra con formato de Argentina mediante toLocaleString("es-AR"); por ejemplo, 59990 se presenta como $59.990. */

      title.id = titleId;
      titleLink.href = product.titleUrl;
      titleLink.textContent = product.name;
      title.append(titleLink);

      description.textContent = product.description;
      priceLabel.textContent = `Precio: $${product.price.toLocaleString("es-AR")}`;
      price.append(priceLabel);
/* Configura el botón para el carrito 
  El botón recibe su texto, la clase add-to-cart y datos del producto en dataset, como su ID, nombre y precio.
  Este código solo configura el botón; no implementa aquí la acción de agregar al carrito. */
  detailsLink.href = product.detailsUrl;
  detailsLink.textContent = "Ver producto";
  details.append(detailsLink);
  addToCart.type = "button";
  addToCart.className = "add-to-cart";
  addToCart.dataset.productId = product.id;
  addToCart.dataset.productName = product.name;
  addToCart.dataset.productPrice = product.price;
  addToCart.textContent = "Agregar al carrito";
  /* Arma la tarjeta y la inserta en la página 
  append agrega los elementos en orden: imagen, título, descripción, precio, enlace y botón.
   Luego inserta el artículo en el <li> y el <li> dentro de la lista de productos. */
  
      article.append(figure, title, description, price, details, addToCart);
      item.append(article);
      productList.append(item);
    });

    /* Muestra un mensaje si ocurre un error (líneas 63–71)
Si falla la carga o lectura del JSON, el catch registra el error en la consola y
 muestra en la página un mensaje accesible avisando que no se pudieron cargar los productos. */
  } catch (error) {
    console.error("Error al cargar la lista de productos:", error);

    const errorMessage = document.createElement("p");
    errorMessage.setAttribute("role", "alert");
    errorMessage.textContent = "No se pudieron cargar los productos. Intenta nuevamente más tarde.";
    productList.after(errorMessage);
  }
});
/* En resumen: cuando el DOM está listo, el script carga los datos de products.json,
 crea una tarjeta HTML por cada producto y la agrega a #product-list. */