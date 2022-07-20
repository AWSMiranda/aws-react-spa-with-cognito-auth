import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { CfnOutput } from "aws-cdk-lib/core";
import { Construct } from 'constructs';

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly client: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, "UserPool", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      mfa: cognito.Mfa.REQUIRED,
      mfaSecondFactor: {
        otp: true,
        sms: false,
      },
    });

    const client = userPool.addClient("WebClient", {
      userPoolClientName: "webClient",
      idTokenValidity: cdk.Duration.days(1),
      accessTokenValidity: cdk.Duration.days(1),
      authFlows: {
        userPassword: true,
        userSrp: true,
        custom: true,
      },
    });

    this.userPool = userPool;
    this.client = client;
    process.env.AWS_REGION = 'us-west-2'
    process.env.USER_POOL_ID = userPool.userPoolId
    process.env.USER_POOL_CLIENT_ID = client.userPoolClientId

    new CfnOutput(this, "CognitoUserPoolId", {
      value: userPool.userPoolId,
      description: "userPoolId required for frontend settings",
    });
    new CfnOutput(this, "CognitoUserPoolWebClientId", {
      value: client.userPoolClientId,
      description: "clientId required for frontend settings",
    });
  }
}
