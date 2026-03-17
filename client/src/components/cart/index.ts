import "./style.css";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export class CartPage {

  async mount(root: HTMLElement): Promise<void> {

    try {

      const res = await fetch("http://localhost:5000/cart");

      if (!res.ok) throw new Error("Backend error");

      const cart = await res.json();
      const items: CartItem[] = cart.items || [];

      const total = items.reduce((sum: number, i: CartItem) =>
        sum + i.price * i.quantity, 0
      );

      root.innerHTML = `
        <div class="cart-page">

          <div class="cart-container">

            <div class="cart-header">
              <h1>🛒 Your Cart</h1>
              <span>${items.length} items</span>
            </div>

            <div class="cart-list">
              ${
                items.length === 0
                  ? `<div class="empty">Your cart is empty</div>`
                  : items.map((item: CartItem) => `
                    <div class="cart-row" data-id="${item.productId}">
                      
                      <div class="cart-info">
                        <div class="name">${item.name}</div>
                        <div class="price">$${item.price}</div>
                      </div>

                      <div class="cart-controls">
                        <button class="minus">−</button>
                        <span class="qty">${item.quantity}</span>
                        <button class="plus">+</button>
                      </div>

                      <button class="remove">×</button>

                    </div>
                  `).join("")
              }
            </div>

            <div class="cart-bottom">
              <div class="total">Total: $${total}</div>
              <button id="checkoutBtn" ${items.length === 0 ? "disabled" : ""}>
                Checkout
              </button>
            </div>

          </div>

        </div>
      `;

      this.bind(root, items);

    } catch (e) {

      console.error(e);

      root.innerHTML = `
        <div style="color:red">
          Error loading cart
        </div>
      `;
    }
  }

  private bind(root: HTMLElement, items: CartItem[]): void {

    const rows = root.querySelectorAll(".cart-row");

    rows.forEach(row => {

      const id = row.getAttribute("data-id");

      const plus = row.querySelector(".plus") as HTMLButtonElement;
      const minus = row.querySelector(".minus") as HTMLButtonElement;
      const qtyEl = row.querySelector(".qty") as HTMLElement;
      const remove = row.querySelector(".remove") as HTMLButtonElement;

      let qty = Number(qtyEl.textContent);

      plus.onclick = async () => {
        qty++;
        qtyEl.textContent = String(qty);

        await fetch("http://localhost:5000/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: id, quantity: qty })
        });
      };

      minus.onclick = async () => {

        if (qty <= 1) return;

        qty--;
        qtyEl.textContent = String(qty);

        await fetch("http://localhost:5000/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: id, quantity: qty })
        });
      };

      remove.onclick = async () => {

        await fetch("http://localhost:5000/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: id })
        });

        row.remove();
      };

    });

    const checkoutBtn = root.querySelector("#checkoutBtn");

    checkoutBtn?.addEventListener("click", () => {
      this.showCheckoutModal(items);
    });
  }

  private showCheckoutModal(items: CartItem[]): void {

    const modal = document.createElement("div");
    modal.className = "modal";

    modal.innerHTML = `
      <div class="modal-box">

        <h2>Delivery</h2>

        <input id="address" placeholder="Enter your address"/>

        <select id="payment">
          <option value="">Select payment</option>
          <option value="card">Card</option>
          <option value="cash">Cash</option>
        </select>

        <label>
          <input type="checkbox" id="captcha"/>
          I am not a robot
        </label>

        <button id="orderBtn">Place order</button>

      </div>
    `;

    document.body.appendChild(modal);

    // закрытие по клику вне
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    const orderBtn = modal.querySelector("#orderBtn") as HTMLButtonElement;

    orderBtn.addEventListener("click", async () => {

      const address = (modal.querySelector("#address") as HTMLInputElement).value.trim();
      const payment = (modal.querySelector("#payment") as HTMLSelectElement).value;
      const captcha = (modal.querySelector("#captcha") as HTMLInputElement).checked;

      if (!address) {
        alert("Введите адрес доставки");
        return;
      }

      if (!payment) {
        alert("Выберите способ оплаты");
        return;
      }

      if (!captcha) {
        alert("Подтвердите, что вы не робот");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            items,
            address,
            paymentMethod: payment,
            captchaToken: "iamhuman"
          })
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          alert("Ошибка оформления заказа: " + (data.message || res.status));
          return;
        }

        modal.remove();
        alert(data.message || "Заказ успешно оформлен!");
        location.reload();
      } catch (_e) {
        alert("Ошибка сети. Проверьте, что бэкенд запущен на http://localhost:5000");
      }
    });
  }
}