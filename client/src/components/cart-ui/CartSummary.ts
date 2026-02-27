import type { CartProduct } from "../cart";

export class CartSummary {
    private items: CartProduct[];

    constructor(items: CartProduct[]) {
        this.items = items;
    }

    private calculateTotal(): number {
        return this.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
    }

   render(): string {
    return `
    <div class="cart-summary">
        <span>Total:</span>
        <span>${this.calculateTotal()} €</span>
    </div>
    <button>Checkout</button>
    `;
}
}