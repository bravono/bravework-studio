// @ts-nocheck
import * as THREE from 'three'
import Experience from './Experience'
import Baked from './Baked'
import GoogleLeds from './GoogleLeds'
import LoupedeckButtons from './LoupedeckButtons'
import CoffeeSteam from './CoffeeSteam'
import TopChair from './TopChair'
import ElgatoLight from './ElgatoLight'
import BouncingLogo from './BouncingLogo'
import Screen from './Screen'

export default class World
{
    constructor(_options)
    {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        
        this.resources.on('groupEnd', (_group) =>
        {
            if(_group.name === 'base')
            {
                this.setBaked()
                this.setGoogleLeds()
                this.setLoupedeckButtons()
                this.setCoffeeSteam()
                this.setTopChair()
                this.setElgatoLight()
                this.setBouncingLogo()
                this.setScreens()
            }
        })
    }

    setBaked()
    {
        this.baked = new Baked()
    }

    setGoogleLeds()
    {
        this.googleLeds = new GoogleLeds()
    }

    setLoupedeckButtons()
    {
        this.loupedeckButtons = new LoupedeckButtons()
    }

    setCoffeeSteam()
    {
        this.coffeeSteam = new CoffeeSteam()
    }

    setTopChair()
    {
        this.topChair = new TopChair()
    }

    setElgatoLight()
    {
        this.elgatoLight = new ElgatoLight()
    }

    setBouncingLogo()
    {
        this.bouncingLogo = new BouncingLogo()
    }

    setScreens()
    {
        this.pcScreen = new Screen(
            this.resources.items.pcScreenModel.scene.children[0],
            '/assets/Aircraft_Final.mp4'
        )
        this.macScreen = new Screen(
            this.resources.items.macScreenModel.scene.children[0],
            '/assets/Abcd_fiverr.mp4'
        )
    }

    resize()
    {
    }

    update()
    {
        if(this.googleLeds)
            this.googleLeds.update()

        if(this.loupedeckButtons)
            this.loupedeckButtons.update()

        if(this.coffeeSteam)
            this.coffeeSteam.update()

        if(this.topChair)
            this.topChair.update()

        if(this.bouncingLogo)
            this.bouncingLogo.update()
    }

    destroy()
    {
        if (this.baked && typeof this.baked.destroy === 'function') this.baked.destroy()
        if (this.googleLeds && typeof this.googleLeds.destroy === 'function') this.googleLeds.destroy()
        if (this.loupedeckButtons && typeof this.loupedeckButtons.destroy === 'function') this.loupedeckButtons.destroy()
        if (this.coffeeSteam && typeof this.coffeeSteam.destroy === 'function') this.coffeeSteam.destroy()
        if (this.topChair && typeof this.topChair.destroy === 'function') this.topChair.destroy()
        if (this.elgatoLight && typeof this.elgatoLight.destroy === 'function') this.elgatoLight.destroy()
        if (this.bouncingLogo && typeof this.bouncingLogo.destroy === 'function') this.bouncingLogo.destroy()
        if (this.pcScreen && typeof this.pcScreen.destroy === 'function') this.pcScreen.destroy()
        if (this.macScreen && typeof this.macScreen.destroy === 'function') this.macScreen.destroy()
    }
}