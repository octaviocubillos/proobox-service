import axios, { AxiosHeaders, AxiosRequestConfig, AxiosResponse } from "axios";
import { CreateError } from "./apiError";


enum Method {
    POST = "POST",
    GET = "GET",
    DELETE = "DELETE",
    PUT = "PUT"
}

interface D {
    id: string;
    [x: string]: any;
}

interface MongoConfig {
    database: string;
    table: string;
    schema: {[x: string]: string | number | boolean | {[x: string]: string | number | boolean | {[x: string]: string | number | boolean}}};
    settings: {
        manageUrl: string;
        manageToken: string;
        mongoUrl: string;
        mongoToken: string;
        options: {
            create?: boolean;
            update?: boolean;
        }
    }
}

interface Options {}

export default class MongoService {
    public table: string;
    public database: string;
    private manageUrl: string;
    private manageToken: string;
    private mongoUrl: string;
    private mongoToken: string;
    private setting: MongoConfig['settings'];

    public schema: MongoConfig["schema"];

    constructor(config: MongoConfig) {
        this.table = config.table,
        this.database = config.database;

        this.manageUrl = `${config.settings.manageUrl}/${this.database}`;
        this.manageToken = `Bearer ${config.settings.manageToken}`;

        this.mongoUrl = `${config.settings.mongoUrl}/${this.database}/${this.table}`;
        this.mongoToken = `Bearer ${config.settings.mongoToken}`;
        this.schema = config.schema;
        this.setting = config.settings || {}
        if(config.settings.options?.create) this.createTable()
    }
    
