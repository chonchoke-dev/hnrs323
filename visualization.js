let svg, userCircle, userLabel;
const companyPoints = {};
const COMPANY_DATA = {
    'NVIDIA': { pos: [4, 9], shift: [3, -1], color: '#34d399' },
    'TSMC': { pos: [2, 10], shift: [1, 0], color: '#f87171' },
    'SMIC': { pos: [8, 5], shift: [1, 1], color: '#fbbf24' },
    'Intel': { pos: [5, 8], shift: [2, -1], color: '#60a5fa' },
    'Huawei': { pos: [6, 8], shift: [-2, 1], color: '#a78bfa' }
};

const MARGIN = 60;
const WIDTH = 800;
const HEIGHT = 600;

export function init(initialUserPos) {
    svg = document.getElementById('viz-svg');
    if (!svg) return;
    svg.innerHTML = ''; // Clear previous

    createGrid();
    createAxes();

    // Plot Companies
    for (const [name, data] of Object.entries(COMPANY_DATA)) {
        companyPoints[name] = createPoint(data.pos, data.color, name);
    }

    // Plot User
    const [uX, uY] = project(initialUserPos[0], initialUserPos[1]);
    userCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    userCircle.setAttribute("cx", uX);
    userCircle.setAttribute("cy", uY);
    userCircle.setAttribute("r", 10);
    userCircle.setAttribute("fill", "#0071e3");
    userCircle.style.transition = "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)";
    svg.appendChild(userCircle);

    userLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    userLabel.setAttribute("x", uX);
    userLabel.setAttribute("y", uY - 15);
    userLabel.setAttribute("text-anchor", "middle");
    userLabel.setAttribute("fill", "#0071e3");
    userLabel.setAttribute("font-weight", "600");
    userLabel.setAttribute("font-size", "12px");
    userLabel.textContent = "YOU";
    userLabel.style.transition = "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)";
    svg.appendChild(userLabel);
}

function project(x, y) {
    // Input 0-10 -> Canvas coordinates
    const px = MARGIN + (x / 10) * (WIDTH - 2 * MARGIN);
    const py = HEIGHT - MARGIN - (y / 10) * (HEIGHT - 2 * MARGIN);
    return [px, py];
}

function createGrid() {
    for (let i = 0; i <= 10; i++) {
        const [x1, y1] = project(i, 0);
        const [x2, y2] = project(i, 10);
        const [x3, y3] = project(0, i);
        const [x4, y4] = project(10, i);

        drawLine(x1, y1, x2, y2, "#e8e8ed", 1);
        drawLine(x3, y3, x4, y4, "#e8e8ed", 1);
    }
}

function createAxes() {
    const [ox, oy] = project(0, 0);
    const [xx, xy] = project(10, 0);
    const [yx, yy] = project(0, 10);

    drawLine(ox, oy, xx, xy, "#86868b", 2);
    drawLine(ox, oy, yx, yy, "#86868b", 2);

    // Labels
    drawText(ox + (xx - ox) / 2, oy + 40, "Dependency →", "#86868b", "middle");
    drawVerticalText(ox - 40, oy + (yy - oy) / 2, "← Innovation", "#86868b");
}

function createPoint(pos, color, name) {
    const [x, y] = project(pos[0], pos[1]);
    
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 6);
    circle.setAttribute("fill", "#d2d2d7");
    circle.style.transition = "all 4s cubic-bezier(0.4, 0, 0.2, 1)";
    svg.appendChild(circle);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y - 10);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#86868b");
    text.setAttribute("font-size", "10px");
    text.textContent = name;
    text.style.transition = "all 4s cubic-bezier(0.4, 0, 0.2, 1)";
    svg.appendChild(text);

    return { circle, text, pos };
}

function drawLine(x1, y1, x2, y2, color, width) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", width);
    svg.appendChild(line);
}

function drawText(x, y, text, color, anchor) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
    el.setAttribute("x", x);
    el.setAttribute("y", y);
    el.setAttribute("text-anchor", anchor);
    el.setAttribute("fill", color);
    el.setAttribute("font-size", "12px");
    el.setAttribute("font-weight", "500");
    el.textContent = text;
    svg.appendChild(el);
}

function drawVerticalText(x, y, text, color) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
    el.setAttribute("x", x);
    el.setAttribute("y", y);
    el.setAttribute("text-anchor", "middle");
    el.setAttribute("fill", color);
    el.setAttribute("font-size", "12px");
    el.setAttribute("font-weight", "500");
    el.setAttribute("transform", `rotate(-90, ${x}, ${y})`);
    el.textContent = text;
    svg.appendChild(el);
}

export function updateUserPoint(newPos) {
    const [x, y] = project(newPos[0], newPos[1]);
    userCircle.setAttribute("cx", x);
    userCircle.setAttribute("cy", y);
    userLabel.setAttribute("x", x);
    userLabel.setAttribute("y", y - 15);
}

export function startShiftAnimation(onComplete) {
    for (const [name, data] of Object.entries(COMPANY_DATA)) {
        const target = [data.pos[0] + data.shift[0], data.pos[1] + data.shift[1]];
        const [tx, ty] = project(target[0], target[1]);
        
        companyPoints[name].circle.setAttribute("cx", tx);
        companyPoints[name].circle.setAttribute("cy", ty);
        companyPoints[name].circle.setAttribute("fill", data.color);
        companyPoints[name].circle.setAttribute("r", 8);
        
        companyPoints[name].text.setAttribute("x", tx);
        companyPoints[name].text.setAttribute("y", ty - 12);
        companyPoints[name].text.setAttribute("fill", data.color);
        companyPoints[name].text.setAttribute("font-weight", "600");
    }

    // Shift User
    const userTarget = [7.5, 6.5]; // Example shift for 2D
    const [ux, uy] = project(userTarget[0], userTarget[1]);
    userCircle.setAttribute("cx", ux);
    userCircle.setAttribute("cy", uy);
    userLabel.setAttribute("x", ux);
    userLabel.setAttribute("y", uy - 15);

    setTimeout(onComplete, 4000);
}

// Stubs for main.js compatibility
export function resetCamera() {}
export function applyDefaultAngle() {}
export function focusUser() {}
export function resize() {}
