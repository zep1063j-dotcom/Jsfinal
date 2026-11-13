// ============================================================
//  main.js — 이벤트 연결 및 초기화 (선택 과제 이벤트 포함)
// ============================================================

import { appendNumber, appendOperator, calculate, deleteLast, clearAll, appendPercent, setExpression } from './calculator.js';
import { loadHistory, addHistory, clearHistory, deleteHistoryItem } from './history.js';

// DOM 요소
const historyPanel = document.getElementById("historyPanel");
const historyList  = document.getElementById("historyList");
const historyBtn   = document.getElementById("historyBtn");
const clearAllBtn  = document.getElementById("clearAllBtn");
const themeBtn     = document.getElementById("themeBtn");
const badge        = document.getElementById("badge");

// ── 기록 렌더링 ──────────────────────────────────────────────
const renderHistory = (history) => {
    badge.textContent = history.length;

    if (history.length === 0) {
        historyList.innerHTML = '<li class="empty-msg">아직 계산 기록이 없어요 🧮</li>';
        return;
    }

    // 저장된 문자열은 HTML로 해석하지 않고 텍스트로 표시합니다.
    historyList.replaceChildren(...history.map((item, index) => {
        const row = document.createElement("li");
        row.className = "history-item";
        row.dataset.result = item.result;
        row.tabIndex = 0;
        row.setAttribute("aria-label", `${item.expression} = ${item.result}, 결과 불러오기`);

        for (const [className, text] of [
            ["hist-expr", item.expression + " ="],
            ["hist-result", item.result],
            ["hist-date", item.date]
        ]) {
            const field = document.createElement("div");
            field.className = className;
            field.textContent = text;
            row.append(field);
        }

        const deleteButton = document.createElement("button");
        deleteButton.className = "del-item-btn";
        deleteButton.dataset.index = index;
        deleteButton.textContent = "×";
        deleteButton.title = "삭제";
        deleteButton.setAttribute("aria-label", `${item.expression} 기록 삭제`);
        row.append(deleteButton);
        return row;
    }));
};

// ── 버튼 이벤트 ──────────────────────────────────────────────
document.querySelectorAll(".btn-num").forEach(btn =>
    btn.addEventListener("click", () => appendNumber(btn.dataset.num))
);

document.querySelectorAll(".btn-op").forEach(btn =>
    btn.addEventListener("click", () => {
        document.querySelectorAll(".btn-op").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        appendOperator(btn.dataset.op);
    })
);

document.querySelector("[data-action='equals']").addEventListener("click", () => {
    const r = calculate();
    if (r) renderHistory(addHistory(r.expression, r.result));
    document.querySelectorAll(".btn-op").forEach(b => b.classList.remove("active"));
});

document.querySelector("[data-action='clear']").addEventListener("click", clearAll);

document.querySelector("[data-action='delete']").addEventListener("click", deleteLast);

document.querySelector("[data-action='percent']").addEventListener("click", appendPercent);

// ── 키보드 입력 ──────────────────────────────────────────────
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
    if (e.target.closest("input, textarea, select, [contenteditable='true']")) return;
    // Enter로 포커스된 버튼을 누를 때 계산이 중복 실행되지 않게 합니다.
    if ((e.key === "Enter" || e.key === " ")
        && e.target.closest("button, .history-item")) return;
    if (/^[0-9.]$/.test(e.key) || ["+", "-", "*", "/", "%", "Enter", "=", "Backspace", "Escape"].includes(e.key)) {
        e.preventDefault();
    }
    if (e.key === "%") {
        appendPercent();
        return;
    }
    if ((e.key >= "0" && e.key <= "9") || e.key === ".") {
        appendNumber(e.key);
        return;
    }
    if (["+", "-", "*", "/"].includes(e.key)) {
        document.querySelectorAll(".btn-op").forEach(b => b.classList.remove("active"));
        const opBtn = document.querySelector(`[data-op="${e.key}"]`);
        if (opBtn) opBtn.classList.add("active");
        appendOperator(e.key);
        return;
    }
    if (e.key === "Enter" || e.key === "=") {
        const r = calculate();
        if (r) renderHistory(addHistory(r.expression, r.result));
        document.querySelectorAll(".btn-op").forEach(b => b.classList.remove("active"));
    }
    if (e.key === "Backspace") deleteLast();
    if (e.key === "Escape")    clearAll();
});

// ── 기록 패널 토글 ───────────────────────────────────────────
historyBtn.addEventListener("click", () =>
    historyPanel.classList.toggle("open")
);

clearAllBtn.addEventListener("click", () => renderHistory(clearHistory()));

// ── 도전 과제: 기록 개별 삭제 / 결과 불러오기 ────────────────
historyList.addEventListener("click", (e) => {
    const deleteButton = e.target.closest(".del-item-btn");
    if (deleteButton) {
        renderHistory(deleteHistoryItem(Number(deleteButton.dataset.index)));
        return;
    }
    const item = e.target.closest(".history-item");
    if (item) setExpression(item.dataset.result);
});

historyList.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".history-item")) {
        e.preventDefault();
        setExpression(e.target.dataset.result);
    }
});

// ── 다크모드 ─────────────────────────────────────────────────
const applyTheme = (dark) => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    themeBtn.textContent = dark ? "☀️" : "🌙";
};

themeBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    applyTheme(!isDark);
    localStorage.setItem("calc_theme", !isDark ? "dark" : "light");
});

// ── 초기화 ───────────────────────────────────────────────────
applyTheme(localStorage.getItem("calc_theme") === "dark");
renderHistory(loadHistory());
