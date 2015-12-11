This repo is used for code editor, which is based on Ace and Esprima.


# How to test the Editor

Run these commands in root of this project:

* npm install
* gulp update-electron
* ./start.sh

# Develop

```bash
npm start -- test --package builtin/code-editor/test/renderer/demo.js
```

# Debug

```bash
npm start -- test --package builtin/code-editor/test/renderer/demo.js --detail
```
