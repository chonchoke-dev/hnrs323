import * as viz from './visualization.js';

const state = {
    screen: 'intro',
    currentQuestion: 0,
    userStats: { dependency: 4, innovation: 4, adaptability: 4 },
    userPosition: [4, 4, 4],
};

const questions = [
    {
        text: "Select your primary technology focus:",
        options: [
            { text: "Core IP and high-end design architecture", impact: { innovation: 2.5, dependency: -0.5 } },
            { text: "Scalable volume-node manufacturing", impact: { dependency: 2.5, innovation: -0.5 } },
            { text: "Niche specialization in specialized sensors", impact: { innovation: 1.0, adaptability: 1.5 } }
        ]
    },
    {
        text: "How is your research ecosystem structured?",
        options: [
            { text: "Internal proprietary labs with closed IP", impact: { adaptability: 1.5, innovation: 1.5 } },
            { text: "Global multi-party research consortiums", impact: { innovation: 2.0, dependency: 1.0 } },
            { text: "Open regional collaborations and standards", impact: { adaptability: 2.5, innovation: 0.5 } }
        ]
    },
    {
        text: "What drives your long-term growth?",
        options: [
            { text: "Speed and global market expansion", impact: { innovation: 2.0, dependency: 1.5 } },
            { text: "Independence and supply chain sovereignty", impact: { adaptability: 3.0, dependency: -1.0 } },
            { text: "Dominance in specialized component supply", impact: { innovation: 2.5, adaptability: 0.5 } }
        ]
    },
    {
        text: "How do you position your offering?",
        options: [
            { text: "Broad, vertically integrated platform", impact: { adaptability: 2.5, innovation: 1.5 } },
            { text: "Highly refined, single-purpose component", impact: { innovation: 2.0, dependency: 0.5 } }
        ]
    },
    {
        text: "Strategic response to shifting conditions:",
        options: [
            { text: "Deepen existing infrastructure specialization", impact: { dependency: 1.5, adaptability: 0.5 } },
            { text: "Reconfigure architectures for regional parity", impact: { adaptability: 3.0, innovation: 1.0 } }
        ]
    }
];

function init() {
    // Flow Buttons
    document.getElementById('btn-start').onclick = () => showScreen('strategy');
    document.getElementById('btn-to-viz').onclick = () => showScreen('viz');
    document.getElementById('btn-viz-action').onclick = handleVizAction;
    document.getElementById('btn-to-shift').onclick = triggerChinaShift;
    document.getElementById('btn-to-final').onclick = () => showScreen('final');

    // Viz Controls
    document.getElementById('btn-reset-cam').onclick = viz.resetCamera;
    document.getElementById('btn-default-angle').onclick = viz.applyDefaultAngle;
    document.getElementById('btn-focus-user').onclick = viz.focusUser;

    showScreen('intro');
    renderQuestion();
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${id}`).classList.add('active');
    state.screen = id;

    if (id === 'summary') updateSummary();
    if (id === 'viz') {
        viz.init(state.userPosition);
        resetVizOverlay();
    }
}

function renderQuestion() {
    const q = questions[state.currentQuestion];
    document.getElementById('question-text').textContent = q.text;
    const container = document.getElementById('options-container');
    container.innerHTML = '';

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt.text;
        btn.onclick = () => {
            for (const key in opt.impact) {
                state.userStats[key] = Math.max(0, Math.min(10, state.userStats[key] + opt.impact[key]));
            }
            state.currentQuestion++;
            if (state.currentQuestion < questions.length) renderQuestion();
            else {
                state.userPosition = [state.userStats.dependency, state.userStats.innovation, state.userStats.adaptability];
                showScreen('summary');
            }
        };
        container.appendChild(btn);
    });
}

function updateSummary() {
    document.getElementById('bar-dependency').style.width = `${state.userStats.dependency * 10}%`;
    document.getElementById('bar-innovation').style.width = `${state.userStats.innovation * 10}%`;
    document.getElementById('bar-adaptability').style.width = `${state.userStats.adaptability * 10}%`;

    let profile = "Your company profile indicates a ";
    if (state.userStats.innovation > 7) profile += "high-innovation, ";
    if (state.userStats.adaptability > 7) profile += "highly adaptive ";
    else profile += "specialized ";
    profile += "approach to the global semiconductor landscape.";
    document.getElementById('profile-description').textContent = profile;
}

function resetVizOverlay() {
    document.getElementById('viz-status-text').textContent = "Current Strategic Map";
    document.getElementById('shift-legend').style.display = 'none';
    document.getElementById('btn-viz-action').textContent = "Observe Growth";
    document.getElementById('btn-viz-action').dataset.phase = 'plot';
}

function handleVizAction() {
    const btn = document.getElementById('btn-viz-action');
    const phase = btn.dataset.phase;

    if (phase === 'plot') {
        // Growth Phase
        document.getElementById('viz-status-text').textContent = "Your strategy begins to take shape.";
        btn.style.opacity = '0';
        btn.style.pointerEvents = 'none';
        
        state.userPosition = state.userPosition.map(v => v + (Math.random() - 0.5) * 0.8);
        viz.updateUserPoint(state.userPosition, 1500);

        setTimeout(() => {
            showScreen('china-intro');
        }, 2500);
    } else if (phase === 'shift-complete') {
        showScreen('explanation');
        renderExplanations();
    }
}

function triggerChinaShift() {
    showScreen('viz');
    document.getElementById('viz-status-text').textContent = "Repositioning strategies in the operational environment...";
    document.getElementById('shift-legend').style.display = 'flex';
    
    const btn = document.getElementById('btn-viz-action');
    btn.style.opacity = '0';
    btn.style.pointerEvents = 'none';

    viz.startShiftAnimation(() => {
        document.getElementById('viz-status-text').textContent = "Strategy Reshaped (Concept Insight Only)";
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'all';
        btn.textContent = "See Analytical Insights";
        btn.dataset.phase = 'shift-complete';
    });
}

function renderExplanations() {
    const container = document.getElementById('explanation-container');
    container.innerHTML = '';
    
    const shifts = [
        {
            title: "Your Shift Pattern",
            change: "Increased adaptability and regional ecosystem coordination.",
            why: "Tool access and supply chain structures influence how business models align with local conditions.",
            link: "https://www.bis.doc.gov"
        },
        {
            title: "NVIDIA Concept (Regional Parity)",
            change: "Strategic development of bespoke regional architectures.",
            why: "Adjusting product roadmaps allows for market alignment within evolving regulatory frameworks.",
            link: "https://nvidianews.nvidia.com"
        },
        {
            title: "TSMC Concept (Nanjing VEU)",
            change: "Focused continuity in authorized manufacture of mature nodes.",
            why: "Specific authorizations allow facilities to maintain stable output for local customers.",
            link: "https://www.tsmc.com/english/aboutTSMC/TSMC_China"
        },
        {
            title: "Huawei Concept (Verticalization)",
            change: "Rapid integration of internal software and hardware ecosystems.",
            why: "Supply shifts often lead companies to internalize dependencies and build autonomous platforms.",
            link: "https://www.huawei.com/en/annual-report/2023"
        }
    ];

    shifts.forEach(s => {
        const div = document.createElement('div');
        div.className = 'explanation-item';
        div.innerHTML = `
            <h3>${s.title}</h3>
            <h4>Change Observation</h4>
            <p>${s.change}</p>
            <h4>Analysis</h4>
            <p>${s.why}</p>
            <a href="${s.link}" target="_blank" class="learn-more">Official Source →</a>
        `;
        container.appendChild(div);
    });
}

init();
