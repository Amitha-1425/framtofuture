// ============================================================
// Farm2Future 3D — Realistic Diorama Model
// Solar-powered processing unit on a green grass base
// with metal frame, detailed machinery, human workers, and plants
// Animated walkthrough: Chilli → Grinder → Powder → Packing → Packet
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ── Globals ──────────────────────────────────────────────────
let scene, camera, renderer, controls, clock;

// Scene objects
let zones = [];          // Zone groups for camera targets
let animChilli = null;
let animParticles = null;
let animPacket = null;
let humanWorkers = [];   // Human figure meshes with arm refs
let conveyorRollers = []; // Conveyor belt roller refs for spinning

// Journey
let journeyActive = false;
let journeyStep = 0;
let stepTimer = 0;

// ── Config ───────────────────────────────────────────────────
const BASE_W = 18, BASE_D = 12;
const ZONE_X = [-6, -2.5, 1.5, 5, 8];
const ZONE_Y = 0.6;
const BELT_Y = 0.72; // conveyor belt height

// ── Entry ────────────────────────────────────────────────────
export function run() {
    init();
    animate(0);
    window.runFarm2Future && window.runFarm2Future();
}

// ── Init ─────────────────────────────────────────────────────
function init() {
    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd4ccbe); // warm showroom beige

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 300);
    camera.position.set(12, 14, 22);
    camera.lookAt(0, 2, 0);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 2, 0);
    controls.minDistance = 6;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2.05;

    setupLighting();
    buildShowroomFloor();
    buildPedestal();
    buildGrassBase();
    buildMetalFrameWithSolarPanels();
    buildRoof();
    buildProcessingMachines();
    buildConveyorBelts();
    buildHumanWorkers();
    buildPlants();
    buildInfoPlaques();
    buildZoneSigns();
    buildAnimatedChilli();
    buildPowderParticles();
    buildFinalPacket();
    setupJourneyButton();

    window.addEventListener('resize', onWindowResize);
}

// ── Lighting ─────────────────────────────────────────────────
function setupLighting() {
    // Bright ambient to mimic exhibition hall
    scene.add(new THREE.AmbientLight(0xfff8f0, 0.65));

    // Main sun
    const sun = new THREE.DirectionalLight(0xfffff0, 1.8);
    sun.position.set(8, 20, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 60;
    sun.shadow.camera.left = -15;
    sun.shadow.camera.right = 15;
    sun.shadow.camera.top = 15;
    sun.shadow.camera.bottom = -15;
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    // Warm fill
    const fill = new THREE.DirectionalLight(0xffd8b0, 0.5);
    fill.position.set(-10, 8, -5);
    scene.add(fill);

    // Cool rim from behind
    const rim = new THREE.DirectionalLight(0xa0c0ff, 0.35);
    rim.position.set(0, 6, -14);
    scene.add(rim);

    // Hemisphere sky
    scene.add(new THREE.HemisphereLight(0xb0d0ff, 0x7a6a55, 0.4));
}

// ── Showroom marble floor ────────────────────────────────────
function buildShowroomFloor() {
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0xd4c8b4,
        roughness: 0.35,
        metalness: 0.05
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    floor.receiveShadow = true;
    scene.add(floor);
}

// ── Pedestal (wood + marble layers) ──────────────────────────
function buildPedestal() {
    const group = new THREE.Group();

    // Bottom wooden base
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.7, metalness: 0.05 });
    const woodBase = new THREE.Mesh(new THREE.BoxGeometry(BASE_W + 2, 0.35, BASE_D + 2), woodMat);
    woodBase.position.y = -0.95;
    woodBase.castShadow = true;
    woodBase.receiveShadow = true;
    group.add(woodBase);

    // Dark marble layer
    const marbleDarkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2, metalness: 0.4 });
    const marbleDark = new THREE.Mesh(new THREE.BoxGeometry(BASE_W + 1.2, 0.3, BASE_D + 1.2), marbleDarkMat);
    marbleDark.position.y = -0.55;
    marbleDark.castShadow = true;
    group.add(marbleDark);

    // Green marble layer
    const marbleGreenMat = new THREE.MeshStandardMaterial({ color: 0x3a6b4a, roughness: 0.25, metalness: 0.3 });
    const marbleGreen = new THREE.Mesh(new THREE.BoxGeometry(BASE_W + 0.8, 0.2, BASE_D + 0.8), marbleGreenMat);
    marbleGreen.position.y = -0.3;
    marbleGreen.castShadow = true;
    group.add(marbleGreen);

    // Silver trim strip
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.15 });
    const trim = new THREE.Mesh(new THREE.BoxGeometry(BASE_W + 0.6, 0.06, BASE_D + 0.6), trimMat);
    trim.position.y = -0.17;
    group.add(trim);

    // 4 wooden pedestal legs
    const legGeo = new THREE.CylinderGeometry(0.35, 0.3, 0.5, 8);
    [[-8, -5.5], [8, -5.5], [-8, 5.5], [8, 5.5]].forEach(([x, z]) => {
        const leg = new THREE.Mesh(legGeo, woodMat);
        leg.position.set(x, -1.35, z);
        leg.castShadow = true;
        group.add(leg);
    });

    scene.add(group);
}

// ── Green grass base ─────────────────────────────────────────
function buildGrassBase() {
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x5da83a, roughness: 0.85, metalness: 0.0 });
    const grass = new THREE.Mesh(new THREE.BoxGeometry(BASE_W, 0.25, BASE_D), grassMat);
    grass.position.y = -0.01;
    grass.receiveShadow = true;
    grass.castShadow = true;
    scene.add(grass);

    // Dirt edge strip
    const dirtMat = new THREE.MeshStandardMaterial({ color: 0x6e5c3e, roughness: 0.9 });
    const dirtEdge = new THREE.Mesh(new THREE.BoxGeometry(BASE_W + 0.1, 0.12, BASE_D + 0.1), dirtMat);
    dirtEdge.position.y = -0.14;
    scene.add(dirtEdge);
}

