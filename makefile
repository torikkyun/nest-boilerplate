docker-dev:
	docker compose -f docker-compose.dev.yml up -d --build

docker-test:
	docker compose -f docker-compose.test.yml up -d --build
