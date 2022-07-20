#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib/core";
import { APIStack } from "../lib/api";
import { AuthStack } from "../lib/auth";

const app = new cdk.App();
const env = {
  region: "us-west-2",
};
const auth = new AuthStack(app, "APIStack", { env });
new APIStack(app, "AuthStack", {
  userPool: auth.userPool,
  env,
});
