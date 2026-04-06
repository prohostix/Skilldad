/**
 * Resolve media URL consistently across the application.
 * Handles both development (localhost) and production (skilldad.com) URLs.
 */
export const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    
    let normalizedPath = path;
    
    if (!normalizedPath.startsWith('/') && !normalizedPath.startsWith('uploads/')) {
        if (!normalizedPath.startsWith('assets/')) {
             normalizedPath = `/uploads/${normalizedPath}`;
        } else {
             normalizedPath = `/${normalizedPath}`;
        }
    } else if (normalizedPath.startsWith('uploads/')) {
        normalizedPath = `/${normalizedPath}`;
    }
    
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
    return `${baseUrl}${normalizedPath}`;
};

export const getPlaceholderImage = (text = 'Image') => {
    return `/assets/placeholders/default.png`; // Fallback to local placeholder
};
