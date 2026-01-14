// ==================== GAME CONFIGURATION ====================
const CONFIG = {
    PLAYER_SPEED: 0.4,
    PLAYER_HEALTH: 100,
    CAMERA_DISTANCE: 14,
    CAMERA_HEIGHT: 9,
    CITY_SIZE: 100,
    BUILDING_COUNT: 25,
    ENEMY_SPAWN_DISTANCE: 30,
    WAVE_BASE_ENEMIES: 8,
    WAVE_ENEMY_INCREMENT: 5,
    ENEMY_HITBOX: 2.5
};

// ==================== WEAPONS DATA ====================
const WEAPONS = [
    { name: 'PISTOLA', damage: 30, fireRate: 150, ammo: 12, maxAmmo: 12, spread: 0.02, auto: false, icon: 'pistol' },
    { name: 'REVÓLVER', damage: 65, fireRate: 250, ammo: 6, maxAmmo: 6, spread: 0.01, auto: false, icon: 'revolver' },
    { name: 'SMG', damage: 22, fireRate: 50, ammo: 30, maxAmmo: 30, spread: 0.05, auto: true, icon: 'smg' },
    { name: 'SHOTGUN', damage: 120, fireRate: 400, ammo: 8, maxAmmo: 8, spread: 0.15, auto: false, icon: 'shotgun' },
    { name: 'RIFLE', damage: 45, fireRate: 70, ammo: 25, maxAmmo: 25, spread: 0.03, auto: true, icon: 'rifle' },
    { name: 'SNIPER', damage: 180, fireRate: 600, ammo: 5, maxAmmo: 5, spread: 0, auto: false, icon: 'sniper' },
    { name: 'AK-47', damage: 50, fireRate: 60, ammo: 30, maxAmmo: 30, spread: 0.04, auto: true, icon: 'ak47' },
    { name: 'METRALHADORA', damage: 35, fireRate: 40, ammo: 100, maxAmmo: 100, spread: 0.06, auto: true, icon: 'lmg' }
];

// ==================== WEAPON ICONS SVG ====================
const WEAPON_ICONS = {
    pistol: `<svg viewBox="0 0 100 100"><path d="M20 45 L60 45 L60 35 L75 35 L75 50 L85 50 L85 60 L60 60 L60 70 L40 70 L40 60 L20 60 Z"/></svg>`,
    revolver: `<svg viewBox="0 0 100 100"><path d="M15 45 L55 45 L55 35 L70 35 L70 50 L85 50 L85 60 L55 60 L55 75 L35 75 L35 60 L15 60 Z"/><circle cx="45" cy="52" r="8" fill="none" stroke="currentColor" stroke-width="3"/></svg>`,
    smg: `<svg viewBox="0 0 100 100"><rect x="15" y="40" width="55" height="20" rx="3"/><rect x="70" y="35" width="20" height="30" rx="2"/><rect x="30" y="60" width="10" height="25" rx="2"/><rect x="25" y="25" width="15" height="20" rx="2"/></svg>`,
    shotgun: `<svg viewBox="0 0 100 100"><rect x="10" y="42" width="70" height="16" rx="3"/><rect x="80" y="40" width="15" height="20" rx="2"/><rect x="55" y="58" width="15" height="20" rx="2"/><rect x="20" y="35" width="8" height="10" rx="1"/></svg>`,
    rifle: `<svg viewBox="0 0 100 100"><rect x="5" y="42" width="75" height="16" rx="2"/><rect x="80" y="38" width="18" height="24" rx="2"/><rect x="45" y="58" width="12" height="22" rx="2"/><rect x="15" y="30" width="20" height="15" rx="2"/><rect x="60" y="35" width="15" height="10" rx="1"/></svg>`,
    sniper: `<svg viewBox="0 0 100 100"><rect x="5" y="44" width="80" height="12" rx="2"/><rect x="85" y="40" width="12" height="20" rx="2"/><rect x="50" y="56" width="10" height="25" rx="2"/><circle cx="25" cy="35" r="10" fill="none" stroke="currentColor" stroke-width="3"/><line x1="25" y1="25" x2="25" y2="45" stroke="currentColor" stroke-width="2"/><line x1="15" y1="35" x2="35" y2="35" stroke="currentColor" stroke-width="2"/></svg>`,
    ak47: `<svg viewBox="0 0 100 100"><rect x="5" y="40" width="70" height="18" rx="2"/><rect x="75" y="35" width="20" height="28" rx="2"/><path d="M40 58 L55 58 L50 85 L35 85 Z"/><rect x="15" y="28" width="25" height="15" rx="2"/></svg>`,
    lmg: `<svg viewBox="0 0 100 100"><rect x="5" y="38" width="75" height="22" rx="3"/><rect x="80" y="32" width="18" height="34" rx="2"/><rect x="35" y="60" width="20" height="30" rx="3"/><rect x="10" y="25" width="30" height="18" rx="2"/><circle cx="55" cy="75" r="8" fill="none" stroke="currentColor" stroke-width="3"/></svg>`
};

// ==================== GAME STATE ====================
let scene, camera, renderer;
let player, playerMixer, playerActions = {};
let enemies = [];
let bullets = [];
let buildings = [];
let cars = [];
let currentWeapon = 0;
let unlockedWeapons = [true, false, false, false, false, false, false, false];
let ammo, health = CONFIG.PLAYER_HEALTH;
let wave = 1, kills = 0, enemiesInWave = 0;
let gameRunning = false;
let lastShot = 0;
let isShooting = false;
let isJumping = false;
let jumpVelocity = 0;
let gravity = -0.02;

// Input state
let joystickActive = false;
let joystickVector = { x: 0, y: 0 };
let mousePos = { x: 0, y: 0 };
let keys = {};
let playerRotation = 0;
let isDesktop = !('ontouchstart' in window);

// ==================== INITIALIZATION ====================
function init() {
    // Scene - Dark atmosphere
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a15);
    scene.fog = new THREE.Fog(0x0a0a15, 30, 80);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    
    // Renderer with optimizations
    renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    document.getElementById('game-container').insertBefore(renderer.domElement, document.getElementById('menu'));

    // Lighting
    setupLighting();
    
    // Ground
    createGround();
    
    // City
    generateCity();
    
    // Player
    createPlayer();
    
    // Setup controls
    setupControls();
    
    // Setup weapon selector
    setupWeaponSelector();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    
    // Initial weapon
    ammo = WEAPONS[currentWeapon].ammo;
    updateHUD();
    
    // Start render loop
    animate();
}

function setupLighting() {
    // Ambient light - Dark and moody
    const ambient = new THREE.AmbientLight(0x1a1a2e, 0.4);
    scene.add(ambient);
    
    // Directional light (moonlight)
    const moon = new THREE.DirectionalLight(0x6a7b9e, 0.5);
    moon.position.set(50, 100, 50);
    moon.castShadow = true;
    moon.shadow.mapSize.width = 1024;
    moon.shadow.mapSize.height = 1024;
    moon.shadow.camera.near = 0.5;
    moon.shadow.camera.far = 300;
    moon.shadow.camera.left = -50;
    moon.shadow.camera.right = 50;
    moon.shadow.camera.top = 50;
    moon.shadow.camera.bottom = -50;
    scene.add(moon);
    
    // Hemisphere light - Dark sky
    const hemi = new THREE.HemisphereLight(0x0a0a15, 0x1a1a1a, 0.3);
    scene.add(hemi);
    
    // Reduced atmospheric point lights for performance
    const streetLightColor = 0xff8800;
    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            if (Math.random() > 0.7) {
                const light = new THREE.PointLight(streetLightColor, 0.6, 15);
                light.position.set(i * 25 + 7, 6, j * 25 + 7);
                scene.add(light);
            }
        }
    }
}

