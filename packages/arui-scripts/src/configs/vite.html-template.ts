import applyOverrides from './util/apply-overrides';
import configs from './app-configs';

export const viteHtmlTemplate = applyOverrides('viteHtml', `<!DOCTYPE html>
<html lang="en">
  <head>
  </head>
  <body>
    <script type="module" src="${configs.clientEntry}"></script>
  </body>
</html>`)