// ── Metal Frame Structure with Solar Panels ──────────────────
function buildMetalFrameWithSolarPanels() {
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.85, roughness: 0.2 });
    const group = new THREE.Group();

    // 8 vertical posts
    const postH = 6.5, postGeo = new THREE.CylinderGeometry(0.06, 0.06, postH, 8);
    const postPositions = [
        [-7.5, -4.5], [-7.5, 4.5], [7.5, -4.5], [7.5, 4.5],
        [-2, -4.5], [-2, 4.5], [4, -4.5], [4, 4.5]
    ];
    postPositions.forEach(([x, z]) => {
        const post = new THREE.Mesh(postGeo, metalMat);
        post.position.set(x, postH / 2, z);
        post.castShadow = true;
        group.add(post);

        // Base plate
        const basePlate = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.35), metalMat);
        basePlate.position.set(x, 0.05, z);
        group.add(basePlate);
    });

    // Horizontal cross beams at top
    const beamGeo1 = new THREE.CylinderGeometry(0.04, 0.04, BASE_D + 1, 8);
    [-7.5, -2, 4, 7.5].forEach(x => {
        const beam = new THREE.Mesh(beamGeo1, metalMat);
        beam.rotation.x = Math.PI / 2;
        beam.position.set(x, postH, 0);
        group.add(beam);
    });

    // Longitudinal beams
    const beamGeo2 = new THREE.CylinderGeometry(0.04, 0.04, BASE_W + 1, 8);
    [-4.5, 4.5].forEach(z => {
        const beam = new THREE.Mesh(beamGeo2, metalMat);
        beam.rotation.z = Math.PI / 2;
        beam.position.set(0, postH, z);
        group.add(beam);
    });

    // Diagonal braces on sides
    [-7.5, 7.5].forEach(x => {
        const braceLen = Math.sqrt(postH * postH + 2 * 2);
        const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, braceLen * 0.7, 6), metalMat);
        brace.position.set(x, postH / 2 + 1, 0);
        brace.rotation.z = Math.PI / 6 * (x > 0 ? -1 : 1);
        group.add(brace);
    });

    scene.add(group);

    // ── Solar Panels on roof ─────────────────────────
    const panelMat = new THREE.MeshStandardMaterial({
        color: 0x1a2f5c,
        metalness: 0.7,
        roughness: 0.08
    });
    const gridLineMat = new THREE.MeshStandardMaterial({ color: 0x3050aa, metalness: 0.6 });
    const framePanelMat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.9, roughness: 0.15 });

    const panelGroup = new THREE.Group();
    const panelRows = 2, panelCols = 5;
    const panelW = 2.8, panelD = 1.8;

    for (let r = 0; r < panelRows; r++) {
        for (let c = 0; c < panelCols; c++) {
            const px = -6 + c * 3.2;
            const pz = -2.5 + r * 5;
            const py = postH + 0.6 + r * 0.3;

            // Panel body
            const panel = new THREE.Mesh(new THREE.BoxGeometry(panelW, 0.08, panelD), panelMat);
            panel.position.set(px, py, pz);
            panel.rotation.x = Math.PI / 8;
            panel.castShadow = true;
            panel.receiveShadow = true;
            panelGroup.add(panel);

            // Grid lines
            for (let gl = 0; gl < 4; gl++) {
                const line = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, panelD * 0.95), gridLineMat);
                line.position.set(px - panelW * 0.35 + gl * (panelW * 0.7 / 3), py + 0.02, pz);
                line.rotation.x = Math.PI / 8;
                panelGroup.add(line);
            }
            for (let gl = 0; gl < 3; gl++) {
                const line = new THREE.Mesh(new THREE.BoxGeometry(panelW * 0.95, 0.1, 0.03), gridLineMat);
                line.position.set(px, py + 0.02, pz - panelD * 0.35 + gl * (panelD * 0.7 / 2));
                line.rotation.x = Math.PI / 8;
                panelGroup.add(line);
            }

            // Frame
            const frame = new THREE.Mesh(new THREE.BoxGeometry(panelW + 0.1, 0.12, panelD + 0.1), framePanelMat);
            frame.position.set(px, py - 0.03, pz);
            frame.rotation.x = Math.PI / 8;
            panelGroup.add(frame);

            // Panel support arm
            const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6), metalMat);
            arm.position.set(px, py - 0.5, pz);
            arm.rotation.x = Math.PI / 12;
            panelGroup.add(arm);
        }
    }
    scene.add(panelGroup);
}

