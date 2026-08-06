// Wraps a dynamic import() so that a stale-chunk failure (the browser tab was
// open across a deploy, so the old hashed chunk file no longer exists on the
// server) triggers exactly one automatic page reload to pick up the new
// build, instead of surfacing a blank "Oops! Something went wrong" screen.
export default function lazyRetry(importFn) {
    return new Promise((resolve, reject) => {
        importFn()
            .then((module) => {
                resolve(module);
            })
            .catch((error) => {
                console.error(`[lazyRetry] Error importing chunk: ${error.message}`);
                const lastRefresh = parseInt(sessionStorage.getItem('lazy-retry-time') || '0', 10);
                const now = Date.now();
                // Only allow one reload per 5 seconds to prevent infinite loops
                if (now - lastRefresh > 5000) {
                    sessionStorage.setItem('lazy-retry-time', now.toString());
                    window.location.reload();
                } else {
                    reject(error);
                }
            });
    });
}
