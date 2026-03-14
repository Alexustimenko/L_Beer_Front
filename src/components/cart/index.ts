import "./style.css";
import { CartItem } from "../cart-ui/CartItem";
import { CartSummary } from "../cart-ui/CartSummary";

export interface CartProduct {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

export class CartPage {
    private products: CartProduct[] = [
        { id: 1, name: "Oktober Beer", price: 5, quantity: 2 },
        { id: 2, name: "German Sausage", price: 8, quantity: 1 }
    ];

    mount(root: HTMLElement): void {
        this.render(root);
    }

   private render(root: HTMLElement): void {
    root.innerHTML = `
    <div class="cart-page">
        <div class="cart-wrapper">
            <div class="cart-header">
                <h1>Your Cart</h1>
                <span class="cart-count">${this.products.length} items</span>
            </div>

            <div class="cart-body">
                <div id="cart-list" class="cart-list"></div>
                <div id="cart-summary" class="cart-summary-container"></div>
            </div>
        </div>
    </div>
    `;

    const list = root.querySelector<HTMLElement>("#cart-list");
    const summary = root.querySelector<HTMLElement>("#cart-summary");

    if (!list || !summary) return;

    list.innerHTML = "";

    this.products.forEach(product => {
        const item = new CartItem(product, (id, qty) => {
            this.updateQuantity(id, qty);
            this.render(root);
        });

        list.innerHTML += item.render();
    });

    this.products.forEach(product => {
        const item = new CartItem(product, () => {});
        item.bind(list);
    });

    const summaryComponent = new CartSummary(this.products);
    summary.innerHTML = summaryComponent.render();
}

    private updateQuantity(id: number, quantity: number): void {
        const product = this.products.find(p => p.id === id);
        if (product) {
            product.quantity = quantity;
        }
    }
}