import { logger } from '@shared/logger';
import { SQSRecord, StreamRecord } from 'aws-lambda';
import { SyncRedactor } from 'redact-pii';
import { queryGSI1, upsert } from '@adapters/secondary/dynamodb-adapter';
import { config } from '@config/config';
import { EngagementInput } from 'types';
import { summariseProjectEngagements } from '@adapters/secondary/bedrock-adapter';
import { v4 as uuid } from 'uuid';

const redactor = new SyncRedactor();

const tableName = config.get('tableName');

interface CustomPipesDyanmoDBEvent {
  eventID: string;
  eventName: string;
  eventVersion: string;
  eventSource: string;
  awsRegion: string;
  dynamodb: StreamRecord;
}

interface Engagement {
  pk: string;
  sk: string;
  attr1: string;
  attr2: string;
  id: string;
  clientId: string;
  projectId: string;
  description: string;
  value: string;
  engagementDate: string;
  createdAt: string;
}

export async function queueProcessorUseCase(
  newEvent: SQSRecord,
): Promise<SQSRecord> {
  logger.info('UseCase - Received Message:', newEvent.body);
  const newEngagementEvent = JSON.parse(
    newEvent.body,
  ) as CustomPipesDyanmoDBEvent;

  // GET all engagments prior with project id
  const projectId = newEngagementEvent.dynamodb.NewImage?.projectId.S!;
  const clientId = newEngagementEvent.dynamodb.NewImage?.clientId.S!;

  logger.info(
    'UseCase - Fetching assoicated Engagements:',
    JSON.stringify({ projectId, clientId }),
  );

  const { items: allEngagements }: { items: Engagement[] } = await queryGSI1(
    tableName,
    `Engagement#${projectId}`,
  );

  const engagementsInput = allEngagements.map((e): EngagementInput => {
    return {
      description: redactor.redact(e.description),
      valueAdded: redactor.redact(e.value),
      engagementDate: e.engagementDate,
    };
  });

  logger.info(
    'UseCase - Calling GenAI to summarise engagements:',
    JSON.stringify({
      projectId,
      clientId,
      numberOfEngagements: engagementsInput.length,
    }),
  );

  const result = await summariseProjectEngagements(
    engagementsInput,
    'Write a detailed account on how I have helped the customer with their project and added value to their business',
  );

  const summaryId = uuid();
  const summaryDate = new Date();

  logger.info(
    'UseCase - Saving Summary:',
    JSON.stringify({ projectId, clientId, summaryId }),
  );

  const summary = result
    .replace(/[\\]/g, '\\\\')
    .replace(/[\"]/g, '\\"')
    .replace(/[\/]/g, '\\/')
    .replace(/[\b]/g, '\\b')
    .replace(/[\f]/g, '\\f')
    .replace(/[\n]/g, '\\n')
    .replace(/[\r]/g, '\\r')
    .replace(/[\t]/g, '\\t');

  // Create Summary
  await upsert(
    {
      id: summaryId,
      clientId,
      projectId,
      summary,
      createdAt: `${summaryDate.getTime()}`,
      lastUpdated: summaryDate.toISOString(),
      pk: `Summary#${summaryId}`,
      sk: `Project#${projectId}`,
      attr1: `Summary#${projectId}`,
      attr2: `${summaryDate.getTime()}`,
    },
    tableName,
    summaryId,
  );
  return newEvent;
}
