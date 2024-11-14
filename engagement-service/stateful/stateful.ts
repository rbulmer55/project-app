import { EnvironmentConfig } from 'app-config';
import * as cdk from 'aws-cdk-lib';
import {
  AttributeType,
  ITableV2,
  StreamViewType,
  TableV2,
} from 'aws-cdk-lib/aws-dynamodb';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { CfnPipe } from 'aws-cdk-lib/aws-pipes';
import { IQueue, Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

interface EngagementStatefulProps extends cdk.StackProps {
  appConfig: EnvironmentConfig;
}

export class EngagementServiceStatefulStack extends cdk.Stack {
  public readonly engagementTable: ITableV2;
  public readonly engagementQueue: IQueue;
  constructor(scope: Construct, id: string, props: EngagementStatefulProps) {
    super(scope, id, props);

    const engagementTable = new TableV2(this, 'EngagementTable', {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      globalSecondaryIndexes: [
        {
          indexName: 'gsi1',
          partitionKey: { name: 'attr1', type: AttributeType.STRING },
        },
        {
          indexName: 'gsi2',
          partitionKey: { name: 'attr1', type: AttributeType.STRING },
          sortKey: { name: 'attr2', type: AttributeType.STRING },
        },
      ],
      dynamoStream: StreamViewType.NEW_IMAGE,
    });
    this.engagementTable = engagementTable;

    const engagementDlq = new Queue(this, 'EngagementsDlq', {
      retentionPeriod: cdk.Duration.days(14),
      fifo: true,
    });
    const engagementQueue = new Queue(this, 'EngagementsQueue', {
      fifo: true,
      contentBasedDeduplication: true,
      deadLetterQueue: { queue: engagementDlq, maxReceiveCount: 3 },
    });
    this.engagementQueue = engagementQueue;

    const role = new Role(this, 'DynamoDbHandlerRole', {
      description:
        'Role assumed by the Pipes to transfer data from DynamoDB streams to SQS',
      assumedBy: new ServicePrincipal('pipes.amazonaws.com'),
    });
    engagementQueue.grantSendMessages(role);
    engagementTable.grantStreamRead(role);

    const logGroup = new LogGroup(this, 'EventBridgePipeLogGroup', {
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Optional: delete log group on stack deletion
    });

    new CfnPipe(this, 'DynamoDbToSqsPipe', {
      roleArn: role.roleArn,
      source: engagementTable.tableStreamArn!,
      sourceParameters: {
        dynamoDbStreamParameters: {
          startingPosition: 'LATEST',
          batchSize: 1,
        },
        filterCriteria: {
          filters: [
            {
              pattern: JSON.stringify({
                dynamodb: {
                  NewImage: {
                    pk: { S: [{ prefix: 'Engagement' }] }, //Filter for where our pk contains Engagement#
                  },
                },
              }),
            },
          ],
        },
      },
      target: engagementQueue.queueArn,
      targetParameters: {
        sqsQueueParameters: {
          messageGroupId: `$.dynamodb.Keys.pk.S`, // Use PK as MessageGroupId
          messageDeduplicationId: `$.eventID`, // Use eventID for deduplication
        },
      },
      logConfiguration: {
        level: 'INFO',
        includeExecutionData: ['ALL'],
        cloudwatchLogsLogDestination: { logGroupArn: logGroup.logGroupArn },
      },
    });
  }
}
