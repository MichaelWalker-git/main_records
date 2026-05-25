import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { NagSuppressions } from 'cdk-nag';

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'maine-rms-users',
      selfSignUpEnabled: false,
      signInAliases: { email: true, username: true },
      mfa: cognito.Mfa.REQUIRED,
      mfaSecondFactor: { sms: false, otp: true },
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: cdk.Duration.days(1),
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      advancedSecurityMode: cognito.AdvancedSecurityMode.ENFORCED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      customAttributes: {
        agencyId: new cognito.StringAttribute({ mutable: true, maxLen: 64 }),
        agencyCode: new cognito.StringAttribute({ mutable: true, maxLen: 16 }),
      },
    });

    const groups = ['SystemAdmin', 'ArchivesStaff', 'RecordsOfficer', 'AgencyStaff'];
    groups.forEach((groupName) => {
      new cognito.CfnUserPoolGroup(this, `${groupName}Group`, {
        userPoolId: this.userPool.userPoolId,
        groupName,
        description: `${groupName} role group`,
      });
    });

    this.userPoolClient = this.userPool.addClient('AppClient', {
      authFlows: {
        userSrp: true,
      },
      generateSecret: false,
      preventUserExistenceErrors: true,
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
    });

    new cdk.CfnOutput(this, 'UserPoolId', { value: this.userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: this.userPoolClient.userPoolClientId });

    NagSuppressions.addStackSuppressions(this, [
      { id: 'AwsSolutions-COG2', reason: 'MFA is configured as REQUIRED with TOTP' },
      { id: 'AwsSolutions-COG8', reason: 'Plus tier not required for demo - Advanced Security Mode enabled' },
    ]);
  }
}
