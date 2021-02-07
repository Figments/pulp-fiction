import {
    Injectable,
    Logger,
    UnauthorizedException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify, argon2id } from 'argon2';
import { nanoid } from 'nanoid';

import { User, FrontendUser, CreateUser, AuditSession } from '@dragonfish/models/users';
import { UsersStore } from '../../db/users/users.store';
import { JwtPayload } from '@dragonfish/models/auth';
import { IAuth } from '../../shared/auth';

@Injectable()
export class AuthService implements IAuth {
    private readonly logger: Logger = new Logger(AuthService.name);

    constructor(private readonly usersService: UsersStore, private readonly jwtService: JwtService) {}

    async validateUser(email: string, password: string): Promise<User> {
        const potentialUser = await this.usersService.findOneByEmail(email);
        if (potentialUser) {
            try {
                if (await verify(potentialUser.password, password, { type: argon2id })) {
                    return potentialUser;
                } else {
                    throw new UnauthorizedException('Either your email or password is invalid.');
                }
            } catch (err) {
                throw new InternalServerErrorException(
                    'Something went wrong logging you in. Try again in a little bit.',
                );
            }
        } else {
            throw new NotFoundException("Looks like you don't exist yet. Why not try signing up?");
        }
    }

    async register(req: any, newUser: CreateUser): Promise<FrontendUser> {
        const addedUser = await this.usersService.createUser(newUser);
        this.logger.log(`New user created with ID: ${addedUser._id}`);
        const sessionId = nanoid();
        const newSession = await this.usersService.addRefreshToken(addedUser._id, sessionId);
        return this.login(addedUser, req, sessionId, newSession.expires);
    }

    async login(user: User, req: any, sessionId?: string, sessionExpiry?: Date): Promise<FrontendUser> {
        const payload: JwtPayload = {
            username: user.username,
            roles: user.audit.roles,
            sub: user._id,
        };
        if (sessionId) {
            req._cookies = [
                { name: 'refreshToken', value: sessionId, options: { httpOnly: true, expires: sessionExpiry } },
            ];
        } else {
            req._cookies = [{ name: 'refreshToken', value: '', options: { httpOnly: true, expires: Date.now() } }];
        }
        return this.usersService.buildFrontendUser(user, this.jwtService.sign(payload));
    }

    logout(req: any): void {
        req._cookies = [
            { name: 'refreshToken', value: '', options: { httpOnly: true, expires: new Date(Date.now()) } },
        ];
    }

    async refreshLogin(user: JwtPayload): Promise<string> {
        const validatedUser = await this.usersService.findOneById(user.sub);
        const newPayload: JwtPayload = {
            username: validatedUser.username,
            roles: validatedUser.audit.roles,
            sub: validatedUser._id,
        };

        return this.jwtService.sign(newPayload);
    }

    async addRefreshToken(userId: string, sessionId: string): Promise<AuditSession> {
        return await this.usersService.addRefreshToken(userId, sessionId);
    }

    async checkRefreshToken(userId: string, sessionId: string): Promise<boolean> {
        return await this.usersService.checkRefreshToken(userId, sessionId);
    }

    async clearRefreshToken(userId: string, oldSessionId: string): Promise<void> {
        return await this.usersService.clearRefreshToken(userId, oldSessionId);
    }
}
