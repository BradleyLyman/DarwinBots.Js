#DarwinBots.js

This repo represents the core functionality of the DarwinBots.js app. All
code directly related to the user-facing application can be found in
the DarwinBots.js-Client repo.

JsDoc can be found here: http://bradlyman.github.io/DarwinBots.Js/

Right now the parser supports compiling provided source into an abstract
syntax tree.

Example Source:
```
'Animal_Minimalis
'By: Nums -- Modified by Brad Lyman
'Good for mutation sims and for
'newbies to see how a basic bot works.
'Contains everything necessary for it
'to survive and reproduce.
'Syntax modified for DarwinBots.js,
'the semantics have not changed.

' Gene 1 Food Finder
cond
  eye5 > 0
  and refeye != myeye
start
  dx <- refveldx
  up <- refvelup + 30
stop

' Gene 2 Eat Food
cond
  eye5 > 50
  and refeye != myeye
start
  shoot <- -1
  up    <- refvelup
stop

' Gene 3 Avoiding Family
cond
  eye5 = 0
  or refeye = myeye
start
  rnd   <- 314
  aimdx <- rnd
stop

' Gene 4 Reproduce
cond
  nrg > 20000
start
  repro <- 10
stop
end
```

A Demo program/source is provided, to try it out just clone the repo,
run "npm install" and then run "node demo.js" in the repo's directory.

The demo program just dumps a pretty printed AST.

The parser uses a recursive descent strategy and is essentially a codification
of the modified BNF describing the language. This can be viewed in the
dnaSpec.markdown file.
