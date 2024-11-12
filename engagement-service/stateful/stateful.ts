import * as cdk from 'aws-cdk-lib';
import { AttributeType, ITableV2, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class EngagementServiceStatefulStack extends cdk.Stack {
  public readonly engagementTable: ITableV2;
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
    });
    this.engagementTable = engagementTable;
  }
}
