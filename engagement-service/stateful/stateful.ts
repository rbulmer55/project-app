import * as cdk from 'aws-cdk-lib';
import {
  AttributeType,
  ITableV2,
  StreamViewType,
  TableV2,
} from 'aws-cdk-lib/aws-dynamodb';
import {
  Effect,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { CfnPipe } from 'aws-cdk-lib/aws-pipes';
import { IQueue, Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export class EngagementServiceStatefulStack extends cdk.Stack {
  public readonly engagementTable: ITableV2;
  public readonly engagementQueue: IQueue;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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
      deadLetterQueue: { queue: engagementDlq, maxReceiveCount: 3 },
    });
    this.engagementQueue = engagementQueue;

    const role = new Role(this, 'DynamoDbHandlerRole', {
      description:
        'Role assumed by the Pipes to transfer data from DynamoDB streams to SQS',
      assumedBy: new ServicePrincipal('pipes.amazonaws.com'),
    });

    role.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['sqs:SendMessage'],
        resources: [engagementQueue.queueArn],
      }),
    );

    role.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'dynamodb:DescribeStream',
          'dynamodb:GetRecords',
          'dynamodb:GetShardIterator',
          'dynamodb:ListStreams',
        ],
        resources: [engagementTable.tableStreamArn!],
      }),
    );

    new CfnPipe(this, 'DynamoDbToSqsPipe', {
      roleArn: role.roleArn,
      source: engagementTable.tableStreamArn!,
      sourceParameters: {
        dynamoDbStreamParameters: {
          startingPosition: 'LATEST', // Start from the latest records
          batchSize: 1, // Process items individually
        },
      },
      target: engagementQueue.queueArn,
      targetParameters: {
        sqsQueueParameters: {
          messageGroupId: 'default', // Required for FIFO queues
        },
      },
    });
  }
}
