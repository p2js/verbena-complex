# verbena-complex

This package acts as a complex number extension to the [verbena](https://github.com/p2js/verbena) math function transcompiler to JS.

It uses verbena's standard lexer, parser and compiler, all completely unmodified. The magic happens with the library: All operations are redefined to convert all numbers to complex.js `Complex` numbers, and `i` is treated as a simple constant.

Some additional logic is implemented after lexing and parsing to allow for additional robustness and ergonomics:
    - any identifier `i` will be converted to the constant `i` to allow implicit multiplications of variables by i, such as `ix`.
    - due to the lack of logical operator overloading in verbena, as well as the lack of a natural order on the complex numbers, function clauses are unimplemented and will be removed before compilation.