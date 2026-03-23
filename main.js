import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- INITIAL STATE & DATA ---
const state = {
    screen: 'intro',
    currentQuestion: 0,
    userStats: {
        dependency: 5,
        innovation: 5,
        adaptability: 5
    },
    userPosition: [5, 5, 5],
    shiftedUserPosition: [5, 5, 5],
};

const questions = [
    {
        text: "What is your primary product focus?",
        options: [
            { text: "Advanced logic chip design", impact: { innovation: 2.0, dependency: -0.5 } },
            { text: "High-volume node manufacturing", impact: { dependency: 2.0, innovation: -0.5 } },
            { text: "Specialized integrated sensors", impact: { innovation: 1.0, adaptability: 1.0 } }
        ]
    },
    {
        text: "How do you approach Research & Development?",
        options: [
            { text: "Internal labs and proprietary IP", impact: { adaptability: 1.5, innovation: 1.0 } },
            { text: "Strategic global partnerships", impact: { innovation: 2.0, dependency: 0.5 } },
            { text: "Open-source ecosystem contribution", impact: { adaptability: 2.0, innovation: 0.5 } }
        ]
    },
    {
        text: "What is your top growth priority?",
        options: [
            { text: "Rapid global market expansion", impact: { innovation: 1.5, dependency: 1.0 } },
            { text: "End-to-end supply chain independence", impact: { adaptability: 2.5, dependency: -1.0 } },
            { text: "Leading-edge technical specialization", impact: { innovation: 2.5, adaptability: -0.5 } }
        ]
    },
    {
        text: "How do you position your market offering?",
        options: [
            { text: "A broad, vertically integrated ecosystem", impact: { adaptability: 2.0, innovation: 1.0 } },
            { text: "A highly specialized component provider", impact: { innovation: 1.5, dependency: 0.5 } }
        ]
    },
    {
        text: "Under evolving conditions, how do you pivot?",
        options: [
            { text: "Optimize existing infrastructure for efficiency", impact: { dependency: 1.0, adaptability: 0.5 } },
            { text: "Modularize designs for regional adaptation", impact: { adaptability: 2.5, innovation: 0.5 } }
        ]
    }
];

// --- APP FLOW ---

