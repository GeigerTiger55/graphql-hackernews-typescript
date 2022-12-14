//Create the context

import { PrismaClient } from "@prisma/client";
import { decodeAuthHeader, AuthTokenPayload } from "./utils/auth";
import { Request } from "express";

export const prisma = new PrismaClient();

//define Context interface - specifies what objects 
//will be attached to the context object
export interface Context {
    prisma: PrismaClient;
    userId?: number;
};

//export the context object so that it can be imported 
//and used by GraphQL server
export const context = ({ req }: { req: Request }): Context => {
    const token = 
        req && req.headers.authorization
            ? decodeAuthHeader(req.headers.authorization)
            : null;
            
        return {
            prisma,
            userId: token?.userId,
        };
};