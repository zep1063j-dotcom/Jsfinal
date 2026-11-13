// ============================================================
//  history.js — 계산 기록 관리 (localStorage)
//  필수 과제 및 선택 과제 구현 완료.
// ============================================================

const STORAGE_KEY = "calc_history";
const MAX_COUNT   = 20;

// ── 과제 5: 기록 불러오기 ────────────────────────────────────
/**
 * localStorage에서 계산 기록 배열을 불러옵니다.
 *
 * 힌트:
 *  - localStorage.getItem(STORAGE_KEY) 로 값을 가져옵니다.
 *  - 저장된 값이 없으면(null이면) 빈 배열 []을 반환합니다.
 *  - JSON.parse() 로 문자열 → 배열 변환이 필요합니다.
 *
 * @returns {Array} 기록 배열
 */
export const loadHistory = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) return [];
        const history = JSON.parse(raw);
        if (!Array.isArray(history)) return [];
        return history.filter(item => item && typeof item.expression === "string"
            && typeof item.result === "string" && typeof item.date === "string")
            .slice(0, MAX_COUNT);
    } catch {
        // 손상된 저장 데이터 때문에 계산기 전체가 멈추지 않게 합니다.
        return [];
    }
};

// ── 과제 6: 기록 저장 ────────────────────────────────────────
/**
 * 계산 기록 배열을 localStorage에 저장합니다.
 *
 * 힌트:
 *  - JSON.stringify() 로 배열 → 문자열 변환 후 저장합니다.
 *  - MAX_COUNT(20)개 초과분은 제거하세요. (힌트: history.slice(0, MAX_COUNT))
 *
 * @param {Array} history - 저장할 기록 배열
 */
export const saveHistory = (history) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_COUNT)));
};

// ── 과제 7: 기록 항목 추가 ───────────────────────────────────
/**
 * 새 계산 결과를 기록 맨 앞에 추가하고 저장합니다.
 *
 * 저장할 항목 형식:
 *   { expression, result, date: new Date().toLocaleString("ko-KR") }
 *
 * 구현 순서:
 *  1. loadHistory() 로 기존 기록을 가져옵니다.
 *  2. 새 항목을 배열 맨 앞에 추가합니다. (힌트: [새항목, ...기존배열])
 *  3. saveHistory() 로 저장합니다.
 *  4. 업데이트된 배열을 반환합니다.
 *
 * @param {string} expression - 계산 수식 (예: "3+4")
 * @param {string} result     - 계산 결과 (예: "7")
 * @returns {Array} 업데이트된 기록 배열
 */
export const addHistory = (expression, result) => {
    const item = { expression, result, date: new Date().toLocaleString("ko-KR") };
    const updated = [item, ...loadHistory()].slice(0, MAX_COUNT);
    saveHistory(updated);
    return updated;
};

// ── 도전 2: 기록 개별 삭제 (선택 과제) ──────────────────────
/**
 * 특정 인덱스의 기록 항목을 삭제하고 저장합니다.
 *
 * 힌트 1: loadHistory()로 배열을 가져옵니다.
 * 힌트 2: filter() 또는 splice()로 해당 인덱스 항목을 제거합니다.
 * 힌트 3: saveHistory()로 저장하고 업데이트된 배열을 반환합니다.
 *
 * @param {number} index - 삭제할 항목의 인덱스
 * @returns {Array} 업데이트된 기록 배열
 */
export const deleteHistoryItem = (index) => {
    const updated = loadHistory().filter((_, i) => i !== index);
    saveHistory(updated);
    return updated;
};

// ── 기록 전체 삭제 (완성 코드 — 수정 금지) ──────────────────
export const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    return [];
};
