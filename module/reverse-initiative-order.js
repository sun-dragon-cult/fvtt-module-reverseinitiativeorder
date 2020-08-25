class ReverseInitiativeOrder {

    static async setup() {
        console.log('reverse-initiative-order | Initializing Reverse Initiative Order module');
        Combat.prototype.setupTurns = ReverseInitiativeOrder.setupTurns;
    }

    static setupTurns() {
        const scene = game.scenes.get(this.data.scene);
        const players = game.users.players;
        // Populate additional data for each combatant
        const turns = this.data.combatants
            .map((c) => {
                c.token = scene.getEmbeddedEntity("Token", c.tokenId);
                if (!c.token) return c;
                c.actor = Actor.fromToken(new Token(c.token, scene));
                c.players = c.actor
                    ? players.filter((u) => c.actor.hasPerm(u, "OWNER"))
                    : [];
                c.owner = game.user.isGM || (c.actor ? c.actor.owner : false);
                c.visible = c.owner || !c.hidden;
                return c;
            })
            .filter((c) => c.token)
            // Sort turns into initiative order: (1) initiative, (2) name, (3) tokenId
            .sort((a, b) => {
                const ia = Number.isNumeric(a.initiative) ? a.initiative : 9999;
                const ib = Number.isNumeric(b.initiative) ? b.initiative : 9999;
                const ci = ia - ib;
                if (ci !== 0) return ci;
                let [an, bn] = [a.token.name || "", b.token.name || ""];
                let cn = an.localeCompare(bn);
                if (cn !== 0) return cn;
                return a.tokenId - b.tokenId;
            });
        // Ensure the current turn is bounded
        this.data.turn = Math.clamped(this.data.turn, 0, turns.length - 1);
        this.turns = turns;
        // When turns change, tracked resources also change
        if (ui.combat) ui.combat.updateTrackedResources();
        return this.turns;
    }
}

Hooks.on('init', ReverseInitiativeOrder.setup);