function createGround() {
    // Main ground - Dark asphalt
    const groundGeo = new THREE.PlaneGeometry(CONFIG.CITY_SIZE * 2, CONFIG.CITY_SIZE * 2);
    const groundMat = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        roughness: 0.95
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Road markings
    createRoads();
}

function createRoads() {
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d });
    const lineMat = new THREE.MeshStandardMaterial({ color: 0x444444, emissive: 0x222222 });
    
    // Main roads
    for (let i = -2; i <= 2; i++) {
        // Horizontal roads
        const hRoad = new THREE.Mesh(
            new THREE.PlaneGeometry(CONFIG.CITY_SIZE * 2, 12),
            roadMat
        );
        hRoad.rotation.x = -Math.PI / 2;
        hRoad.position.set(0, 0.01, i * 25);
        scene.add(hRoad);
        
        // Vertical roads
        const vRoad = new THREE.Mesh(
            new THREE.PlaneGeometry(12, CONFIG.CITY_SIZE * 2),
            roadMat
        );
        vRoad.rotation.x = -Math.PI / 2;
        vRoad.position.set(i * 25, 0.01, 0);
        scene.add(vRoad);
        
        // Road lines with dim glow
        const hLine = new THREE.Mesh(
            new THREE.PlaneGeometry(CONFIG.CITY_SIZE * 2, 0.3),
            lineMat
        );
        hLine.rotation.x = -Math.PI / 2;
        hLine.position.set(0, 0.02, i * 25);
        scene.add(hLine);
        
        const vLine = new THREE.Mesh(
            new THREE.PlaneGeometry(0.3, CONFIG.CITY_SIZE * 2),
            lineMat
        );
        vLine.rotation.x = -Math.PI / 2;
        vLine.position.set(i * 25, 0.02, 0);
        scene.add(vLine);
    }
}


// ==================== CITY GENERATION ====================
function generateCity() {
    const buildingColors = [0x1a1a1a, 0x2d2d2d, 0x1a2332, 0x2a1a1a, 0x1a2a1a, 0x252525];
    
    for (let i = 0; i < CONFIG.BUILDING_COUNT; i++) {
        let x, z;
        let validPosition = false;
        
        while (!validPosition) {
            x = (Math.random() - 0.5) * CONFIG.CITY_SIZE * 1.5;
            z = (Math.random() - 0.5) * CONFIG.CITY_SIZE * 1.5;
            
            // Check if not on road or too close to center
            const onRoad = Math.abs(x % 25) < 8 || Math.abs(z % 25) < 8;
            const tooClose = Math.sqrt(x * x + z * z) < 15;
            
            if (!onRoad && !tooClose) validPosition = true;
        }
        
        const width = 8 + Math.random() * 12;
        const depth = 8 + Math.random() * 12;
        const height = 10 + Math.random() * 30;
        
        const building = createBuilding(width, height, depth, buildingColors[Math.floor(Math.random() * buildingColors.length)]);
        building.position.set(x, height / 2, z);
        scene.add(building);
        buildings.push({ mesh: building, bounds: { x, z, width, depth } });
    }
    
    // Add some props
    addCityProps();
}

function createBuilding(width, height, depth, color) {
    const group = new THREE.Group();
    
    // Main structure
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    
    // Simplified windows - fewer for performance
    const windowMat = new THREE.MeshStandardMaterial({ 
        color: 0xff8800, 
        emissive: 0xff6600,
        emissiveIntensity: 0.6,
        roughness: 0.1 
    });
    
    const windowSize = 1.5;
    const windowSpacing = 4;
    
    // Only add windows on front and back
    for (let y = -height / 2 + 4; y < height / 2 - 2; y += windowSpacing) {
        for (let x = -width / 2 + 3; x < width / 2 - 2; x += windowSpacing) {
            // Front windows
            const windowFront = new THREE.Mesh(
                new THREE.PlaneGeometry(windowSize, windowSize * 1.5),
                windowMat
            );
            windowFront.position.set(x, y, depth / 2 + 0.01);
            group.add(windowFront);
            
            // Back windows
            const windowBack = windowFront.clone();
            windowBack.position.z = -depth / 2 - 0.01;
            windowBack.rotation.y = Math.PI;
            group.add(windowBack);
        }
    }
    
    return group;
}

function addCityProps() {
    // Street lights with glow - Reduced for performance
    const lightPoleGeo = new THREE.CylinderGeometry(0.15, 0.2, 6, 6);
    const lightPoleMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    
    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            if (Math.random() > 0.6) continue;
            
            const pole = new THREE.Mesh(lightPoleGeo, lightPoleMat);
            pole.position.set(i * 25 + 7, 3, j * 25 + 7);
            pole.castShadow = true;
            scene.add(pole);
            
            // Light fixture with glow
            const fixture = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.3, 0.5),
                new THREE.MeshStandardMaterial({ 
                    color: 0xff8800,
                    emissive: 0xff6600,
                    emissiveIntensity: 0.8
                })
            );
            fixture.position.set(i * 25 + 7, 6, j * 25 + 7);
            scene.add(fixture);
        }
    }
    
    // Dumpsters - Dark green, reduced count
    const dumpsterGeo = new THREE.BoxGeometry(2, 1.5, 1);
    const dumpsterMat = new THREE.MeshStandardMaterial({ color: 0x1a3a1a });
    
    for (let i = 0; i < 8; i++) {
        const dumpster = new THREE.Mesh(dumpsterGeo, dumpsterMat);
        dumpster.position.set(
            (Math.random() - 0.5) * CONFIG.CITY_SIZE,
            0.75,
            (Math.random() - 0.5) * CONFIG.CITY_SIZE
        );
        dumpster.rotation.y = Math.random() * Math.PI;
        dumpster.castShadow = true;
        scene.add(dumpster);
    }
    
    // Cars (parked) - Dark colors with collision, reduced count
    const carColors = [0x3a0000, 0x00003a, 0x3a3a00, 0x003a00, 0x2a2a2a, 0x0a0a0a];
    
    for (let i = 0; i < 12; i++) {
        const color = carColors[Math.floor(Math.random() * carColors.length)];
        const car = createCar(color);
        
        let x, z;
        let validPosition = false;
        
        while (!validPosition) {
            x = (Math.random() - 0.5) * CONFIG.CITY_SIZE;
            z = (Math.random() - 0.5) * CONFIG.CITY_SIZE;
            
            // Check if not on road center or too close to spawn
            const onRoadCenter = Math.abs(x % 25) < 3 || Math.abs(z % 25) < 3;
            const tooClose = Math.sqrt(x * x + z * z) < 10;
            
            if (!onRoadCenter && !tooClose) validPosition = true;
        }
        
        car.position.set(x, 0, z);
        car.rotation.y = Math.random() * Math.PI * 2;
        scene.add(car);
        
        // Store collision bounds
        cars.push({
            mesh: car,
            bounds: { x, z, width: 4, depth: 2 }
        });
    }
}

