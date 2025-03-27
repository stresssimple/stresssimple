export class ValidateJsResponse {
  public isValid!: boolean;
  public errors!: JsValidationError[];
}

export class JsValidationError {
  public message!: string;
  public line?: number;
  public character?: number;
}
