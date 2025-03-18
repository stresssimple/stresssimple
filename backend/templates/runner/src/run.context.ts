import Redis from 'ioredis';

export class RunContent {
  public runId!: string;
  public testId!: string;
  public redis!: Redis.Redis;
}

export const ctx = new RunContent();
