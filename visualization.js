import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let userPoint, companyPoints = {};
let pointsGroup, gridGroup, labelsGroup;
let isInitialized = false;

const COMPANY_DATA = {
    'NVIDIA': { pos: [4, 9, 8], shift: [3, -0.5, 1.5], color: 0x4ade80 },
    'TSMC': { pos: [2, 10, 9], shift: [1, 0, 0.5], color: 0xf87171 },
    'SMIC': { pos: [8, 5, 6], shift: [1, 0.5, 0.5], color: 0xfacc15 },
    'Intel': { pos: [5, 8, 7], shift: [2, -0.5, 0.5], color: 0x60a5fa },
    'Huawei': { pos: [6, 8, 7], shift: [-2, 0.5, 2.5], color: 0xc084fc }
};

export function init(initialUserPos) {
    const container = document.getElementById('canvas-container');
    if (!container || isInitialized) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.Fog(0x020617, 10, 50);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    applyDefaultAngle();

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    pointsGroup = new THREE.Group();
    labelsGroup = new THREE.Group();
    gridGroup = new THREE.Group();
    scene.add(pointsGroup, labelsGroup, gridGroup);

    createGrid();
    createAxesWithLabels();
    addLights();
    
    // Plot Companies
    for (const [name, data] of Object.entries(COMPANY_DATA)) {
        companyPoints[name] = createPoint(data.pos, data.color, name);
    }

    // Plot User
    userPoint = createPoint(initialUserPos, 0x38bdf8, 'YOU', true);

    window.addEventListener('resize', onWindowResize);
    animate();
    isInitialized = true;
}

function addLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const point = new THREE.PointLight(0xffffff, 1);
    point.position.set(10, 20, 10);
    scene.add(point);
}

function createPoint(pos, color, name, isUser = false) {
    const group = new THREE.Group();
    group.position.set(...pos);
    pointsGroup.add(group);

    const geometry = new THREE.SphereGeometry(isUser ? 0.35 : 0.25, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: color, 
        emissive: color, 
        emissiveIntensity: 0.3,
        shininess: 100 
    });
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    // Glow
    const glowGeo = new THREE.SphereGeometry(isUser ? 0.5 : 0.4, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.1 });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    group.add(glowMesh);

    // Label Sprite
    const sprite = createLabelSprite(name, color);
    sprite.position.y = isUser ? 0.7 : 0.5;
    group.add(sprite);

    return { group, pos: [...pos], color, name, label: sprite };
}

function createLabelSprite(text, color) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    
    ctx.font = '500 48px Inter, sans-serif';
    ctx.fillStyle = '#' + new THREE.Color(color).getHexString();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(4, 1, 1);
    return sprite;
}

function createGrid() {
    const size = 10;
    const divisions = 10;
    const gridXY = new THREE.GridHelper(size, divisions, 0x1e293b, 0x0f172a);
    gridXY.position.set(5, 5, 0);
    gridXY.rotation.x = Math.PI / 2;
    gridGroup.add(gridXY);

    const gridXZ = new THREE.GridHelper(size, divisions, 0x1e293b, 0x0f172a);
    gridXZ.position.set(5, 0, 5);
    gridGroup.add(gridXZ);
}

function createAxesWithLabels() {
    const axisMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.5 });
    
    const axes = [
        { dir: [12,0,0], label: 'DEPENDENCY', color: 0x94a3b8, labelPos: [13, 0, 0] },
        { dir: [0,12,0], label: 'INNOVATION', color: 0x94a3b8, labelPos: [0, 13, 0] },
        { dir: [0,0,12], label: 'ADAPTABILITY', color: 0x94a3b8, labelPos: [0, 0, 13] }
    ];

    axes.forEach(axis => {
        const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(...axis.dir)]);
        const line = new THREE.Line(geo, axisMat);
        scene.add(line);

        const lbl = createLabelSprite(axis.label, axis.color);
        lbl.scale.set(6, 1.5, 1);
        lbl.position.set(...axis.labelPos);
        labelsGroup.add(lbl);
    });
}

export function updateUserPoint(newPos, duration) {
    animateMove(userPoint.group, userPoint.pos, newPos, duration);
    userPoint.pos = [...newPos];
}

function animateMove(object, start, end, duration) {
    const startTime = performance.now();
    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        object.position.set(
            start[0] + (end[0] - start[0]) * ease,
            start[1] + (end[1] - start[1]) * ease,
            start[2] + (end[2] - start[2]) * ease
        );
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

export function startShiftAnimation(onComplete) {
    const duration = 4000; // Slower, intentional shift
    
    for (const [name, data] of Object.entries(COMPANY_DATA)) {
        const target = data.pos.map((v, i) => v + data.shift[i]);
        createTrajectory(data.pos, target, data.color);
        animateMove(companyPoints[name].group, data.pos, target, duration);
    }

    const userTarget = userPoint.pos.map((v, i) => v + (i===0 ? 1.5 : (i===2 ? 2.5 : 0)));
    createTrajectory(userPoint.pos, userTarget, 0x38bdf8);
    animateMove(userPoint.group, userPoint.pos, userTarget, duration);
    
    setTimeout(onComplete, duration);
}

function createTrajectory(start, end, color) {
    // Faded Sphere at start
    const geo = new THREE.SphereGeometry(0.15, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.2 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...start);
    scene.add(mesh);

    // Dashed Line
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineDashedMaterial({ 
        color: color, 
        dashSize: 0.2, 
        gapSize: 0.1, 
        transparent: true, 
        opacity: 0.4 
    });
    const line = new THREE.Line(lineGeo, lineMat);
    line.computeLineDistances();
    scene.add(line);
}

export function resetCamera() {
    controls.reset();
    applyDefaultAngle();
}

export function applyDefaultAngle() {
    camera.position.set(22, 18, 22);
    if (controls) controls.target.set(5, 5, 5);
}

export function focusUser() {
    controls.target.set(...userPoint.pos);
    const camTarget = [userPoint.pos[0] + 8, userPoint.pos[1] + 8, userPoint.pos[2] + 8];
    animateMove(camera, [camera.position.x, camera.position.y, camera.position.z], camTarget, 800);
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
