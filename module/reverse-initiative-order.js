class ReverseInitiativeOrder {

    static async setup() {
        console.log('reverse-initiative-order | Initializing Reverse Initiative Order module');
        Combat.prototype.setupTurns = ReverseInitiativeOrder.setupTurns;
        await ReverseInitiativeOrder.registerSettings();
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

    static registerSettings() {
        game.settings.register("reverse-initiative-order", "min", {
            name: "Minimum initiative allowed",
            scope: "world",
            config: true,
            type: Number,
            default: 1,
        });

        game.settings.register("reverse-initiative-order", "max", {
            name: "Maximum initiative allowed",
            scope: "world",
            config: true,
            type: Number,
            default: 12,
        });
    }
}

Hooks.on('init', ReverseInitiativeOrder.setup);


Hooks.on("renderCombatTracker", (app, html, data) => {
    const currentCombat = data.combats[data.currentIndex - 1];
    html.find(".combatant").each((i, el) => {
        const combId = el.dataset.combatantId;
        const combatant = currentCombat.data.combatants.find((c) => c._id === combId);
        const initdiv = el.getElementsByClassName("token-initiative")[0];
        const min = game.settings.get("reverse-initiative-order","min");
        const max = game.settings.get("reverse-initiative-order","max");
        initdiv.innerHTML = `<input type="number" min="${min}" max="${max}" value="${combatant.initiative}">`;

        initdiv.addEventListener("change", async (e) => {
            const inputElement = e.target;
            const combatantId = inputElement.closest("[data-combatant-id]").dataset.combatantId;
            await currentCombat.setInitiative(combatantId, inputElement.value);
        });
    });
});
