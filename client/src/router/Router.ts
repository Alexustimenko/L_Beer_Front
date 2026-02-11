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
}