function createCar(color) {
    const group = new THREE.Group();
    
    // Body
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(4, 1, 2),
        new THREE.MeshStandardMaterial({ color })
    );
    body.position.y = 0.7;
    body.castShadow = true;
    group.add(body);
    
    // Top
    const top = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.8, 1.8),
        new THREE.MeshStandardMaterial({ color })
    );
    top.position.set(-0.3, 1.5, 0);
    top.castShadow = true;
    group.add(top);
    
    // Wheels - Simplified to 8 segments
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 8);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    
    const wheelPositions = [
        [1.2, 0.4, 1], [1.2, 0.4, -1],
        [-1.2, 0.4, 1], [-1.2, 0.4, -1]
    ];
    
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(...pos);
        wheel.rotation.x = Math.PI / 2;
        group.add(wheel);
    });
    
    return group;
}

// ==================== PLAYER ====================
function createPlayer() {
    player = new THREE.Group();
    
    // Body (torso)
    const torsoGeo = new THREE.BoxGeometry(1, 1.2, 0.6);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x1a237e }); // Police blue
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.3;
    torso.castShadow = true;
    player.add(torso);
    
    // Vest
    const vestGeo = new THREE.BoxGeometry(1.1, 0.8, 0.7);
    const vestMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const vest = new THREE.Mesh(vestGeo, vestMat);
    vest.position.y = 1.4;
    vest.castShadow = true;
    player.add(vest);
    
    // Badge
    const badgeGeo = new THREE.CircleGeometry(0.1, 6);
    const badgeMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(0.3, 1.5, 0.36);
    player.add(badge);
    
    // Head
    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.15;
    head.castShadow = true;
    player.add(head);
    
    // Police cap
    const capGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 8);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x1a237e });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 2.45;
    player.add(cap);
    
    // Cap visor
    const visorGeo = new THREE.BoxGeometry(0.4, 0.05, 0.25);
    const visor = new THREE.Mesh(visorGeo, capMat);
    visor.position.set(0, 2.38, 0.25);
    player.add(visor);
    
    // Arms
    const armGeo = new THREE.BoxGeometry(0.25, 0.8, 0.25);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x1a237e });
    
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.65, 1.3, 0);
    leftArm.castShadow = true;
    player.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.65, 1.3, 0);
    rightArm.castShadow = true;
    player.add(rightArm);
    
    // Hands
    const handGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const handMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    
    const leftHand = new THREE.Mesh(handGeo, handMat);
    leftHand.position.set(-0.65, 0.8, 0.2);
    player.add(leftHand);
    
    const rightHand = new THREE.Mesh(handGeo, handMat);
    rightHand.position.set(0.65, 0.8, 0.2);
    player.add(rightHand);
    
    // Legs
    const legGeo = new THREE.BoxGeometry(0.35, 0.9, 0.35);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0d1b2a });
    
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.25, 0.45, 0);
    leftLeg.castShadow = true;
    player.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.25, 0.45, 0);
    rightLeg.castShadow = true;
    player.add(rightLeg);
    
    // Belt with holster
    const beltGeo = new THREE.BoxGeometry(1.05, 0.15, 0.65);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x2d2d2d });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.y = 0.95;
    player.add(belt);
    
    // Weapon in hands
    player.weapon = createWeaponModel(currentWeapon);
    player.weapon.position.set(0.4, 1.1, 0.5);
    player.add(player.weapon);
    
    player.position.y = 0;
    player.userData = { animTime: 0 };
    scene.add(player);
}

function createWeaponModel(weaponIndex) {
    const group = new THREE.Group();
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x2d2d2d, metalness: 0.6 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    
    switch(weaponIndex) {
        case 0: // Pistol
            const pistolBody = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.25, 0.5), gunMat);
            group.add(pistolBody);
            const pistolGrip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.3, 0.15), gunMat);
            pistolGrip.position.set(0, -0.2, -0.1);
            pistolGrip.rotation.x = 0.3;
            group.add(pistolGrip);
            break;
            
        case 1: // Revolver
            const revolverBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.45), gunMat);
            group.add(revolverBody);
            const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.15, 8), gunMat);
            cylinder.rotation.x = Math.PI / 2;
            cylinder.position.set(0, 0, -0.1);
            group.add(cylinder);
            const revolverGrip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.12), woodMat);
            revolverGrip.position.set(0, -0.18, -0.15);
            revolverGrip.rotation.x = 0.4;
            group.add(revolverGrip);
            break;
            
        case 2: // SMG
            const smgBody = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.6), gunMat);
            group.add(smgBody);
            const smgMag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.1), gunMat);
            smgMag.position.set(0, -0.2, 0);
            group.add(smgMag);
            const smgStock = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.25), gunMat);
            smgStock.position.set(0, 0, -0.4);
            group.add(smgStock);
            break;
            
        case 3: // Shotgun
            const shotgunBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), gunMat);
            shotgunBarrel.rotation.x = Math.PI / 2;
            shotgunBarrel.position.z = 0.2;
            group.add(shotgunBarrel);
            const shotgunBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.4), gunMat);
            shotgunBody.position.z = -0.2;
            group.add(shotgunBody);
            const shotgunStock = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.3), woodMat);
            shotgunStock.position.set(0, -0.02, -0.5);
            group.add(shotgunStock);
            break;
            
        case 4: // Rifle
            const rifleBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.8), gunMat);
            group.add(rifleBody);
            const rifleMag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.08), gunMat);
            rifleMag.position.set(0, -0.15, 0.1);
            group.add(rifleMag);
            const rifleStock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.25), gunMat);
            rifleStock.position.set(0, 0, -0.5);
            group.add(rifleStock);
            const rifleScope = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8), gunMat);
            rifleScope.rotation.x = Math.PI / 2;
            rifleScope.position.set(0, 0.12, 0.1);
            group.add(rifleScope);
            break;
            
        case 5: // Sniper
            const sniperBody = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 1.1), gunMat);
            group.add(sniperBody);
            const sniperScope = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.25, 8), gunMat);
            sniperScope.rotation.x = Math.PI / 2;
            sniperScope.position.set(0, 0.12, 0.2);
            group.add(sniperScope);
            const sniperStock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.35), woodMat);
            sniperStock.position.set(0, -0.02, -0.6);
            group.add(sniperStock);
            break;
            
        case 6: // AK-47
            const akBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.75), gunMat);
            group.add(akBody);
            const akMag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, 0.1), gunMat);
            akMag.position.set(0, -0.18, 0.1);
            akMag.rotation.x = 0.3;
            group.add(akMag);
            const akStock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.3), woodMat);
            akStock.position.set(0, -0.02, -0.5);
            group.add(akStock);
            const akGrip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 0.08), woodMat);
            akGrip.position.set(0, -0.12, -0.15);
            group.add(akGrip);
            break;
            
        case 7: // LMG
            const lmgBody = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.9), gunMat);
            group.add(lmgBody);
            const lmgBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.15), gunMat);
            lmgBox.position.set(0, -0.15, 0.15);
            group.add(lmgBox);
            const lmgBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), gunMat);
            lmgBarrel.rotation.x = Math.PI / 2;
            lmgBarrel.position.z = 0.55;
            group.add(lmgBarrel);
            const lmgStock = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.25), gunMat);
            lmgStock.position.set(0, 0, -0.55);
            group.add(lmgStock);
            break;
    }
    
    return group;
}


