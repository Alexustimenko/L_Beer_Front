type RouteHandler = () => void;

interface Route {
    path: string;
    handler: RouteHandler;
}

export class Router {
    private routes: Route[] = [];

    constructor() {
        window.addEventListener("popstate", () => {
            this.resolve();
        });
    }

    register(path: string, handler: RouteHandler): void {
        this.routes.push({ path, handler });
    }

    navigate(path: string): void {
        history.pushState({}, "", path);
        this.resolve();
    }

    resolve(): void {
        const currentPath = window.location.pathname;
        const route = this.routes.find(r => r.path === currentPath);

        if (route) {
            route.handler();
        }
    }

    // Метод для привязки кнопок хедера
    bindHeaderButtons(): void {
        // Используем MutationObserver чтобы точно поймать момент появления кнопок
        const observer = new MutationObserver((mutations, obs) => {
            const btnRegister = document.getElementById("btnRegister");
            const btnLogin = document.getElementById("btnLogin");
            
            if (btnRegister && btnLogin) {
                btnRegister.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.navigate("/register");
                    return false;
                };

                btnLogin.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.navigate("/login");
                    return false;
                };
                
                obs.disconnect(); // Отключаем наблюдатель после привязки
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Также пробуем сразу привязать, если кнопки уже есть
        this.tryBindButtons();
    }

    private tryBindButtons(): void {
        const btnRegister = document.getElementById("btnRegister");
        const btnLogin = document.getElementById("btnLogin");
        
        if (btnRegister) {
            btnRegister.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.navigate("/register");
                return false;
            };
        }

        if (btnLogin) {
            btnLogin.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.navigate("/login");
                return false;
            };
        }
    }
}