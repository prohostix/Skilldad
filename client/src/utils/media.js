/**
 * Resolve media URL consistently across the application.
 * Handles both development (localhost) and production (skilldad.com) URLs.
 */
export const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Ensure path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // In production, use the current origin if not configured
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
    
    // Check if the path is already relative to the app (e.g., starts with /assets or /uploads)
    return `${baseUrl}${normalizedPath}`;
};

export const getPlaceholderImage = (text = 'Image') => {
    return `/assets/placeholders/default.png`; // Fallback to local placeholder
};