// ── Corrugated Tin Roof ──────────────────────────────────────
function buildRoof() {
    const roofMat = new THREE.MeshStandardMaterial({
        color: 0x8a9aaa, metalness: 0.7, roughness: 0.35, side: THREE.DoubleSide
    });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.8, roughness: 0.2 });
    const roofGroup = new THREE.Group();

    const roofY = 5.8;  // just below the solar panel support arms
    const roofW = BASE_W - 1;
    const roofD = BASE_D - 2;

    // Left slope
    const slopeL = new THREE.Mesh(new THREE.BoxGeometry(roofW, 0.06, roofD / 2 + 0.5), roofMat);
    slopeL.position.set(0, roofY + 0.25, -roofD / 4);
    slopeL.rotation.x = Math.PI / 14;
    slopeL.castShadow = true;
    slopeL.receiveShadow = true;
    roofGroup.add(slopeL);

    // Right slope
    const slopeR = new THREE.Mesh(new THREE.BoxGeometry(roofW, 0.06, roofD / 2 + 0.5), roofMat);
    slopeR.position.set(0, roofY + 0.25, roofD / 4);
    slopeR.rotation.x = -Math.PI / 14;
    slopeR.castShadow = true;
    slopeR.receiveShadow = true;
    roofGroup.add(slopeR);

    // Ridge beam along the top
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(roofW + 0.4, 0.12, 0.12), trimMat);
    ridge.position.set(0, roofY + 0.48, 0);
    roofGroup.add(ridge);

    // Corrugation lines (visual detail)
    for (let ci = 0; ci < 12; ci++) {
        const cx = -roofW / 2 + 0.8 + ci * (roofW / 12);
        [-1, 1].forEach(side => {
            const line = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.07, roofD / 2 + 0.3), trimMat);
            line.position.set(cx, roofY + 0.26, side * roofD / 4);
            line.rotation.x = side * (-Math.PI / 14);
            roofGroup.add(line);
        });
    }

    // Front and back trim / fascia
    [-roofD / 2 - 0.3, roofD / 2 + 0.3].forEach(z => {
        const fascia = new THREE.Mesh(new THREE.BoxGeometry(roofW + 0.4, 0.3, 0.05), trimMat);
        fascia.position.set(0, roofY + 0.15, z);
        roofGroup.add(fascia);
    });

    // Side trim
    [-roofW / 2 - 0.2, roofW / 2 + 0.2].forEach(x => {
        const sideTrim = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, roofD + 0.6), trimMat);
        sideTrim.position.set(x, roofY + 0.15, 0);
        roofGroup.add(sideTrim);
    });

    // Gutter channels (small troughs at edges)
    [-roofD / 2 - 0.15, roofD / 2 + 0.15].forEach(z => {
        const gutter = new THREE.Mesh(new THREE.BoxGeometry(roofW + 0.2, 0.05, 0.15), roofMat);
        gutter.position.set(0, roofY, z);
        roofGroup.add(gutter);
    });

    scene.add(roofGroup);
}

// ── Processing Machines ──────────────────────────────────────
function buildProcessingMachines() {
    buildZone0_RawStorage();
    buildZone1_GrinderMachine();
    buildZone2_PowderOutput();
    buildZone3_PackingStation();
    buildZone4_FinalProduct();
}

// Materials
function steelMat() {
    return new THREE.MeshStandardMaterial({ color: 0xc8ccd0, metalness: 0.85, roughness: 0.15 });
}
function darkMat() {
    return new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.3, roughness: 0.8 });
}
function whiteMat() {
    return new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.5, metalness: 0.1 });
}

// Zone 0: Raw Chilli Storage — Baskets on a table
function buildZone0_RawStorage() {
    const g = new THREE.Group();
    g.position.set(ZONE_X[0], 0, 0);

    // Wooden table
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.8 });
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 1.8), tableMat);
    tableTop.position.y = 0.7;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    g.add(tableTop);
    // Table legs
    [[-0.9, -0.7], [0.9, -0.7], [-0.9, 0.7], [0.9, 0.7]].forEach(([x, z]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8), tableMat);
        leg.position.set(x, 0.35, z);
        g.add(leg);
    });

    // Pile of realistic chillies (curved lathe shape)
    const chilliMat = new THREE.MeshStandardMaterial({ color: 0xcc1100, roughness: 0.55 });
    const stemColorMat = new THREE.MeshStandardMaterial({ color: 0x2d7a2d, roughness: 0.7 });
    for (let i = 0; i < 20; i++) {
        const cg = createRealisticChilli(chilliMat, stemColorMat, 0.08 + Math.random() * 0.03);
        cg.position.set((Math.random() - 0.5) * 1.2, 0.82 + Math.random() * 0.1,
            (Math.random() - 0.5) * 0.9);
        cg.rotation.z = (Math.random() - 0.5) * 1.0;
        cg.rotation.y = Math.random() * Math.PI;
        g.add(cg);
    }

    // Woven basket
    const basketMat = new THREE.MeshStandardMaterial({ color: 0xb38b4d, roughness: 0.9 });
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.45, 12), basketMat);
    basket.position.set(0.6, 0.97, -0.3);
    g.add(basket);

    // Basket rim
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.035, 6, 12), basketMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0.6, 1.2, -0.3);
    g.add(rim);

    // Label board
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xffeedd, roughness: 0.6 }));
    sign.position.set(0, 1.4, -0.92);
    g.add(sign);

    scene.add(g);
    zones.push(g);
}

