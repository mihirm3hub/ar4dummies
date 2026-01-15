const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()
const textureLoader = new THREE.TextureLoader()

// Adjust these in degrees (e.g. 40)
const MODEL_Y_ROT_DEG = 30
// Negative X moves left. Tweak this (e.g. -2, -5)
const MODEL_X_OFFSET = 0
const degToRad = (deg) => (deg * Math.PI) / 180

const container = canvas?.parentElement
const sizes = {
    width: container?.clientWidth || window.innerWidth,
    height: container?.clientHeight || window.innerHeight
}

// Base camera
const camera = new THREE.PerspectiveCamera(10, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 18
camera.position.y = 15
camera.position.z = 30
scene.add(camera)

//Controls
const controls = new THREE.OrbitControls(camera, canvas)
controls.enableRotate = true
controls.enableDamping = true
controls.enableZoom = true
controls.enablePan = false
controls.minDistance = 20
controls.maxDistance = 40
// Allow full rotation around the model
controls.minPolarAngle = 0
controls.maxPolarAngle = Math.PI
controls.minAzimuthAngle = -Infinity
controls.maxAzimuthAngle = Infinity

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding

// Optional tone mapping (supported in many Three builds)
if ("ACESFilmicToneMapping" in THREE) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping
}

// Canvas background (renderer clear color)
// You can tweak these hex colors to taste.
// light: sky blue, dark: dark grey
const CANVAS_BG_LIGHT = 0x87CEEB
const CANVAS_BG_DARK = 0x333333

const applyCanvasBackground = (theme) => {
    const isDark = theme === "dark"
    // alpha=1 gives a solid canvas background even though the renderer was created with alpha:true.
    renderer.setClearColor(isDark ? CANVAS_BG_DARK : CANVAS_BG_LIGHT, 1)
}

// Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222233, 0.65)
scene.add(hemiLight)

const keyLight = new THREE.DirectionalLight(0xffffff, 1.25)
keyLight.position.set(4, 6, 4)
scene.add(keyLight)

const fillLight = new THREE.DirectionalLight(0xffffff, 0.55)
fillLight.position.set(-5, 2, 3)
scene.add(fillLight)

const rimLight = new THREE.DirectionalLight(0xffffff, 0.8)
rimLight.position.set(-2, 5, -5)
scene.add(rimLight)

// Cyberpunk accent lights (enabled in dark theme)
const cyberPink = new THREE.PointLight(0xFF2EC4, 0, 90, 2)
cyberPink.position.set(-6, 2.2, 4)
scene.add(cyberPink)

const cyberPurple = new THREE.SpotLight(0x7C3AED, 0, 140, Math.PI / 7, 0.45, 2)
cyberPurple.position.set(0, 8, 0)
cyberPurple.target.position.set(0, 0, 0)
scene.add(cyberPurple)
scene.add(cyberPurple.target)

// Model state (declared early to avoid TDZ issues)
let model = null
let mixer = null

const CYBER_BASE = { pink: 1.7, purple: 1.25 }
let isDarkTheme = false
let lastTheme = null
let pendingThemeSpin = 0
let modelBaseX = null

// When true, theme changes trigger the extra 180° spin/flip.
// For the gummy bear we disable this so it doesn't rotate on theme change.
let enableThemeSwitchFlip = true

// Theme switch spin (adds a smooth 180° turn instead of an instant flip)
const THEME_SPIN_AMOUNT = Math.PI
const THEME_SPIN_DURATION_SEC = 0.55
const THEME_SPIN_SPEED = THEME_SPIN_AMOUNT / THEME_SPIN_DURATION_SEC
let themeSpinRemaining = 0

const startThemeSpin = () => {
    themeSpinRemaining += THEME_SPIN_AMOUNT
}

const flipModelOnThemeSwitch = () => {
    if (model) startThemeSpin()
    else pendingThemeSpin += THEME_SPIN_AMOUNT
}

const applyThemeModelOffset = (theme) => {
    if (!model) return
    if (modelBaseX === null) modelBaseX = model.position.x
    const isDark = theme === "dark"
    model.position.x = modelBaseX + (isDark ? 0.3 : MODEL_X_OFFSET)
    model.position.y = -1.5
}

