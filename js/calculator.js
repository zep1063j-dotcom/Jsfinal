// ============================================================
//  calculator.js — 계산기 핵심 로직
//  필수 과제 및 선택 과제 구현 완료.
// ============================================================

const mainDisplay = document.getElementById("mainDisplay");
const subDisplay  = document.getElementById("subDisplay");

let expression     = "";    // 현재 입력 중인 수식 문자열
let justCalculated = false; // 방금 = 을 눌렀는지 여부

// 디스플레이 갱신 — main.js에서도 호출합니다 (수정 금지)
export const updateDisplay = () => {
    mainDisplay.textContent = expression || "0";
    mainDisplay.style.fontSize = expression.length > 10 ? "1.8rem" : "2.6rem";
};

// ── 과제 1: 숫자 / 소수점 입력 ──────────────────────────────
/**
 * 버튼에서 눌린 숫자(또는 '.')를 expression에 추가합니다.
 *
 * 구현해야 할 규칙:
 *  1. justCalculated가 true이면 expression을 ""로 초기화 후 입력 (새 계산 시작)
 *  2. expression이 "0"일 때 숫자를 누르면 "0"을 대체 (앞자리 0 방지)
 *  3. 소수점(.)은 현재 숫자 구간에 이미 있으면 추가하지 않음
 *
 * @param {string} num - 입력된 숫자 문자 ("0"~"9", ".")
 */
export const appendNumber = (num) => {
    if (justCalculated) {
        expression = "";
    }
    const parts = expression.split(/[+\-*\/]/);
    const currentNum = parts[parts.length - 1];
    if (num === "." && currentNum.includes(".")) {
        return;
    }
    if (expression === "0" && num !== ".") {
        expression = num;
    } else if (expression === "" && num === ".") {
        expression = "0.";
    } else {
        expression += num;
    }
    justCalculated = false;
    updateDisplay();
};

// ── 과제 2: 연산자 입력 ─────────────────────────────────────
/**
 * 연산자(+, -, *, /)를 expression 끝에 추가합니다.
 *
 * 구현해야 할 규칙:
 *  1. expression이 비어 있으면 무시 (연산자로 시작 불가)
 *  2. 마지막 문자가 이미 연산자이면 새 연산자로 교체
 *  3. justCalculated가 true이면 이전 결과에 이어서 연산 가능 (expression 유지)
 *
 * @param {string} op - 연산자 문자 ("+", "-", "*", "/")
 */
export const appendOperator = (op) => {
    if (expression === "") return;
    
    const lastChar = expression[expression.length - 1];
    
    if (["+", "-", "*", "/"].includes(lastChar)) {
        expression = expression.slice(0, -1) + op;
    } else {
        expression += op;
    }

    justCalculated = false;
    updateDisplay();
};

// ── 과제 3: 계산 실행 ───────────────────────────────────────
/**
 * expression을 계산하여 결과를 화면에 출력합니다.
 *
 * 구현해야 할 규칙:
 *  1. expression이 비어 있거나 연산자로 끝나면 null 반환 (계산 안 함)

 *  2. 0으로 나누기 감지 → subDisplay에 에러 메시지 표시 후 null 반환
 *  3. 성공 시:
 *     - mainDisplay → 결과값
 *     - subDisplay  → "입력한 수식 ="
 *     - justCalculated = true
 *  4. 반환값: { expression, result } 객체 (기록 저장에 사용)
 *
 * 힌트 — 수식 문자열을 안전하게 계산하는 방법:
 *   Function('"use strict"; return (' + expression + ')')()
 *   실행 전 숫자와 사칙연산만 포함하는 수식인지 반드시 검증합니다.
 *
 * 힌트 — 부동소수점 오류 처리:
 *   Number(result.toPrecision(15)).toString()
 *
 * @returns {{ expression: string, result: string } | null}
 */
