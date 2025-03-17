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
    public test(userId: string): void {
        console.log("Test with " + userId);
    }

    public interval(): number{
        return Math.random() * 1000;
    }

}
```