function init() {
    // Button listeners
    document.getElementById('btn-start').onclick = () => showScreen('strategy');
    document.getElementById('btn-to-viz').onclick = () => showScreen('viz');
    document.getElementById('btn-to-growth').onclick = triggerGrowthPhase;
    document.getElementById('btn-start-shift').onclick = triggerChinaShift;

    // Start with Intro
    showScreen('intro');
    renderQuestion();
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${screenId}`).classList.add('active');
    state.screen = screenId;

    if (screenId === 'summary') {
        updateSummary();
    }
    
    if (screenId === 'viz') {
        initViz();
    }
}

function renderQuestion() {
    const q = questions[state.currentQuestion];
    document.querySelector('.step-indicator').textContent = `Step ${state.currentQuestion + 1} of ${questions.length}`;
    document.getElementById('question-text').textContent = q.text;

    const container = document.getElementById('options-container');
    container.innerHTML = '';

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt.text;
        btn.onclick = () => handleAnswer(opt.impact);
        container.appendChild(btn);
    });
}

function handleAnswer(impact) {
    for (const key in impact) {
        state.userStats[key] = Math.max(0, Math.min(10, state.userStats[key] + impact[key]));
    }

    state.currentQuestion++;
    if (state.currentQuestion < questions.length) {
        renderQuestion();
    } else {
        state.userPosition = [state.userStats.dependency, state.userStats.innovation, state.userStats.adaptability];
        showScreen('summary');
    }
}

function updateSummary() {
    document.getElementById('bar-dependency').style.width = `${state.userStats.dependency * 10}%`;
    document.getElementById('bar-innovation').style.width = `${state.userStats.innovation * 10}%`;
    document.getElementById('bar-adaptability').style.width = `${state.userStats.adaptability * 10}%`;

    let profile = "";
    if (state.userStats.innovation > 7) profile += "highly innovative, ";
    if (state.userStats.adaptability > 7) profile += "flexible, ";
    if (state.userStats.dependency > 7) profile += "ecosystem-focused ";
    else profile += "specialized ";
    
    document.getElementById('profile-description').textContent = 
        `Your strategy emphasizes a ${profile}approach to the semiconductor market.`;
}

// --- VISUALIZATION WRAPPER ---
let viz = null;

function initViz() {
    if (viz) return;
    // We will implement visualization.js as a separate file and import it
    // For now, let's keep it in a placeholder.
    import('./visualization.js').then(module => {
        viz = module;
        viz.init(state.userPosition);
    });
}

function triggerGrowthPhase() {
    document.getElementById('viz-message').textContent = "Your strategy begins to take shape.";
    document.getElementById('btn-to-growth').style.display = 'none';
    
    // Subtle move
    state.userPosition = state.userPosition.map(v => v + (Math.random() - 0.5) * 0.5);
    viz.updateUserPoint(state.userPosition, 1000);
    
    setTimeout(() => {
        showScreen('china-intro');
    }, 2000);
}

function triggerChinaShift() {
    showScreen('viz');
    document.getElementById('viz-message').textContent = "Reshaping strategies for the China environment...";
    
    // Calculate shifted positions
    // This will be handled inside visualization.js
    viz.startShiftAnimation(() => {
        setTimeout(() => {
            showScreen('final');
            renderExplanations();
        }, 1500);
    });
}

function renderExplanations() {
    const container = document.getElementById('explanation-container');
    container.innerHTML = '';
    
    const shifts = [
        {
            title: "Your Strategy Evolution",
            change: "Strategic focus repositioned toward regional adaptability.",
            why: "Operating environments influence how business models prioritize ecosystem coordination and tool access.",
            link: "https://www.bis.doc.gov"
        },
        {
            title: "NVIDIA (Adaptation)",
            change: "Strategy reconfigured with a focus on bespoke regional architectures.",
            why: "Product designs are often adjusted to meet specific regulatory requirements while maintaining market participation.",
            link: "https://nvidianews.nvidia.com"
        },
        {
            title: "TSMC (Stability)",
            change: "Continued focus on mature node capacity and authorized operations.",
            why: "Maintaining a global manufacturing footprint requires securing specific operating authorizations for regional facilities.",
            link: "https://www.tsmc.com/english/aboutTSMC/TSMC_China"
        },
        {
            title: "SMIC (Domestic Focus)",
            change: "Deepening alignment with the domestic electronics ecosystem.",
            why: "Growth strategies are often reshaped by the internal demand and supply chain structures of the host environment.",
            link: "https://www.smics.com/en/site/company_financialSummary"
        },
        {
            title: "Intel (Localization)",
            change: "Transition toward modular and customized platform solutions.",
            why: "Localization strategies can involve offering customized configurations to meet the specific needs of regional cloud and PC markets.",
            link: "https://www.intel.cn"
        },
        {
            title: "Huawei (Ecosystem)",
            change: "Accelerated shift toward a vertically integrated internal ecosystem.",
            why: "Supply chain reconfiguration can lead companies to internalize dependencies and build independent software and chip platforms.",
            link: "https://www.huawei.com/en/annual-report/2023"
        }
    ];

    shifts.forEach(s => {
        const div = document.createElement('div');
        div.className = 'explanation-item';
        div.innerHTML = `
            <h3>${s.title}</h3>
            <h4>WHAT CHANGED</h4>
            <p>${s.change}</p>
            <h4>WHY</h4>
            <p>${s.why}</p>
            <a href="${s.link}" target="_blank" class="learn-more">Learn more (Official) →</a>
        `;
        container.appendChild(div);
    });
}

init();
