
export class PowerUp {
    constructor(x, y, type, quality, assets) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.quality = quality; // 'common', 'rare', 'epic'
        this.assets = assets;
        this.width = 60; // Tamaño más grande para el power-up
        this.height = 60; // Tamaño más grande para el power-up
        this.isCollected = false;
        this.speed = 1; // Power-ups slowly float downwards
        this.frame = 0; // For animation
        this.colors = {
            common: { shadow: '#87CEEB', fill: '#87CEEB', text: 'black' }, // Celeste
            rare: { shadow: '#EE82EE', fill: '#EE82EE', text: 'white' },   // Violet
            epic: { shadow: '#FFA500', fill: '#FFA500', text: 'white' }    // Orange
        };
    }

    update(deltaTime, game) {
        this.y += this.speed * (deltaTime / 16.67);
        if (this.y > game.canvas.height) {
            this.isCollected = true; // Remove if it goes off-screen
        }
        this.frame = (this.frame + deltaTime * 0.01) % (Math.PI * 2); // Animate over time
    }

    draw(ctx) {
        ctx.save();

        const color = this.colors[this.quality];
        if (!color) {
            console.warn(`Unknown power-up quality: ${this.quality}`);
            ctx.restore();
            return;
        }

        // Hologram effect: pulsating glow and translucency
        const glowIntensity = 0.5 + Math.sin(this.frame) * 0.2; // Pulsating effect
        ctx.globalAlpha = 0.6 + Math.sin(this.frame * 0.5) * 0.1; // Subtle translucency change
        ctx.shadowBlur = 20 * glowIntensity;
        ctx.shadowColor = color.shadow;

        // Draw a diamond shape for a crystal effect
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y); // Top center
        ctx.lineTo(this.x + this.width, this.y + this.height / 2); // Right center
        ctx.lineTo(this.x + this.width / 2, this.y + this.height); // Bottom center
        ctx.lineTo(this.x, this.y + this.height / 2); // Left center
        ctx.closePath();

        // Apply gradient for crystal look with more shine
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        gradient.addColorStop(0, `rgba(255,255,255,${0.8 * glowIntensity})`); // Stronger highlight
        gradient.addColorStop(0.3, color.fill);
        gradient.addColorStop(0.7, color.fill);
        gradient.addColorStop(1, `rgba(0,0,0,${0.3 * glowIntensity})`); // Darker shadow
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw a subtle inner glow/border for more definition
        ctx.strokeStyle = `rgba(255,255,255,${0.4 * glowIntensity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw text
        ctx.globalAlpha = 1; // Text should be fully opaque
        ctx.fillStyle = color.text;
        ctx.font = '12px Arial'; // Slightly larger font
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle'; // Center text vertically
        ctx.fillText(this.type, this.x + this.width / 2, this.y + this.height / 2);
        ctx.restore();
    }

    apply(player, game) {
        console.log(`Applying ${this.type} power-up to player`);
    }

    revert(player) {
        console.log(`Reverting ${this.type} power-up from player`);
    }
}

export class ShieldPowerUp extends PowerUp {
    constructor(x, y, assets) {
        super(x, y, 'Shield', 'rare', assets);
        this.shieldHp = 100; // Additional HP for the shield
        this.image = assets.shieldGreen; // Assuming a shield asset is loaded
    }

    apply(player, game) {
        super.apply(player, game);
        player.activateShield(this.shieldHp, game.currentLevel);
    }

    revert(player) {
        super.revert(player);
        // Shield is destroyed when its HP runs out, not by duration here.
    }
}

export class LaserModePowerUp extends PowerUp {
    constructor(x, y, assets) {
        super(x, y, 'LaserMode', 'epic', assets);
        this.duration = 10000; // 10 seconds
        this.originalShipType = null;
    }

    apply(player, game) {
        super.apply(player, game);
        this.originalShipType = player.shipType;
        player.transformToLaserMode(this.assets.playerLaser, this.duration, game.currentLevel);
    }

    revert(player) {
        super.revert(player);
        player.revertFromLaserMode(this.originalShipType);
    }
}

export class TankModePowerUp extends PowerUp {
    constructor(x, y, assets) {
        super(x, y, 'TankMode', 'epic', assets);
        this.duration = 10000; // 10 seconds
        this.originalShipType = null;
    }

    apply(player, game) {
        super.apply(player, game);
        this.originalShipType = player.shipType;
        player.transformToTankMode(this.assets.playerTank, this.duration, game.currentLevel);
    }

    revert(player) {
        super.revert(player);
        player.revertFromTankMode(this.originalShipType);
    }
}


export class BoostPowerUp extends PowerUp {
    constructor(x, y, assets) {
        super(x, y, 'Boost', 'epic', assets);
        this.duration = 10000; // 10 seconds
    }

    apply(player, game) {
        super.apply(player, game);
        player.activateBoost(this.duration, game.currentLevel);
    }

    revert(player) {
        super.revert(player);
        player.deactivateBoost();
    }
}



// New Common Power-ups
export class MovementSpeedPowerUp extends PowerUp {
    constructor(x, y, assets) {
        super(x, y, 'MovementSpeed', 'common', assets);
        this.value = 1; // Speed increase
        this.duration = 10000; // 10 seconds
    }

    apply(player, game) {
        super.apply(player, game);
        player.activateMovementSpeed(this.value, this.duration, game.currentLevel);
    }

    revert(player) {
        super.revert(player);
        // Revert logic will be handled by player.revertFromMovementSpeed()
    }
}


export class FireRatePowerUp extends PowerUp {
    constructor(x, y, assets) {
        super(x, y, 'FireRate', 'common', assets);
        this.value = 50; // Cooldown reduction in ms
        this.duration = 10000; // 10 seconds
    }

    apply(player, game) {
        super.apply(player, game);
        player.activateFireRate(this.value, this.duration, game.currentLevel);
    }

    revert(player) {
        super.revert(player);
        // Revert logic will be handled by player.revertFromFireRate()
    }
}


// New Rare Power-ups
export class HealthPowerUp extends PowerUp {
    constructor(x, y, assets) {
        super(x, y, 'Salud', 'rare', assets);
        this.value = 20; // Health increase
    }

    apply(player, game) {
        super.apply(player, game);
        player.increaseHealth(this.value, game.currentLevel);
    }
}



