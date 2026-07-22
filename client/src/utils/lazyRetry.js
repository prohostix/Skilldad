// Wraps a dynamic import() so that a stale-chunk failure (the browser tab was
// open across a deploy, so the old hashed chunk file no longer exists on the
// server) triggers exactly one automatic page reload to pick up the new
// build, instead of surfacing a blank "Oops! Something went wrong" screen.
export default function lazyRetry(importFn) {
    return new Promise((resolve, reject) => {
        importFn()
            .then((module) => {
                sessionStorage.removeItem('lazy-retry-refreshed');
                resolve(module);
            })
            .catch((error) => {
                const hasRefreshed = sessionStorage.getItem('lazy-retry-refreshed') === 'true';
                if (!hasRefreshed) {
                    sessionStorage.setItem('lazy-retry-refreshed', 'true');
                    window.location.reload();
                } else {
                    reject(error);
                }
            });
    });
}
