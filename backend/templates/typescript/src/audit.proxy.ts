import { publisher } from './rabbit.js';

export class AuditProxy {
  private interval: NodeJS.Timeout | undefined;
  private queue: unknown[] = [];
  constructor(
    private readonly failures: 'none' | 'all' | 'some',
    private readonly successes: 'none' | 'all' | 'some',
    private readonly failuresThreshold: number,
    private readonly successesThreshold: number,
  ) {
    this.interval = setInterval(async () => {
      await this.collect();
    }, 1000);
  }

  public audit(record: unknown, success: boolean) {
    if (success) {
      if (this.successes === 'none') return;
      if (this.successes === 'some' && Math.random() > this.successesThreshold)
        return;
    } else {
      if (this.failures === 'none') return;
      if (this.failures === 'some' && Math.random() > this.failuresThreshold)
        return;
    }
    this.queue.push(record);
  }

  private async collect() {
    if (!publisher) return;
    //take first 100 records
    let records = this.queue.splice(0, 100);
    while (records.length > 0) {
      await publisher.send(
        {
          exchange: 'audit',
          routingKey: 'audit',
        },
        records,
      );
      records = this.queue.splice(0, 100);
    }
  }
}

export let auditProxy: AuditProxy | undefined;

export function initAuditProxy(
  failures: 'none' | 'all' | 'some',
  successes: 'none' | 'all' | 'some',
  failuresThreshold: number,
  successesThreshold: number,
) {
  auditProxy = new AuditProxy(
    failures,
    successes,
    failuresThreshold,
    successesThreshold,
  );
}
