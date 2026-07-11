// @ts-nocheck
import * as THREE from 'three'
import { Pane } from 'tweakpane'

import Time from './Utils/Time'
import Sizes from './Utils/Sizes'
import Stats from './Utils/Stats'

import Resources from './Resources'
import Renderer from './Renderer'
import Camera from './Camera'
import World from './World'
import Navigation from './Navigation'

import assets from './assets'

export default class Experience
{
    static instance

    constructor(_options = {})
    {
        if(Experience.instance)
        {
            return Experience.instance
        }
        Experience.instance = this

        // Options
        this.targetElement = _options.targetElement
        this.onProgress = _options.onProgress
        this.onReady = _options.onReady
        this.isAdmin = _options.isAdmin

        if(!this.targetElement)
        {
            console.warn('Missing \'targetElement\' property')
            return
        }

        this.time = new Time()
        this.sizes = new Sizes()
        this.setConfig()
        this.setStats()
        this.setDebug()
        this.setScene()
        this.setCamera()
        this.setRenderer()
        this.setResources()
        this.setWorld()
        this.setNavigation()
        
        this.sizes.on('resize', () =>
        {
            this.resize()
        })

        this.update()
    }

    setConfig()
    {
        this.config = {}
    
        // Pixel ratio
        this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2)

        // Width and height
        const boundings = this.targetElement.getBoundingClientRect()
        this.config.width = boundings.width
        this.config.height = boundings.height || window.innerHeight
        this.config.smallestSide = Math.min(this.config.width, this.config.height)
        this.config.largestSide = Math.max(this.config.width, this.config.height)
        
        // Debug
        this.config.debug = this.config.width > 420
    }

    setStats()
    {
        if(this.config.debug && typeof window !== 'undefined' && window.location.hash === '#stats')
        {
            this.stats = new Stats(true)
        }
    }

    setDebug()
    {
        if(this.config.debug && this.isAdmin)
        {
            this.debug = new Pane()
            const container = this.debug.containerElem_
            container.style.width = '320px'
            container.style.position = 'absolute'
            container.style.top = '90px'
            container.style.right = '24px'
            container.style.zIndex = '9999'
        }
    }
    
    setScene()
    {
        this.scene = new THREE.Scene()
    }

    setCamera()
    {
        this.camera = new Camera()
    }

    setRenderer()
    {
        this.renderer = new Renderer({ rendererInstance: this.rendererInstance })

        this.targetElement.appendChild(this.renderer.instance.domElement)
    }

    setResources()
    {
        this.resources = new Resources(assets)
    }

    setWorld()
    {
        this.world = new World()
    }

    setNavigation()
    {
        this.navigation = new Navigation()
    }

    update()
    {
        if(this.stats)
            this.stats.update()
        
        this.camera.update()
        
        if(this.renderer)
            this.renderer.update()

        if(this.world)
            this.world.update()

        if(this.navigation)
            this.navigation.update()

        this.updateFrame = window.requestAnimationFrame(() =>
        {
            this.update()
        })
    }

    resize()
    {
        // Config
        const boundings = this.targetElement.getBoundingClientRect()
        this.config.width = boundings.width
        this.config.height = boundings.height
        this.config.smallestSide = Math.min(this.config.width, this.config.height)
        this.config.largestSide = Math.max(this.config.width, this.config.height)

        this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2)

        if(this.camera)
            this.camera.resize()

        if(this.renderer)
            this.renderer.resize()

        if(this.world)
            this.world.resize()
    }

    destroy()
    {
        // Stop tick loop
        if (this.updateFrame)
        {
            window.cancelAnimationFrame(this.updateFrame)
        }

        // Clean up utilities
        if (this.time)
        {
            this.time.stop()
        }
        if (this.sizes)
        {
            this.sizes.destroy()
        }

        // Clean up subsystems
        if (this.navigation)
        {
            this.navigation.destroy()
        }
        if (this.world)
        {
            this.world.destroy()
        }
        if (this.resources)
        {
            this.resources.destroy()
        }
        if (this.renderer)
        {
            this.renderer.destroy()
        }
        if (this.camera && typeof this.camera.destroy === 'function')
        {
            this.camera.destroy()
        }

        // Remove canvas from DOM
        if (this.targetElement && this.renderer && this.renderer.instance && this.renderer.instance.domElement)
        {
            if (this.targetElement.contains(this.renderer.instance.domElement))
            {
                this.targetElement.removeChild(this.renderer.instance.domElement)
            }
        }

        // Clean up tweakpane debug panel
        if (this.debug)
        {
            this.debug.dispose()
        }

        // Clear singleton instance
        Experience.instance = null
    }
}