// ==================== ENEMIES ====================
const ENEMY_TYPES = [
    { name: 'Bandido', color: 0x8B0000, health: 50, speed: 0.15, damage: 10, scale: 1 },
    { name: 'Capanga', color: 0x4a0080, health: 80, speed: 0.12, damage: 15, scale: 1.1 },
    { name: 'Chefão', color: 0x1a1a1a, health: 150, speed: 0.09, damage: 25, scale: 1.3 },
    { name: 'Atirador', color: 0x006400, health: 40, speed: 0.18, damage: 20, scale: 0.95 }
];

function createEnemy(type) {
    const enemyType = ENEMY_TYPES[type];
    const enemy = new THREE.Group();
    enemy.userData = {
        type: type,
        health: enemyType.health,
        maxHealth: enemyType.health,
        speed: enemyType.speed,
        damage: enemyType.damage,
        lastAttack: 0,
        name: enemyType.name
    };
    
    const scale = enemyType.scale;
    
    // Body variations based on type
    switch(type) {
        case 0: // Bandido básico - camiseta e jeans
            createBasicBandit(enemy, enemyType.color, scale);
            break;
        case 1: // Capanga - jaqueta de couro
            createCapanga(enemy, enemyType.color, scale);
            break;
        case 2: // Chefão - terno
            createChefao(enemy, enemyType.color, scale);
            break;
        case 3: // Atirador - camuflado
            createAtirador(enemy, enemyType.color, scale);
            break;
    }
    
    // Health bar
    const healthBarBg = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 0.1),
        new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    healthBarBg.position.y = 2.8 * scale;
    healthBarBg.name = 'healthBarBg';
    enemy.add(healthBarBg);
    
    const healthBar = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    healthBar.position.y = 2.8 * scale;
    healthBar.position.z = 0.01;
    healthBar.name = 'healthBar';
    enemy.add(healthBar);
    
    return enemy;
}

function createBasicBandit(enemy, color, scale) {
    // Head with bandana
    const headGeo = new THREE.BoxGeometry(0.45 * scale, 0.45 * scale, 0.45 * scale);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xd4a574 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2 * scale;
    head.castShadow = true;
    enemy.add(head);
    
    // Bandana
    const bandanaGeo = new THREE.BoxGeometry(0.5 * scale, 0.15 * scale, 0.5 * scale);
    const bandanaMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const bandana = new THREE.Mesh(bandanaGeo, bandanaMat);
    bandana.position.y = 2.15 * scale;
    enemy.add(bandana);
    
    // Torso (t-shirt)
    const torsoGeo = new THREE.BoxGeometry(0.9 * scale, 1 * scale, 0.5 * scale);
    const torsoMat = new THREE.MeshStandardMaterial({ color: color });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.25 * scale;
    torso.castShadow = true;
    enemy.add(torso);
    
    // Arms
    const armGeo = new THREE.BoxGeometry(0.22 * scale, 0.7 * scale, 0.22 * scale);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xd4a574 });
    
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.6 * scale, 1.2 * scale, 0);
    leftArm.castShadow = true;
    enemy.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.6 * scale, 1.2 * scale, 0);
    rightArm.castShadow = true;
    enemy.add(rightArm);
    
    // Legs (jeans)
    const legGeo = new THREE.BoxGeometry(0.3 * scale, 0.8 * scale, 0.3 * scale);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1a3a5c });
    
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.22 * scale, 0.4 * scale, 0);
    leftLeg.castShadow = true;
    enemy.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.22 * scale, 0.4 * scale, 0);
    rightLeg.castShadow = true;
    enemy.add(rightLeg);
}

function createCapanga(enemy, color, scale) {
    // Head with sunglasses
    const headGeo = new THREE.BoxGeometry(0.5 * scale, 0.5 * scale, 0.5 * scale);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xc4956a });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.1 * scale;
    head.castShadow = true;
    enemy.add(head);
    
    // Sunglasses
    const glassGeo = new THREE.BoxGeometry(0.5 * scale, 0.1 * scale, 0.1 * scale);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.8 });
    const glasses = new THREE.Mesh(glassGeo, glassMat);
    glasses.position.set(0, 2.15 * scale, 0.26 * scale);
    enemy.add(glasses);
    
    // Leather jacket
    const torsoGeo = new THREE.BoxGeometry(1 * scale, 1.1 * scale, 0.55 * scale);
    const torsoMat = new THREE.MeshStandardMaterial({ color: color });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.3 * scale;
    torso.castShadow = true;
    enemy.add(torso);
    
    // Jacket collar
    const collarGeo = new THREE.BoxGeometry(0.4 * scale, 0.2 * scale, 0.6 * scale);
    const collar = new THREE.Mesh(collarGeo, torsoMat);
    collar.position.set(0, 1.9 * scale, 0);
    enemy.add(collar);
    
    // Arms with jacket
    const armGeo = new THREE.BoxGeometry(0.25 * scale, 0.75 * scale, 0.25 * scale);
    
    const leftArm = new THREE.Mesh(armGeo, torsoMat);
    leftArm.position.set(-0.65 * scale, 1.25 * scale, 0);
    leftArm.castShadow = true;
    enemy.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeo, torsoMat);
    rightArm.position.set(0.65 * scale, 1.25 * scale, 0);
    rightArm.castShadow = true;
    enemy.add(rightArm);
    
    // Legs
    const legGeo = new THREE.BoxGeometry(0.32 * scale, 0.85 * scale, 0.32 * scale);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.25 * scale, 0.42 * scale, 0);
    leftLeg.castShadow = true;
    enemy.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.25 * scale, 0.42 * scale, 0);
    rightLeg.castShadow = true;
    enemy.add(rightLeg);
    
    // Chain necklace
    const chainGeo = new THREE.TorusGeometry(0.15 * scale, 0.02 * scale, 8, 16);
    const chainMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 });
    const chain = new THREE.Mesh(chainGeo, chainMat);
    chain.position.set(0, 1.75 * scale, 0.28 * scale);
    chain.rotation.x = Math.PI / 2;
    enemy.add(chain);
}

