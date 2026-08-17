import { runArtifactsCli } from '../util/run-artifacts-cli';

(async () => {
    await runArtifactsCli('docker-build:compiled');
})();
