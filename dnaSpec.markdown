# DarwinBots DNA Spec

DNA will be specified in BNF-like format.

----

```HTML
<dna>  ::= <gene>*
<gene> ::= <conditional-block> <body-block>


<conditional-block>   ::= "cond" <cond-statement-list> "start"
<cond-statement-list> ::=
  <cond-statement> |
  <cond-statement> <opt-and-or> <cond-statement-list>

<opt-and-or>     ::= '"' | 'and' | 'or'
<cond-statement> ::= <expression> <bool-op> <expression>


<body-block>          ::= "start" <body-statement-list> "stop"
<body-statement-list> ::=
  <body-statement> | <body-statement> <body-statement-list>

<body-statement> ::= <var> ':=' <expression>
<var>            ::= <sysvar> | <user-var>
<expression>     ::= <term> | <term> <bin-op> <expression>
<term>           ::= <opt-minus> <value>
<value>          ::= <literal> | <var>
```

