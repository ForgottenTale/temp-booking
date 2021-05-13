const multer = require('multer');
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, done)=>{
        done(null, Date.now() + file.originalname);
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (err, file, done)=>{
        switch (file.mimetype){
            case "image/jpeg":  done(null, true);
                                break;
            case "image/png": done(null, true);
                                break;
            case "text/csv": done(null, true);
                            break;
            default : done("Unsupported file type", false);
        }
    }
})
module.exports = upload;