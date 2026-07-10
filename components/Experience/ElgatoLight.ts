// @ts-nocheck
import * as THREE from 'three'

import Experience from './Experience'

export default class ElgatoLight
{
    constructor()
    {
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.scene = this.experience.scene

        this.setModel()
    }

    setModel()
    {
        this.model = {}

        const originalMesh = this.resources.items.elgatoLightModel.scene.children[0]
        this.model.mesh = originalMesh ? originalMesh.clone() : null

        if (!this.model.mesh)
        {
            console.error('elgatoLightModel mesh not found')
            return
        }

        this.scene.add(this.model.mesh)

        this.model.mesh.material = new THREE.MeshBasicMaterial({
            color: 0xffffff
        })
    }
}