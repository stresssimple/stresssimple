from stress_test import StressTest
import random


class Test(StressTest):
    def __init__(self):
        super().__init__()
        print("Test initialized", flush=True)
        self.request = 1
        self.google_client = self.http.base_url(
            'https://www.google.com').create()

    # Test function
    async def test(self, user_id: str):
        print(f"Test with {user_id} request number {self.request}", flush=True)
        self.request += 1

        # Send request to google and wait for response
        google_response = await self.google_client.get("").send()
        # print(f"Google response: {google_response.status_code}", flush=True)
        # You can process google_response here as needed

    # Optional interval between tests in milliseconds
    def interval(self):
        return 1
