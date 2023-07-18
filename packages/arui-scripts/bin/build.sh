set -e;
tsc --project tsconfig-local.json;cp ./src/configs/mq.css build/configs/mq.css;
