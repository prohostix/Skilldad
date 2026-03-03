# How to Add B2B Partner Company Names and Logos

## Quick Start - Add Sample Companies

I've created a seed script that will add 9 sample B2B partner companies to your database.

### Step 1: Run the Seed Script

```bash
cd server
node scripts/seedPartnerLogos.js
```

This will add these companies:
1. TechCorp Solutions
2. Global Innovations Ltd
3. Digital Dynamics Inc
4. Enterprise Systems Group
5. CloudTech Partners
6. DataFlow Corporation
7. NextGen Technologies
8. Smart Solutions International
9. Innovate Labs

### Step 2: Add Real Company Logos

The script uses placeholder logo paths. To add real logos:

1. **Create logos folder** (if it doesn't exist):
   ```bash
   mkdir -p client/public/assets/logos
   ```

2. **Add your logo files** to `client/public/assets/logos/`:
   - techcorp.png
   - global-innovations.png
   - digital-dynamics.png
   - enterprise-systems.png
   - cloudtech.png
   - dataflow.png
   - nextgen.png
   - smart-solutions.png
   - innovate-labs.png

3. **Logo Requirements**:
   - Format: PNG or SVG (PNG recommended)
   - Size: 200x80px or similar aspect ratio
   - Background: Transparent
   - File size: < 100KB

### Step 3: Refresh Your Admin Panel

After running the script and adding logos:
1. Refresh the B2B Partners page
2. You should see the 9 companies with their names
3. Logos will appear once you add the image files

---

## Option 2: Add Companies Manually via UI

If you prefer to add companies through the admin interface:

1. **Click "+ ADD COMPANY"** button (top right)
2. **Fill in the form**:
   - Name: Company name
   - Logo: Upload logo file
   - Type: Corporate or University
   - Order: Display order (1, 2, 3...)
   - Active: Yes
3. **Click Save**

---

## Option 3: Add via API (For Bulk Upload)

If you have a list of companies with logos, you can use the API:

### API Endpoint:
```
POST /api/admin/partner-logos
```

### Request Body:
```json
{
  "name": "Company Name",
  "logo": "/assets/logos/company-logo.png",
  "type": "corporate",
  "order": 1,
  "isActive": true
}
```

### Example with cURL:
```bash
curl -X POST https://skilldad-server.onrender.com/api/admin/partner-logos \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechCorp Solutions",
    "logo": "/assets/logos/techcorp.png",
    "type": "corporate",
    "order": 1,
    "isActive": true
  }'
```

---

## Customize Company Names

To change the sample company names, edit `server/scripts/seedPartnerLogos.js`:

```javascript
const samplePartners = [
    {
        name: 'Your Company Name Here',  // Change this
        logo: '/assets/logos/your-logo.png',  // Change this
        type: 'corporate',
        order: 1,
        isActive: true
    },
    // Add more companies...
];
```

Then run the script again:
```bash
node server/scripts/seedPartnerLogos.js
```

---

## Logo Design Tips

### Recommended Logo Specifications:
- **Dimensions**: 200x80px (or 400x160px for retina)
- **Format**: PNG with transparent background
- **Color**: Full color or monochrome (depending on your design)
- **File size**: < 100KB
- **Naming**: Use kebab-case (e.g., `tech-corp-solutions.png`)

### Where to Get Logos:
1. **From Companies**: Request official logos from partner companies
2. **Create Placeholders**: Use tools like:
   - Canva (free logo maker)
   - Figma (design tool)
   - LogoMakr (online logo generator)
3. **Use Text Logos**: Simple text-based logos work well too

---

## Real Company Examples

Here are some real B2B partner examples you might want to add:

### Technology Companies:
- Microsoft
- Google Cloud
- Amazon Web Services
- IBM
- Oracle
- SAP
- Salesforce

### Educational Institutions:
- Local universities
- Training centers
- Corporate training partners

### Industry Partners:
- Manufacturing companies
- Healthcare organizations
- Financial institutions
- Consulting firms

---

## Troubleshooting

### Issue 1: Script Fails to Connect
**Error**: "Error connecting to MongoDB"

**Solution**:
- Check `MONGO_URI` in your `.env` file
- Ensure MongoDB is running
- Verify network connection

### Issue 2: Logos Not Showing
**Possible Causes**:
- Logo files not uploaded to correct folder
- Wrong file path in database
- File permissions issue

**Solution**:
1. Verify files exist in `client/public/assets/logos/`
2. Check file names match database paths
3. Ensure files are accessible (check permissions)
4. Clear browser cache and refresh

### Issue 3: Companies Not Appearing
**Possible Causes**:
- Script didn't run successfully
- Database connection issue
- Frontend not fetching data

**Solution**:
1. Check script output for errors
2. Verify data in MongoDB (use MongoDB Compass)
3. Check browser console for API errors
4. Refresh the page

---

## Production Deployment

After adding companies locally, deploy to production:

1. **Commit logo files**:
   ```bash
   git add client/public/assets/logos/
   git commit -m "Add B2B partner logos"
   git push origin main
   ```

2. **Run seed script on production**:
   - SSH into your server, or
   - Use Render shell, or
   - Create an admin endpoint to seed data

3. **Verify on production**:
   - Visit your production admin panel
   - Check B2B Partners page
   - Verify logos are displaying

---

## Summary

✅ **Quickest Method**: Run `node server/scripts/seedPartnerLogos.js`
✅ **Add Real Logos**: Upload PNG files to `client/public/assets/logos/`
✅ **Customize Names**: Edit the script with your actual partner names
✅ **Deploy**: Commit and push to production

The seed script will populate your database with sample companies. Just add the actual logo files and you're done!
