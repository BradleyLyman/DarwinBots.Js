# DarwinBots DNA Spec

DNA will be specified in BNF-like format.

* \* indicates that zero or more of the following terms can be present
* ? indicates that the term may not exist
* values within "" indicate that the literal value is expected in code

----



```
[Gene]        ::= [Conditional] & ?[Body]

[Conditional] ::= ["cond"] & *[BoolExpr] & ["start" | "stop" | "end"]

[Body]        ::= ["start"] & *[StackExpr] & ["stop" | "end"]

[BoolExpr]    ::= [Term] & [Term] & [BoolOp]

[BoolOp]      ::= ["=" | ">" | "<" | ">=" | "<="]

[StackExpr]   ::= [Term] & [StackOp]

[Term]        ::= [Integer Literal]

[StackOp]     ::= ["add" | "sub" | "mult" | "div"]
```

----

Example:

```
cond
  4 3 >
start
  3 4 mult
end
