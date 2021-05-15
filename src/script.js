import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const params = {
    count: 70000,
    particleSize: 0.02,
    radius: 5,
    branches: 5,
    spin: 1,
    randomness: 0.02,
    randomnessPower: 3.615,
    insideColor: "#ff6030",
    outsideColor: "#1b3984"
}

let geometry = null, material = null, galaxy = null
const generateGalaxy = () => {

    if (geometry !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(galaxy)
    }

    geometry = new THREE.BufferGeometry()

    //we create the positions of each vertex that are equal to our count * 3 for xyz values
    const positions = new Float32Array(params.count * 3)
    const colors = new Float32Array(params.count * 3)

    const insideColor = new THREE.Color(params.insideColor)
    const outsideColor = new THREE.Color(params.outsideColor)

    for (let i = 0; i < params.count; i++) {
        const i3 = i * 3

        const radius = Math.random() * params.radius

        //we want a value that goes from 0 to 1 and gives us as many intervals as there are branches in our galaxy
        // % will help us with this - for example i % 3 will never give us three
        // it will give us: 0, 1, 2, 0, 1, 2, 0, 1, 2, etc but never a 3

        //and then to position everything in a circle, we multiply our branchAngule by 2*pi (because 2pi is a full circle)

        const branchAngle = (i % params.branches) / params.branches * Math.PI * 2

        //this will make the spin angle larger the farther a vertex is from the center
        const spinAngle = radius * params.spin
        

        //using Math.pow() will make the galaxy more realistic by making most of the vertices closer to the branch
        //while only a few will branch outwards into random positions
        //that's because Math.pow() when used on a float number will decrease its value a bit

        const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) //multiply by -1 only a random amount of time
        const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

        //positioning the same angle on the Math.cos on the x axis, and Math.sin on the z axis will give us a full rotation
        //then we just multiply everything by our radius in order to draw a full line ALONG that path
        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = 0 + randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ




        //colors - fill the colors Float32Array with values

        //we create a new color variable that's gonna represent our base color
        //and use the .lerp() method on it
        //.lerp() blends two colors together - it takes two arguments, the color to be blended with, and a value from 0-1 that represents how much we're going to blend the two colors

        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, (radius / params.radius))

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }

    //set the position of each vertex
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    material = new THREE.PointsMaterial({
        size: params.particleSize,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true //will notify the material that we'll be providing our own colors to each vertex
    })

    galaxy = new THREE.Points(
        geometry,
        material
    )

    scene.add(galaxy)
}
generateGalaxy()

gui.add(params, "count").min(1000).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(params, "particleSize").min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(params, "radius").min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(params, "branches").min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(params, "spin").min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(params, "randomness").min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(params, "randomnessPower").min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(params, "insideColor").onFinishChange(generateGalaxy)
gui.addColor(params, "outsideColor").onFinishChange(generateGalaxy)



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 2.5
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    galaxy.rotation.y = (elapsedTime * 0.04) * -1

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()