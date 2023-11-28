import express, { NextFunction, Request, Response } from 'express';
import logger from './config/logger';
const app = express();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.get('/', async (_req: Request, res: Response) => {
   
    res.send('Hello world!');
}
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req:Request, res: Response, next: NextFunction) => {
    if (err instanceof Error) {
        logger.error(err.message);
        const statusCode =  500;
        res.status(statusCode).json({
            errors: [
                {
                    type : err.name,
                    msg: err.message,
                    path: '',
                    location: ''

                }
            ]
        });

    } else {
        res.status(400).send('Bad request');
    }
})

export default app;