export const calculate = () => {
    if (expression === "") return null;
    const lastChar = expression[expression.length - 1];
    
    if (["+", "-", "*", "/", "."].includes(lastChar)) return null;
    // 숫자와 사칙연산으로 구성된 수식만 허용합니다.
    // 지수 표기는 큰 수 또는 작은 수의 계산 결과를 이어 쓸 때 필요합니다.
    if (/\/0(?![.\d])/.test(expression)) {
        subDisplay.textContent = "0으로 나눌 수 없습니다";
        return null;
    }
    try {
        const originalExpression = expression;
        const rawResult = Function('"use strict"; return (' + expression + ')')();

        if (!isFinite(rawResult) || isNaN(rawResult)) {
            subDisplay.textContent = "계산 오류";
            return null;
        }
    
    const resultStr = parseFloat(rawResult.toFixed(10)).toString();

    mainDisplay.textContent = resultStr;
    mainDisplay.style.fontSize = resultStr.length > 10 ? "1.8rem" : "2.6rem";
    subDisplay.textContent = `${originalExpression} =`;
    justCalculated = true;
    expression = resultStr;

    return { expression: originalExpression, result: resultStr };
    } catch (e) {
        subDisplay.textContent = "수식 오류";
        return null;
    }
};

// ── 과제 4: 마지막 문자 삭제 ────────────────────────────────
/**
 * expression의 마지막 글자 하나를 제거합니다.
 * justCalculated 상태(계산 직후)라면 전체를 초기화합니다.
 */
export const deleteLast = () => {
    if (justCalculated) {
        clearAll();
        return;
    }
    expression = expression.slice(0, -1);
    subDisplay.textContent = "";
    updateDisplay();
};

// ── 도전 1: % 연산 (선택 과제) ──────────────────────────────
/**
 * 현재 입력된 마지막 숫자를 100으로 나눕니다.
 * 연산자로 끝나거나 expression이 비어 있으면 무시합니다.
 *
 * 예) "50"    → % 클릭 → "0.5"
 *     "100+50" → % 클릭 → "100+0.5"
 *     연산자 뒤에는 동작하지 않습니다.
 *
 * 힌트: expression.lastIndexOf("+") 등으로 마지막 연산자 위치를 찾고
 *       그 뒤의 숫자 부분만 parseFloat(numStr) / 100 으로 교체합니다.
 */
export const appendPercent = () => {
    if (expression === "" || /[+\-*/]$/.test(expression)) return;

    // 지수 표기의 부호를 연산자로 오인하지 않고 마지막 숫자를 찾습니다.
    const match = expression.match(/(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:e[+-]?[0-9]+)?$/);
    if (!match) return;
    const value = Number(match[0]) / 100;
    if (!Number.isFinite(value)) return;

    expression = expression.slice(0, match.index) + Number(value.toPrecision(15)).toString();
    subDisplay.textContent = "";
    // 계산 결과의 %를 구한 뒤 숫자를 누르면 새 계산을 시작합니다.
    updateDisplay();
};

// ── 도전 3: 기록 클릭 시 결과 불러오기 (선택 과제) ──────────
/**
 * 외부에서 expression 값을 직접 설정합니다.
 * 기록 항목을 클릭했을 때 해당 결과를 계산기에 불러오는 데 사용합니다.
 *
 * 힌트: expression = value 로 대입하고
 *       justCalculated = true, updateDisplay() 를 호출합니다.
 */
export const setExpression = (value) => {
    const result = String(value);
    if (!/^-?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:e[+-]?[0-9]+)?$/.test(result)
        || !Number.isFinite(Number(result))) return;

    expression = result;
    justCalculated = true;
    subDisplay.textContent = "";
    document.querySelectorAll(".btn-op").forEach(b => b.classList.remove("active"));
    updateDisplay();
};

// ── 전체 초기화 (완성 코드 — 수정 금지) ─────────────────────
export const clearAll = () => {
    expression     = "";
    justCalculated = false;
    mainDisplay.textContent    = "0";
    mainDisplay.style.fontSize = "2.6rem";
    subDisplay.textContent     = "";
    document.querySelectorAll(".btn-op").forEach(b => b.classList.remove("active"));
};
