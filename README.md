#DarwinBots.js

This repo represents the core functionality of the DarwinBots.js app. All
code directly related to the user-facing application can be found in
the DarwinBots.js-Client repo.

Right now the parser supports compiling provided source into an abstract
syntax tree.

Example Source:
```
cond
  eye5 > 40 and
  eye2 < 20
start
  up   <- 10
  left <- refleft + 2
  repo <- .50
stop
```

A Demo program/source is provided, to try it out just clone the repo,
run "npm install" and then run "node demo.js" in the repo's directory.

The demo program just dumps a pretty printed AST.

The parser uses a recursive descent strategy and is essentially a codification
of the modified BNF describing the language. This can be viewed in the
dnaSpec.markdown file.
