import "./style.css";

const API = "http://localhost:5000";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  image?: string;
}

export class AdminPage {
  private root: HTMLElement | null = null;
  private editingId: number | null = null;

  async mount(root: HTMLElement): Promise<void> {
    this.root = root;
    const ok = await this.checkAuth();
    if (ok) {
      await this.renderProducts();
    } else {
      this.renderLogin();
    }
  }

  private async checkAuth(): Promise<boolean> {
    const res = await fetch(`${API}/admin/products`, { credentials: "include" });
    return res.ok;
  }

  private renderLogin(): void {
    if (!this.root) return;
    this.root.innerHTML = `
      <div class="admin-page">
        <div class="admin-login">
          <h1>🔐 Вход в админку</h1>
          <div id="adminLoginError" class="error" style="display:none;"></div>
          <input type="email" id="adminEmail" placeholder="Email" value="admin@gmail.com" />
          <input type="password" id="adminPassword" placeholder="Пароль" value="admin" />
          <button type="button" id="adminLoginBtn">Войти</button>
        </div>
      </div>
    `;
    const errEl = this.root.querySelector("#adminLoginError") as HTMLElement;
    const btn = this.root.querySelector("#adminLoginBtn") as HTMLButtonElement;
    const email = this.root.querySelector("#adminEmail") as HTMLInputElement;
    const password = this.root.querySelector("#adminPassword") as HTMLInputElement;

    btn.addEventListener("click", async () => {
      errEl.style.display = "none";
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.value.trim(), password: password.value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        errEl.textContent = data.message || "Ошибка входа";
        errEl.style.display = "block";
        return;
      }
      await this.renderProducts();
    });
  }

  private async renderProducts(): Promise<void> {
    if (!this.root) return;
    const res = await fetch(`${API}/admin/products`, { credentials: "include" });
    if (!res.ok) {
      this.renderLogin();
      return;
    }
    const products: Product[] = await res.json();

    this.root.innerHTML = `
      <div class="admin-page">
        <div class="admin-header">
          <h1>📦 Управление товарами</h1>
          <div>
            <a href="/">На главную</a>
            <button type="button" id="adminLogoutBtn">Выйти</button>
          </div>
        </div>

        <div class="admin-form-card" id="adminFormCard">
          <h2 id="adminFormTitle">Добавить товар</h2>
          <form id="adminProductForm">
            <input type="hidden" id="adminProductId" />
            <label>Название</label>
            <input type="text" id="adminName" required />
            <label>Описание</label>
            <input type="text" id="adminDescription" />
            <label>Цена</label>
            <input type="number" id="adminPrice" min="0" step="1" required />
            <label>Категория</label>
            <input type="text" id="adminCategory" placeholder="Cat 1" />
            <label>Фото товара</label>
            <input type="file" id="adminImage" accept="image/jpeg,image/png,image/webp" />
            <div id="adminImagePreview" class="admin-image-preview"></div>
            <div class="chk">
              <input type="checkbox" id="adminAvailable" checked />
              <label for="adminAvailable">В наличии</label>
            </div>
            <button type="submit">Сохранить</button>
            <button type="button" class="btn-cancel" id="adminFormCancel" style="display:none">Отмена</button>
          </form>
        </div>

        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Цена</th>
                <th>Категория</th>
                <th>В наличии</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="adminTableBody">
              ${products
                .map(
                  (p) => `
                <tr data-id="${p.id}" data-desc="${(p.description || "").replace(/"/g, "&quot;")}">
                  <td>${p.id}</td>
                  <td>${p.name}</td>
                  <td>${p.price} ₽</td>
                  <td>${p.category}</td>
                  <td>${p.available ? "Да" : "Нет"}</td>
                  <td>
                    <button type="button" class="btn-edit" data-id="${p.id}">Изменить</button>
                    <button type="button" class="btn-delete" data-id="${p.id}">Удалить</button>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const form = this.root.querySelector("#adminProductForm") as HTMLFormElement;
    const cancelBtn = this.root.querySelector("#adminFormCancel") as HTMLButtonElement;
    const formTitle = this.root.querySelector("#adminFormTitle") as HTMLElement;

    const readFileAsBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => reject(new Error("Не удалось прочитать файл"));
        r.readAsDataURL(file);
      });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const idEl = this.root!.querySelector("#adminProductId") as HTMLInputElement;
      const name = (this.root!.querySelector("#adminName") as HTMLInputElement).value.trim();
      const description = (this.root!.querySelector("#adminDescription") as HTMLInputElement).value.trim();
      const price = Number((this.root!.querySelector("#adminPrice") as HTMLInputElement).value);
      const category = (this.root!.querySelector("#adminCategory") as HTMLInputElement).value.trim() || "Cat 1";
      const available = (this.root!.querySelector("#adminAvailable") as HTMLInputElement).checked;
      const fileInput = this.root!.querySelector("#adminImage") as HTMLInputElement;
      let imageBase64: string | undefined;
      if (fileInput?.files?.length) {
        try {
          imageBase64 = await readFileAsBase64(fileInput.files[0]);
        } catch {
          alert("Ошибка чтения файла");
          return;
        }
      }

      const bodyWithImage = (base: Record<string, unknown>) =>
        imageBase64 ? { ...base, imageBase64 } : base;

      if (this.editingId !== null) {
        const res = await fetch(`${API}/admin/products`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(
            bodyWithImage({
              id: this.editingId,
              name,
              description,
              price,
              category,
              available,
            })
          ),
        });
        if (!res.ok) {
          alert("Ошибка обновления");
          return;
        }
        this.editingId = null;
        idEl.value = "";
        formTitle.textContent = "Добавить товар";
        if (cancelBtn) cancelBtn.style.display = "none";
      } else {
        const res = await fetch(`${API}/admin/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(
            bodyWithImage({ name, description, price, category, available })
          ),
        });
        if (!res.ok) {
          alert("Ошибка добавления");
          return;
        }
      }
      form.reset();
      (this.root!.querySelector("#adminImagePreview") as HTMLElement).innerHTML = "";
      await this.renderProducts();
    });

    cancelBtn?.addEventListener("click", () => {
      this.editingId = null;
      (this.root!.querySelector("#adminProductId") as HTMLInputElement).value = "";
      formTitle.textContent = "Добавить товар";
      cancelBtn.style.display = "none";
      form.reset();
      (this.root!.querySelector("#adminImagePreview") as HTMLElement).innerHTML = "";
    });

    this.root.querySelector("#adminImage")?.addEventListener("change", (e) => {
      const input = e.target as HTMLInputElement;
      const preview = this.root!.querySelector("#adminImagePreview") as HTMLElement;
      preview.innerHTML = "";
      if (input.files?.length) {
        const url = URL.createObjectURL(input.files[0]);
        preview.innerHTML = `<img src="${url}" alt="Preview" />`;
      }
    });

    this.root.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number((e.currentTarget as HTMLElement).dataset.id);
        const row = this.root!.querySelector(`tr[data-id="${id}"]`);
        if (!row) return;
        const cells = row.querySelectorAll("td");
        const name = cells[1].textContent ?? "";
        const price = cells[2].textContent?.replace(/\s*₽\s*/, "") ?? "0";
        const category = cells[3].textContent ?? "";
        const available = cells[4].textContent === "Да";
        const desc = (row as HTMLElement).dataset.desc ?? "";

        (this.root!.querySelector("#adminProductId") as HTMLInputElement).value = String(id);
        (this.root!.querySelector("#adminName") as HTMLInputElement).value = name;
        (this.root!.querySelector("#adminDescription") as HTMLInputElement).value = desc;
        (this.root!.querySelector("#adminPrice") as HTMLInputElement).value = price;
        (this.root!.querySelector("#adminCategory") as HTMLInputElement).value = category;
        (this.root!.querySelector("#adminAvailable") as HTMLInputElement).checked = available;
        this.editingId = id;
        formTitle.textContent = "Изменить товар";
        cancelBtn!.style.display = "inline-block";
      });
    });

    this.root.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (!confirm("Удалить товар?")) return;
        const res = await fetch(`${API}/admin/products?id=${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) {
          alert("Ошибка удаления");
          return;
        }
        await this.renderProducts();
      });
    });

    this.root.querySelector("#adminLogoutBtn")?.addEventListener("click", async () => {
      await fetch(`${API}/admin/logout`, { method: "POST", credentials: "include" });
      this.renderLogin();
    });
  }
}
