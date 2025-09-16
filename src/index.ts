import { Complex } from 'complex.js';
import { Library, standard as std } from 'verbena/lib';
import { vbFunction } from 'verbena/function';
import { scan } from 'verbena/lexer';
import { parse } from 'verbena/parser';
import { compileFn } from 'verbena/compileFn';
import { TokenType } from 'verbena/token';

/**
 * Library for complex functions.
 * 
 * Includes complex operations and functions, as well as constants for i, pi and e.
 */
export const complexLib: Library<Complex> = {
    operations: {
        add: forceComplex((l, r) => l.add(r)),
        sub: forceComplex((l, r) => l.sub(r)),
        mul: forceComplex((l, r) => l.mul(r)),
        div: forceComplex((l, r) => l.div(r)),
        pow: forceComplex((l, r) => l.pow(r)),
        neg: forceComplex((z) => z.mul(-1)),

        mod: forceReal((x, y) => x % y),
        fac: forceReal(std.functions.fac)
    },
    functions: {
        re: forceComplex((z) => z.re),
        im: forceComplex((z) => z.im),

        abs: forceComplex((z) => z.abs()),
        acos: forceComplex((z) => z.acos()),
        acosh: forceComplex((z) => z.acosh()),
        asin: forceComplex((z) => z.asin()),
        asinh: forceComplex((z) => z.asinh()),
        atan: forceComplex((z) => z.atan()),
        atanh: forceComplex((z) => z.atanh()),
        cbrt: forceComplex((z) => z.pow(1 / 3)),
        ceil: forceComplex((z) => z.ceil(0)),
        cos: forceComplex((z) => z.cos()),
        cosh: forceComplex((z) => z.cosh()),
        exp: forceComplex((z) => z.exp()),
        floor: forceComplex((z) => z.floor(0)),
        hypot: forceComplex((...zs) => zs.reduce((acc, z) => acc.add(z.pow(2)), Complex(0)).sqrt()),
        log_: forceComplex((z, b = Complex(10)) => z.log().div(b.log())),
        ln: forceComplex((z) => z.log()),
        max: forceReal(Math.max),
        min: forceReal(Math.min),
        pow: forceComplex((z, p) => z.pow(p)),
        random: () => Complex(Math.random()),
        round: forceComplex((z) => z.round(0)),
        sign: forceComplex((z) => z.sign()),
        sin: forceComplex((z) => z.sin()),
        sinh: forceComplex((z) => z.sinh()),
        sqrt: forceComplex((z) => z.sqrt()),
        tan: forceComplex((z) => z.tan()),
        tanh: forceComplex((z) => z.tanh())
    },
    constants: {
        i: Complex.I,
        pi: Complex.PI,
        e: Complex.E,
    }
};

export function ComplexFunction(source: string): vbFunction<Complex> {
    let tokens = scan(source, complexLib as any).map(token => {
        // Little hack to allow implicit of identifiers with i, like ix
        if (token.type == TokenType.IDENTIFIER && token.lexeme == 'i') {
            token.type = TokenType.CONSTANT;
        }
        return token;
    });
    let decl = parse(tokens);

    // Remove function clauses
    decl.clauses = [];

    // Compile the function as a real function using the complex library
    let compiledFn = compileFn(decl, complexLib as any);

    // Force conversion of function arguments and result to a complex number
    let complexFn = forceComplex((...args) => Complex(compiledFn(...args as any[]))) as vbFunction<Complex>;

    // Copy over the real function's properties to the complex one
    Object.defineProperties(complexFn, {
        name: {
            value: compiledFn.name,
            writable: false,
            enumerable: false
        },
        ast: {
            value: compiledFn.ast,
            writable: false,
            enumerable: false
        },
        paramList: {
            value: compiledFn.paramList,
            writable: false,
            enumerable: false
        },
        body: {
            value: compiledFn.body,
            writable: false,
            enumerable: false
        }
    });

    return complexFn;
}

/**
 * Utility function to wrap a complex function, converting all its arguments to a Complex value.
 * 
 * @param f Complex function
 * @returns `f` with all its parameters converted to Complex
 */
function forceComplex(f: (...args: Complex[]) => Complex): (...args: Complex[]) => Complex {
    return (...args: Complex[]) => f(...args.map(z => Complex(z)));
}

/**
 * Utility function to wrap a real function, forcing all its arguments to be real numbers.
 * 
 * @param f Real function
 * @returns `f`, but will throw an error on any complex arguments
 */
function forceReal(f: (...args: number[]) => number): (...args: Complex[]) => Complex {
    return (...args) => {
        let realArgs = args.map(z => {
            z = Complex(z);
            if (z.im != 0) {
                throw Error("complex " + f.name + "is unsupported");
            }
            return z.re;
        });

        return Complex(f(...realArgs));
    }
}
