.PHONY: local local-run deploy

local: local-run

local-run:
	$(MAKE) -C coders
	cp coders/codexion server/codexion
	( cd server && go run cmd/server/main.go ) &
	( cd visual-replayer && npm run dev )

deploy:
	docker compose build
	docker compose up
