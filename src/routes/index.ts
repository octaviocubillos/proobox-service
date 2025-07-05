

import express from 'express';
// import multen from 'multer';
import storageController from '../controller/storage.controller';

// const multerUpload = multen(
//     {
//         dest: './uploads',
//         limits: {
//             fileSize: 1000000000, // 10MB
//         },

//     }
// )


const router = express.Router();

router.post('/upload/*path',/*  multerUpload.single('file'), */ storageController.post);


export default router; 