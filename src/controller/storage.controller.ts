import { Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import config from '../config';
import BaseController from '../utils/baseController';

export default new class StorageController extends BaseController {

    // get = async (req: Request, res: Response) => {
    //     try {
    //         const {id} = req.params
    //         const {query} = this.filterQuery(req.query, ["fullname"])
    //         console.log(req.headers)
    //         const options = JSON.parse(req.header("options") || "{}")

    //         const patient = await (id? patientsService.get(id): patientsService.filter(query, options)); 
    //         this.resSuccess(res, patient)
            
    //     } catch (error) {
    //         this.resError(res, error)
    //     }
    // };

    storage =  multer.diskStorage({
        destination: function (req, file, cb) {
            const path = [...req.params.path].join("/")
            const fullUploadPath = `${config.storagePath}/${path}`
            if (!fs.existsSync(fullUploadPath)){
                fs.mkdirSync(fullUploadPath);
            }
            cb(null, fullUploadPath);
        },
        filename: function (req, file, cb) {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    })  
    

    post = async (req: Request, res: Response) => {
        try {

            // esta logica sirve para agregar storage por config
            const upload = multer({
                limits: {
                    fileSize: 100000000000000, // 10MB
                },
                storage: this.storage 
            }).array('files');

            upload(req, res, (err) => {
                if (err) {
                    console.error(err)
                    return this.resError(res, err)
                }
                return this.resSuccess(res, true, JSON.stringify(req.files));
            });
            
        } catch (error) {
            this.resError(res, error)
        }
    };
}