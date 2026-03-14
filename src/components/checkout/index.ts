import "./style.css";

interface DeliveryForm {
    name: string;
    phone: string;
    address: string;
    comment: string;
    payment: "card" | "cash";
}

export class CheckoutPage {
    private form: DeliveryForm = {
        name: "",
        phone: "",
        address: "",
        comment: "",
        payment: "card",
    };

    mount(root: HTMLElement): void {
        root.innerHTML = `
        <div class="checkout-page">
            <div class="checkout-wrapper">

                <div class="checkout-header">
                    <h1>Delivery Information</h1>
                    <p class="checkout-subtitle">Enter your details to arrange delivery.</p>
                </div>

                <form id="checkoutForm" class="checkout-form" novalidate>
                    <div class="grid">
                        <div class="field">
                            <label for="name">Full Name</label>
                            <input id="name" type="text" placeholder="John Smith" required />
                        </div>

                        <div class="field">
                            <label for="phone">Phone Number</label>
                            <input id="phone" type="tel" placeholder="+375 (29) 000-00-00" required />
                        </div>

                        <div class="field field-wide">
                            <label for="address">Delivery Address</label>
                            <input id="address" type="text" placeholder="Street, building, apartment" required />
                        </div>

                        <div class="field field-wide">
                            <label for="comment">Comment</label>
                            <textarea id="comment" placeholder="Intercom, floor, courier instructions..."></textarea>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Payment Method</div>

                        <div class="payment">
                            <label class="pay-option">
                                <input type="radio" name="payment" value="card" checked />
                                <span class="pay-dot"></span>
                                <span class="pay-text">
                                    <span class="pay-main">Card</span>
                                    <span class="pay-sub">Pay online or upon delivery</span>
                                </span>
                            </label>

                            <label class="pay-option">
                                <input type="radio" name="payment" value="cash" />
                                <span class="pay-dot"></span>
                                <span class="pay-text">
                                    <span class="pay-main">Cash</span>
                                    <span class="pay-sub">Pay to courier on delivery</span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div class="actions">
                        <button type="submit" class="btn-primary">Place Order</button>
                        <span class="hint">This is a frontend demo. No backend yet.</span>
                    </div>
                </form>

            </div>
        </div>
        `;

        this.bind(root);
    }

    private bind(root: HTMLElement): void {
        const form = root.querySelector<HTMLFormElement>("#checkoutForm");
        if (!form) return;

        form.onsubmit = (e) => {
            e.preventDefault();

            const name = root.querySelector<HTMLInputElement>("#name");
            const phone = root.querySelector<HTMLInputElement>("#phone");
            const address = root.querySelector<HTMLInputElement>("#address");
            const comment = root.querySelector<HTMLTextAreaElement>("#comment");
            const payment = form.querySelector<HTMLInputElement>('input[name="payment"]:checked');

            if (!name || !phone || !address || !comment || !payment) return;

            this.form = {
                name: name.value.trim(),
                phone: phone.value.trim(),
                address: address.value.trim(),
                comment: comment.value.trim(),
                payment: payment.value as "card" | "cash",
            };

            console.log("Order submitted:", this.form);
            alert("Order submitted (frontend demo)");
        };
    }
}