function createChefao(enemy, color, scale) {
    // Head with slicked hair
    const headGeo = new THREE.BoxGeometry(0.55 * scale, 0.55 * scale, 0.55 * scale);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xb8956c });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.2 * scale;
    head.castShadow = true;
    enemy.add(head);
    
    // Hair
    const hairGeo = new THREE.BoxGeometry(0.55 * scale, 0.15 * scale, 0.5 * scale);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 2.5 * scale, -0.05 * scale);
    enemy.add(hair);
    
    // Suit jacket
    const torsoGeo = new THREE.BoxGeometry(1.1 * scale, 1.2 * scale, 0.6 * scale);
    const torsoMat = new THREE.MeshStandardMaterial({ color: color });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.35 * scale;
    torso.castShadow = true;
    enemy.add(torso);
    
    // Tie
    const tieGeo = new THREE.BoxGeometry(0.1 * scale, 0.6 * scale, 0.05 * scale);
    const tieMat = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 1.4 * scale, 0.33 * scale);
    enemy.add(tie);
    
    // Shirt collar
    const collarGeo = new THREE.BoxGeometry(0.35 * scale, 0.15 * scale, 0.55 * scale);
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.set(0, 1.9 * scale, 0);
    enemy.add(collar);
    
    // Arms
    const armGeo = new THREE.BoxGeometry(0.28 * scale, 0.8 * scale, 0.28 * scale);
    
    const leftArm = new THREE.Mesh(armGeo, torsoMat);
    leftArm.position.set(-0.7 * scale, 1.3 * scale, 0);
    leftArm.castShadow = true;
    enemy.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeo, torsoMat);
    rightArm.position.set(0.7 * scale, 1.3 * scale, 0);
    rightArm.castShadow = true;
    enemy.add(rightArm);
    
    // Legs (suit pants)
    const legGeo = new THREE.BoxGeometry(0.35 * scale, 0.9 * scale, 0.35 * scale);
    
    const leftLeg = new THREE.Mesh(legGeo, torsoMat);
    leftLeg.position.set(-0.28 * scale, 0.45 * scale, 0);
    leftLeg.castShadow = true;
    enemy.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeo, torsoMat);
    rightLeg.position.set(0.28 * scale, 0.45 * scale, 0);
    rightLeg.castShadow = true;
    enemy.add(rightLeg);
    
    // Gold rings
    const ringGeo = new THREE.TorusGeometry(0.05 * scale, 0.015 * scale, 8, 16);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0.72 * scale, 0.9 * scale, 0);
    enemy.add(ring);
}

function createAtirador(enemy, color, scale) {
    // Head with cap
    const headGeo = new THREE.BoxGeometry(0.42 * scale, 0.42 * scale, 0.42 * scale);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xc9a86c });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.95 * scale;
    head.castShadow = true;
    enemy.add(head);
    
    // Military cap
    const capGeo = new THREE.CylinderGeometry(0.28 * scale, 0.28 * scale, 0.12 * scale, 8);
    const capMat = new THREE.MeshStandardMaterial({ color: color });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 2.2 * scale;
    enemy.add(cap);
    
    // Cap visor
    const visorGeo = new THREE.BoxGeometry(0.3 * scale, 0.03 * scale, 0.2 * scale);
    const visor = new THREE.Mesh(visorGeo, capMat);
    visor.position.set(0, 2.12 * scale, 0.2 * scale);
    enemy.add(visor);
    
    // Camo torso
    const torsoGeo = new THREE.BoxGeometry(0.85 * scale, 0.95 * scale, 0.48 * scale);
    const torsoMat = new THREE.MeshStandardMaterial({ color: color });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.22 * scale;
    torso.castShadow = true;
    enemy.add(torso);
    
    // Ammo belt
    const beltGeo = new THREE.BoxGeometry(0.9 * scale, 0.12 * scale, 0.52 * scale);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x4a3c28 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.y = 1.5 * scale;
    enemy.add(belt);
    
    // Arms
    const armGeo = new THREE.BoxGeometry(0.2 * scale, 0.65 * scale, 0.2 * scale);
    
    const leftArm = new THREE.Mesh(armGeo, torsoMat);
    leftArm.position.set(-0.55 * scale, 1.15 * scale, 0);
    leftArm.castShadow = true;
    enemy.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeo, torsoMat);
    rightArm.position.set(0.55 * scale, 1.15 * scale, 0);
    rightArm.castShadow = true;
    enemy.add(rightArm);
    
    // Legs
    const legGeo = new THREE.BoxGeometry(0.28 * scale, 0.75 * scale, 0.28 * scale);
    
    const leftLeg = new THREE.Mesh(legGeo, torsoMat);
    leftLeg.position.set(-0.2 * scale, 0.38 * scale, 0);
    leftLeg.castShadow = true;
    enemy.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeo, torsoMat);
    rightLeg.position.set(0.2 * scale, 0.38 * scale, 0);
    rightLeg.castShadow = true;
    enemy.add(rightLeg);
    
    // Boots
    const bootGeo = new THREE.BoxGeometry(0.3 * scale, 0.15 * scale, 0.35 * scale);
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x2d2d2d });
    
    const leftBoot = new THREE.Mesh(bootGeo, bootMat);
    leftBoot.position.set(-0.2 * scale, 0.08 * scale, 0.02 * scale);
    enemy.add(leftBoot);
    
    const rightBoot = new THREE.Mesh(bootGeo, bootMat);
    rightBoot.position.set(0.2 * scale, 0.08 * scale, 0.02 * scale);
    enemy.add(rightBoot);
}

function spawnEnemy() {
    const angle = Math.random() * Math.PI * 2;
    const distance = CONFIG.ENEMY_SPAWN_DISTANCE + Math.random() * 20;
    
    const type = Math.floor(Math.random() * ENEMY_TYPES.length);
    const enemy = createEnemy(type);
    
    enemy.position.set(
        player.position.x + Math.cos(angle) * distance,
        0,
        player.position.z + Math.sin(angle) * distance
    );
    
    scene.add(enemy);
    enemies.push(enemy);
}

function spawnWave() {
    enemiesInWave = CONFIG.WAVE_BASE_ENEMIES + (wave - 1) * CONFIG.WAVE_ENEMY_INCREMENT;
    
    for (let i = 0; i < enemiesInWave; i++) {
        setTimeout(() => {
            if (gameRunning) spawnEnemy();
        }, i * 300);
    }
    
    // Unlock weapons based on wave
    if (wave >= 2 && !unlockedWeapons[1]) { unlockedWeapons[1] = true; updateWeaponSelector(); }
    if (wave >= 3 && !unlockedWeapons[2]) { unlockedWeapons[2] = true; updateWeaponSelector(); }
    if (wave >= 4 && !unlockedWeapons[3]) { unlockedWeapons[3] = true; updateWeaponSelector(); }
    if (wave >= 5 && !unlockedWeapons[4]) { unlockedWeapons[4] = true; updateWeaponSelector(); }
    if (wave >= 6 && !unlockedWeapons[5]) { unlockedWeapons[5] = true; updateWeaponSelector(); }
    if (wave >= 7 && !unlockedWeapons[6]) { unlockedWeapons[6] = true; updateWeaponSelector(); }
    if (wave >= 8 && !unlockedWeapons[7]) { unlockedWeapons[7] = true; updateWeaponSelector(); }
}


