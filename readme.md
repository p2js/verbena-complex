# verbena-complex

This package acts as a complex number extension to the [verbena](https://github.com/p2js/verbena) math function transcompiler to JS.

It uses verbena's standard lexer, parser and compiler, all completely unmodified. The magic happens with the library: All operations are redefined to convert all numbers to complex.js `Complex` numbers, and `i` is treated just another constant.