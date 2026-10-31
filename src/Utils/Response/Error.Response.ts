
import { NextFunction, Request, Response } from "express";
import { env } from "../../config/config.service";


export interface IErrorResponse extends Error{
    statusCode:number;
}

export class ApplicationException extends Error {
    constructor(
        message:string,
        public statusCode: number =400,
        options?:ErrorOptions,
    ){
        super(message, options);
        this.name = this.constructor.name;

    }
}

export class BadRequestException extends ApplicationException {
    constructor(
        message:string,
        options?:ErrorOptions,
    ){
        super(message, 400, options);
    }
}

export class UnauthorizedException extends ApplicationException {
    constructor(
        message:string,
        options?:ErrorOptions,
    ){
        super(message, 401, options);
    }
}

export class ForbiddenException extends ApplicationException {
    constructor(
        message:string,
        options?:ErrorOptions,
    ){
        super(message, 403, options);
    }
}

export class NotFoundException extends ApplicationException {
    constructor(
        message:string,
        options?:ErrorOptions,
    ){
        super(message, 404, options);
    }
}
export class ConflictException extends ApplicationException {
    constructor(
        message:string,
        options?:ErrorOptions,      
    ){
        super(message, 409, options);
    }
};
export class TooManyRequestsException extends ApplicationException {
    constructor(
        message:string,
        options?:ErrorOptions,
    ){
        super(message, 429, options);
    }
};

export class InternalServerErrorException extends ApplicationException {
    constructor(
        message:string,
        options?:ErrorOptions,
    ){
        super(message, 500, options);
    }
}

export const globalErrorHandler = (error:IErrorResponse, _req:Request, res:Response, _next:NextFunction):void =>{
    const statusCode = error.statusCode || 500;
    const IsDev = env.MODE === 'DEVELOPMENT';
    if(statusCode >= 500 ){
        console.error(error);
    }
    
    res.status(statusCode).json({
        message:error.message || `something went wrong`, ...(IsDev && {stack:error.stack} ),
        cause:error.cause,
    });
}