// ==================== CONTROLS ====================
function setupControls() {
    // Joystick
    const joystickContainer = document.getElementById('joystick-container');
    const joystickKnob = document.getElementById('joystick-knob');
    
    const handleJoystickMove = (clientX, clientY) => {
        const rect = joystickContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let deltaX = clientX - centerX;
        let deltaY = clientY - centerY;
        
        const maxDistance = rect.width / 2 - 30;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > maxDistance) {
            deltaX = (deltaX / distance) * maxDistance;
            deltaY = (deltaY / distance) * maxDistance;
        }
        
        joystickKnob.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
        
        joystickVector.x = deltaX / maxDistance;
        joystickVector.y = -deltaY / maxDistance; // Inverted Y: up on screen = negative deltaY = positive vector
    };
    
    const resetJoystick = () => {
        joystickActive = false;
        joystickVector.x = 0;
        joystickVector.y = 0;
        joystickKnob.style.transform = 'translate(-50%, -50%)';
    };
    
    // Touch events for joystick
    joystickContainer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        joystickActive = true;
        const touch = e.touches[0];
        handleJoystickMove(touch.clientX, touch.clientY);
    });
    
    joystickContainer.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (joystickActive) {
            const touch = e.touches[0];
            handleJoystickMove(touch.clientX, touch.clientY);
        }
    });
    
    joystickContainer.addEventListener('touchend', resetJoystick);
    joystickContainer.addEventListener('touchcancel', resetJoystick);
    
    // Mouse events for joystick (desktop testing)
    joystickContainer.addEventListener('mousedown', (e) => {
        joystickActive = true;
        handleJoystickMove(e.clientX, e.clientY);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (joystickActive) {
            handleJoystickMove(e.clientX, e.clientY);
        }
        mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
        mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // Rotate player with mouse on desktop
        if (isDesktop && gameRunning) {
            const rect = renderer.domElement.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            playerRotation = Math.atan2(e.clientX - centerX, centerY - e.clientY);
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (joystickActive) resetJoystick();
        isShooting = false;
    });
    
    // Also reset on mouseleave
    document.addEventListener('mouseleave', () => {
        if (joystickActive) resetJoystick();
    });
    
    // Shoot button
    const shootBtn = document.getElementById('shoot-btn');
    
    shootBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isShooting = true;
    });
    
    shootBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        isShooting = false;
    });
    
    shootBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isShooting = true;
    });
    
    shootBtn.addEventListener('mouseup', () => {
        isShooting = false;
    });
    
    // Jump button
    const jumpBtn = document.getElementById('jump-btn');
    
    jumpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        jump();
    });
    
    jumpBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        jump();
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        
        // Number keys for weapon selection
        if (e.key >= '1' && e.key <= '8') {
            const weaponIndex = parseInt(e.key) - 1;
            if (unlockedWeapons[weaponIndex]) {
                selectWeapon(weaponIndex);
            }
        }
        
        // R to reload
        if (e.key.toLowerCase() === 'r') {
            reload();
        }
        
        // Space or K to jump
        if (e.key === ' ' || e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (e.key.toLowerCase() === 'k') {
                jump();
            } else {
                isShooting = true;
            }
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
        if (e.key === ' ') {
            isShooting = false;
        }
    });
    
    // Mouse click to shoot
    renderer.domElement.addEventListener('mousedown', () => {
        if (gameRunning) isShooting = true;
    });
    
    renderer.domElement.addEventListener('mouseup', () => {
        isShooting = false;
    });
}

function setupWeaponSelector() {
    const selector = document.getElementById('weapon-selector');
    selector.innerHTML = '';
    
    WEAPONS.forEach((weapon, index) => {
        const slot = document.createElement('div');
        slot.className = 'weapon-slot' + (index === currentWeapon ? ' active' : '') + (!unlockedWeapons[index] ? ' locked' : '');
        slot.innerHTML = WEAPON_ICONS[weapon.icon];
        slot.addEventListener('click', () => {
            if (unlockedWeapons[index]) {
                selectWeapon(index);
            }
        });
        selector.appendChild(slot);
    });
}

function updateWeaponSelector() {
    const slots = document.querySelectorAll('.weapon-slot');
    slots.forEach((slot, index) => {
        slot.classList.toggle('active', index === currentWeapon);
        slot.classList.toggle('locked', !unlockedWeapons[index]);
    });
}

function selectWeapon(index) {
    if (index === currentWeapon) return;
    
    currentWeapon = index;
    ammo = WEAPONS[currentWeapon].ammo;
    
    // Update weapon model
    player.remove(player.weapon);
    player.weapon = createWeaponModel(currentWeapon);
    player.weapon.position.set(0.4, 1.1, 0.5);
    player.add(player.weapon);
    
    updateWeaponSelector();
    updateHUD();
}

function reload() {
    ammo = WEAPONS[currentWeapon].maxAmmo;
    updateHUD();
}

function jump() {
    if (!isJumping && gameRunning) {
        isJumping = true;
        jumpVelocity = 0.35;
    }
}

// ==================== SHOOTING ====================
function shoot() {
    const now = Date.now();
    const weapon = WEAPONS[currentWeapon];
    
    if (now - lastShot < weapon.fireRate) return;
    if (ammo <= 0) {
        reload();
        return;
    }
    
    lastShot = now;
    ammo--;
    updateHUD();
    
    // Weapon recoil animation
    if (player.weapon) {
        player.weapon.position.z = 0.3;
        setTimeout(() => {
            if (player.weapon) player.weapon.position.z = 0.5;
        }, 50);
    }
    
    // Create bullet
    const bulletGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0xffaa00 });
    const bullet = new THREE.Mesh(bulletGeo, bulletMat);
    
    // Get shooting direction (forward from player)
    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(player.quaternion);
    
    // Add spread
    direction.x += (Math.random() - 0.5) * weapon.spread;
    direction.y += (Math.random() - 0.5) * weapon.spread * 0.5;
    direction.z += (Math.random() - 0.5) * weapon.spread;
    direction.normalize();
    
    bullet.position.copy(player.position);
    bullet.position.y = 1.5;
    bullet.position.add(direction.clone().multiplyScalar(1));
    
    bullet.userData = {
        direction: direction,
        speed: 3,
        damage: weapon.damage,
        distance: 0,
        maxDistance: 100
    };
    
    scene.add(bullet);
    bullets.push(bullet);
    
    // Muzzle flash effect
    createMuzzleFlash();
    
    // Shotgun fires multiple pellets
    if (currentWeapon === 3) {
        for (let i = 0; i < 7; i++) {
            const pellet = bullet.clone();
            const pelletDir = direction.clone();
            pelletDir.x += (Math.random() - 0.5) * 0.25;
            pelletDir.y += (Math.random() - 0.5) * 0.15;
            pelletDir.z += (Math.random() - 0.5) * 0.25;
            pelletDir.normalize();
            pellet.userData = {
                direction: pelletDir,
                speed: 3,
                damage: weapon.damage / 7,
                distance: 0,
                maxDistance: 50
            };
            scene.add(pellet);
            bullets.push(pellet);
        }
    }
}

