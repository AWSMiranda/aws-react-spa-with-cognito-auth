import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as customResources from "aws-cdk-lib/custom-resources";
import * as path from "path";
import { Construct } from 'constructs';

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      websiteErrorDocument: "index.html",
      websiteIndexDocument: "index.html",
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
    });

    const websiteIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "WebsiteIdentity"
    );
    websiteBucket.grantRead(websiteIdentity);

    const websiteDistribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "WebsiteDistribution",
      {
        errorConfigurations: [
          {
            errorCachingMinTtl: 300,
            errorCode: 404,
            responseCode: 200,
            responsePagePath: "/index.html",
          },
        ],
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: websiteBucket,
              originAccessIdentity: websiteIdentity,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
              },
            ],
          },
        ],
        priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      }
    );

    new s3deploy.BucketDeployment(this, "WebsiteDeploy", {
      sources: [
        s3deploy.Source.asset(`${path.resolve(__dirname)}/../../web/build`),
      ],
      destinationBucket: websiteBucket,
      distribution: websiteDistribution,
      distributionPaths: ["/*"],
      memoryLimit: 1024,
    });

    const ssm = new SsmParameterReader(this, 'ssmTesting', {
      parameterName: 'crossaccounttest',
      region: 'us-west-2'
    })
    new cdk.CfnOutput(this, "endpoint", {
      description: "Frontend Endpoint",
      value: websiteDistribution.distributionDomainName,
      ssmTest: ssm.stringValue
    });

  }
}

interface SsmParameterReaderProps {
  parameterName: string;
  region: string;
}

class SsmParameterReader extends Construct {
  private reader: customResources.AwsCustomResource;

  get stringValue(): string {
    return this.getParameterValue();
  }

  constructor(
    scope: Construct,
    name: string,
    props: SsmParameterReaderProps
  ) {
    super(scope, name);

    const { parameterName, region } = props;

    const customResource = new customResources.AwsCustomResource(
      scope,
      `${name}CustomResource`,
      {
        policy: customResources.AwsCustomResourcePolicy.fromSdkCalls({
          resources: customResources.AwsCustomResourcePolicy.ANY_RESOURCE
        }),
        onUpdate: {
          service: "SSM",
          action: "getParameter",
          parameters: {
            Name: parameterName,
          },
          region,
          physicalResourceId: customResources.PhysicalResourceId.of(
            Date.now().toString()
          ),
          assumedRoleArn: 'arn:aws:iam::891004053088:role/crossaccountest'
        },
      }
    );

    this.reader = customResource;
  }

  private getParameterValue(): string {
    return this.reader.getResponseField("Parameter.Value");
  }
}
