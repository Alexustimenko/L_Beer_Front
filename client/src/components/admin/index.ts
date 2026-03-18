import "./style.css";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  volume: string;
  category: string;
}

export function AdminPage() {
  const app = document.getElementById("app");
  if (!app) return;

  if (localStorage.getItem("role") !== "admin") {
    app.innerHTML = `<h2 style="padding:20px;">Доступ запрещён</h2>`;
    return;
  }

  app.innerHTML = `
    <div class="admin-page">
      <h2>Админка товаров пива</h2>

      <div class="admin-form">
        <input id="title" placeholder="Название">
        <input id="price" type="number" min="1" placeholder="Цена">
        <input id="image" placeholder="Ссылка на картинку">
        <input id="volume" placeholder="Объем">
        <input id="category" placeholder="Категория">
        <button id="saveBtn">Добавить</button>
      </div>

      <div id="products" class="products-grid"></div>
    </div>
  `;

  const title = document.getElementById("title") as HTMLInputElement;
  const price = document.getElementById("price") as HTMLInputElement;
  const image = document.getElementById("image") as HTMLInputElement;
  const volume = document.getElementById("volume") as HTMLInputElement;
  const category = document.getElementById("category") as HTMLInputElement;
  const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement;
  const productsBox = document.getElementById("products") as HTMLDivElement;

  let editId: string | null = null;

  async function loadProducts() {
    const res = await fetch("http://localhost:5000/products");
    const products: Product[] = await res.json();

    productsBox.innerHTML = products.map(p => `
      <div class="admin-card">
        <img src="${p.image}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p>Категория: ${p.category}</p>
        <p>Цена: ${p.price} BYN</p>
        <p>Объем: ${p.volume}</p>
        <div class="admin-actions">
          <button class="edit-btn" data-id="${p.id}">Редактировать</button>
          <button class="delete-btn" data-id="${p.id}">Удалить</button>
        </div>
      </div>
    `).join("");

    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLButtonElement).dataset.id!;
        const product = products.find(x => x.id === id);
        if (!product) return;

        editId = product.id;
        title.value = product.title;
        price.value = String(product.price);
        image.value = product.image;
        volume.value = product.volume;
        category.value = product.category;
        saveBtn.textContent = "Сохранить";
      });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = (btn as HTMLButtonElement).dataset.id!;
        await fetch("http://localhost:5000/products", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
        });
        loadProducts();
      });
    });
  }

  saveBtn.onclick = async () => {
    const product = {
      title: title.value.trim(),
      price: Number(price.value),
      image: image.value.trim(),
      volume: volume.value.trim(),
      category: category.value.trim()
    };

    if (!product.title || !product.price || !product.image || !product.volume || !product.category) {
      alert("Заполни все поля");
      return;
    }

    if (product.price <= 0) {
      alert("Цена должна быть больше 0");
      return;
    }

    const method = editId ? "PUT" : "POST";
    const body = editId ? { id: editId, ...product } : product;

    const res = await fetch("http://localhost:5000/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Ошибка");
      return;
    }

    editId = null;
    saveBtn.textContent = "Добавить";

    title.value = "";
    price.value = "";
    image.value = "";
    volume.value = "";
    category.value = "";

    loadProducts();
  };

  loadProducts();
}