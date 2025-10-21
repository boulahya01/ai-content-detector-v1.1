from pydantic import BaseSettings, validator
from typing import List

class Settings(BaseSettings):
	API_URL: str = "http://localhost:8000"
	FRONTEND_URLS: str = "http://localhost:5173,http://127.0.0.1:5173"

	@property
	def frontend_origins(self) -> List[str]:
		# Normalize and split URLs
		return [url.rstrip('/') for url in self.FRONTEND_URLS.split(',') if url]

	@property
	def api_url(self) -> str:
		# Ensure API_URL does not end with /api
		return self.API_URL.rstrip('/').replace('/api', '')

settings = Settings()
