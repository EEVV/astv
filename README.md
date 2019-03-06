# ASTV
Abstract syntax tree viewer written in HTML and JS that displays SVG.

## Grammar
The grammar is similar to Lisp.
```
identifier ::= [^) ]+
tree ::= identifier tree*
```

### Examples
```
(+ 1 (* 2 3))
```

## Preview
https://eevv.github.io/astv/
