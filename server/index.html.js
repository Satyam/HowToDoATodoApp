export default (html, initialState, locale) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>How to do a Todo App</title>
    <link rel="stylesheet" href="/index.css" />
    <link rel="stylesheet" href="/css/bootstrap.min.css" />
    <link rel="stylesheet" href="/css/bootstrap-theme.min.css" />
    <script src="//cdn.polyfill.io/v1/polyfill.min.js?features=Promise,Intl.~locale.en-GB,Intl.~locale.es-ES,Intl.~locale.en-US." defer async></script>
    <script src="/lib/index.js"></script>
    <script id="initialState" type="application/json">${initialState}</script>
  </head>
  <body>
    <div id="contents" class="container-fluid">${html}</div>
    <script src="/lib/${locale}.js"></script>
  </body>
</html>
`;
