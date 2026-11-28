// @ts-nocheck
import * as THREE from 'three'

import Experience from './Experience'

// TV screen visible boundary in local coordinates
const SCREEN_BOUNDS = {
    z: { min: -1.924, max: 2.302 },
    y: { min: -1.235, max: 1.127 }
}

export default class BouncingLogo
{
    constructor()
    {
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.world = this.experience.world
        this.time = this.experience.time

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder({
                title: 'bouncingLogo',
                expanded: false
            })
        }

        this.setModel()
        this.setAnimation()
    }

    setModel()
    {
        this.model = {}

        this.model.group = new THREE.Group()
        this.model.group.position.x = 4.2
        this.model.group.position.y = 2.717
        this.model.group.position.z = 1.630
        this.scene.add(this.model.group)

        this.model.texture = this.resources.items.bwsLogoTexture
        this.model.texture.encoding = THREE.sRGBEncoding

        // Logo aspect ratio is 130 width / 150 height to prevent stretching
        const logoAspectRatio = 130 / 150
        this.model.geometry = new THREE.PlaneGeometry(logoAspectRatio, 1, 1, 1)
        this.model.geometry.rotateY(- Math.PI * 0.5)

        this.model.material = new THREE.MeshBasicMaterial({
            transparent: true,
            premultipliedAlpha: true,
            map: this.model.texture
        })

        this.model.mesh = new THREE.Mesh(this.model.geometry, this.model.material)
        this.model.mesh.scale.y = 1.0
        this.model.mesh.scale.z = 1.0
        this.model.group.add(this.model.mesh)

        // Debug
        if(this.debug)
        {
            this.debugFolder.addBinding(
                this.model.group.position,
                'x',
                {
                    label: 'positionX', min: - 5, max: 5, step: 0.001
                }
            )

            this.debugFolder.addBinding(
                this.model.group.position,
                'y',
                {
                    label: 'positionY', min: - 5, max: 5, step: 0.001
                }
            )

            this.debugFolder.addBinding(
                this.model.group.position,
                'z',
                {
                    label: 'positionZ', min: - 5, max: 5, step: 0.001
                }
            )

            this.debugFolder.addBinding(
                this.model.mesh.scale,
                'z',
                {
                    label: 'scaleZ', min: 0.1, max: 1.8, step: 0.01
                }
            ).on('change', () => this.updateLimits())

            this.debugFolder.addBinding(
                this.model.mesh.scale,
                'y',
                {
                    label: 'scaleY', min: 0.1, max: 1.8, step: 0.01
                }
            ).on('change', () => this.updateLimits())
        }
    }

    updateLimits()
    {
        const logoAspectRatio = 130 / 150
        const halfWidthZ = (logoAspectRatio * this.model.mesh.scale.z) / 2
        const halfHeightY = (1.0 * this.model.mesh.scale.y) / 2

        this.animations.limits = {
            z: {
                min: SCREEN_BOUNDS.z.min + halfWidthZ,
                max: SCREEN_BOUNDS.z.max - halfWidthZ
            },
            y: {
                min: SCREEN_BOUNDS.y.min + halfHeightY,
                max: SCREEN_BOUNDS.y.max - halfHeightY
            }
        }
    }

    setAnimation()
    {
        this.animations = {}

        this.animations.z = 0
        this.animations.y = 0

        this.updateLimits()

        this.animations.speed = {}
        this.animations.speed.z = 0.00061
        this.animations.speed.y = 0.00037

        if(this.debug)
        {
            this.debugFolder.addBinding(
                this.animations.limits.z,
                'min',
                {
                    label: 'limitZMin', min: - 3, max: 0, step: 0.001
                }
            )

            this.debugFolder.addBinding(
                this.animations.limits.z,
                'max',
                {
                    label: 'limitZMax', min: 0, max: 3, step: 0.001
                }
            )

            this.debugFolder.addBinding(
                this.animations.limits.y,
                'min',
                {
                    label: 'limitYMin', min: - 3, max: 0, step: 0.001
                }
            )

            this.debugFolder.addBinding(
                this.animations.limits.y,
                'max',
                {
                    label: 'limitYMax', min: 0, max: 3, step: 0.001
                }
            )

            this.debugFolder.addBinding(
                this.animations.speed,
                'z',
                {
                    label: 'speedZ', min: 0, max: 0.001, step: 0.00001
                }
            )

            this.debugFolder.addBinding(
                this.animations.speed,
                'y',
                {
                    label: 'speedY', min: 0, max: 0.001, step: 0.00001
                }
            )
        }
    }

    update()
    {
        this.animations.z += this.animations.speed.z * this.time.delta
        this.animations.y += this.animations.speed.y * this.time.delta

        if(this.animations.z > this.animations.limits.z.max)
        {
            this.animations.z = this.animations.limits.z.max
            this.animations.speed.z *= -1
        }
        if(this.animations.z < this.animations.limits.z.min)
        {
            this.animations.z = this.animations.limits.z.min
            this.animations.speed.z *= -1
        }
        if(this.animations.y > this.animations.limits.y.max)
        {
            this.animations.y = this.animations.limits.y.max
            this.animations.speed.y *= -1
        }
        if(this.animations.y < this.animations.limits.y.min)
        {
            this.animations.y = this.animations.limits.y.min
            this.animations.speed.y *= -1
        }

        this.model.mesh.position.z = this.animations.z
        this.model.mesh.position.y = this.animations.y
    }
}