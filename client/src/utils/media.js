/**
 * Resolve media URL consistently across the application.
 * Handles both development (localhost) and production (skilldad.com) URLs.
 */
export const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    
    let normalizedPath = path;
    let isAsset = false;

    // Check if it's a frontend relative asset path
    if (normalizedPath.startsWith('assets/')) {
        normalizedPath = `/${normalizedPath}`;
        isAsset = true;
    } else if (normalizedPath.startsWith('/assets/')) {
        isAsset = true;
    }
    
    if (isAsset) {
        // Assets are always served from the frontend origin
        return `${window.location.origin}${normalizedPath}`;
    }

    // Handle upload paths
    if (!normalizedPath.startsWith('/') && !normalizedPath.startsWith('uploads/')) {
        normalizedPath = `/uploads/${normalizedPath}`;
    } else if (normalizedPath.startsWith('uploads/')) {
        normalizedPath = `/${normalizedPath}`;
    }
    
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
    return `${baseUrl}${normalizedPath}`;
};

export const getPlaceholderImage = (text = 'Image') => {
    return `/assets/placeholders/default.png`; // Fallback to local placeholder
};
