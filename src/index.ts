import { Complex } from 'complex.js';
import { Library, standard as std } from 'verbena/lib';
import { vbFunction } from 'verbena/function';
import { scan } from 'verbena/lexer';
import { parse } from 'verbena/parser';
import { compileFn } from 'verbena/compileFn';
import { TokenType } from 'verbena/token';

function enforceRealFn(f: (...args: number[]) => number): (...args: Complex[]) => Complex {
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

export const complexLib: Library<Complex> = {
    operations: {
        add: (l, r) => Complex(l).add(Complex(r)),
        sub: (l, r) => Complex(l).sub(Complex(r)),
        mul: (l, r) => Complex(l).mul(Complex(r)),
        div: (l, r) => Complex(l).div(Complex(r)),
        pow: (l, r) => Complex(l).pow(Complex(r)),
        neg: (x) => Complex(x).mul(-1),
        abs: (x) => Complex(Complex(x).abs()),

        mod: enforceRealFn((x, y) => x % y),
        fac: enforceRealFn(std.functions.fac)
    },
    functions: {

    },
    constants: {
        i: Complex.I,
        pi: Complex.PI,
        e: Complex.E,
    }
};

export function ComplexFunction(source: string): vbFunction<Complex> {
    let tokens = scan(source, complexLib as any).map(token => {
        // Little hack to allow multiplications of identifiers with i, like ix
        if (token.type == TokenType.IDENTIFIER && token.lexeme == 'i') {
            token.type = TokenType.CONSTANT;
        }
        return token;
    });
    let decl = parse(tokens);

    let compiledFn = compileFn(decl, complexLib as any);

    let complexFn = ((...args: Complex[]) => Complex(compiledFn(...args as any[]))) as vbFunction<Complex>;

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