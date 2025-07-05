import express, { Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import config from '../config';
import BaseController from '../utils/baseController';

export default new class StorageController extends BaseController {

    get = async (req: Request, res: Response) => {
        try {
            console.log([...req.params.path].join("/"))
            // this.resSuccess(res, true)
            res.download([...req.params.path].join("/"))
            
        } catch (error) {
            this.resError(res, error)
        }
    };

    storage =  multer.diskStorage({
        destination: function (req: Request, file, cb: Function) {
            const path = [...req.params.path].join("/")
            const fullUploadPath = `${config.storagePath}/${path}`
            if (!fs.existsSync(fullUploadPath)){
                fs.mkdirSync(fullUploadPath, {recursive: true});
            }
            cb(null, fullUploadPath);
        },
        filename: function (req: Request, file, cb: Function) {
            cb(null, `${file.originalname}`);
        }
    })  
    

    post = async (req: Request, res: Response) => {
        try {
            console.log(req.headers.authorization)
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
                return this.resSuccess(res, req.files);
            });
            
        } catch (error) {
            this.resError(res, error)
        }
    };
}