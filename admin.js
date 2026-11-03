const ADMIN_SUPABASE_URL =
  "https://xxxuxvwzjcaxuwxrjomq.supabase.co/rest/v1/products";
const ADMIN_SUPABASE_KEY = "sb_publishable_2TVOIBk4c8yyjaXJtBwmfQ_En_h4_lW";

const adminRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      apikey: ADMIN_SUPABASE_KEY,
      Authorization: `Bearer ${ADMIN_SUPABASE_KEY}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const responseText = await response.text();
    let message = responseText;
    let code;
    try {
      const error = JSON.parse(responseText);
      message = error.message || error.details || responseText;
      code = error.code;
    } catch {
      // Si la respuesta no es JSON, se muestra el texto devuelto por la API.
    }
    const requestError = new Error(`Supabase (${response.status}): ${message}`);
    requestError.code = code;
    throw requestError;
  }

  if (response.status === 204) {
    return null;
  }

  const responseText = await response.text();
  return responseText ? JSON.parse(responseText) : null;
};

const productSlug = (name) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "producto";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("product-form");
  const productList = document.getElementById("admin-product-list");
  const productCount = document.getElementById("product-count");
  const message = document.getElementById("admin-message");
  const modeMessage = document.getElementById("product-form-mode");
  const saveButton = document.getElementById("save-product-button");
  const newProductButton = document.getElementById("new-product-button");
  const cancelEditButton = document.getElementById("cancel-edit-button");
  const imageInput = document.getElementById("product-image");
  const imageAltInput = document.getElementById("product-image-alt");
  const imagePreview = document.getElementById("product-image-preview");
  const imagePreviewImage = document.getElementById("product-image-preview-img");
  const imagePreviewStatus = document.getElementById("product-image-preview-status");
  let products = [];

  const setFormVisible = (visible) => {
    form.hidden = !visible;
    newProductButton.setAttribute("aria-expanded", String(visible));
    newProductButton.textContent = visible ? "Cerrar formulario" : "Nuevo producto";
  };

  const updateImagePreview = () => {
    const imageUrl = imageInput.value.trim();
    imagePreviewImage.onload = null;
    imagePreviewImage.onerror = null;

    if (!imageUrl) {
      imagePreview.hidden = true;
      imagePreviewImage.hidden = true;
      imagePreviewImage.removeAttribute("src");
      imagePreviewStatus.textContent = "";
      return;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(imageUrl);
    } catch {
      imagePreview.hidden = false;
      imagePreviewImage.hidden = true;
      imagePreviewImage.removeAttribute("src");
      imagePreviewStatus.textContent = "Ingresa una URL de imagen válida.";
      return;
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      imagePreview.hidden = false;
      imagePreviewImage.hidden = true;
      imagePreviewImage.removeAttribute("src");
      imagePreviewStatus.textContent = "La URL debe comenzar con http:// o https://.";
      return;
    }

    imagePreview.hidden = false;
    imagePreviewImage.hidden = true;
    imagePreviewImage.alt = imageAltInput.value.trim();
    imagePreviewStatus.textContent = "Cargando vista previa...";
    imagePreviewImage.onload = () => {
      if (imageInput.value.trim() === imageUrl) {
        imagePreviewImage.hidden = false;
        imagePreviewStatus.textContent = "La imagen se cargó correctamente.";
      }
    };
    imagePreviewImage.onerror = () => {
      if (imageInput.value.trim() === imageUrl) {
        imagePreviewImage.hidden = true;
        imagePreviewStatus.textContent = "No se pudo cargar la imagen. Revisa la URL.";
      }
    };
    imagePreviewImage.src = parsedUrl.href;
  };

  const showMessage = (text, isError = false) => {
    message.textContent = text;
    message.setAttribute("role", isError ? "alert" : "status");
  };

  const createActionButton = (label, className, action, product) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.dataset.action = action;
    button.dataset.productId = product.id;
    button.textContent = label;
    button.setAttribute("aria-label", `${label}: ${product.name}`);
    return button;
  };

  const renderProducts = (products) => {
    productList.replaceChildren();

    products.forEach((product) => {
      const row = document.createElement("tr");
      const name = document.createElement("th");
      const category = document.createElement("td");
      const price = document.createElement("td");
      const status = document.createElement("td");
      const actions = document.createElement("td");
      const statusLabel = document.createElement("span");

      name.scope = "row";
      name.textContent = product.name;
      category.textContent = product.categoria;
      price.textContent =
        `$${Number(product.price).toLocaleString("es-AR")}`;
      statusLabel.className = "admin-status";
      statusLabel.textContent = product.nuevo ? "Nuevo" : "Publicado";
      status.append(statusLabel);
      actions.className = "admin-row-actions";
      actions.append(
        createActionButton("Editar", "admin-text-button", "edit", product),
        createActionButton(
          "Eliminar",
          "admin-text-button admin-delete-button",
          "delete",
          product
        )
      );
      row.append(name, category, price, status, actions);
      productList.append(row);
    });

    productCount.textContent = `${products.length} ${
      products.length === 1 ? "producto" : "productos"
    } en el catálogo`;
  };

  const loadProducts = async () => {
    productCount.textContent = "Cargando productos...";
    const url = new URL(ADMIN_SUPABASE_URL);
    url.searchParams.set(
      "select",
      "id,idName,name,description,price,categoria,nuevo,image,imageAlt"
    );
    url.searchParams.set("order", "id.asc");
    const products = await adminRequest(url);
    renderProducts(products);
    return products;
  };

  const resetForm = () => {
    form.reset();
    delete form.dataset.editingId;
    updateImagePreview();
    modeMessage.textContent = "Completa los datos para crear un producto.";
    saveButton.textContent = "Crear producto";
    cancelEditButton.hidden = true;
    setFormVisible(false);
    showMessage("");
  };

  const startEditing = (product) => {
    form.elements.name.value = product.name || "";
    form.elements.categoria.value = product.categoria || "electronica";
    form.elements.price.value = product.price ?? "";
    form.elements.image.value = product.image || "";
    form.elements.imageAlt.value = product.imageAlt || "";
    form.elements.description.value = product.description || "";
    form.elements.nuevo.checked = Boolean(product.nuevo);
    updateImagePreview();
    form.dataset.editingId = product.id;
    modeMessage.textContent = `Editando: ${product.name}`;
    saveButton.textContent = "Guardar cambios";
    cancelEditButton.hidden = false;
    setFormVisible(true);
    showMessage("");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    form.elements.name.focus();
  };

  productList.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const productId = button.dataset.productId;
    if (button.dataset.action === "edit") {
      const product = products.find((item) => String(item.id) === productId);
      if (product) {
        startEditing(product);
      }
      return;
    }

    const product = products.find((item) => String(item.id) === productId);
    if (
      !product ||
      !window.confirm(
        `¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    button.disabled = true;
    try {
      const url = new URL(ADMIN_SUPABASE_URL);
      url.searchParams.set("id", `eq.${productId}`);
      await adminRequest(url, { method: "DELETE" });
      if (form.dataset.editingId === productId) {
        resetForm();
      }
      showMessage(`Se eliminó "${product.name}".`);
      await refreshProducts();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      showMessage(error.message, true);
      button.disabled = false;
    }
  });

  const refreshProducts = async () => {
    try {
      products = await loadProducts();
    } catch (error) {
      console.error("Error al cargar productos:", error);
      productCount.textContent = "No se pudieron cargar los productos.";
      showMessage(error.message, true);
    }
  };

  imageInput.addEventListener("input", updateImagePreview);
  imageAltInput.addEventListener("input", () => {
    imagePreviewImage.alt = imageAltInput.value.trim();
  });

  newProductButton.addEventListener("click", () => {
    if (!form.hidden) {
      resetForm();
      return;
    }

    resetForm();
    setFormVisible(true);
    form.elements.name.focus();
  });
  cancelEditButton.addEventListener("click", resetForm);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) {
      return;
    }

    const name = form.elements.name.value.trim();
    const product = {
      idName: productSlug(name),
      name,
      categoria: form.elements.categoria.value,
      price: Number(form.elements.price.value),
      image: form.elements.image.value.trim(),
      imageAlt: form.elements.imageAlt.value.trim(),
      description: form.elements.description.value.trim(),
      nuevo: form.elements.nuevo.checked,
      titleUrl: "producto.html",
      detailsUrl: "producto.html",
    };
    const editingId = form.dataset.editingId;
    const requestUrl = new URL(ADMIN_SUPABASE_URL);
    const requestOptions = {
      method: editingId ? "PATCH" : "POST",
      body: JSON.stringify(product),
      headers: editingId ? { Prefer: "return=minimal" } : {},
    };

    if (editingId) {
      requestUrl.searchParams.set("id", `eq.${editingId}`);
    }

    saveButton.disabled = true;
    try {
      await adminRequest(requestUrl, requestOptions);
      resetForm();
      showMessage(editingId ? "Producto actualizado." : "Producto creado.");
      await refreshProducts();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      const isProductIdSequenceError =
        error.code === "23505" && error.message.includes("Products_pkey");
      showMessage(
        isProductIdSequenceError
          ? 'La secuencia automática del ID está desincronizada. Ejecuta el archivo supabase/fix-products-id-sequence.sql en Supabase → SQL Editor y vuelve a intentar. El producto no se creó.'
          : error.message,
        true
      );
    } finally {
      saveButton.disabled = false;
    }
  });

  refreshProducts();
});
