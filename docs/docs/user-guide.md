# User Guide

Lets have a look at a full example of how to use the **StressSimple** application.


## How it works in a bit more details.

You need to create a class name `Test` that extends the `StressTest` class. This class will be used to perform stress testing by sending HTTP requests. The `Test` class must implement the `test` method, which sends an HTTP request to the server. The `interval` method specifies the interval between consecutive tests in milliseconds is optional.


* The `test` method is called repeatedly by the application to send HTTP requests to the server.
* The `interval` method is called to specify the interval between consecutive tests in milliseconds. If the method is not implemented, the default interval is 1000 milliseconds.
* A test consider as failure if an Exception is thrown during the execution of the `test` method.

## Sample Test Script
```typescript
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

```

## Test Execution
![Test execution](./images/ScreenshotRuns.png)

### Test Execution - settings
* **Number of users**: The number of users to simulate.
* **Duration**: The duration of the test in seconds.
* **Ramp-up time**: The time in seconds to ramp-up to the number of users.

### Screen actions
* Click on `Run` button to start a test execution.
* Click on `Stop` button to stop the test execution for a running test to cancel the execution.
* Click on `Delete` button to delete a test execution.
* Click on a execution row to see the details of the test execution.


## Test results

### Overview
![Test results](./images/ScreenshotOverview.png)
* This screen shows graphical representation of the test results in real time.

### Logs
Just open the tab. `console.log` messages or `print` messages are displayed here.

### Audit
![Audit](./images/ScreenshotAudit.png)
* Details for the http requests sent during execution.
