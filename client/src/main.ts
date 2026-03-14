import { Router } from "./router/Router";
import { LoginPage } from "./components/login";
import { RegisterPage } from "./components/register";
import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";
import { CartPage } from "./components/cart";
import './main.css';

interface Beer {
    id: number;
    name: string;
    price: number;
    category: string;
}

interface User {
    id: string;
    email: string;
    name: string;
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

// Функция для получения текущего пользователя
function getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
    return null;
}

// Функция для проверки авторизации
function isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
}

// Функция для выхода
function logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.navigate('/');
}

// --- ГЛАВНАЯ СТРАНИЦА ---
router.register("/", () => {
    console.log("Главная страница загружена");
    
    const currentUser = getCurrentUser();
    const welcomeMessage = currentUser 
        ? `👋 Добро пожаловать, ${currentUser.name}!` 
        : 'Добро пожаловать в Oktober Shop';

    root.innerHTML = `
        <div class="okt-page">
            <div id="header-container"></div>
            <main class="okt-content">
                <header class="okt-hero">
                    <h1 class="hero-title">🍺 OKTOBER SHOP</h1>
                    <p class="hero-subtitle">${welcomeMessage}</p>
                    <!-- Убраны user-email и кнопка выхода отсюда -->
                </header>
                <div class="okt-layout">
                    <aside class="okt-filters">
                        <div class="filter-card">
                            <label class="filter-label">Поиск</label>
                            <div class="search-box"><input type="text" id="mainSearch" placeholder="🔍 Поиск пива..." /></div>
                            <label class="filter-label">Категории</label>
                            <div class="filter-options">
                                ${[1, 2, 3, 4, 5].map(id => `
                                    <label class="checkbox-container">
                                        <input type="checkbox" class="cat-cb" data-id="${id}" />
                                        <span class="checkmark"></span>
                                        <span class="category-text">Категория ${id}</span>
                                    </label>
                                `).join('')}
                            </div>
                            <button class="btn-reset" id="clearFilters">Сбросить фильтры</button>
                        </div>
                    </aside>
                    <section class="okt-grid" id="beer-grid">
                        ${BEER_DATA.map(beer => `
                            <div class="beer-card">
                                <div class="beer-image">🍺</div>
                                <h3 class="beer-name">${beer.name}</h3>
                                <p class="beer-category">${beer.category}</p>
                                <p class="beer-price">${beer.price} ₽</p>
                                <button class="btn-buy" data-id="${beer.id}">➕ В КОРЗИНУ</button>
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
    
    setTimeout(() => {
        router.bindHeaderButtons();
    }, 50);

    // Кнопки добавления в корзину
    root.querySelectorAll(".btn-buy").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number((e.currentTarget as HTMLElement).dataset.id);
            const beer = BEER_DATA.find(b => b.id === id);
            if (beer) {
                cart.push(beer);
                const total = cart.reduce((sum, b) => sum + b.price, 0);
                header.update(cart.length, total);
                
                // Показываем уведомление
                alert(`🍺 ${beer.name} добавлен в корзину!`);
            }
        });
    });

    // Сброс фильтров
    root.querySelector("#clearFilters")?.addEventListener("click", () => {
        root.querySelectorAll<HTMLInputElement>(".cat-cb").forEach(cb => cb.checked = false);
    });

    // Поиск
    root.querySelector("#mainSearch")?.addEventListener("input", (e) => {
        const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
        const cards = root.querySelectorAll<HTMLElement>(".beer-card");
        
        cards.forEach((card, index) => {
            const beer = BEER_DATA[index];
            if (beer) {
                const matches = beer.name.toLowerCase().includes(searchTerm);
                card.style.display = matches ? 'block' : 'none';
            }
        });
    });
});

// --- СТРАНИЦЫ АВТОРИЗАЦИИ ---
router.register("/login", () => {
    // Если уже авторизован, редирект на главную
    if (isAuthenticated()) {
        router.navigate('/');
        return;
    }
    
    console.log("Страница логина загружена");
    root.innerHTML = '';
    const loginPage = new LoginPage((path: string) => router.navigate(path));
    loginPage.mount(root);
});

router.register("/register", () => {
    // Если уже авторизован, редирект на главную
    if (isAuthenticated()) {
        router.navigate('/');
        return;
    }
    
    console.log("Страница регистрации загружена");
    root.innerHTML = '';
    const registerPage = new RegisterPage((path: string) => router.navigate(path));
    registerPage.mount(root);
});

// --- СТРАНИЦА КОРЗИНЫ ---
router.register("/cart", () => {
    console.log("Страница корзины загружена");
    root.innerHTML = '';
    const cartPage = new CartPage();
    cartPage.mount(root);
});

// --- ПРЯМАЯ ПРИВЯЗКА КНОПОК ПОСЛЕ ЗАГРУЗКИ ---
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        router.bindHeaderButtons();
    }, 100);
});

router.resolve();