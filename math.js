/**
 * 
 * @param {string} operator 
 */
function precedenceOf(operator) {
    switch (operator) {
        case '^':
            return 3;
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

/**
 * 
 * @param {number} value 
 * @param {string} funct 
 */
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

/**
 * 
 * @param {number} leftOperand 
 * @param {number} rightOperand 
 * @param {String} operator 
 */
function applyOperation(leftOperand, rightOperand, operator) {
    switch (operator) {
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
 * 
 * @param {string} expression 
 */
function evaluate(expression) {
    const tokens = expression.split(/([()^*/%+-])/g);
    const operands = [];
    const operators = [];
    for (var i = 0; i < tokens.length; i++) {
        const token = tokens[i].trim();
        if (token.match(/^\s*$/)) {
            continue;
        } else if (/[0-9]+(\.[0-9]+)?$/.test(token)) {
            if (!operands.length == 0 && operators.length == 0) {
                throw new Error(`Misplaced operands: "${expression}"`);
            }
            operands.push(Number(token));
        } else if (token == "pi") {
            operands.push(Math.PI);
        } else if (token == "e") {
            operands.push(Math.E);
        } else if (/^\(|sqrt|cbrt|cos|sin|tan|acos|asin|atan|cosh|sinh|tanh|ln|log$/.test(token)) {
            if (!operands.length == 0 && operators.length == 0) {
                throw new Error(`Misplaced operands: "${expression}"`);
            }
            operators.push(token);
        } else if (token.charAt(0) == ')') {
            while (!operators.length == 0 && operators[operators.length - 1].charAt(0) != '(') {
                if (operands.length == 0) {
                    throw new Error(`Missing operands: "${expression}"`);
                }
                const rightOperand = operands.pop();
                if (operands.length == 0) {
                    throw new Error(`Missing operands: "${expression}"`);
                }
                const leftOperand = operands.pop();
                operands.push(applyOperation(leftOperand, rightOperand, operators.pop().charAt(0)));
            }
            if (operators.length == 0) {
                throw new Error(`Unbalanced parenthesis: "${expression}"`);
            }
            operators.pop();
            if (!operators.length == 0) {
                if (/^sqrt|cbrt|cos|sin|tan|acos|asin|atan|cosh|sinh|tanh|ln|log$/.test(operators[operators.length - 1])) {
                    operands.push(applyFunction(operands.pop(), operators.pop()));
                }
            }
        } else if (/^[\^*/%+-]$/.test(token)) {
            while (!operators.length == 0
                && precedenceOf(operators[operators.length - 1].charAt(0)) >= precedenceOf(token.charAt(0))) {
                const rightOperand = operands.pop();
                if (operands.length == 0) {
                    throw new Error(`Misplaced operators: "${expression}"`);
                }
                const leftOperand = operands.pop();
                operands.push(applyOperation(leftOperand, rightOperand, operators.pop().charAt(0)));
            }
            operators.push(token);
        } else {
            throw new Error(`Unexpected token: "${token}"`);
        }
    }
    while (!operators.length == 0) {
        if (operators[operators.length - 1].charAt(0) == '(') {
            throw new Error(`Unbalanced parenthesis: "${expression}"`);
        } else if (operands.length == 0) {
            throw new Error(`Missing operands: "${expression}"`);
        }
        const rightOperand = operands.pop();
        if (operands.length == 0) {
            throw new Error(`Missing operands: "${expression}"`);
        }
        const leftOperand = operands.pop();
        operands.push(applyOperation(leftOperand, rightOperand, operators.pop().charAt(0)));
    }
    return operands.pop();
}

export {
    evaluate
}