function createMuzzleFlash() {
    const flash = new THREE.PointLight(0xffaa00, 3, 5);
    flash.position.copy(player.position);
    flash.position.y = 1.5;
    
    const dir = new THREE.Vector3(0, 0, 1);
    dir.applyQuaternion(player.quaternion);
    flash.position.add(dir.multiplyScalar(1.5));
    
    scene.add(flash);
    
    setTimeout(() => {
        scene.remove(flash);
    }, 50);
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        const moveAmount = bullet.userData.direction.clone().multiplyScalar(bullet.userData.speed);
        bullet.position.add(moveAmount);
        bullet.userData.distance += bullet.userData.speed;
        
        // Removed bullet trail for performance
        
        // Check collision with enemies - Increased hitbox
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const dist = bullet.position.distanceTo(enemy.position);
            
            if (dist < CONFIG.ENEMY_HITBOX) {
                // Hit enemy
                enemy.userData.health -= bullet.userData.damage;
                
                // Update health bar
                const healthBar = enemy.getObjectByName('healthBar');
                if (healthBar) {
                    const healthPercent = enemy.userData.health / enemy.userData.maxHealth;
                    healthBar.scale.x = Math.max(0, healthPercent);
                    healthBar.position.x = -(1 - healthPercent) * 0.5;
                }
                
                // Create hit effect
                createHitEffect(bullet.position);
                
                if (enemy.userData.health <= 0) {
                    // Enemy died
                    scene.remove(enemy);
                    enemies.splice(j, 1);
                    kills++;
                    enemiesInWave--;
                    addKillFeed(enemy.userData.name);
                    updateHUD();
                    
                    // Check wave complete
                    if (enemies.length === 0 && enemiesInWave <= 0) {
                        wave++;
                        setTimeout(spawnWave, 3000);
                    }
                }
                
                // Remove bullet
                scene.remove(bullet);
                bullets.splice(i, 1);
                break;
            }
        }
        
        // Remove bullet if too far
        if (bullet.userData.distance > bullet.userData.maxDistance) {
            scene.remove(bullet);
            bullets.splice(i, 1);
        }
    }
}

function createHitEffect(position) {
    const particles = new THREE.Group();
    
    for (let i = 0; i < 3; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 4, 4),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        particle.position.copy(position);
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            Math.random() * 0.2,
            (Math.random() - 0.5) * 0.2
        );
        particles.add(particle);
    }
    
    scene.add(particles);
    
    let frame = 0;
    const animateParticles = () => {
        frame++;
        particles.children.forEach(p => {
            p.position.add(p.userData.velocity);
            p.userData.velocity.y -= 0.01;
        });
        
        if (frame < 20) {
            requestAnimationFrame(animateParticles);
        } else {
            scene.remove(particles);
        }
    };
    animateParticles();
}

function addKillFeed(enemyName) {
    const feed = document.getElementById('kill-feed');
    const entry = document.createElement('div');
    entry.className = 'kill-entry';
    entry.textContent = `Você eliminou ${enemyName}`;
    feed.appendChild(entry);
    
    setTimeout(() => {
        entry.remove();
    }, 3000);
}


// ==================== GAME LOOP ====================
function updatePlayer() {
    if (!gameRunning) return;
    
    // Movement from joystick - Fixed: up = forward, down = backward
    let moveX = -joystickVector.x; // Inverted X
    let moveZ = joystickVector.y; // Direct Y
    
    // Movement from keyboard (WASD and Arrow keys) - Fixed
    // Only override if keys are pressed
    let keyboardMoveX = 0;
    let keyboardMoveZ = 0;
    
    if (keys['w'] || keys['arrowup']) keyboardMoveZ = -1;
    if (keys['s'] || keys['arrowdown']) keyboardMoveZ = 1;
    if (keys['a'] || keys['arrowleft']) keyboardMoveX = -1;
    if (keys['d'] || keys['arrowright']) keyboardMoveX = 1;
    
    // Keyboard overrides joystick if any key is pressed
    if (keyboardMoveX !== 0 || keyboardMoveZ !== 0) {
        moveX = keyboardMoveX;
        moveZ = keyboardMoveZ;
    }
    
    // Normalize diagonal movement
    const magnitude = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (magnitude > 1) {
        moveX /= magnitude;
        moveZ /= magnitude;
    }
    
    // Apply movement
    const newX = player.position.x + moveX * CONFIG.PLAYER_SPEED;
    const newZ = player.position.z + moveZ * CONFIG.PLAYER_SPEED;
    
    // Check collision with buildings
    let canMove = true;
    for (const building of buildings) {
        const b = building.bounds;
        if (Math.abs(newX - b.x) < b.width / 2 + 1 &&
            Math.abs(newZ - b.z) < b.depth / 2 + 1) {
            canMove = false;
            break;
        }
    }
    
    // Check collision with cars
    if (canMove) {
        for (const car of cars) {
            const c = car.bounds;
            if (Math.abs(newX - c.x) < c.width / 2 + 0.8 &&
                Math.abs(newZ - c.z) < c.depth / 2 + 0.8) {
                canMove = false;
                break;
            }
        }
    }
    
    if (canMove) {
        player.position.x = newX;
        player.position.z = newZ;
    }
    
    // Jump physics
    if (isJumping) {
        player.position.y += jumpVelocity;
        jumpVelocity += gravity;
        
        // Land on ground
        if (player.position.y <= 0) {
            player.position.y = 0;
            isJumping = false;
            jumpVelocity = 0;
        }
    }
    
    // Animate player walking - Faster and more dynamic
    const isMoving = magnitude > 0.1;
    if (isMoving) {
        player.userData.animTime += 0.35;
        animateCharacterWalk(player, player.userData.animTime, true);
    } else {
        player.userData.animTime = 0;
        resetCharacterPose(player);
    }
    
    // Rotate player - Desktop uses mouse, Mobile auto-aims at nearest enemy
    if (isDesktop) {
        // Use mouse rotation on desktop
        player.rotation.y = playerRotation;
    } else {
        // Auto-aim at nearest enemy on mobile
        if (enemies.length > 0) {
            let nearestEnemy = null;
            let nearestDist = Infinity;
            
            for (const enemy of enemies) {
                const dist = player.position.distanceTo(enemy.position);
                if (dist < nearestDist && dist < 30) {
                    nearestDist = dist;
                    nearestEnemy = enemy;
                }
            }
            
            if (nearestEnemy) {
                const targetAngle = Math.atan2(
                    nearestEnemy.position.x - player.position.x,
                    nearestEnemy.position.z - player.position.z
                );
                player.rotation.y = targetAngle;
            }
        } else if (magnitude > 0.1) {
            // Face movement direction when no enemies
            const targetAngle = Math.atan2(moveX, moveZ);
            player.rotation.y = targetAngle;
        }
    }
    
    // Handle shooting (Space bar or mouse click or touch)
    if (isShooting) {
        if (WEAPONS[currentWeapon].auto) {
            shoot();
        } else if (Date.now() - lastShot >= WEAPONS[currentWeapon].fireRate) {
            shoot();
        }
    }
}

