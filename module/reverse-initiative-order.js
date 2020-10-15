class ReverseInitiativeOrder {

    static async setup() {
        console.log('reverse-initiative-order | Initializing Reverse Initiative Order module');
        Combat.prototype._sortCombatants = ReverseInitiativeOrder.sortCombatants;
        CombatTracker.prototype._getEntryContextOptions = ReverseInitiativeOrder.getEntryContextOptions;
        await ReverseInitiativeOrder.registerSettings();
        CONFIG.Combat.initiative = {
            formula: null,
            decimals: 0
        };
    }

    static sortCombatants(a, b) {
        const ia = Number.isNumeric(a.initiative) ? a.initiative : 9999;
        const ib = Number.isNumeric(b.initiative) ? b.initiative : 9999;
        const ci = ia - ib;
        if (ci !== 0) return ci;
        let [an, bn] = [a.token.name || "", b.token.name || ""];
        let cn = an.localeCompare(bn);
        if (cn !== 0) return cn;
        return a.tokenId - b.tokenId;
    }

    static getEntryContextOptions() {
        return [
            {
                name: "Duplicate Combatant",
                icon: '<i class="far fa-copy fa-fw"></i>',
                callback: async (li) => {
                    const combatant = this.combat.getCombatant(li.data('combatant-id'));
                    await this.combat.createCombatant(combatant);
                }

            },
            {
                name: "COMBAT.CombatantUpdate",
                icon: '<i class="fas fa-edit"></i>',
                callback: this._onConfigureCombatant.bind(this)
            },
            {
                name: "COMBAT.CombatantRemove",
                icon: '<i class="fas fa-skull"></i>',
                callback: li => this.combat.deleteCombatant(li.data('combatant-id'))
            }
        ];
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
        initdiv.innerHTML = `<input type="number" min="${min}" max="${max}" value="${combatant.initiative}" style="color:white">`;

        initdiv.addEventListener("change", async (e) => {
            const inputElement = e.target;
            const combatantId = inputElement.closest("[data-combatant-id]").dataset.combatantId;
            await currentCombat.setInitiative(combatantId, inputElement.value);
        });
    });
});
