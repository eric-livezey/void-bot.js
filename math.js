function isOperand(token) {
    return /[0-9]+(\.[0-9]+)?$/.test(token);
}

function isOperator(token) {
    return /^[\^*/%+\-E]$/.test(token);
}

function precedenceOf(operator) {
    switch (operator) {
        case 'E':
            return 4;
        case '^':
            return 3; // not exactly
        case '*':
        case '/':
        case '%':
            return 2;
        case '+':
        case '-':
            return 1;
        case '(':
            return 0;
        default:
            throw new Error("Unexpected operator: " + operator);
    };
}

function applyFunction(value, funct) {
    switch (funct) {
        case "sqrt": return Math.sqrt(value);
        case "cbrt": return Math.cbrt(value);
        case "cos": return Math.cos(value);
        case "sin": return Math.sin(value);
        case "tan": return Math.tan(value);
        case "acos": return Math.acos(value);
        case "asin": return Math.asin(value);
        case "atan": return Math.atan(value);
        case "cosh": return Math.cosh(value);
        case "sinh": return Math.sinh(value);
        case "tanh": return Math.tanh(value);
        case "ln": return Math.log(value);
        case "log": return Math.log10(value);
        default: throw new Error("Unexpected function: " + funct);
    };
}

function applyOperation(leftOperand, rightOperand, operator) {
    switch (operator) {
        case 'E': return leftOperand * Math.pow(10, rightOperand);
        case '^': return Math.pow(leftOperand, rightOperand);
        case '*': return leftOperand * rightOperand;
        case '/': return leftOperand / rightOperand;
        case '%': return leftOperand % rightOperand;
        case '+': return leftOperand + rightOperand;
        case '-': return leftOperand - rightOperand;
        default: throw new Error("Unexpected operator: " + operator);
    };
}

/**
 * Evaluates a mathematical expression.
 * 
 * **NOTE**: There are currently a few errors with this function
 * - Exponents are evaluated left to right when they should be right to left
 * 
 * *I'll probably fix this at some point, but who knows when*
 * 
 * It's annoyingly difficult to handle these scenarios with the algorithm this uses
 * 
 * @param {string} expression a mathematical expression
 */
function evaluate(expression) {
    const tokens = expression.split(/([()^*/%+\-E])/g);
    const operands = [];
    const operators = [];
    const history = [];
    for (var i = 0; i < tokens.length; i++) {
        const token = tokens[i].trim();
        if (token.match(/^\s*$/)) {
            continue;
        } else if (/[0-9]+(\.[0-9]+)?$/.test(token)) {
            if (history.length >= 2 && history[history.length - 1] === '-' && /([()^*/%+\-E])/.test(history[history.length - 2])) {
                operands.push(Number(operators.pop() + token));
            } else if (operands.length !== 0 && operators.length == 0) {
                throw new Error(`Misplaced operands: "${expression}"`);
            } else {
                operands.push(Number(token));
            }
        } else if (token === "pi") {
            operands.push(Math.PI);
        } else if (token === "e") {
            operands.push(Math.E);
        } else if (/^\(|sqrt|cbrt|cos|sin|tan|acos|asin|atan|cosh|sinh|tanh|ln|log$/.test(token)) {
            if (operands.length !== 0 && operators.length == 0) {
                throw new Error(`Misplaced operands: "${expression}"`);
            }
            operators.push(token);
        } else if (token === ')') {
            while (operators.length !== 0 && operators[operators.length - 1] !== '(') {
                if (operands.length === 0) {
                    throw new Error(`Missing operands: "${expression}"`);
                }
                const rightOperand = operands.pop();
                if (operands.length === 0) {
                    throw new Error(`Missing operands: "${expression}"`);
                }
                const leftOperand = operands.pop();
                operands.push(applyOperation(leftOperand, rightOperand, operators.pop()));
            }
            if (operators.length === 0) {
                throw new Error(`Unbalanced parenthesis: "${expression}"`);
            }
            operators.pop();
            if (operators.length !== 0) {
                if (/^sqrt|cbrt|cos|sin|tan|acos|asin|atan|cosh|sinh|tanh|ln|log$/.test(operators[operators.length - 1])) {
                    operands.push(applyFunction(operands.pop(), operators.pop()));
                }
            }
        } else if (/^[\^*/%+\-E]$/.test(token)) {
            while (operators.length !== 0 && precedenceOf(operators[operators.length - 1]) >= precedenceOf(token)) {
                const rightOperand = operands.pop();
                if (operands.length === 0) {
                    throw new Error(`Misplaced operators: "${expression}"`);
                }
                const leftOperand = operands.pop();
                operands.push(applyOperation(leftOperand, rightOperand, operators.pop()));
            }
            operators.push(token);
        } else {
            throw new Error(`Unexpected token: "${token}"`);
        }
        history.push(token);
    }
    while (operators.length !== 0) {
        if (operators[operators.length - 1] === '(') {
            throw new Error(`Unbalanced parenthesis: "${expression}"`);
        } else if (operands.length === 0) {
            throw new Error(`Missing operands: "${expression}"`);
        }
        const rightOperand = operands.pop();
        if (operands.length === 0) {
            if (operators.pop() === '-') {
                operands.push(rightOperand * -1);
                continue;
            } else {
                throw new Error(`Missing operands: "${expression}"`);
            }
        }
        const leftOperand = operands.pop();
        operands.push(applyOperation(leftOperand, rightOperand, operators.pop()));
    }
    return operands.pop();
}

export {
    evaluate
}