// Zone 1: Grinder/Pulverizer Machine (realistic)
function buildZone1_GrinderMachine() {
    const g = new THREE.Group();
    g.position.set(ZONE_X[1], 0, 0);

    const sm = steelMat();
    const dm = darkMat();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7, roughness: 0.35 });
    const greenLabel = new THREE.MeshStandardMaterial({ color: 0x228833, roughness: 0.5 });

    // Frame - 4 posts with rails
    const postH = 1.3;
    [[-0.45, 0.3], [0.45, 0.3], [-0.45, -0.3], [0.45, -0.3]].forEach(([x, z]) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, postH, 0.06), frameMat);
        post.position.set(x, postH / 2, z);
        post.castShadow = true;
        g.add(post);
    });
    // Rails
    [0.05, postH].forEach(y => {
        const rf = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.06), frameMat);
        rf.position.set(0, y, 0.3); g.add(rf);
        const rb = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.06), frameMat);
        rb.position.set(0, y, -0.3); g.add(rb);
        const rl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.6), frameMat);
        rl.position.set(-0.45, y, 0); g.add(rl);
        const rr = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.6), frameMat);
        rr.position.set(0.45, y, 0); g.add(rr);
    });
    // Shelf
    g.add((() => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.04, 0.62), frameMat); m.position.y = 0.08; return m; })());

    // Caster wheels
    [[-0.4, 0.25], [0.4, 0.25], [-0.4, -0.25], [0.4, -0.25]].forEach(([x, z]) => {
        const w = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), dm);
        w.position.set(x, -0.03, z);
        g.add(w);
    });

    // Motor body - tall box (left side)
    const motor = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.75, 0.55), sm);
    motor.position.set(-0.18, 0.7, 0);
    motor.castShadow = true;
    g.add(motor);

    // Motor top
    const motorTop = new THREE.Mesh(new THREE.BoxGeometry(0.47, 0.04, 0.57), sm);
    motorTop.position.set(-0.18, 1.1, 0);
    g.add(motorTop);

    // Green label
    const lbl = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.02), greenLabel);
    lbl.position.set(-0.18, 0.6, -0.29);
    g.add(lbl);

    // Grinding chamber (horizontal cylinder)
    const chamber = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.35, 18), sm);
    chamber.rotation.z = Math.PI / 2;
    chamber.position.set(0.15, 0.78, 0);
    chamber.castShadow = true;
    g.add(chamber);

    // Spinning blade reference
    const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 14), dm);
    blade.rotation.z = Math.PI / 2;
    blade.position.set(0.15, 0.78, 0);
    g.add(blade);
    g.userData.spinBody = blade;

    // Bowl/hopper on top (right side)
    const bowlPts = [];
    for (let i = 0; i <= 10; i++) {
        const a = (i / 10) * Math.PI * 0.55;
        bowlPts.push(new THREE.Vector2(Math.sin(a) * 0.3, -Math.cos(a) * 0.18));
    }
    const bowlGeo = new THREE.LatheGeometry(bowlPts, 16);
    const bowl = new THREE.Mesh(bowlGeo, sm);
    bowl.position.set(0.25, 1.25, 0);
    bowl.castShadow = true;
    g.add(bowl);
    const bowlRim = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.03, 6, 20), sm);
    bowlRim.position.set(0.25, 1.22, 0);
    g.add(bowlRim);

    // Feed chute
    const chute = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8), sm);
    chute.rotation.z = -Math.PI / 7;
    chute.position.set(0.18, 1.05, 0);
    g.add(chute);

    // Collection drum below
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.42, 16), sm);
    drum.position.set(0.25, 0.32, 0);
    drum.castShadow = true;
    g.add(drum);
    const drumLid = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.04, 16), sm);
    drumLid.position.set(0.25, 0.54, 0);
    g.add(drumLid);

    // Output pipe
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8), sm);
    pipe.rotation.x = Math.PI / 6;
    pipe.position.set(0.22, 0.63, 0.08);
    g.add(pipe);

    scene.add(g);
    zones.push(g);
}

// Zone 2: Powder Output — Conveyor with sieve
function buildZone2_PowderOutput() {
    const g = new THREE.Group();
    g.position.set(ZONE_X[2], 0, 0);

    const sm = steelMat();
    const dm = darkMat();

    // Sieve table
    const sieveFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 1.2), sm);
    sieveFrame.position.y = 0.8;
    sieveFrame.castShadow = true;
    g.add(sieveFrame);

    // Table legs
    [[-0.7, -0.5], [0.7, -0.5], [-0.7, 0.5], [0.7, 0.5]].forEach(([x, z]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), sm);
        leg.position.set(x, 0.4, z);
        g.add(leg);
    });

    // Sieve mesh (flat thin disc)
    const sieveMat = new THREE.MeshStandardMaterial({
        color: 0xddcc88, roughness: 0.7, metalness: 0.3, transparent: true, opacity: 0.6
    });
    const sieve = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.05, 20), sieveMat);
    sieve.position.set(-0.2, 0.88, 0);
    g.add(sieve);
    const sieveRim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.03, 6, 20), sm);
    sieveRim.position.set(-0.2, 0.91, 0);
    g.add(sieveRim);

    // Powder pile (orange mound)
    const powderMat = new THREE.MeshStandardMaterial({ color: 0xdd6622, roughness: 0.95 });
    const pile = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 10), powderMat);
    pile.scale.set(1.4, 0.5, 1.4);
    pile.position.set(0.5, 0.88, 0);
    g.add(pile);

    // Container below
    const container = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.6), sm);
    container.position.set(0, 0.25, 0);
    container.castShadow = true;
    g.add(container);

    scene.add(g);
    zones.push(g);
}

// Zone 3: Packing Station (with table, bags, and space for workers)
function buildZone3_PackingStation() {
    const g = new THREE.Group();
    g.position.set(ZONE_X[3], 0, 0);

    const tableMat = new THREE.MeshStandardMaterial({ color: 0x9e8b70, roughness: 0.7, metalness: 0.05 });
    const bagMat = new THREE.MeshStandardMaterial({ color: 0xf5e6b8, roughness: 0.85 });

    // Packing table
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 1.5), tableMat);
    tableTop.position.y = 0.75;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    g.add(tableTop);
    [[-1, -0.6], [1, -0.6], [-1, 0.6], [1, 0.6]].forEach(([x, z]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.75, 8), tableMat);
        leg.position.set(x, 0.375, z);
        g.add(leg);
    });

    // Bags/pouches on table
    for (let i = 0; i < 6; i++) {
        const bag = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.12), bagMat);
        bag.position.set(-0.6 + i * 0.28, 0.97, -0.1 + (i % 2) * 0.3);
        bag.rotation.y = (Math.random() - 0.5) * 0.3;
        bag.castShadow = true;
        g.add(bag);
    }

    // Weighing scale on table
    const scalePlatform = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 12), steelMat());
    scalePlatform.position.set(-0.8, 0.82, 0.3);
    g.add(scalePlatform);
    const scalePost = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8), steelMat());
    scalePost.position.set(-0.8, 1.0, 0.3);
    g.add(scalePost);

    // Sealing machine
    const sealer = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.2), darkMat());
    sealer.position.set(0.8, 0.92, 0);
    sealer.castShadow = true;
    g.add(sealer);
    const sealerArm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.18), steelMat());
    sealerArm.position.set(0.8, 1.08, 0);
    g.add(sealerArm);

    scene.add(g);
    zones.push(g);
}

