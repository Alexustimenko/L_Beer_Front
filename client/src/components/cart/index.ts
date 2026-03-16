export class CartPage {
  async mount(root: HTMLElement) {
    const res = await fetch("http://localhost:5000/cart");
    const cart = await res.json();

    root.innerHTML = `
      <div class="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-3xl font-bold text-gray-800 tracking-tight">Your Cart</h1>
          <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
            ${cart.items.length} items
          </span>
        </div>
        
        <div id="items" class="space-y-4 mb-8"></div>

        <div class="border-t pt-6 flex justify-between items-center">
          <div class="text-gray-500">Subtotal will be calculated at checkout</div>
          <button id="checkout" class="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-95 shadow-md">
            Go to Checkout
          </button>
        </div>
      </div>
    `;

    const itemsContainer = root.querySelector("#items")!;

    cart.items.forEach((item: any) => {
      const el = document.createElement("div");
      el.className = "flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors";

      el.innerHTML = `
        <div class="flex flex-col">
          <span class="font-semibold text-gray-700 text-lg">${item.name}</span>
          <span class="text-sm text-gray-400 font-mono">ID: ${item.productId}</span>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="flex items-center border rounded-md bg-white">
            <input type="number" value="${item.quantity}" min="1" 
              class="w-16 px-2 py-1 text-center outline-none bg-transparent font-medium" />
          </div>
          <button class="remove text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors text-sm font-medium">
            Remove
          </button>
        </div>
      `;

      // Логика обновления
      const qty = el.querySelector("input")!;
      qty.addEventListener("change", async () => {
        await fetch("http://localhost:5000/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            quantity: Number(qty.value)
          })
        });
      });

      // Логика удаления
      el.querySelector(".remove")!.addEventListener("click", async () => {
        await fetch("http://localhost:5000/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: item.productId })
        });
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 300);
      });

      itemsContainer.appendChild(el);
    });

    root.querySelector("#checkout")!.addEventListener("click", () => {
      this.showCheckout(root, cart.items);
    });
  }

  showCheckout(root: HTMLElement, items: any[]) {
    root.innerHTML = `
      <div class="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <button id="back" class="mb-6 text-sm text-gray-500 hover:text-black flex items-center gap-1 transition-colors">
           ← Back to cart
        </button>
        
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Delivery Details</h2>

        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
            <input id="address" type="text" placeholder="Street, City, Zip" 
              class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all placeholder:text-gray-300"/>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select id="payment" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black outline-none appearance-none bg-white cursor-pointer">
              <option value="card">💳 Credit Card</option>
              <option value="cash">💵 Cash on Delivery</option>
            </select>
          </div>

          <div class="p-4 bg-blue-50 rounded-lg flex items-center gap-3 border border-blue-100">
            <input type="checkbox" id="captcha" class="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer"/>
            <label for="captcha" class="text-sm font-medium text-blue-800 cursor-pointer select-none">
              I verify that I'm a human
            </label>
          </div>

          <button id="order" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
            Place Order
          </button>
        </div>
      </div>
    `;

    // Кнопка назад
    root.querySelector("#back")!.addEventListener("click", () => this.mount(root));

    root.querySelector("#order")!.addEventListener("click", async () => {
      const address = (document.querySelector("#address") as HTMLInputElement).value;
      const payment = (document.querySelector("#payment") as HTMLSelectElement).value;
      const captcha = (document.querySelector("#captcha") as HTMLInputElement).checked;

      if (!address) {
        alert("Please enter address");
        return;
      }

      if (!captcha) {
        alert("Please confirm you are human");
        return;
      }

      const btn = (root.querySelector("#order") as HTMLButtonElement);
      btn.disabled = true;
      btn.innerText = "Processing...";

      try {
        await fetch("http://localhost:5000/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            address,
            paymentMethod: payment,
            captchaToken: "iamhuman"
          })
        });

        root.innerHTML = `
          <div class="text-center py-20 animate-bounce">
            <div class="text-6xl mb-4">🎉</div>
            <h2 class="text-3xl font-bold text-gray-800">Order Placed!</h2>
            <p class="text-gray-500 mt-2">Thank you for your purchase.</p>
          </div>
        `;
        setTimeout(() => location.reload(), 3000);
      } catch (e) {
        btn.disabled = false;
        btn.innerText = "Place Order";
        alert("Something went wrong");
      }
    });
  }
}