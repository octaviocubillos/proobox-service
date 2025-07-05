import express, {Express, Request, Response } from 'express';
// import multen from 'multer';
import routes from './routes';
import cors from "cors";
// import { dirname, join } from 'path';

// const CURRENT_DIR = dirname(__dirname);

// console.log(join(CURRENT_DIR, './storage'))

// const multerUpload = multen(
//     {
//         dest: join(CURRENT_DIR, './storage'),
//         limits: {
//             fileSize: 1000000000, // 10MB
//         },
//     }
// )

const app: Express = express();

app.use(express.json()); // Para parsear JSON bodies
app.use(express.urlencoded({ extended: true })); // Para parsear URL-encoded bodies
app.use(cors({}));


// app.post('/upload', multerUpload.single('file'), (req: Request, res: Response) => {
//     console.log(req.file);
//     res.send('Archivo subido correctamente');
// });



app.use('/api', routes);



// app.get('/', (req: Request, res: Response) => {
//     res.send('¡Hola Mundo desde la App!');
// });

// app.get('/ping', (req: Request, res: Response) => {
//     console.log('ping - pong');
//     res.send('Pong');
// });

   
export default app; 