function animateCharacterWalk(character, time, isPlayer = false) {
    const speed = isPlayer ? 1.2 : 1;
    const legSwing = Math.sin(time * speed) * 0.6;
    const armSwing = Math.sin(time * speed) * 0.5;
    const bodyBob = Math.abs(Math.sin(time * speed)) * 0.15;
    const bodyTilt = Math.sin(time * speed) * 0.05;
    
    character.children.forEach(child => {
        if (!child.userData) child.userData = {};
        
        // Store original position on first animation
        if (child.userData.originalY === undefined) {
            child.userData.originalY = child.position.y;
            child.userData.originalRotX = child.rotation.x;
            child.userData.originalRotZ = child.rotation.z || 0;
        }
        
        // Identify body parts by position
        const isLeftLeg = child.position.x < -0.1 && child.position.y < 0.6;
        const isRightLeg = child.position.x > 0.1 && child.position.y < 0.6;
        const isLeftArm = child.position.x < -0.5 && child.position.y > 1;
        const isRightArm = child.position.x > 0.5 && child.position.y > 1;
        const isTorso = Math.abs(child.position.x) < 0.3 && child.position.y > 1 && child.position.y < 1.8;
        const isHead = child.position.y > 1.9;
        
        if (isLeftLeg) {
            child.rotation.x = legSwing;
            child.position.z = Math.sin(time * speed) * 0.1;
        } else if (isRightLeg) {
            child.rotation.x = -legSwing;
            child.position.z = -Math.sin(time * speed) * 0.1;
        } else if (isLeftArm) {
            child.rotation.x = -armSwing * 0.8;
            child.rotation.z = Math.sin(time * speed) * 0.1;
        } else if (isRightArm) {
            child.rotation.x = armSwing * 0.8;
            child.rotation.z = -Math.sin(time * speed) * 0.1;
        } else if (isTorso) {
            child.position.y = child.userData.originalY + bodyBob;
            child.rotation.z = bodyTilt;
        } else if (isHead) {
            child.position.y = child.userData.originalY + bodyBob;
            child.rotation.z = bodyTilt * 0.5;
        }
    });
}

function resetCharacterPose(character) {
    character.children.forEach(child => {
        if (child.userData && child.userData.originalY !== undefined) {
            child.position.y = child.userData.originalY;
            child.position.z = 0;
            child.rotation.x = child.userData.originalRotX || 0;
            child.rotation.z = child.userData.originalRotZ || 0;
        }
    });
}

function updateEnemies() {
    if (!gameRunning) return;
    
    const now = Date.now();
    
    for (const enemy of enemies) {
        // Move towards player
        const direction = new THREE.Vector3();
        direction.subVectors(player.position, enemy.position);
        direction.y = 0;
        direction.normalize();
        
        const newPos = enemy.position.clone();
        newPos.add(direction.multiplyScalar(enemy.userData.speed));
        
        // Simple collision avoidance with other enemies
        let canMove = true;
        for (const other of enemies) {
            if (other === enemy) continue;
            if (newPos.distanceTo(other.position) < 1.5) {
                canMove = false;
                break;
            }
        }
        
        if (canMove) {
            enemy.position.copy(newPos);
        }
        
        // Animate enemy walking - Faster
        enemy.userData.animTime = (enemy.userData.animTime || 0) + 0.25;
        animateCharacterWalk(enemy, enemy.userData.animTime, false);
        
        // Face player
        enemy.lookAt(player.position.x, enemy.position.y, player.position.z);
        
        // Make health bar face camera
        const healthBar = enemy.getObjectByName('healthBar');
        const healthBarBg = enemy.getObjectByName('healthBarBg');
        if (healthBar && healthBarBg) {
            healthBar.lookAt(camera.position);
            healthBarBg.lookAt(camera.position);
        }
        
        // Attack player if close - Faster attacks
        const distToPlayer = enemy.position.distanceTo(player.position);
        if (distToPlayer < 2 && now - enemy.userData.lastAttack > 800) {
            enemy.userData.lastAttack = now;
            takeDamage(enemy.userData.damage);
            
            // Attack animation
            enemy.userData.attackAnim = 10;
        }
        
        // Attack animation
        if (enemy.userData.attackAnim > 0) {
            enemy.userData.attackAnim--;
            const attackScale = 1 + (enemy.userData.attackAnim / 20);
            enemy.scale.set(attackScale, attackScale, attackScale);
        } else {
            enemy.scale.set(1, 1, 1);
        }
    }
}

function takeDamage(amount) {
    health -= amount;
    health = Math.max(0, health);
    
    // Update health bar
    document.getElementById('health-fill').style.width = health + '%';
    
    // Damage effect
    const overlay = document.getElementById('damage-overlay');
    overlay.style.opacity = '1';
    setTimeout(() => {
        overlay.style.opacity = '0';
    }, 200);
    
    if (health <= 0) {
        gameOver();
    }
}

function updateCamera() {
    // Third person camera
    const cameraOffset = new THREE.Vector3(0, CONFIG.CAMERA_HEIGHT, -CONFIG.CAMERA_DISTANCE);
    cameraOffset.applyQuaternion(player.quaternion);
    
    const targetPos = player.position.clone().add(cameraOffset);
    camera.position.lerp(targetPos, 0.1);
    
    // Look at player
    const lookTarget = player.position.clone();
    lookTarget.y += 2;
    camera.lookAt(lookTarget);
}

function updateHUD() {
    document.getElementById('wave-num').textContent = wave;
    document.getElementById('enemies-left').textContent = enemies.length;
    document.getElementById('weapon-name').textContent = WEAPONS[currentWeapon].name;
    document.getElementById('ammo').textContent = ammo;
    document.getElementById('max-ammo').textContent = WEAPONS[currentWeapon].maxAmmo;
}

// ==================== GAME STATE ====================
function startGame() {
    document.getElementById('menu').style.display = 'none';
    gameRunning = true;
    health = CONFIG.PLAYER_HEALTH;
    wave = 1;
    kills = 0;
    ammo = WEAPONS[currentWeapon].ammo;
    
    document.getElementById('health-fill').style.width = '100%';
    updateHUD();
    
    spawnWave();
}

function gameOver() {
    gameRunning = false;
    
    document.getElementById('final-waves').textContent = wave;
    document.getElementById('final-kills').textContent = kills;
    document.getElementById('game-over').style.display = 'flex';
}

function restartGame() {
    // Clear enemies
    for (const enemy of enemies) {
        scene.remove(enemy);
    }
    enemies = [];
    
    // Clear bullets
    for (const bullet of bullets) {
        scene.remove(bullet);
    }
    bullets = [];
    
    // Reset player position
    player.position.set(0, 0, 0);
    
    // Reset weapons
    currentWeapon = 0;
    unlockedWeapons = [true, false, false, false, false, false, false, false];
    selectWeapon(0);
    setupWeaponSelector();
    
    document.getElementById('game-over').style.display = 'none';
    startGame();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ==================== MAIN LOOP ====================
function animate() {
    requestAnimationFrame(animate);
    
    if (gameRunning) {
        updatePlayer();
        updateEnemies();
        updateBullets();
        updateCamera();
    } else {
        // Slowly rotate camera around scene in menu
        const time = Date.now() * 0.0001;
        camera.position.x = Math.sin(time) * 30;
        camera.position.z = Math.cos(time) * 30;
        camera.position.y = 20;
        camera.lookAt(0, 0, 0);
    }
    
    renderer.render(scene, camera);
}

// Start the game
init();
