## Getting started
### Installation
```bash
docker compose -f ./docker-compose.yaml build
docker compose -f ./docker-compose.yaml up
```
Open http://localhost:5000/ in your browser


## Simple stress test example
```typescript
import { StressTest } from './StressTest.js';

export class Test extends StressTest {
    private request:number = 1;
    // Create http client
    private googleClient = this.http.baseUrl("https://google.com").create();

    // Test function
    public async test(userId: string): Promise<void> {
        console.log("Test with " + userId + ' request number '+this.request++);

        // Send request to google and wait for response
        const googleResponse = await this.googleClient.get("").name("google").send();
    }

    // Optional interval between tests in milliseconds
    public interval(): number { 
        return Math.random() * 1000;
    }
}
```

