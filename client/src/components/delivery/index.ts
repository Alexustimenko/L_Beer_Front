import "./style.css";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export class DeliveryPage {
  async mount(root: HTMLElement): Promise<void> {
    const cartRes = await fetch("http://localhost:5000/cart", { credentials: "include" });
    if (cartRes.status === 401) {
      alert("Доставка доступна только для зарегистрированных пользователей");
      window.location.href = "/login";
      return;
    }
    if (!cartRes.ok) {
      root.innerHTML = `<div style="color:red">Error loading cart</div>`;
      return;
    }

    const cart = await cartRes.json();
    const items: CartItem[] = cart.items || [];

    const total = items.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0);

    root.innerHTML = `
      <div class="delivery-page">
        <div class="delivery-card">
          <h1>🚚 Доставка</h1>
          <p class="muted">Проверьте корзину и заполните данные доставки.</p>

          <div class="order-summary">
            <div class="row"><span>Товаров</span><b>${items.length}</b></div>
            <div class="row"><span>Сумма</span><b>${total} ₽</b></div>
          </div>

          <form data-delivery id="deliveryForm" class="delivery-form">
            <input id="address" placeholder="Адрес доставки" />
            <input id="email" type="email" placeholder="Email" />
            <input id="phone" type="tel" placeholder="Телефон" />

            <select id="payment">
              <option value="">Способ оплаты</option>
              <option value="card">Карта</option>
              <option value="cash">Наличные</option>
            </select>

            <label class="captcha">
              <input type="checkbox" id="captcha"/>
              Я не робот
            </label>

            <button id="orderBtn" ${items.length === 0 ? "disabled" : ""}>Оформить</button>
            <button type="button" id="backBtn" class="secondary">Назад в корзину</button>
          </form>
        </div>
      </div>
    `;

    const backBtn = root.querySelector("#backBtn") as HTMLButtonElement | null;
    backBtn?.addEventListener("click", () => {
      window.location.href = "/cart";
    });

    const orderBtn = root.querySelector("#orderBtn") as HTMLButtonElement | null;
    orderBtn?.addEventListener("click", async (e) => {
      e.preventDefault();

      const address = (root.querySelector("#address") as HTMLInputElement).value.trim();
      const email = (root.querySelector("#email") as HTMLInputElement).value.trim();
      const phone = (root.querySelector("#phone") as HTMLInputElement).value.trim();
      const payment = (root.querySelector("#payment") as HTMLSelectElement).value;
      const captcha = (root.querySelector("#captcha") as HTMLInputElement).checked;

      if (!address) return alert("Введите адрес доставки");
      if (!email) return alert("Введите email");
      if (!phone) return alert("Введите телефон");
      if (!payment) return alert("Выберите способ оплаты");
      if (!captcha) return alert("Подтвердите капчу");

      try {
        const res = await fetch("http://localhost:5000/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            items,
            address,
            email,
            phone,
            paymentMethod: payment,
            captchaToken: "iamhuman",
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert("Ошибка оформления: " + (data.message || res.status));
          return;
        }

        alert(data.message || "Заказ оформлен!");
        window.location.href = "/cart";
      } catch {
        alert("Ошибка сети. Проверьте, что бэкенд запущен на http://localhost:5000");
      }
    });
  }
}