// Zone 4: Final Product Display
function buildZone4_FinalProduct() {
    const g = new THREE.Group();
    g.position.set(ZONE_X[4], 0, 0);

    // Display shelf
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.7 });
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.8), shelfMat);
    shelf.position.y = 0.9;
    shelf.castShadow = true;
    g.add(shelf);
    [[-0.7, -0.3], [0.7, -0.3], [-0.7, 0.3], [0.7, 0.3]].forEach(([x, z]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), shelfMat);
        leg.position.set(x, 0.45, z);
        g.add(leg);
    });

    // Finished packed products
    const packetMat = new THREE.MeshStandardMaterial({ color: 0xff8800, roughness: 0.5 });
    const labelMat = new THREE.MeshStandardMaterial({ color: 0xfff8ee, roughness: 0.4 });
    for (let i = 0; i < 5; i++) {
        const pkt = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.32, 0.12), packetMat);
        pkt.position.set(-0.5 + i * 0.26, 1.1, 0);
        pkt.castShadow = true;
        g.add(pkt);
        // Label
        const lbl = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.22), labelMat);
        lbl.position.set(-0.5 + i * 0.26, 1.1, 0.065);
        g.add(lbl);
    }

    // "Value Added Product" sign
    const signMat = new THREE.MeshStandardMaterial({ color: 0x1a1a3a, roughness: 0.4, metalness: 0.3 });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.05), signMat);
    sign.position.set(0, 1.65, -0.35);
    g.add(sign);
    // Gold label text plate
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4a732, metalness: 0.8, roughness: 0.2 });
    const goldPlate = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.3, 0.06), goldMat);
    goldPlate.position.set(0, 1.65, -0.32);
    g.add(goldPlate);

    scene.add(g);
    zones.push(g);
}

// ── Helper: Realistic Chilli shape ───────────────────────────
function createRealisticChilli(bodyMat, stemMat, scale) {
    const cg = new THREE.Group();
    // Curved body using lathe
    const pts = [];
    for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const r = Math.sin(t * Math.PI) * 0.38 * (1 - t * 0.5); // tapers toward tip
        const y = t * 2.5 - 1.25;
        pts.push(new THREE.Vector2(r, y));
    }
    const bodyGeo = new THREE.LatheGeometry(pts, 8);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.setScalar(scale);
    cg.add(body);
    // Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015 * scale / 0.08, 0.02 * scale / 0.08, 0.12, 6), stemMat);
    stem.position.y = scale * 1.35;
    cg.add(stem);
    return cg;
}

// ── Conveyor Belts connecting stations ───────────────────────
function buildConveyorBelts() {
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7, roughness: 0.3 });
    const rollerMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.8, roughness: 0.2 });

    // Build conveyor between each consecutive pair of zones
    for (let i = 0; i < ZONE_X.length - 1; i++) {
        const x1 = ZONE_X[i] + 1.0;  // start past zone center
        const x2 = ZONE_X[i + 1] - 1.0; // end before next zone center
        const length = x2 - x1;
        const cx = (x1 + x2) / 2;

        const bg = new THREE.Group();

        // Belt surface
        const belt = new THREE.Mesh(new THREE.BoxGeometry(length, 0.04, 0.5), beltMat);
        belt.position.set(cx, BELT_Y, 0);
        belt.receiveShadow = true;
        bg.add(belt);

        // Side rails
        [-0.28, 0.28].forEach(z => {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(length, 0.08, 0.04), frameMat);
            rail.position.set(cx, BELT_Y + 0.02, z);
            bg.add(rail);
        });

        // Support legs
        const legCount = Math.max(2, Math.round(length / 1.2));
        for (let li = 0; li < legCount; li++) {
            const lx = x1 + (li + 0.5) * (length / legCount);
            [-0.22, 0.22].forEach(z => {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, BELT_Y, 6), frameMat);
                leg.position.set(lx, BELT_Y / 2, z);
                bg.add(leg);
            });
        }

        // Rollers (animated spinning)
        const rollerCount = Math.max(3, Math.round(length / 0.6));
        for (let ri = 0; ri < rollerCount; ri++) {
            const rx = x1 + (ri + 0.5) * (length / rollerCount);
            const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.44, 8), rollerMat);
            roller.rotation.x = Math.PI / 2;
            roller.position.set(rx, BELT_Y + 0.03, 0);
            bg.add(roller);
            conveyorRollers.push(roller);
        }

        scene.add(bg);
    }
}

// ── Human Workers ────────────────────────────────────────────
function buildHumanWorkers() {
    // Packing station workers - face TOWARD the table (table at z=0, workers at z>0, so face -z)
    buildHuman(ZONE_X[3] - 0.3, 0, 1.1, Math.PI, 0x2255aa);   // blue shirt, faces table
    buildHuman(ZONE_X[3] + 0.5, 0, 1.0, Math.PI * 0.9, 0x22aa55); // green shirt, faces table

    // Grinder worker - stands behind machine, faces it
    buildHuman(ZONE_X[1] + 0.1, 0, 0.85, Math.PI, 0xaa5522);  // brown shirt, faces machine

    // Raw storage worker - stands to the side, faces table
    buildHuman(ZONE_X[0] + 0.8, 0, 1.0, Math.PI * 0.8, 0xcc3333);  // red shirt, faces table
}

