export class QuantityControl {
    private quantity: number;
    private onChange: (newValue: number) => void;

    constructor(
        quantity: number,
        onChange: (newValue: number) => void
    ) {
        this.quantity = quantity;
        this.onChange = onChange;
    }

    render(): string {
        return `
        <div class="qty-control">
            <button class="qty-btn" data-action="minus">−</button>
            <span class="qty-value">${this.quantity}</span>
            <button class="qty-btn" data-action="plus">+</button>
        </div>
        `;
    }

    bind(root: HTMLElement): void {
        const minus = root.querySelector<HTMLButtonElement>('[data-action="minus"]');
        const plus = root.querySelector<HTMLButtonElement>('[data-action="plus"]');

        if (minus) {
            minus.onclick = () => {
                if (this.quantity > 1) {
                    this.quantity--;
                    this.onChange(this.quantity);
                }
            };
        }

        if (plus) {
            plus.onclick = () => {
                this.quantity++;
                this.onChange(this.quantity);
            };
        }
    }
}