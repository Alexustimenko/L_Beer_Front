import { Router } from "./router/Router";
import { LoginPage } from "./components/login";
import { RegisterPage } from "./components/register";
import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";
import './main.css';

interface Beer {
    id: number;
    name: string;
    price: number;
    category: string;
}

const BEER_DATA: Beer[] = [
    { id: 1, name: "Lager 1", price: 450, category: "Cat 1" },
    { id: 2, name: "Wheat 1", price: 520, category: "Cat 2" },
    { id: 3, name: "Fest 1", price: 600, category: "Cat 3" },
    { id: 4, name: "Dark 1", price: 480, category: "Cat 4" },
    { id: 5, name: "Ale 1", price: 550, category: "Cat 5" },
    { id: 6, name: "Zero 1", price: 390, category: "Cat 1" },
];

const root = document.getElementById("app");
if (!root) throw new Error("Root element not found");

const router = new Router();

const header = new Header(0, 0);
const footer = new Footer();
let cart: Beer[] = [];

// --- ГЛАВНАЯ СТРАНИЦА ---
router.register("/", () => {
    console.log("Главная страница загружена");
    
    root.innerHTML = `
        <div class="okt-page">
            <div id="header-container"></div>
            <main class="okt-content">
                <header class="okt-hero">
                    <div class="hero-title-skeleton"></div>
                    <div class="hero-sub-skeleton"></div>
                </header>
                <div class="okt-layout">
                    <aside class="okt-filters">
                        <div class="filter-card">
                            <div class="filter-label-skeleton"></div>
                            <div class="search-box"><input type="text" id="mainSearch" /></div>
                            <div class="filter-label-skeleton"></div>
                            <div class="filter-options">
                                ${[1, 2, 3, 4, 5].map(id => `
                                    <label class="checkbox-container-empty">
                                        <input type="checkbox" class="cat-cb" data-id="${id}" />
                                        <span class="checkmark"></span>
                                        <div class="category-text-skeleton"></div>
                                    </label>
                                `).join('')}
                            </div>
                            <button class="btn-reset-empty" id="clearFilters"></button>
                        </div>
                    </aside>
                    <section class="okt-grid" id="beer-grid">
                        ${BEER_DATA.map(beer => `
                            <div class="beer-card-empty">
                                <div class="empty-placeholder"></div>
                                <div class="card-actions-only">
                                    <button class="btn-buy-full" data-id="${beer.id}">В КОРЗИНУ</button>
                                </div>
                            </div>
                        `).join('')}
                    </section>
                </div>
            </main>
            <div id="footer-container"></div>
        </div>
    `;

    header.mount(root.querySelector("#header-container")!);
    footer.mount(root.querySelector("#footer-container")!);
    
    // Привязываем кнопки хедера через роутер
    setTimeout(() => {
        router.bindHeaderButtons();
    }, 50);

    root.querySelectorAll(".btn-buy-full").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number((e.currentTarget as HTMLElement).dataset.id);
            const beer = BEER_DATA.find(b => b.id === id);
            if (beer) {
                cart.push(beer);
                const total = cart.reduce((sum, b) => sum + b.price, 0);
                header.update(cart.length, total);
            }
        });
    });

    root.querySelector("#clearFilters")?.addEventListener("click", () => {
        root.querySelectorAll<HTMLInputElement>(".cat-cb").forEach(cb => cb.checked = false);
    });
});

// --- СТРАНИЦЫ АВТОРИЗАЦИИ ---
router.register("/login", () => {
    console.log("Страница логина загружена");
    root.innerHTML = '';
    const loginPage = new LoginPage((path: string) => router.navigate(path));
    loginPage.mount(root);
});

router.register("/register", () => {
    console.log("Страница регистрации загружена");
    root.innerHTML = '';
    const registerPage = new RegisterPage((path: string) => router.navigate(path));
    registerPage.mount(root);
});

// --- ПРЯМАЯ ПРИВЯЗКА КНОПОК ПОСЛЕ ЗАГРУЗКИ ---
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        router.bindHeaderButtons();
    }, 100);
});

router.resolve();