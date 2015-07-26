# DarwinBots DNA Spec

DNA will be specified in BNF-like format.

* \* indicates that zero or more of the following terms can be present
* ? indicates that the term may not exist
* values within "" indicate that the literal value is expected in code

----



```
[Gene]        ::= [Conditional] & ?[Body]

[Conditional] ::= ["cond"] & *[CondExpr] & ["start" | "stop" | "end"]

[CondExpr]    ::= [StackOp] | [BoolOp];

[BoolOp]      ::= [">" | "<" | "=" | "!=" | ">=" | "<="]

[StackOp]     ::= [Literal] | ["add" | "sub" | "mul" | "div"]

[Body]        ::= ["start"] & *[StackOp] & ["end"];

[Literal]     ::= *[0-9] & ?. & *[0-9]
```

----

Example:

```
cond
  4 3 >
start
  3 4 mult
end
