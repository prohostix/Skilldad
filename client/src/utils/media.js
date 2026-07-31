/**
 * Resolve media URL consistently across the application.
 * Handles both development (localhost) and production (skilldad.com) URLs.
 */
export const getMediaUrl = (path) => {
    if (!path) return '';

    // If it's already an absolute HTTP/HTTPS or data URL
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        // If on production domain, replace localhost/127.0.0.1 with current origin
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            if (path.includes('localhost') || path.includes('127.0.0.1')) {
                const relativePath = path.replace(/^https?:\/\/[^\/]+/, '');
                return `${window.location.origin}${relativePath}`;
            }
        }
        return path;
    }
    
    let normalizedPath = path;

    // Standardize leading slash and upload directory prefix
    if (normalizedPath.startsWith('assets/')) {
        normalizedPath = `/${normalizedPath}`;
    } else if (normalizedPath.startsWith('uploads/')) {
        normalizedPath = `/${normalizedPath}`;
    } else if (!normalizedPath.startsWith('/')) {
        normalizedPath = `/uploads/${normalizedPath}`;
    } else if (!normalizedPath.startsWith('/uploads/') && !normalizedPath.startsWith('/assets/')) {
        normalizedPath = `/uploads${normalizedPath}`;
    }
    
    // On live production domain (e.g. skilldad.com), always use window.location.origin
    if (typeof window !== 'undefined') {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isLocal) {
            return `${window.location.origin}${normalizedPath}`;
        }
    }

    const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    return `${baseUrl}${normalizedPath}`;
};

export const getPlaceholderImage = (text = 'Image') => {
    return `/assets/placeholders/default.png`;
};
