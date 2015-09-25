# DarwinBots DNA Spec

DNA will be specified in BNF-like format.

----

```HTML

<body-expression> ::= <variable> <- <expression> ;
<expression>      ::= <term> + <exrpession> | <term> - <expression> | <term>
<term>            ::= <factor> * <term> | <factor> / <term> | <factor>
<factor>          ::= <unary> ^ <factor> | <unary>
<unary>           ::= - <unary> | <group>
<group>           ::= <number> | <variable> | ( <expression> )
<variable>        ::= (\w+)
<number>          ::= \d*(\.\d*)?

```

