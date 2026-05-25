import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  ListUsersCommand,
  AdminUpdateUserAttributesCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { UsersRepository } from '../repositories/UsersRepository';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  private cognitoClient: CognitoIdentityProviderClient;

  constructor(private usersRepo: UsersRepository) {
    this.cognitoClient = new CognitoIdentityProviderClient({ region: config.cognito.region });
  }

  async createUser(data: { email: string; firstName: string; lastName: string; agencyId: string; roles: string[] }) {
    const existing = await this.usersRepo.findByEmail(data.email);
    if (existing) throw new AppError(409, 'User already exists');

    const cognitoResponse = await this.cognitoClient.send(
      new AdminCreateUserCommand({
        UserPoolId: config.cognito.userPoolId,
        Username: data.email,
        UserAttributes: [
          { Name: 'email', Value: data.email },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'custom:agencyId', Value: data.agencyId },
          { Name: 'custom:roles', Value: data.roles.join(',') },
        ],
        DesiredDeliveryMediums: ['EMAIL'],
      })
    );

    const cognitoId = cognitoResponse.User?.Username || data.email;

    const user = await this.usersRepo.create({
      cognito_id: cognitoId,
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      agency_id: data.agencyId,
      roles: data.roles,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    } as any);

    return user;
  }

  async deactivateUser(userId: string) {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new AppError(404, 'User not found');

    await this.cognitoClient.send(
      new AdminDisableUserCommand({
        UserPoolId: config.cognito.userPoolId,
        Username: user.cognito_id,
      })
    );

    return this.usersRepo.deactivate(userId);
  }

  async updateRoles(userId: string, roles: string[]) {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new AppError(404, 'User not found');

    await this.cognitoClient.send(
      new AdminUpdateUserAttributesCommand({
        UserPoolId: config.cognito.userPoolId,
        Username: user.cognito_id,
        UserAttributes: [{ Name: 'custom:roles', Value: roles.join(',') }],
      })
    );

    return this.usersRepo.updateRoles(userId, roles);
  }

  async listUsers(agencyId?: string) {
    if (agencyId) {
      return this.usersRepo.findByAgency(agencyId);
    }
    return this.usersRepo.findAll();
  }
}
