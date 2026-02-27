import type { CartProduct } from "../cart";
import { QuantityControl } from "./QuantityControl";

export class CartItem {
    private product: CartProduct;
    private onUpdate: (id: number, quantity: number) => void;

    constructor(
        product: CartProduct,
        onUpdate: (id: number, quantity: number) => void
    ) {
        this.product = product;
        this.onUpdate = onUpdate;
    }

    render(): string {
        return `
        <div class="cart-item" data-id="${this.product.id}">
            <div class="cart-info">
                <h3>${this.product.name}</h3>
                <p>${this.product.price} €</p>
            </div>
            <div id="qty-${this.product.id}"></div>
        </div>
        `;
    }

    bind(root: HTMLElement): void {
        const container = root.querySelector<HTMLElement>(
            `#qty-${this.product.id}`
        );

        if (!container) return;

        const qtyControl = new QuantityControl(
            this.product.quantity,
            (newQty) => {
                this.onUpdate(this.product.id, newQty);
            }
        );

        container.innerHTML = qtyControl.render();
        qtyControl.bind(container);
    }
}