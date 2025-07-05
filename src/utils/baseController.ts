
import { Response } from 'express';
import { ParsedQs } from "qs";
import { createError, CreateError } from './apiError';

interface D {
    [x: string]: string
}


export interface Opts extends /* CrudOpts,  */D { }
type ValidationInput = Record<string, string>;

export default class BaseController {
    public options: string[] = []

    filterQuery = <T=D>(query:string | string[] | ParsedQs | ParsedQs[] | undefined | {[x: string]: string}, filter?: string[]): {query:T, options: Opts} => {

        const tras = (v:string) => ({"false": false,"true": true,"null": null}[v]);

        return {
            query: Object.entries(query as D).reduce((acc, [k, v]) => (!([...["id"], ...(filter || [])]).includes(k) ? acc : {...acc, [k]: tras(v) || v}), {}) as T,
            options: Object.entries(query as D).reduce((acc, [k, v]) => (!([...["startDate", "endDate", "date", "sortField", "sortOrder", "status", "limit"], ...this.options].includes(k)) ? acc : {...acc, [k]: tras(v) || v}), {}) as Opts
        }
    }

    validateInput = (input: ValidationInput, values: string[]) => {
        for (const value of values) {
            if (input[value] == undefined || String(input[value]).trim() == "")
                throw new CreateError(`Invalid field, "${value}" is required`);
        }
    }
    
    resError = (res: Response, error: unknown): Response => res.status(createError(error).status).json(createError(error).data);

    resSuccess = <T=D>(res: Response, data?: T, msg?: string):Response => res.status(200).json({
        success: true,
        message: msg || 'successful',
        data
    });

} 