const applyThemeLighting = (theme) => {
    const isDark = theme === "dark"
    isDarkTheme = isDark

    // Rotate the model 180° relative to current rotation on each theme switch.
    if (enableThemeSwitchFlip && lastTheme !== null && theme !== lastTheme) {
        flipModelOnThemeSwitch()
    }

    applyCanvasBackground(theme)
    applyThemeModelOffset(theme)

    // Neo-brutalist vaporwave palette
    // - pink:   #FF2EC4
    // - purple: #7C3AED
    if (isDark) {
        hemiLight.color.setHex(0x7C3AED)
        hemiLight.groundColor.setHex(0x05010f)
        hemiLight.intensity = 0.55

        keyLight.color.setHex(0xFF2EC4)
        keyLight.intensity = 1.05

        fillLight.color.setHex(0x7C3AED)
        fillLight.intensity = 0.38

        rimLight.color.setHex(0xFF2EC4)
        rimLight.intensity = 0.7

        cyberPink.intensity = CYBER_BASE.pink
        cyberPurple.intensity = CYBER_BASE.purple

        if ("toneMappingExposure" in renderer) renderer.toneMappingExposure = 0.95
    } else {
        hemiLight.color.setHex(0xffffff)
        hemiLight.groundColor.setHex(0xE9E2FF)
        hemiLight.intensity = 0.75

        keyLight.color.setHex(0xFFD300)
        keyLight.intensity = 1.25

        fillLight.color.setHex(0x7C3AED)
        fillLight.intensity = 0.5

        rimLight.color.setHex(0xFF2EC4)
        rimLight.intensity = 0.85

        cyberPink.intensity = 0
        cyberPurple.intensity = 0

        if ("toneMappingExposure" in renderer) renderer.toneMappingExposure = 1.1
    }

    lastTheme = theme
}

// Apply lighting now + whenever the theme toggle changes `data-theme`.
const getTheme = () => document.documentElement?.dataset?.theme === "dark" ? "dark" : "light"
applyThemeLighting(getTheme())

