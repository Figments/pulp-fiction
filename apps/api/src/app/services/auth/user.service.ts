import {
    Injectable,
    Logger,
    UnauthorizedException,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { verify, argon2id } from 'argon2';
import { UsersStore } from '../../db/users/users.store';
import { JwtPayload } from '@dragonfish/shared/models/auth';
import {
    FrontendUser,
    ChangeUsername,
    ChangeEmail,
    ChangePassword,
    ChangeBio,
    UpdateTagline,
} from '@dragonfish/shared/models/users';
import { IUser } from '../../shared/auth';

@Injectable()
export class UserService implements IUser {
    private readonly logger: Logger = new Logger(UserService.name);

    constructor(private readonly usersStore: UsersStore) {}

    async getOneUser(userId: string): Promise<FrontendUser> {
        return await this.usersStore.getOneUser(userId);
    }

    async changeUsername(jwtPayload: JwtPayload, changeUsernameRequest: ChangeUsername): Promise<FrontendUser> {
        const potentialUser = await this.usersStore.findOneById(jwtPayload.sub);
        if (!potentialUser) {
            // This happening is _super_ fishy. Either a well-meaning tinkerer playing with the API, or something malicious.
            throw new NotFoundException(`Can't seem to find you. Try again in a little bit.`);
        }

        if (!(await verify(potentialUser.password, changeUsernameRequest.currentPassword, { type: argon2id }))) {
            throw new UnauthorizedException(`You don't have permission to do that.`);
        }
        const updatedUser = await this.usersStore.changeUsername(potentialUser._id, changeUsernameRequest.newUsername);
        return this.usersStore.buildFrontendUser(updatedUser);
    }

    async changeEmail(jwtPayload: JwtPayload, changeEmailRequest: ChangeEmail): Promise<FrontendUser> {
        const potentialUser = await this.usersStore.findOneById(jwtPayload.sub);
        if (!potentialUser) {
            // This happening is _super_ fishy. Either a well-meaning tinkerer playing with the API, or something malicious.
            throw new NotFoundException(`Can't seem to find you. Try again in a little bit.`);
        }

        if (!(await verify(potentialUser.password, changeEmailRequest.currentPassword, { type: argon2id }))) {
            throw new UnauthorizedException(`You don't have permission to do that.`);
        }

        const updatedUser = await this.usersStore.changeEmail(potentialUser._id, changeEmailRequest.newEmail);
        return this.usersStore.buildFrontendUser(updatedUser);
    }

    async changePassword(user: JwtPayload, newPassword: ChangePassword): Promise<FrontendUser> {
        const potentialUser = await this.usersStore.findOneById(user.sub);
        if (potentialUser) {
            try {
                if (await verify(potentialUser.password, newPassword.currentPassword, { type: argon2id })) {
                    const newUserInfo = await this.usersStore.changePassword(potentialUser._id, newPassword);
                    return this.usersStore.buildFrontendUser(newUserInfo);
                } else {
                    throw new UnauthorizedException(`You don't have permission to do that.`);
                }
            } catch (err) {
                throw new InternalServerErrorException(
                    `Something went wrong verifying your credentials. Try again in a little bit.`
                );
            }
        } else {
            throw new NotFoundException(
                `It doesn't look like you exist! Try again in a little bit, or create an account.`
            );
        }
    }

    async updateBio(user: JwtPayload, newProfileInfo: ChangeBio): Promise<FrontendUser> {
        const newUserInfo = await this.usersStore.updateBio(user.sub, newProfileInfo);
        return this.usersStore.buildFrontendUser(newUserInfo);
    }

    async agreeToPolicies(user: JwtPayload): Promise<FrontendUser> {
        const updatedUserInfo = await this.usersStore.agreeToPolicies(user.sub);
        return this.usersStore.buildFrontendUser(updatedUserInfo);
    }

    async updateAvatar(user: JwtPayload, newAvatarUrl: string): Promise<FrontendUser> {
        const updatedUser = await this.usersStore.updateAvatar(user.sub, newAvatarUrl);
        return this.usersStore.buildFrontendUser(updatedUser);
    }

    async updateTagline(user: JwtPayload, newTagline: UpdateTagline): Promise<FrontendUser> {
        const updatedUser = await this.usersStore.updateTagline(user.sub, newTagline.newTagline);
        return this.usersStore.buildFrontendUser(updatedUser);
    }
}
