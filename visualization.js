import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let userPoint, companyPoints = {};
let pointsGroup, gridGroup;
let isInitialized = false;

const COMPANY_DATA = {
    'NVIDIA': { pos: [4, 9, 8], shift: [3, -0.5, 1.5], color: 0x22c55e },
    'TSMC': { pos: [2, 10, 9], shift: [1, 0, 0.5], color: 0xef4444 },
    'SMIC': { pos: [8, 5, 6], shift: [1, 0.5, 0.5], color: 0xfacc15 },
    'Intel': { pos: [5, 8, 7], shift: [2, -0.5, 0.5], color: 0x3b82f6 },
    'Huawei': { pos: [6, 8, 7], shift: [-2, 0.5, 2.5], color: 0xa855f7 }
};

export function init(initialUserPos) {
    if (isInitialized) return;

    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a); // Darker for high contrast

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(15, 15, 15);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    pointsGroup = new THREE.Group();
    scene.add(pointsGroup);
    
    gridGroup = new THREE.Group();
    scene.add(gridGroup);

    createGrid();
    createAxes();
    
    // Plot Companies
    for (const [name, data] of Object.entries(COMPANY_DATA)) {
        companyPoints[name] = createPoint(data.pos, data.color, name);
    }

    // Plot User
    userPoint = createPoint(initialUserPos, 0x007bff, 'YOU (Initial)', true);

    // Controls listeners
    document.getElementById('btn-reset-cam').onclick = resetCamera;
    document.getElementById('btn-focus-user').onclick = focusUser;

    window.addEventListener('resize', onWindowResize);
    animate();
    isInitialized = true;
}

function createPoint(pos, color, name, isUser = false) {
    const geometry = new THREE.SphereGeometry(isUser ? 0.4 : 0.3, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...pos);
    pointsGroup.add(mesh);

    // Label
    const sprite = createLabel(name, color);
    sprite.position.y = isUser ? 0.6 : 0.5;
    mesh.add(sprite);

    return { mesh, pos: [...pos], color, name, label: sprite };
}

function createLabel(text, color) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    ctx.font = 'Bold 32px Inter, sans-serif';
    ctx.fillStyle = '#' + new THREE.Color(color).getHexString();
    ctx.textAlign = 'center';
    ctx.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(3, 0.75, 1);
    return sprite;
}

function createGrid() {
    const size = 10;
    const divisions = 10;
    const gridXY = new THREE.GridHelper(size, divisions, 0x333333, 0x222222);
    gridXY.position.set(5, 5, 0);
    gridXY.rotation.x = Math.PI / 2;
    gridGroup.add(gridXY);

    const gridXZ = new THREE.GridHelper(size, divisions, 0x333333, 0x222222);
    gridXZ.position.set(5, 0, 5);
    gridGroup.add(gridXZ);
}

function createAxes() {
    const colors = [0xff0000, 0x00ff00, 0x0000ff];
    const labels = ['Dependency', 'Innovation', 'Adaptability'];
    
    // Simple line axes
    const axisMat = new THREE.LineBasicMaterial({ color: 0x888888 });
    
    // X
    const xGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(12,0,0)]);
    const xLine = new THREE.Line(xGeo, axisMat);
    scene.add(xLine);

    // Y
    const yGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,12,0)]);
    const yLine = new THREE.Line(yGeo, axisMat);
    scene.add(yLine);

    // Z
    const zGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,12)]);
    const zLine = new THREE.Line(zGeo, axisMat);
    scene.add(zLine);
}

export function updateUserPoint(newPos, duration) {
    animateMove(userPoint.mesh, userPoint.pos, newPos, duration);
    userPoint.pos = [...newPos];
}

function animateMove(mesh, start, end, duration) {
    const startTime = performance.now();
    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const ease = progress * (2 - progress);
        mesh.position.set(
            start[0] + (end[0] - start[0]) * ease,
            start[1] + (end[1] - start[1]) * ease,
            start[2] + (end[2] - start[2]) * ease
        );
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

export function startShiftAnimation(onComplete) {
    const duration = 2500;
    
    // Create Trajectories and Faded Markers
    for (const [name, data] of Object.entries(COMPANY_DATA)) {
        const target = data.pos.map((v, i) => v + data.shift[i]);
        createTrajectory(data.pos, target, data.color);
        animateMove(companyPoints[name].mesh, data.pos, target, duration);
    }

    // User Shift
    const userTarget = userPoint.pos.map((v, i) => v + (i===0 ? 2 : (i===2 ? 1 : 0)));
    createTrajectory(userPoint.pos, userTarget, 0x007bff);
    animateMove(userPoint.mesh, userPoint.pos, userTarget, duration);
    userPoint.label.material.map.dispose();
    userPoint.label.material.map = createLabelTexture('YOU (Shifted)', 0x007bff);

    setTimeout(onComplete, duration);
}

function createLabelTexture(text, color) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256; canvas.height = 64;
    ctx.font = 'Bold 32px Inter, sans-serif';
    ctx.fillStyle = '#' + new THREE.Color(color).getHexString();
    ctx.textAlign = 'center';
    ctx.fillText(text, 128, 32);
    return new THREE.CanvasTexture(canvas);
}

function createTrajectory(start, end, color) {
    // Faded Sphere at start
    const geo = new THREE.SphereGeometry(0.15, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...start);
    scene.add(mesh);

    // Line
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineDashedMaterial({ color: color, dashSize: 0.5, gapSize: 0.2, transparent: true, opacity: 0.5 });
    const line = new THREE.Line(lineGeo, lineMat);
    line.computeLineDistances();
    scene.add(line);
}

function resetCamera() {
    controls.reset();
    camera.position.set(15, 15, 15);
}

function focusUser() {
    controls.target.set(...userPoint.pos);
    camera.position.set(userPoint.pos[0] + 5, userPoint.pos[1] + 5, userPoint.pos[2] + 5);
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
