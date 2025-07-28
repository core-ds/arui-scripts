import { applyOverrides } from '../configs/util/apply-overrides';

const template = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <title>React-app</title>
    <link
     rel="shortcut icon"
     href="data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23EF3124' /%3E%3C/svg%3E"
    >
  </head>
  <body>
  <div id="react-app"></div>
  <script id="env-settings" type="application/json">
  <%= envConfig %>
  </script>
  </body>
</html>`;

export const htmlTemplate = applyOverrides('html', template);
