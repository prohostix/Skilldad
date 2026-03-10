const { query } = require('../config/postgres');

// @desc    Get all FAQs (public, with optional search)
// @route   GET /api/faqs
// @access  Public
const getFAQs = async (req, res) => {
    try {
        const { search, category } = req.query;
        let faqs;

        if (search) {
            await query(`
                INSERT INTO faq_search_analytics (query, count) 
                VALUES ($1, 1) 
                ON CONFLICT (query) DO UPDATE SET count = faq_search_analytics.count + 1, updated_at = NOW()
            `, [search.toLowerCase()]);
            
            faqs = await query('SELECT * FROM faqs WHERE question ILIKE $1 OR answer ILIKE $1 ORDER BY views DESC, created_at DESC', [`%${search}%`]);
        } else if (category) {
            faqs = await query('SELECT * FROM faqs WHERE category = $1 ORDER BY views DESC, created_at DESC', [category]);
        } else {
            faqs = await query('SELECT * FROM faqs ORDER BY views DESC, created_at DESC');
        }

        res.status(200).json(faqs.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching FAQs' });
    }
};

// @desc    Get FAQ by ID
// @route   GET /api/faqs/:id
// @access  Public
const getFAQById = async (req, res) => {
    try {
        const faqRes = await query('SELECT * FROM faqs WHERE id = $1', [req.params.id]);
        const faq = faqRes.rows[0];
        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found' });
        }
        res.status(200).json(faq);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create new FAQ
// @route   POST /api/faqs
// @access  Private/Admin
const createFAQ = async (req, res) => {
    try {
        const { question, answer, category } = req.body;
        const faqRes = await query(
            'INSERT INTO faqs (question, answer, category) VALUES ($1, $2, $3) RETURNING *',
            [question, answer, category || 'general']
        );
        res.status(201).json(faqRes.rows[0]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update FAQ
// @route   PUT /api/faqs/:id
// @access  Private/Admin
const updateFAQ = async (req, res) => {
    try {
        const { question, answer, category } = req.body;
        const faqRes = await query(
            'UPDATE faqs SET question = COALESCE($1, question), answer = COALESCE($2, answer), category = COALESCE($3, category), updated_at = NOW() WHERE id = $4 RETURNING *',
            [question, answer, category, req.params.id]
        );
        const faq = faqRes.rows[0];
        if (!faq) return res.status(404).json({ message: 'FAQ not found' });
        res.status(200).json(faq);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete FAQ
// @route   DELETE /api/faqs/:id
// @access  Private/Admin
const deleteFAQ = async (req, res) => {
    try {
        const faqRes = await query('DELETE FROM faqs WHERE id = $1 RETURNING id', [req.params.id]);
        if (faqRes.rowCount === 0) return res.status(404).json({ message: 'FAQ not found' });
        res.status(200).json({ message: 'FAQ deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Submit Feedback (helpful/not helpful)
// @route   POST /api/faqs/:id/feedback
// @access  Public
const submitFeedback = async (req, res) => {
    try {
        const { isHelpful } = req.body;
        const column = isHelpful === true ? 'upvotes' : 'downvotes';
        
        const faqRes = await query(
            `UPDATE faqs SET ${column} = ${column} + 1, updated_at = NOW() WHERE id = $1 RETURNING *`,
            [req.params.id]
        );

        const faq = faqRes.rows[0];
        if (!faq) return res.status(404).json({ message: 'FAQ not found' });
        res.status(200).json(faq);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get Analytics
// @route   GET /api/faqs/analytics/stats
// @access  Private/Admin
const getAnalytics = async (req, res) => {
    try {
        const mostViewedRes = await query('SELECT * FROM faqs ORDER BY views DESC LIMIT 10');
        const mostViewed = mostViewedRes.rows;

        const topSearchesRes = await query('SELECT query as _id, count FROM faq_search_analytics ORDER BY count DESC LIMIT 10');
        const topSearches = topSearchesRes.rows;

        res.status(200).json({ mostViewed, topSearches });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Increment Views
// @route   POST /api/faqs/:id/view
// @access  Public
const incrementView = async (req, res) => {
    try {
        const faqRes = await query(
            'UPDATE faqs SET views = views + 1, updated_at = NOW() WHERE id = $1 RETURNING *',
            [req.params.id]
        );

        const faq = faqRes.rows[0];
        if (!faq) return res.status(404).json({ message: 'FAQ not found' });
        res.status(200).json(faq);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Clear Search Analytics
// @route   DELETE /api/faqs/analytics/clear
// @access  Private/Admin
const clearAnalytics = async (req, res) => {
    try {
        await query('TRUNCATE faq_search_analytics RESTART IDENTITY');
        res.status(200).json({ message: 'Search analytics cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getFAQs,
    getFAQById,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    submitFeedback,
    getAnalytics,
    incrementView,
    clearAnalytics
};
