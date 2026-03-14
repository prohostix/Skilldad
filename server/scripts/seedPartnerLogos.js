/**
 * Seed Partner Logos Script (PostgreSQL Version)
 * Run this to add sample B2B partner companies with logos
 * 
 * Usage: node server/scripts/seedPartnerLogos.js
 */

require('dotenv').config();
const { query } = require('../config/postgres');
const crypto = require('crypto');

// Sample B2B Partner Companies & University Partners
const samplePartners = [
    // 4 University Cards (Featured Unis)
    {
        id: crypto.randomUUID(),
        name: 'Oxford Data Science',
        logo: null,
        type: 'university',
        order: 1,
        location: 'Oxford, UK',
        students: '1200+',
        programs: '15 Modules',
        is_active: true
    },
    {
        id: crypto.randomUUID(),
        name: 'Stanford AI Lab',
        logo: null,
        type: 'university',
        order: 2,
        location: 'California, USA',
        students: '1500+',
        programs: '10 Modules',
        is_active: true
    },
    {
        id: crypto.randomUUID(),
        name: 'MIT Robotics',
        logo: null,
        type: 'university',
        order: 3,
        location: 'Massachusetts, USA',
        students: '800+',
        programs: '12 Modules',
        is_active: true
    },
    {
        id: crypto.randomUUID(),
        name: 'Cambridge AI',
        logo: null,
        type: 'university',
        order: 4,
        location: 'Cambridge, UK',
        students: '2000+',
        programs: '20 Modules',
        is_active: true
    },
    // Hiring Banners (Corporate)
    { id: crypto.randomUUID(), name: 'Infosys', logo: null, type: 'corporate', order: 5, is_active: true },
    { id: crypto.randomUUID(), name: 'TCS', logo: null, type: 'corporate', order: 6, is_active: true },
    { id: crypto.randomUUID(), name: 'Wipro', logo: null, type: 'corporate', order: 7, is_active: true },
    { id: crypto.randomUUID(), name: 'Accenture', logo: null, type: 'corporate', order: 8, is_active: true }
];

async function seedPartnerLogos() {
    try {
        console.log('Connecting to PostgreSQL...');
        
        // Clear existing partner logos
        console.log('\nClearing existing partner logos...');
        await query('DELETE FROM partner_logos');
        console.log('✓ Cleared partner_logos table');

        // Insert sample partners
        console.log('\nInserting sample partner logos...');
        for (const p of samplePartners) {
            await query(
                `INSERT INTO partner_logos (id, name, logo, type, "order", location, students, programs, is_active) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [p.id, p.name, p.logo, p.type, p.order, p.location || null, p.students || null, p.programs || null, p.is_active]
            );
            console.log(`   ✓ Inserted: ${p.name} (${p.type})`);
        }

        console.log('\n✅ Seed completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding partner logos:', error);
    } finally {
        process.exit();
    }
}

// Run the seed function
seedPartnerLogos();