try {
    const observer = new MutationObserver(() => applyThemeLighting(getTheme()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
} catch {
    // Ignore if MutationObserver is unavailable.
}

// Optional: force a gummy-bear style translucent material.
// Comment out the *call site* below if you switch back to little_tokyo and want the GLB's original materials.
const applyGummyBearMaterial = (root) => {
    if (!root) return

    // Try to preserve whatever base color the GLB already has.
    let sampledColor = null
    root.traverse((obj) => {
        if (sampledColor) return
        if (!obj || !obj.isMesh) return
        const m = obj.material
        const one = Array.isArray(m) ? m[0] : m
        if (one && one.color && typeof one.color.getHex === 'function') {
            sampledColor = one.color.clone()
        }
    })

    const color = sampledColor || new THREE.Color(0xff2b2b)
    const Physical = THREE.MeshPhysicalMaterial || null

    // Gummy tuning (less see-through than glass)
    const GUMMY_ROUGHNESS = 0.34
    const GUMMY_TRANSMISSION = 0.38
    const GUMMY_THICKNESS = 0.42
    const GUMMY_IOR = 1.42
    const GUMMY_OPACITY = 0.98

    root.traverse((obj) => {
        if (!obj || !obj.isMesh) return

        const geometry = obj.geometry
        const hasMorphTargets = Boolean(geometry?.morphAttributes && Object.keys(geometry.morphAttributes).length)
        const isSkinned = Boolean(obj.isSkinnedMesh)

        const next = Physical
            ? new Physical({
                color,
                metalness: 0,
                                roughness: GUMMY_ROUGHNESS,
                clearcoat: 1,
                clearcoatRoughness: 0.12,
                transparent: true,
                                opacity: GUMMY_OPACITY,
              })
            : new THREE.MeshStandardMaterial({
                color,
                metalness: 0,
                                roughness: GUMMY_ROUGHNESS,
              })

        // Feature-gated properties (varies by Three version).
        if ('transmission' in next) next.transmission = GUMMY_TRANSMISSION
        if ('thickness' in next) next.thickness = GUMMY_THICKNESS
        if ('ior' in next) next.ior = GUMMY_IOR
        if ('attenuationColor' in next) next.attenuationColor = color
        // Lower distance = more absorption (less see-through)
        if ('attenuationDistance' in next) next.attenuationDistance = 0.22
        if ('specularIntensity' in next) next.specularIntensity = 1

        // Preserve animation-related flags so GLTF clips (skinning/morph targets) still work.
        if ('skinning' in next) next.skinning = isSkinned
        if ('morphTargets' in next) next.morphTargets = hasMorphTargets
        if ('morphNormals' in next) next.morphNormals = hasMorphTargets

        obj.material = next
        next.needsUpdate = true
    })
}

// Optional: play gummy-bear animations.
// - If the GLB contains animation clips, this will play them (looped).
// - If not, it enables a subtle procedural "squish + bounce" idle.
// Comment out the *call site* below if you switch back to little_tokyo.
let gummyIdleEnabled = false
let gummyIdleBaseY = null
let gummyIdleBaseScale = null
let gummyIdleBaseRotZ = null
let gummyIdleBobAmp = 0.14
let gummyIdleSquishAmp = 0.06
let gummyIdleWobbleAmp = 0.08

const applyGummyBearAnimation = (gltf, root) => {
    const clips = Array.isArray(gltf?.animations) ? gltf.animations : []
    const usableClips = clips.filter((c) => c && typeof c.duration === 'number' ? c.duration > 0.001 : true)

    if (usableClips.length > 0 && root) {
        // Prefer real authored animations when available.
        mixer = new THREE.AnimationMixer(root)
        mixer.timeScale = 1

        usableClips.forEach((clip) => {
            const action = mixer.clipAction(clip)
            action.enabled = true
            action.clampWhenFinished = false
            action.setLoop(THREE.LoopRepeat, Infinity)
            action.reset()
            action.play()
        })

        gummyIdleEnabled = false
        gummyIdleBaseY = null
        gummyIdleBaseScale = null
        return
    }

    // Fallback if the gummy bear GLB has no animation tracks.
    gummyIdleEnabled = true
    if (root) {
        gummyIdleBaseY = root.position.y
        gummyIdleBaseScale = root.scale.clone()
        gummyIdleBaseRotZ = root.rotation.z

        // Scale the idle amplitudes based on model size so it's visible for tiny/huge models.
        try {
            const box = new THREE.Box3().setFromObject(root)
            const size = new THREE.Vector3()
            box.getSize(size)
            const h = Number.isFinite(size.y) && size.y > 0 ? size.y : 1
            gummyIdleBobAmp = Math.max(0.08, h * 0.03)
            gummyIdleSquishAmp = Math.min(0.14, Math.max(0.05, h * 0.02))
            gummyIdleWobbleAmp = Math.min(0.25, Math.max(0.08, h * 0.03))
        } catch {
            gummyIdleBobAmp = 0.14
            gummyIdleSquishAmp = 0.06
            gummyIdleWobbleAmp = 0.08
        }
    }
}

//Loader
const loader = new THREE.GLTFLoader()
loader.load('assets/red_gummy_bear.glb',
    (gltf) => {
        model = gltf.scene

        // Gummy bear: don't rotate on theme changes.
        // Comment this line out if you switch back to little_tokyo and want the theme flip behavior.
        enableThemeSwitchFlip = false
        pendingThemeSpin = 0
        themeSpinRemaining = 0

        // Optional: gummy material override. Comment this out if using little_tokyo.
        applyGummyBearMaterial(model)
        // Optional: gummy animation (plays embedded clips, or falls back to idle squish/bounce).
        applyGummyBearAnimation(gltf, model)
        model.rotation.y = degToRad(MODEL_Y_ROT_DEG)
        modelBaseX = model.position.x
        applyThemeModelOffset(getTheme())
        scene.add(model)

        if (pendingThemeSpin) {
            themeSpinRemaining += pendingThemeSpin
            pendingThemeSpin = 0
        }

        // Note: animation playback is handled by applyGummyBearAnimation() above.
    },
    ( xhr ) => {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )
    }
)


window.addEventListener('resize', () =>
{
    sizes.width = container?.clientWidth || window.innerWidth
    sizes.height = container?.clientHeight || window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
// Animation
const clock = new THREE.Clock()
const tick = () => {
    const delta = clock.getDelta()
    const t = clock.getElapsedTime()

    controls.update()

    if (mixer) {
        mixer.update(delta)
    } else if (model) {
        model.rotation.y += delta * 0.35
    }

    // Procedural gummy idle if no GLTF clips exist.
    if (model && gummyIdleEnabled) {
        if (gummyIdleBaseY === null) gummyIdleBaseY = model.position.y
        if (!gummyIdleBaseScale) gummyIdleBaseScale = model.scale.clone()
        if (gummyIdleBaseRotZ === null) gummyIdleBaseRotZ = model.rotation.z

        const bob = gummyIdleBobAmp * Math.sin(t * 2.1)
        model.position.y = gummyIdleBaseY + bob

        const squish = gummyIdleSquishAmp * Math.sin(t * 3.2 + 0.6)
        model.scale.set(
            gummyIdleBaseScale.x * (1 + squish),
            gummyIdleBaseScale.y * (1 - squish),
            gummyIdleBaseScale.z * (1 + squish)
        )

        // A visible wobble so it reads as "animated" even while the model is also rotating.
        model.rotation.z = gummyIdleBaseRotZ + gummyIdleWobbleAmp * Math.sin(t * 1.7 + 0.2)
    }

    // Smooth extra spin when switching themes.
    if (model && themeSpinRemaining > 0) {
        const step = Math.min(themeSpinRemaining, THEME_SPIN_SPEED * delta)
        model.rotation.y += step
        themeSpinRemaining -= step
    }

    // Subtle neon pulse in dark theme
    if (isDarkTheme) {
        cyberPink.intensity = CYBER_BASE.pink * (0.82 + 0.18 * Math.sin(t * 1.6 + 1.2))
        cyberPurple.intensity = CYBER_BASE.purple * (0.88 + 0.12 * Math.sin(t * 1.2 + 2.4))
    }

    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()
