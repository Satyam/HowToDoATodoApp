export default (html, initialState) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>How to do a Todo App</title>
    <link rel="stylesheet" href="/index.css" />
    <link rel="stylesheet" href="/css/bootstrap.min.css" />
    <link rel="stylesheet" href="/css/bootstrap-theme.min.css" />
    <script id="initialState" type="application/json">${initialState}</script>
  </head>
  <body>
    <div id="contents" class="container-fluid">${html}</div>
    <script src="//cdn.polyfill.io/v1/polyfill.min.js?features=Promise" defer async></script>
    <script src="/lib/bundle.js"></script>
  </body>
</html>
`;
