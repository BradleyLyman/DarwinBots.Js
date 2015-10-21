# DarwinBots DNA Spec

DNA will be specified in BNF-like format.

----

```HTML

<dna> ::= {<gene>}
<gene> ::= cond <cond-expression>? start {<body-expression>} stop


<body-expression> ::= <variable> <- <expression>
<expression>      ::= <exrpession> + <term> | <expression> - <term> | <term>
<term>            ::= <term> * <factor> | <term> / <factor> | <factor>
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

Comments can be added to lines. Any region beginning with a ' and ending with a
newline is considered a comment.

