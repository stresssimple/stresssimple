import { StressTest } from './StressTest.js';

export class Test extends StressTest {
  private request: number = 1;
  // Create http client
  private cli = this.http.baseUrl('http://localhost:3333').create();

  // Test function
  public async test(userId: string): Promise<void> {
    // console.log("Test with " + userId + ' request number '+this.request++);

    // Send request to google and wait for response
    await this.cli.get('').name('stub server').send();
  }

  // Optional interval between tests in milliseconds
  public interval(): number {
    return 10;
  }
}
