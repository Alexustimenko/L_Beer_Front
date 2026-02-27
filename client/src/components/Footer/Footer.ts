import "./Footer.css";

export class Footer {
    mount(root: HTMLElement): void {
        const currentYear = new Date().getFullYear();
        root.innerHTML = `
        <footer class="okt-footer-modern">
            <div class="footer-line"></div>
            <p>© ${currentYear} Oktober Shop. Чрезмерное употребление вредит всему.</p>
        </footer>
        `;
    }
}