function buildHuman(x, baseY, z, rotY, shirtColor) {
    const g = new THREE.Group();
    g.position.set(x, baseY, z);
    g.rotation.y = rotY;
    const S = 1.6; // scale factor for realistic size

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc99a6b, roughness: 0.7 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x333355, roughness: 0.7 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

    // Feet
    const footGeo = new THREE.BoxGeometry(0.12 * S, 0.05 * S, 0.18 * S);
    const footL = new THREE.Mesh(footGeo, shoeMat);
    footL.position.set(-0.07 * S, 0.025 * S, 0);
    g.add(footL);
    const footR = new THREE.Mesh(footGeo, shoeMat);
    footR.position.set(0.07 * S, 0.025 * S, 0);
    g.add(footR);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.045 * S, 0.05 * S, 0.5 * S, 8);
    const legL = new THREE.Mesh(legGeo, pantsMat);
    legL.position.set(-0.06 * S, 0.3 * S, 0);
    g.add(legL);
    const legR = new THREE.Mesh(legGeo, pantsMat);
    legR.position.set(0.06 * S, 0.3 * S, 0);
    g.add(legR);

    // Hips
    const hips = new THREE.Mesh(new THREE.BoxGeometry(0.2 * S, 0.08 * S, 0.14 * S), pantsMat);
    hips.position.set(0, 0.55 * S, 0);
    g.add(hips);

    // Torso (slight forward lean)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.24 * S, 0.32 * S, 0.15 * S), shirtMat);
    torso.position.set(0, 0.72 * S, 0);
    torso.rotation.x = -0.08;
    torso.castShadow = true;
    g.add(torso);

    // Shoulders
    const shoulders = new THREE.Mesh(new THREE.BoxGeometry(0.32 * S, 0.06 * S, 0.15 * S), shirtMat);
    shoulders.position.set(0, 0.88 * S, 0);
    g.add(shoulders);

    // Arms — pivoted at shoulder
    const armGeo = new THREE.CylinderGeometry(0.035 * S, 0.04 * S, 0.32 * S, 8);
    const armLPivot = new THREE.Group();
    armLPivot.position.set(-0.17 * S, 0.88 * S, 0.02 * S);
    const armL = new THREE.Mesh(armGeo, shirtMat);
    armL.position.y = -0.16 * S;
    // Forearm (skin)
    const forearmL = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * S, 0.035 * S, 0.22 * S, 8), skinMat);
    forearmL.position.y = -0.32 * S;
    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.035 * S, 6, 6), skinMat);
    handL.position.y = -0.44 * S;
    armLPivot.add(armL, forearmL, handL);
    armLPivot.rotation.x = -Math.PI / 4;
    g.add(armLPivot);

    const armRPivot = new THREE.Group();
    armRPivot.position.set(0.17 * S, 0.88 * S, 0.02 * S);
    const armR = new THREE.Mesh(armGeo, shirtMat);
    armR.position.y = -0.16 * S;
    const forearmR = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * S, 0.035 * S, 0.22 * S, 8), skinMat);
    forearmR.position.y = -0.32 * S;
    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.035 * S, 6, 6), skinMat);
    handR.position.y = -0.44 * S;
    armRPivot.add(armR, forearmR, handR);
    armRPivot.rotation.x = -Math.PI / 4;
    g.add(armRPivot);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * S, 0.045 * S, 0.08 * S, 8), skinMat);
    neck.position.set(0, 0.94 * S, 0);
    g.add(neck);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.1 * S, 12, 12), skinMat);
    head.position.set(0, 1.06 * S, 0);
    head.castShadow = true;
    g.add(head);

    // Hair
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.103 * S, 12, 12), hairMat);
    hair.position.set(0, 1.08 * S, -0.015 * S);
    hair.scale.set(1, 0.72, 1);
    g.add(hair);

    // Store arm pivots for animation
    g.userData.armL = armLPivot;
    g.userData.armR = armRPivot;

    scene.add(g);
    humanWorkers.push(g);
}

// ── Plants ───────────────────────────────────────────────────
function buildPlants() {
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d7a2d, roughness: 0.8 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.9 });

    const plantPositions = [
        [-8, 0, -3], [-8, 0, 3], [8, 0, -3], [8, 0, 3],
        [-4.5, 0, -4.5], [6, 0, -4.5], [-4.5, 0, 4.5], [2, 0, 4.5]
    ];

    plantPositions.forEach(([x, y, z]) => {
        const pg = new THREE.Group();
        pg.position.set(x, y, z);

        // Trunk
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.6 + Math.random() * 0.4, 6), trunkMat);
        trunk.position.y = 0.3;
        pg.add(trunk);

        // Bush leaves (overlapping spheres)
        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18 + Math.random() * 0.12, 6, 6), leafMat);
            leaf.position.set((Math.random() - 0.5) * 0.3, 0.5 + Math.random() * 0.4, (Math.random() - 0.5) * 0.3);
            leaf.scale.set(1, 0.7, 1);
            pg.add(leaf);
        }

        scene.add(pg);
    });
}

// ── Info Plaques (on the pedestal) ───────────────────────────
function buildInfoPlaques() {
    const plaqueMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.4 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4a732, metalness: 0.8, roughness: 0.2 });

    // Front plaque
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 0.05), plaqueMat);
    plaque.position.set(0, -0.6, BASE_D / 2 + 0.5);
    scene.add(plaque);

    // Gold inlay
    const gold = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.3, 0.06), goldMat);
    gold.position.set(0, -0.6, BASE_D / 2 + 0.52);
    scene.add(gold);

    // Scale plaque (right side)
    const scalePlaque = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.05), plaqueMat);
    scalePlaque.position.set(5, -0.6, BASE_D / 2 + 0.5);
    scene.add(scalePlaque);
    const scaleGold = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.2, 0.06), goldMat);
    scaleGold.position.set(5, -0.6, BASE_D / 2 + 0.52);
    scene.add(scaleGold);
}

