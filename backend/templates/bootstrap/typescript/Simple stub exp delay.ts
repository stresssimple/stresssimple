import { StressTest } from './StressTest.js';

export class Test extends StressTest {
  private request: number = 1;
  // Create http client
  private cli = this.http.baseUrl('http://localhost:3333').create();

  private users: Set<string> = new Set<string>();

  // Test function
  public async test(userId: string): Promise<void> {
    // console.log("Test with " + userId + ' request number '+this.request++);
    this.users.add(userId);

    const delay = this.users.size * 100;

    // Send request to google and wait for response
    await this.cli
      .get('')
      .header('x-stub-delay', delay.toString())
      .name('stub server')
      .send();
  }

  // Optional interval between tests in milliseconds
  public interval(): number {
    return 10;
  }
}
