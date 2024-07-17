import { configs } from '../app-configs';
import applyOverrides from '../util/apply-overrides';

export const viteHtmlTemplate = applyOverrides('viteHtml', `<!DOCTYPE html>
<html lang="en">
  <head>
  <title>Fake page</title>
  </head>
  <body>
    <script type="module" src="${configs.clientEntry}"></script>
  </body>
</html>`)
