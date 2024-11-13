import { SQSRecord } from 'aws-lambda';

export async function queueProcessorUseCase(
  newEvent: SQSRecord,
): Promise<SQSRecord> {
  const record = JSON.parse(newEvent.body) as Record<string, any>;

  // TODO - process the record using a secondary adapter

  return newEvent;
}
