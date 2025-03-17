export class RunState {
  public testId!: string;
  public runId!: string;
  public status!: string;
  public durationMinutes!: number;
  public rampUpMinutes!: number;
  public users!: number;
  public startTime!: Date;
  public endTime?: Date;
  public isFinal: boolean;
  public lastUpdated!: Date;
  public error?: string;
  public auditType?:
    | 'SomeErrors'
    | 'AllErrors'
    | 'AllErrorAndSomeRequests'
    | 'SomeRequests'
    | 'AllRequests';

  public auditRequestsPercentage?: number;
}