// ── Zone Signs (visual labels for uneducated users) ──────────
function buildZoneSigns() {
    const signData = [
        { label: '1', color: 0xcc1100, x: ZONE_X[0], desc: 'CHILLI' },
        { label: '2', color: 0x888888, x: ZONE_X[1], desc: 'GRINDER' },
        { label: '3', color: 0xdd6622, x: ZONE_X[2], desc: 'POWDER' },
        { label: '4', color: 0x2255aa, x: ZONE_X[3], desc: 'PACKING' },
        { label: '5', color: 0xff8800, x: ZONE_X[4], desc: 'PRODUCT' }
    ];

    signData.forEach((sd, i) => {
        const sg = new THREE.Group();
        sg.position.set(sd.x, 0, -3.2);

        // Sign post
        const postMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.6, roughness: 0.3 });
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8), postMat);
        post.position.y = 1.1;
        sg.add(post);

        // Sign board background
        const boardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        const board = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.06), boardMat);
        board.position.y = 2.3;
        board.castShadow = true;
        sg.add(board);

        // Colored header strip
        const headerMat = new THREE.MeshStandardMaterial({ color: sd.color, roughness: 0.4 });
        const header = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.07), headerMat);
        header.position.y = 2.6;
        sg.add(header);

        // Step number circle
        const circleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
        const circle = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 16), circleMat);
        circle.rotation.x = Math.PI / 2;
        circle.position.set(-0.45, 2.6, 0.04);
        sg.add(circle);

        // Icon representation on board (simple colored shape)
        const iconMat = new THREE.MeshStandardMaterial({ color: sd.color, roughness: 0.5 });
        if (i === 0) {
            // Chilli icon - red elongated shape
            const icon = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), iconMat);
            icon.scale.set(1, 2.5, 1);
            icon.position.set(0, 2.2, 0.04);
            sg.add(icon);
        } else if (i === 1) {
            // Grinder icon - gear shape (cylinder)
            const icon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 8), iconMat);
            icon.rotation.x = Math.PI / 2;
            icon.position.set(0, 2.2, 0.04);
            sg.add(icon);
        } else if (i === 2) {
            // Powder icon - pile (flat sphere)
            const icon = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), iconMat);
            icon.scale.set(1.5, 0.5, 1);
            icon.position.set(0, 2.15, 0.04);
            sg.add(icon);
        } else if (i === 3) {
            // Packing icon - box
            const icon = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.06), iconMat);
            icon.position.set(0, 2.2, 0.04);
            sg.add(icon);
        } else {
            // Product icon - finished packet
            const icon = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.06), iconMat);
            icon.position.set(0, 2.2, 0.04);
            sg.add(icon);
            // Star on top
            const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.06),
                new THREE.MeshStandardMaterial({ color: 0xd4a732, metalness: 0.8 }));
            star.position.set(0, 2.38, 0.04);
            sg.add(star);
        }

        // Arrow to next zone (except last)
        if (i < signData.length - 1) {
            const arrowMat = new THREE.MeshStandardMaterial({ color: 0x1a8a4a, roughness: 0.4 });
            const arrowShaft = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 0.06), arrowMat);
            arrowShaft.position.set(sd.x + 1.2, 1.8, -3.2);
            scene.add(arrowShaft);
            // Arrow head
            const arrowHead = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2, 4), arrowMat);
            arrowHead.rotation.z = -Math.PI / 2;
            arrowHead.position.set(sd.x + 1.7, 1.8, -3.2);
            scene.add(arrowHead);
        }

        scene.add(sg);
    });
}

// ── Animated Chilli ──────────────────────────────────────────
function buildAnimatedChilli() {
    const chilliMat = new THREE.MeshStandardMaterial({ color: 0xcc1100, roughness: 0.5 });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x228822, roughness: 0.7 });
    const g = createRealisticChilli(chilliMat, stemMat, 0.12);
    g.position.set(ZONE_X[0], 1.5, 0);
    g.visible = false;
    scene.add(g);
    animChilli = g;
}

// ── Powder Container (bowl with powder pile sliding on belt) ─
function buildPowderParticles() {
    const g = new THREE.Group();

    // Small steel bowl
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 0.8, roughness: 0.2 });
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.12, 14), bowlMat);
    bowl.position.y = 0.06;
    g.add(bowl);
    const bowlRim = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.02, 6, 14), bowlMat);
    bowlRim.position.y = 0.12;
    g.add(bowlRim);

    // Powder pile inside bowl
    const powderMat = new THREE.MeshStandardMaterial({ color: 0xdd6622, roughness: 0.95 });
    const pile = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), powderMat);
    pile.scale.set(1, 0.45, 1);
    pile.position.y = 0.14;
    g.add(pile);

    g.position.set(ZONE_X[1], BELT_Y, 0);
    g.visible = false;
    scene.add(g);
    animParticles = g;
}

// ── Final Packet ─────────────────────────────────────────────
function buildFinalPacket() {
    const g = new THREE.Group();
    const pktMat = new THREE.MeshStandardMaterial({ color: 0xff8800, roughness: 0.5 });
    const lblMat = new THREE.MeshStandardMaterial({ color: 0xfff8ee, roughness: 0.4 });

    const box = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.34, 0.12), pktMat);
    g.add(box);
    const lbl = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.24), lblMat);
    lbl.position.z = 0.065;
    g.add(lbl);

    g.position.set(ZONE_X[4], 1.5, 0);
    g.visible = false;
    g.scale.set(0.01, 0.01, 0.01);
    scene.add(g);
    animPacket = g;
}

// ── Journey ──────────────────────────────────────────────────
function setupJourneyButton() {
    const btn = document.getElementById('startJourneyBtn');
    if (!btn) return;
    btn.addEventListener('click', () => { if (!journeyActive) startJourney(); });
}

const STEP_DURATIONS = [5.0, 6.0, 5.5, 6.0, 5.0];

const CAM_POSITIONS = [
    new THREE.Vector3(ZONE_X[0] + 3, 4, 6),
    new THREE.Vector3(ZONE_X[1] + 2, 3.5, 5),
    new THREE.Vector3(ZONE_X[2] + 2, 3.5, 5),
    new THREE.Vector3(ZONE_X[3] + 3, 4, 5.5),
    new THREE.Vector3(ZONE_X[4] + 2, 3.5, 5)
];
const CAM_TARGETS = [
    new THREE.Vector3(ZONE_X[0], 1, 0),
    new THREE.Vector3(ZONE_X[1], 0.8, 0),
    new THREE.Vector3(ZONE_X[2], 0.8, 0),
    new THREE.Vector3(ZONE_X[3], 0.8, 0),
    new THREE.Vector3(ZONE_X[4], 1, 0)
];

