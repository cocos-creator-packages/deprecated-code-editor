This repo is used for code editor, which is based on Ace and Esprima.


# How to test the Editor

You should open a Javascript file in Fireball, or run test like:

* Develop

  ```bash
  npm start -- test --package builtin/code-editor/test/renderer/demo.js
  ```

* Debug

  ```bash
  npm start -- test --package builtin/code-editor/test/renderer/demo.js --detail
  ```