    private objectToQuery = (filters: any) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value as string);
        });
        return params.toString();
    }

    protected model = {
        get: async <T extends D> (id: string): Promise<T> => this.request({
            url: this.mongoUrl + "/" + id,
            method: Method.GET,
            headers: { private: this.mongoToken }
        }),
        create: async <T extends D>(data: Partial<T>): Promise<T> => this.request({
            url: this.mongoUrl,
            method: Method.POST,
            headers: { private: this.mongoToken }, 
            data
        }),
        all: async <T extends D>():Promise<T[]> => this.request({
            url: this.mongoUrl,
            method: Method.GET,
            headers: { private: this.mongoToken }
        }),
        filter: async <T extends D>(filter: Partial<T>, options: Partial<Options> = {}):Promise<T[]> => this.request({
            url: this.mongoUrl + "?" + this.objectToQuery(filter),
            method: Method.GET,
            headers: { 
                private: this.mongoToken,
                options: JSON.stringify(options) as unknown as AxiosHeaders
            }
        }),
        update: async <T extends D>(data: Partial<T>):Promise<T> => this.request({
            url: this.mongoUrl + "/" + data.id,
            method: Method.PUT,
            headers: { private: this.mongoToken },
            data
        }),
        delete: async <T extends D>(id: string):Promise<T> => this.request({
            url: this.mongoUrl + "/" + id,
            method: Method.DELETE,
            headers: { private: this.mongoToken }
        })
    }

    private request = async <T, R = AxiosResponse<T>>(config: AxiosRequestConfig, logger: boolean = false): Promise<R> => {
        try {
            config.headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                ...(config.headers || {})
            };

            logger && this.log("HTTP execute", `Request: ${JSON.stringify(config, null, 2)}`);
            const response = await axios.request(config);
            logger && this.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
            return response.data.data;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    private log = (...args: any[]) => console.log(`MONGO || ${this.table} ||`,...args)

    private createTable = async () => {
        try {
            const result = await this.request({
                url: this.manageUrl,
                headers: {
                    private: this.manageToken
                },
                method: Method.POST,
                data: {
                    name: this.table,
                    schema: this.schema,
                    options: this.setting?.options || {}
                }
            })

        } catch (error) {
            console.log({error})
        }
    }

    get = async <T extends D>(id: string, options?: Partial<Options>): Promise<T> => {
        this.log("get with:", id, {options});
        try {
            if (!id) throw new CreateError(`Id is not valid`);
            let res = await this.model.get<T>(id);
            if (!res?.id) throw new CreateError(`Recurso no encontrado con id: ${id} en modelo: ${this.table}`, 200);
            
            for (const option of Object.keys(options || {})) 
                (typeof (this as Record<string, any>)[option] === "function" && res) && (res = await (this as any)[option](res))
            
            return res;
        } catch (error) {
            throw new CreateError(error);
        }
    }

    getOrNull = async <T extends D>(id: string, options?: Partial<Options>): Promise<T | null> => {
        this.log("get with:", id);
        try {
            if (!id) throw new CreateError(`Id is not valid`);
            let res = await this.model.get<T>(id);
            if (!res?.id) 
                return null;
            for (const option of Object.keys(options || {})) 
                (typeof (this as Record<string, any>)[option] === "function" && res) && (res = await (this as any)[option](res));
            return res;
        } catch (error) {
            throw new CreateError(error);
        }
    }

    filter = async <T extends D>(query: Partial<T>,options?: Partial<Options>): Promise<T[]> => {
        this.log("filter with:", {query, options});
        try {
            let res = await this.model.filter(query, options);
            for (const option of Object.keys(options || {})) 
                (typeof (this as Record<string, any> )[option] === "function" && res) && (res = await (this as any)[option](res));
            console.log({res})
            return Array.isArray(res) ? res : [];
        } catch (error) {
            throw new CreateError(error);
        }
        
    }

    update = async <T extends D>(data: Partial<T>, options?: Partial<Options>): Promise<T> => {
        this.log("update with:", {data, options});
        try {
            let res =  await this.model.update(data);
            for (const option of Object.keys(options || {})) 
                (typeof (this as Record<string, any>)[option] === "function" && res) && (res = await (this as any)[option](res));
            return res;
        } catch (error) {
            throw new CreateError(error);
        }
    }

    create = async <T extends D>(data: Partial<T>, options?: Partial<Options>): Promise<T> => {
        this.log("create with:", {data, options});
        try {
            let res = await this.model.create(data);
            for (const option of Object.keys(options || {})) 
                (typeof (this as Record<string, any>)[option] === "function" && res) && (res = await (this as any)[option](res));
            return res;
        } catch (error) {
            throw new CreateError(error);
        }
    }

    delete = async (id: string, options?: Partial<Options>): Promise<D> => {
        this.log("delete with:", id);
        try {
            let res = await this.model.delete(id);
            for (const option of Object.keys(options || {}))
                (typeof (this as Record<string, any>)[option] === "function" && res) && (res = await (this as any)[option](res));
            return res;
        } catch (error) {
            throw new CreateError(error);
        }
    }

    private names: Record<string, Record<string, string>> = {};

    addNameByKey = async <T=D>(obj: T, key: string, name:string, attributes?:string[]): Promise<T> => {
        console.log('addNameByKey', {key, name, attributes});
        
        this.names[key] = {};
        for (const item of (Array.isArray(obj) ? obj : [obj]) as D[]) {
            const id: string = String(item[key]);
            if (this.names[key][id]) {
                item[name] = this.names[key][id].trim();
                continue;
            } 
            this.names[key][id] = '';
            const data =  (await this.getOrNull(item[key]));
            if(!data) continue;
            if(!attributes || attributes?.length === 0) {
                item[name] = data;
                continue;
            }
            for(const attribute of attributes){
                if(attribute.includes('.')) {
                    const [attr, attr2] = attribute.split('.');
                    this.names[key][id] += data?.[attr]?.[attr2] + ' ';
                    continue;
                }
                this.names[key][id] += data?.[attribute] + ' ';
            }           
            item[name] = this.names[key][id].trim();
        }
        delete this.names[key];
        return Array.isArray(obj) ? obj : obj;
    }
}