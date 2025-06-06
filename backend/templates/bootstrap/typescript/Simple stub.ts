import { StressTest } from './StressTest.js';

/**
 * Test class that extends the StressTest base class.
 * This class is used to perform stress testing by sending HTTP requests to a specified server.
 */
export class Test extends StressTest {
  // Counter to track the number of requests made
  private request: number = 1;

  // HTTP client instance configured with the base URL
  private cli = this.http
    .baseUrl('http://localhost:3333') // Stub server URL
    // .header('x-stub-delay', '100') // Uncomment this line to add a delay to all requests
    .create();

  /**
   * Executes the test by sending an HTTP GET request to the server.
   * @param userId - A unique identifier for the user performing the test.
   */
  public async test(userId: string): Promise<void> {
    // Uncomment the following line for debugging purposes
    // console.log("Test with " + userId + ' request number ' + this.request++);

    // Send an HTTP GET request to the server and wait for the response
    await this.cli
      .get('/some-endpoint')
      // Uncomment the following lines to send other types of requests
      // .post('Post request', { userId: userId })
      // .put('Put request', { userId: userId })
      .header('userId', userId)
      .name('stub server')
      .send();
  }

  /**
   * Specifies the interval between consecutive tests in milliseconds.
   * @returns The interval duration in milliseconds.
   */
  public interval(): number {
    return 10;
  }
}
