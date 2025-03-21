from abc import ABC, abstractmethod
from web.client_factory import HttpClientFactory


class StressTest(ABC):
    def __init__(self):
        self._http_factory = HttpClientFactory()

    def interval(self) -> int:
        return 1000

    @abstractmethod
    def test(self, user_id: str) -> None:
        pass

    @property
    def http(self) -> HttpClientFactory:
        return self._http_factory
