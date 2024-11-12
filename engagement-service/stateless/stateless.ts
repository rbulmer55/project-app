import * as cdk from 'aws-cdk-lib';
import {
  AwsIntegration,
  CognitoUserPoolsAuthorizer,
  Cors,
  JsonSchemaType,
  Model,
  PassthroughBehavior,
  RequestValidator,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { ITableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import {
  corsResponseParamters,
  errorIntegrationResponses,
  generateMethodOptions,
} from '../utils/api-gateway';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager';
import { ApiGateway } from 'aws-cdk-lib/aws-route53-targets';
import { Stage } from 'types';
import { EnvironmentConfig } from 'app-config';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

interface EngagementStackProps extends cdk.StackProps {
  engagementTable: ITableV2;
  appConfig: EnvironmentConfig;
}

export class EngagementServiceStatelessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: EngagementStackProps) {
    super(scope, id, props);

    if (!props?.engagementTable || !props.appConfig)
      throw Error('Missing Stateless Stack Props');

    /**
     * Fetch our userPool where users tokens will be authenticated
     */
    const pool = UserPool.fromUserPoolId(
      this,
      'CognitoUserPool',
      props.appConfig.env.userPoolId,
    );
    /**
     * Create a cognito authoriser
     */
    const auth = new CognitoUserPoolsAuthorizer(this, 'CognitoAuthoriser', {
      cognitoUserPools: [pool],
    });

    /**
     * Create an role for our integration permissions
     */
    const engagementApiRole = new Role(this, 'ApiGatewayRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });
    props.engagementTable.grantReadWriteData(engagementApiRole);

    /**
     * For prod - retrieve the hosted zone for the api
     */
    let hostedZone;
    if (props.appConfig.shared.stage !== Stage.develop) {
      // Retrieve the hosted zone
      hostedZone = HostedZone.fromHostedZoneAttributes(this, 'hostedZone', {
        hostedZoneId: props.appConfig.env.hostedZoneId,
        zoneName: props.appConfig.shared.domain,
      });
    }

    /**
     * Create our engagement API
     */
    const engagementApi = new RestApi(this, 'engagementServiceAPI', {
      defaultCorsPreflightOptions: {
        allowOrigins: [
          `${props.appConfig.shared.domainProtocol}://${props.appConfig.shared.domain}`,
        ],
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowMethods: Cors.ALL_METHODS,
        allowCredentials: true,
      },
      /**
       * For Prod - set up the domain
       */
      ...(props.appConfig.shared.stage !== Stage.develop
        ? {
            domainName: {
              domainName: `engagements.api.${props.appConfig.shared.domain}`,
              certificate: new Certificate(this, 'Certificate', {
                domainName: `engagements.api.${props.appConfig.shared.domain}`,
                validation: CertificateValidation.fromDns(hostedZone),
              }),
            },
          }
        : {}),
    });

    /**
     * For Prod - Set up our DNS
     */
    if (props.appConfig.shared.stage !== Stage.develop) {
      if (!hostedZone)
        throw Error('Hosted Zone not set for non-dev environment');
      // Create the DNS entry for our website and point to the ALB
      new ARecord(this, 'ARecord', {
        zone: hostedZone,
        recordName: `engagements.api.${props.appConfig.shared.domain}`,
        ttl: cdk.Duration.minutes(5),
        target: RecordTarget.fromAlias(new ApiGateway(engagementApi)),
      });
    }

    /** API Key */
    const key = engagementApi.addApiKey('engagement-api-key', {
      apiKeyName: `${props.appConfig.shared.serviceName}-${props.appConfig.shared.stage}`,
      // value: apiKeySecret.secretValue.toString(),
    });
    const plan = engagementApi.addUsagePlan('usage-plan', {
      name: `${props.appConfig.shared.serviceName}-${props.appConfig.shared.stage}`,
      throttle: {
        rateLimit: 10,
        burstLimit: 2,
      },
      apiStages: [{ stage: engagementApi.deploymentStage }],
    });
    plan.addApiKey(key);

    /**
     * Describe our API routes
     */
    const v1 = engagementApi.root.addResource('v1');
    const v1Clients = v1.addResource('clients');
    const v1ClientsWithId = v1Clients.addResource('{cid}');
    const v1Projects = v1ClientsWithId.addResource('projects');
    const v1ProjectsWithId = v1Projects.addResource('{pid}');
    const v1Engagements = v1ProjectsWithId.addResource('engagements');
    const v1Summaries = v1ProjectsWithId.addResource('summaries');

    /**
     * List Clients
     */
    v1Clients.addMethod(
      'GET',
      new AwsIntegration({
        service: 'dynamodb',
        action: 'Query',
        options: {
          credentialsRole: engagementApiRole,
          passthroughBehavior: PassthroughBehavior.NEVER,
          integrationResponses: [
            {
              statusCode: '200',
              responseParameters: corsResponseParamters,
              responseTemplates: {
                'application/json': `
                  #set($inputRoot = $input.path('$'))
                  {
                    "status": "OK",
                    "clients":[
                      #foreach($elem in $inputRoot.Items) {
                          "id": "$elem.id.S",
                          "name": "$elem.name.S",
                          "industry": "$elem.industry.S",
                          "sector": "$elem.sector.S"
                      }
                      #if($foreach.hasNext),#end
                      #end
                    ],
                    "Count": $inputRoot.Count,
                    "ScannedCount": $inputRoot.ScannedCount
                  }`,
              },
            },
            ...errorIntegrationResponses,
          ],
          requestTemplates: {
            'application/json': JSON.stringify({
              TableName: `${props.engagementTable.tableName}`,
              IndexName: 'gsi1',
              KeyConditionExpression: '#attr1 = :attr1Val',
              ExpressionAttributeNames: {
                '#attr1': 'attr1',
              },
              ExpressionAttributeValues: {
                ':attr1Val': {
                  S: 'Client',
                },
              },
            }),
          },
        },
      }),
      { ...generateMethodOptions(auth) },
    );

    /**
     * Create Client
     */
    v1Clients.addMethod(
      'POST',
      new AwsIntegration({
        service: 'dynamodb',
        action: 'PutItem',
        options: {
          credentialsRole: engagementApiRole,
          passthroughBehavior: PassthroughBehavior.NEVER,
          integrationResponses: [
            {
              statusCode: '200',
              responseParameters: corsResponseParamters,
              responseTemplates: {
                'application/json': `
                    {
                      "status": "OK",
                      "body":"client created successfully."
                    }`,
              },
            },
            ...errorIntegrationResponses,
          ],
          requestTemplates: {
            'application/json': JSON.stringify({
              TableName: `${props.engagementTable.tableName}`,
              Item: {
                pk: { S: 'Client#$context.requestId' },
                sk: { S: '$context.requestTimeEpoch' },
                attr1: { S: 'Client' },
                attr2: { S: "$input.path('$').name" },
                id: { S: '$context.requestId' },
                name: { S: "$input.path('$').name" },
                industry: { S: "$input.path('$').industry" },
                sector: { S: "$input.path('$').sector" },
                createdAt: { S: '$context.requestTimeEpoch' },
              },
            }),
          },
        },
      }),
      {
        requestValidator: new RequestValidator(this, 'PostClientValidator', {
          restApi: engagementApi,
          requestValidatorName: 'postClientValidator',
          validateRequestBody: true,
        }),
        requestModels: {
          'application/json': new Model(this, 'ClientValidator', {
            restApi: engagementApi,
            contentType: 'application/json',
            description: 'Validating Client request body',
            modelName: 'clientModelCDK',
            schema: {
              type: JsonSchemaType.OBJECT,
              required: ['name', 'industry', 'sector'],
              properties: {
                name: { type: JsonSchemaType.STRING },
                industry: { type: JsonSchemaType.STRING },
                sector: { type: JsonSchemaType.STRING },
              },
            },
          }),
        },
        ...generateMethodOptions(auth),
      },
    );

    /**
     * List Client Projects
     */
    v1Projects.addMethod(
      'GET',
      new AwsIntegration({
        service: 'dynamodb',
        action: 'Query',
        options: {
          credentialsRole: engagementApiRole,
          passthroughBehavior: PassthroughBehavior.NEVER,
          integrationResponses: [
            {
              statusCode: '200',
              responseParameters: corsResponseParamters,
              responseTemplates: {
                'application/json': `
                  #set($inputRoot = $input.path('$'))
                  {
                    "status": "OK",
                    "projects":[
                      #foreach($elem in $inputRoot.Items) {
                          "id": "$elem.id.S",
                          "clientId": "$elem.clientId.S",
                          "name": "$elem.name.S",
                          "startDate": "$elem.startDate.S"
                      }
                      #if($foreach.hasNext),#end
                      #end
                    ],
                    "Count": $inputRoot.Count,
                    "ScannedCount": $inputRoot.ScannedCount
                  }`,
              },
            },
            ...errorIntegrationResponses,
          ],
          requestTemplates: {
            'application/json': JSON.stringify({
              TableName: `${props.engagementTable.tableName}`,
              IndexName: 'gsi2',
              KeyConditionExpression: '#attr1 = :attr1Val',
              ExpressionAttributeNames: {
                '#attr1': 'attr1',
              },
              ExpressionAttributeValues: {
                ':attr1Val': {
                  S: "Project#$input.params('cid')",
                },
              },
              ScanIndexForward: false,
            }),
          },
        },
      }),
      {
        requestValidator: new RequestValidator(this, 'ListProjectValidator', {
          restApi: engagementApi,
          validateRequestParameters: true,
        }),
        requestParameters: { 'method.request.path.cid': true },
        ...generateMethodOptions(auth),
      },
    );

    /**
     * Create Project
     */
    v1Projects.addMethod(
      'POST',
      new AwsIntegration({
        service: 'dynamodb',
        action: 'PutItem',
        options: {
          credentialsRole: engagementApiRole,
          passthroughBehavior: PassthroughBehavior.NEVER,
          requestTemplates: {
            'application/json': JSON.stringify({
              TableName: `${props.engagementTable.tableName}`,
              Item: {
                pk: { S: 'Project#$context.requestId' },
                sk: { S: "Client#$input.params('cid')" },
                attr1: { S: "Project#$input.params('cid')" },
                attr2: { S: '$context.requestTimeEpoch' },
                id: { S: '$context.requestId' },
                clientId: { S: "$input.params('cid')" },
                name: { S: "$input.path('$').name" },
                startDate: { S: "$input.path('$').startDate" },
                createdAt: { S: '$context.requestTimeEpoch' },
              },
            }),
          },
          integrationResponses: [
            {
              statusCode: '200',
              responseParameters: corsResponseParamters,
              responseTemplates: {
                'application/json': `
                    {
                      "status": "OK",
                      "body":"project created successfully."
                    }`,
              },
            },
            ...errorIntegrationResponses,
          ],
        },
      }),
      {
        requestValidator: new RequestValidator(this, 'PostProjectValidator', {
          restApi: engagementApi,
          requestValidatorName: 'postProjectValidator',
          validateRequestBody: true,
          validateRequestParameters: true,
        }),
        requestParameters: { 'method.request.path.cid': true },
        requestModels: {
          'application/json': new Model(this, 'ProjectValidator', {
            restApi: engagementApi,
            contentType: 'application/json',
            description: 'Validating Project request body',
            modelName: 'ProjectModelCDK',
            schema: {
              type: JsonSchemaType.OBJECT,
              required: ['name', 'startDate'],
              properties: {
                name: { type: JsonSchemaType.STRING },
                startDate: { type: JsonSchemaType.STRING },
              },
            },
          }),
        },
        ...generateMethodOptions(auth),
      },
    );

    /**
     * List Project Engagements
     */
    v1Engagements.addMethod(
      'GET',
      new AwsIntegration({
        service: 'dynamodb',
        action: 'Query',
        options: {
          credentialsRole: engagementApiRole,
          passthroughBehavior: PassthroughBehavior.NEVER,
          integrationResponses: [
            {
              statusCode: '200',
              responseParameters: corsResponseParamters,
              responseTemplates: {
                'application/json': `
                  #set($inputRoot = $input.path('$'))
                  {
                    "status": "OK",
                    "engagements":[
                      #foreach($elem in $inputRoot.Items) {
                          "id": "$elem.id.S",
                          "clientId": "$elem.clientId.S",
                          "projectId": "$elem.projectId.S",
                          "description": "$elem.description.S",
                          "value": "$elem.value.S",
                          "engagementDate": "$elem.engagementDate.S"
                      }
                      #if($foreach.hasNext),#end
                      #end
                    ],
                    "Count": $inputRoot.Count,
                    "ScannedCount": $inputRoot.ScannedCount
                  }`,
              },
            },
            ...errorIntegrationResponses,
          ],
          requestTemplates: {
            'application/json': JSON.stringify({
              TableName: `${props.engagementTable.tableName}`,
              IndexName: 'gsi2',
              KeyConditionExpression: '#attr1 = :attr1Val ',
              ExpressionAttributeNames: {
                '#attr1': 'attr1',
              },
              ExpressionAttributeValues: {
                ':attr1Val': {
                  S: "Engagement#$input.params('pid')",
                },
              },
              ScanIndexForward: false,
            }),
          },
        },
      }),
      {
        requestValidator: new RequestValidator(
          this,
          'ListEngagementValidator',
          {
            restApi: engagementApi,
            validateRequestParameters: true,
          },
        ),
        requestParameters: { 'method.request.path.pid': true },
        ...generateMethodOptions(auth),
      },
    );

    /**
     * Create Project Engagement
     */
    v1Engagements.addMethod(
      'POST',
      new AwsIntegration({
        service: 'dynamodb',
        action: 'PutItem',
        options: {
          credentialsRole: engagementApiRole,
          passthroughBehavior: PassthroughBehavior.NEVER,
          requestTemplates: {
            'application/json': JSON.stringify({
              TableName: `${props.engagementTable.tableName}`,
              Item: {
                pk: { S: 'Engagement#$context.requestId' },
                sk: { S: "Project#$input.params('pid')" },
                attr1: { S: "Engagement#$input.params('pid')" },
                attr2: { S: '$context.requestTimeEpoch' },
                id: { S: '$context.requestId' },
                clientId: { S: "$input.params('cid')" },
                projectId: { S: "$input.params('pid')" },
                description: { S: "$input.path('$').description" },
                value: { S: "$input.path('$').value" },
                engagementDate: { S: "$input.path('$').engagementDate" },
                createdAt: { S: '$context.requestTimeEpoch' },
              },
            }),
          },
          integrationResponses: [
            {
              statusCode: '200',
              responseParameters: corsResponseParamters,
              responseTemplates: {
                'application/json': `
                    {
                      "status": "OK",
                      "body":"engagement created successfully."
                    }`,
              },
            },
            ...errorIntegrationResponses,
          ],
        },
      }),
      {
        requestValidator: new RequestValidator(
          this,
          'PostEngagementValidator',
          {
            restApi: engagementApi,
            requestValidatorName: 'postEngagementValidator',
            validateRequestBody: true,
            validateRequestParameters: true,
          },
        ),
        requestParameters: {
          'method.request.path.cid': true,
          'method.request.path.pid': true,
        },
        requestModels: {
          'application/json': new Model(this, 'EngagementValidator', {
            restApi: engagementApi,
            contentType: 'application/json',
            description: 'Validating Engagement request body',
            modelName: 'EngagementModelCDK',
            schema: {
              type: JsonSchemaType.OBJECT,
              required: ['description', 'value', 'engagementDate'],
              properties: {
                description: { type: JsonSchemaType.STRING },
                value: { type: JsonSchemaType.STRING },
                engagementDate: { type: JsonSchemaType.STRING },
              },
            },
          }),
        },
        ...generateMethodOptions(auth),
      },
    );

    /**
     * List Project Summaries
     */
    v1Summaries.addMethod(
      'GET',
      new AwsIntegration({
        service: 'dynamodb',
        action: 'Query',
        options: {
          credentialsRole: engagementApiRole,
          passthroughBehavior: PassthroughBehavior.NEVER,
          integrationResponses: [
            {
              statusCode: '200',
              responseParameters: corsResponseParamters,
              responseTemplates: {
                'application/json': `
                  #set($inputRoot = $input.path('$'))
                  {
                    "status": "OK",
                    "summaries":[
                      #foreach($elem in $inputRoot.Items) {
                          "id": "$elem.id.S",
                          "clientId": "$elem.clientId.S",
                          "projectId": "$elem.projectId.S",
                          "summary": "$elem.summary.S",
                          "updatedAt": "$elem.updatedAt.S"
                      }
                      #if($foreach.hasNext),#end
                      #end
                    ],
                    "Count": $inputRoot.Count,
                    "ScannedCount": $inputRoot.ScannedCount
                  }`,
              },
            },
            ...errorIntegrationResponses,
          ],
          requestTemplates: {
            'application/json': JSON.stringify({
              TableName: `${props.engagementTable.tableName}`,
              IndexName: 'gsi2',
              KeyConditionExpression: '#attr1 = :attr1Val',
              ExpressionAttributeNames: {
                '#attr1': 'attr1',
              },
              ExpressionAttributeValues: {
                ':attr1Val': {
                  S: "Summary#$input.params('pid')",
                },
              },
              ScanIndexForward: false,
              Limit: 1,
            }),
          },
        },
      }),
      {
        requestValidator: new RequestValidator(this, 'ListSummariesValidator', {
          restApi: engagementApi,
          validateRequestParameters: true,
        }),
        requestParameters: { 'method.request.path.pid': true },
        ...generateMethodOptions(auth),
      },
    );
  }
}
