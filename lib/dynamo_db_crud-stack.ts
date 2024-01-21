import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';


export class DynamoDbCrudStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table
    const table = new dynamodb.Table(this, 'UserTable', {
      partitionKey: { name: "userid", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda function
    const handler = new lambda.Function(this, 'CrudHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'index.main',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // Grant the Lambda function permissions to read/write to the DynamoDB table
    table.grantReadWriteData(handler);

    // API Gateway
    const api = new apigateway.RestApi(this, 'CrudApi');

    const integration = new apigateway.LambdaIntegration(handler);
    const resource = api.root.addResource('user');
    resource.addMethod('GET', integration);    // Read
    resource.addMethod('POST', integration);   // Create
    resource.addMethod('PUT', integration);    // Update
    resource.addMethod('DELETE', integration); // Delete
  }
}

