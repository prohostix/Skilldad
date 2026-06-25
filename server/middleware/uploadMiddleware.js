const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        const dest = path.join(__dirname, '../uploads/');
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|svg|mp4|webm|mov|ogg|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /jpg|jpeg|png|webp|svg|mp4|webm|mov|ogg|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt|image\/webp|image\/svg/.test(file.mimetype.toLowerCase());

    if (extname || mimetype) {
        return cb(null, true);
    } else {
        cb(new Error(`File type not supported. Current: ${file.mimetype}`));
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;