function startJourney() {
    journeyActive = true;
    journeyStep = 0;
    stepTimer = 0;

    animChilli.visible = false;
    animChilli.position.set(ZONE_X[0], BELT_Y + 0.15, 0);
    animChilli.scale.set(1, 1, 1);
    animPacket.visible = false;
    animPacket.scale.set(0.01, 0.01, 0.01);
    animParticles.visible = false;
    animParticles.position.set(ZONE_X[1], BELT_Y, 0);
    animParticles.scale.set(0.01, 0.01, 0.01);

    highlightStep(1);
    tweenCamera(0);
    animChilli.visible = true;

    const btn = document.getElementById('startJourneyBtn');
    if (btn) btn.textContent = 'Walkthrough Running…';
}

function tweenCamera(stepIdx) {
    if (stepIdx >= CAM_POSITIONS.length) return;
    const tp = CAM_POSITIONS[stepIdx], tl = CAM_TARGETS[stepIdx];
    new TWEEN.Tween(camera.position).to({ x: tp.x, y: tp.y, z: tp.z }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut).start();
    new TWEEN.Tween(controls.target).to({ x: tl.x, y: tl.y, z: tl.z }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut).start();
}

function highlightStep(num) {
    for (let i = 1; i <= 5; i++) {
        const el = document.getElementById('step' + i);
        if (el) el.classList.toggle('active', i === num);
    }
}

// ── Process Animation ────────────────────────────────────────
function updateProcess(delta) {
    if (!journeyActive) return;
    stepTimer += delta;
    const dur = STEP_DURATIONS[journeyStep];
    const t = Math.min(stepTimer / dur, 1.0);

    switch (journeyStep) {
        case 0: // Chilli glides along conveyor from zone 0 → zone 1
            animChilli.visible = true;
            animChilli.position.x = THREE.MathUtils.lerp(ZONE_X[0], ZONE_X[1], t);
            animChilli.position.y = BELT_Y + 0.15; // rides on conveyor
            animChilli.rotation.y = t * Math.PI; // gentle spin
            break;

        case 1: // Chilli drops into grinder; powder container appears from grinder
            animChilli.position.x = ZONE_X[1];
            animChilli.position.y = THREE.MathUtils.lerp(BELT_Y + 0.15, BELT_Y - 0.1, t);
            animChilli.scale.setScalar(1 - t * 0.95);
            // Powder container grows from grinder output
            animParticles.visible = true;
            animParticles.position.set(ZONE_X[1] + 0.3, BELT_Y, 0);
            animParticles.scale.setScalar(t);
            if (zones[1] && zones[1].userData.spinBody) {
                zones[1].userData.spinBody.rotation.x += delta * 10;
            }
            break;

        case 2: // Powder container slides along conveyor belt to powder output
            animChilli.visible = false;
            animParticles.visible = true;
            animParticles.scale.setScalar(1);
            animParticles.position.x = THREE.MathUtils.lerp(ZONE_X[1], ZONE_X[2], t);
            animParticles.position.y = BELT_Y;
            break;

        case 3: // Powder container slides to packing; packet forms at packing station
            animParticles.position.x = THREE.MathUtils.lerp(ZONE_X[2], ZONE_X[3], t);
            animParticles.position.y = BELT_Y;
            if (t > 0.7) {
                animParticles.scale.setScalar(1 - (t - 0.7) / 0.3);
            }
            animPacket.visible = t > 0.5;
            if (t > 0.5) {
                const pt = (t - 0.5) / 0.5;
                animPacket.position.set(ZONE_X[3], BELT_Y + 0.18, 0);
                animPacket.scale.setScalar(pt * 1.2);
            }
            break;

        case 4: // Packet glides on conveyor to final product display
            animPacket.position.x = THREE.MathUtils.lerp(ZONE_X[3], ZONE_X[4], t);
            animPacket.position.y = BELT_Y + 0.3;
            animPacket.scale.setScalar(1.2 + t * 0.1);
            break;
    }

    if (t >= 1.0) {
        journeyStep++;
        stepTimer = 0;
        if (journeyStep >= 5) {
            journeyActive = false;
            highlightStep(-1);
            const btn = document.getElementById('startJourneyBtn');
            if (btn) btn.textContent = 'Restart Walkthrough';
            return;
        }
        highlightStep(journeyStep + 1);
        tweenCamera(journeyStep);
    }
}

// ── Idle Animations ──────────────────────────────────────────
function updateIdleAnimations(time, delta) {
    // Animate human workers — arms swing as if working
    humanWorkers.forEach((h, i) => {
        const phase = time * 3.0 + i * 1.7;
        if (h.userData.armL) {
            h.userData.armL.rotation.x = -Math.PI / 4 + Math.sin(phase) * 0.35;
        }
        if (h.userData.armR) {
            h.userData.armR.rotation.x = -Math.PI / 4 + Math.sin(phase + Math.PI) * 0.35;
        }
        // Slight body sway
        h.position.y = Math.sin(time * 2 + i * 1.1) * 0.006;
    });

    // Spin grinder blade slowly when idle
    if (zones[1] && zones[1].userData.spinBody && !journeyActive) {
        zones[1].userData.spinBody.rotation.x += delta * 1.5;
    }

    // Spin conveyor rollers
    conveyorRollers.forEach(r => {
        r.rotation.y += delta * 2.0;
    });
}

// ── Animate Loop ─────────────────────────────────────────────
function animate(time) {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const sec = clock.elapsedTime;

    TWEEN.update(time);
    controls.update();

    updateIdleAnimations(sec, delta);
    updateProcess(delta);

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
