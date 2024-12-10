import {
    CanActivate,
    ExecutionContext,
    Inject,
    UnauthorizedException
} from '@nestjs/common';
import {Request} from 'express';
import {JwtService} from "../services/JwtService.js";
import {IS_PUBLIC_KEY, Roles} from "./RolesDecorator.js";
import {Reflector} from "@nestjs/core";
import {SessionToken} from "../interfaces/Sessions.js";

export class JwtAuthGuard implements CanActivate {

    constructor(
        @Inject(Reflector)
        private readonly reflector: Reflector,
        @Inject(JwtService)
        private readonly jwtService: JwtService
    ) {
    }

    async canActivate(ctx: ExecutionContext) {
        const context = ctx.switchToHttp();
        const request = context.getRequest<Request>();
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            ctx.getHandler(),
            ctx.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const roles = this.reflector.get(Roles, ctx.getHandler());
        if (!roles) {
            return false;
        }
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        const payload = await this.jwtService.isValidToken(token);
        if (!payload) {
            throw new UnauthorizedException();
        }
        // 💡 We're assigning the payload to the request object here
        // so that we can access it in our route handlers
        // @ts-ignore
        request.user = {payload};
        // @ts-ignore
        const user = request.user;
        return this.matchRoles(roles, user.payload);
    }

    private matchRoles(roles: string[], user: SessionToken) {
        const temp = roles.filter(Set.prototype.has, new Set(user.groups));
        return temp.length > 0;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request?.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}