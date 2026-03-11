const asyncHandler = require('express-async-handler');
const { query } = require('../config/postgres');

/**
 * @desc    Generate sitemap.xml
 * @route   GET /sitemap.xml
 * @access  Public
 */
const generateSitemap = asyncHandler(async (req, res) => {
    const baseUrl = 'https://skilldad.com';
    
    // Static pages
    const staticPages = [
        '',
        '/courses',
        '/platform',
        '/services',
        '/about',
        '/partners',
        '/support',
        '/privacy',
        '/terms',
        '/cookies',
        '/refund-policy'
    ];

    // Fetch dynamic courses
    const coursesRes = await query('SELECT id, updated_at FROM courses WHERE is_published = true');
    const courses = coursesRes.rows;

    // Fetch dynamic universities
    const universitiesRes = await query("SELECT name, updated_at FROM users WHERE role = 'university'");
    const universities = universitiesRes.rows;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    // Add static pages
    staticPages.forEach(page => {
        xml += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // Add courses
    courses.forEach(course => {
        const lastMod = course.updated_at ? new Date(course.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        xml += `
  <url>
    <loc>${baseUrl}/course/${course.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Add universities
    universities.forEach(univer => {
        const lastMod = univer.updated_at ? new Date(univer.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        xml += `
  <url>
    <loc>${baseUrl}/university-profile/${encodeURIComponent(univer.name)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    xml += '\n</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
});

/**
 * @desc    Generate robots.txt
 * @route   GET /robots.txt
 * @access  Public
 */
const generateRobots = asyncHandler(async (req, res) => {
    const robots = `User-agent: *
Allow: /

Sitemap: https://skilldad.com/sitemap.xml`;

    res.header('Content-Type', 'text/plain');
    res.send(robots);
});

module.exports = {
    generateSitemap,
    generateRobots
};
