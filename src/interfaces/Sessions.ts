import {JWTPayload} from "jose";

export interface SessionToken extends JWTPayload {
    username: string;
    groups: string[];
}