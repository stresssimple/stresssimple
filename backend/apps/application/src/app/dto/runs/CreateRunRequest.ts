export class CreateRunRequest {
  public testId!: string;
  public durationMinutes!: number;
  public rampUpMinutes!: number;
  public users!: number;
  public processes!: number;
  public auditErrors!: 'none' | 'all' | 'some';
  public auditErrorsThreshold?: number;
  public auditSuccesses!: 'none' | 'all' | 'some';
  public auditSuccessesThreshold?: number;
}
