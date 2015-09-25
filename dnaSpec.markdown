# DarwinBots DNA Spec

DNA will be specified in BNF-like format.

----

```HTML

<dna> ::= {<gene>}
<gene> ::= cond <cond-expression>? start {<body-expression>} stop


<body-expression> ::= <variable> <- <expression>
<expression>      ::= <term> + <exrpession> | <term> - <expression> | <term>
<term>            ::= <factor> * <term> | <factor> / <term> | <factor>
<factor>          ::= <unary> ^ <factor> | <unary>
<unary>           ::= - <unary> | <group>
<group>           ::= <number> | <variable> | ( <expression> )
<variable>        ::= (\w+)
<number>          ::= \d*(\.\d*)?

<cond-expression> ::= <and-phrase>
<and-phrase>      ::= <or-phrase>  and <and-phrase> | <or-phrase>
<or-phrase>       ::= <bool-group> or  <or-phrase> | <bool-group>
<bool-group>      ::= <bool-expression> | ( <and-phrase> )
<bool-term>       ::= <expression> <bool-op> <expression>
<bool-op>         ::= [> < = >= <= !=]

```

