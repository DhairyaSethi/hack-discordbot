docker_compose_file=./docker-compose.yml
docker_file=./Dockerfile

NODE_MODULES_DIR = './node_modules'

default: test

build:
	npm run build

test:
	npm test

up-dev:
	if [ ! -d $(NODE_MODULES_DIR) ]; then \
		echo "node_modules does not exist, installing dependencies..."; \
		npm i; \
	fi
	npm run start

up:
	docker build -f $(docker_file) -t hack-discordbot .
	docker-compose -f $(docker_compose_file) up -d

logs:
	docker-compose logs

logs-live:
	docker-compose logs -f

down:
	docker-compose down