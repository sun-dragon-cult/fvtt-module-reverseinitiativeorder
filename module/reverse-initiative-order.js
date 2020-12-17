Hooks.on('init', setup);

Hooks.on("renderCombatTracker", (app, html, data) => {
    const currentCombat = data.combats[data.currentIndex - 1];
    if (currentCombat) {
        html.find(".combatant").each((i, el) => {
            const combId = el.dataset.combatantId;
            const combatant = currentCombat.data.combatants.find((c) => c._id === combId);
            const initDiv = el.getElementsByClassName("token-initiative")[0];
            const min = game.settings.get("reverse-initiative-order", "min");
            const max = game.settings.get("reverse-initiative-order", "max");
            const initiative = combatant.initiative || "";
            initDiv.innerHTML = `<input type="number" min="${min}" max="${max}" value="${initiative}" style="color:white">`;

            initDiv.addEventListener("change", async (e) => {
                const inputElement = e.target;
                const combatantId = inputElement.closest("[data-combatant-id]").dataset.combatantId;
                await currentCombat.setInitiative(combatantId, inputElement.value);
            });
        });
    }
});

async function setup() {
    console.log('reverse-initiative-order | Initializing Reverse Initiative Order module');
    await registerRIOSettings();
    Combat.prototype._sortCombatants = sortCombatants;
    CONFIG.Combat.initiative = {
        formula: null,
        decimals: 0
    };

    // Opt in for possibility to duplicate combatants.
    if (game.settings.get("reverse-initiative-order", "multipleCombatants")) {
        console.log('reverse-initiative-order | Opted in for multiple combatants / token');
        CombatTracker.prototype._onToggleDefeatedStatus = onToggleDefeatedStatus;
        CombatTracker.prototype._getEntryContextOptions = getEntryContextOptions;
        Combat.prototype.getCombatantByToken = getCombatantsByToken;
        Token.prototype._toggleOverlayEffect = _toggleOverlayEffect;
        Object.defineProperty(Token.prototype, 'inCombat', {get: inCombat})

        // Make sure all combatants that share a token gets the same defeated flag
        Hooks.on("preUpdateCombatant", async (combat, data, diff) => {
            if (diff.defeated !== undefined) {
                await Promise.all(
                    combat.data.combatants.map(c => {
                        if (c.token._id === data.tokenId && c.defeated !== data.defeated) {
                            c.defeated = data.defeated;
                            return game.combat.updateCombatant({_id: c._id, defeated: data.defeated});
                        }
                    })
                )
            }
        });
    }
}

function registerRIOSettings() {
    game.settings.register("reverse-initiative-order", "multipleCombatants", {
        name: "Duplicate Combatant",
        hint: "Add a 'Duplicate Combatant' context menu item in the Combat Tracker that allows each token " +
            "to have multiple combatants to give the possibility to get multiple actions in the same round. " +
            "Warning, this is not fully supported by Foundry and may lead to unexpected results, especially after a Foundry update.",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
    });

    game.settings.register("reverse-initiative-order", "min", {
        name: "Minimum Initiative Allowed",
        scope: "world",
        config: true,
        type: Number,
        default: 1,
    });

    game.settings.register("reverse-initiative-order", "max", {
        name: "Maximum Initiative Allowed",
        scope: "world",
        config: true,
        type: Number,
        default: 12,
    });
}

// Sort from low to high
function sortCombatants(a, b) {
    const ia = Number.isNumeric(a.initiative) ? a.initiative : 9999;
    const ib = Number.isNumeric(b.initiative) ? b.initiative : 9999;
    const ci = ia - ib;
    if (ci !== 0) return ci;
    let [an, bn] = [a.token.name || "", b.token.name || ""];
    let cn = an.localeCompare(bn);
    if (cn !== 0) return cn;
    return a.tokenId - b.tokenId;
}

// CombatTracker - Sync defeated status among combatants that belong to the same token
async function onToggleDefeatedStatus(c) {
    let isDefeated = !c.defeated;
    const combatantsSharingToken = this.combat.combatants.filter(cb => cb.tokenId === c.tokenId);
    const updateData = combatantsSharingToken.map(cb => {
        return {_id: cb._id, defeated: isDefeated}
    })
    await this.combat.updateCombatant(updateData);
    const token = canvas.tokens.get(c.tokenId);
    if ( !token ) return;

    // Push the defeated status to the token
    let status = CONFIG.statusEffects.find(e => e.id === CONFIG.Combat.defeatedStatusId);
    let effect = token.actor && status ? status : CONFIG.controlIcons.defeated;
    await token.toggleEffect(effect, {overlay: true, active: isDefeated});
}

// CombatTracker - Add a Duplicate Combatant option
function getEntryContextOptions() {
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

// Combat - Remove 1:1 limit on token <-> combatants.
// Changes signature to return an array of combatants instead of a single combatant.
function getCombatantsByToken(tokenId) {
    return this.turns.filter(c => c.tokenId === tokenId);
}

// Token - Patch uses of Combat#getCombatantsByToken
async function _toggleOverlayEffect(texture, {active}) {

    // Assign the overlay effect
    active = active ?? this.data.overlayEffect !== texture;
    let effect = active ? texture : null;
    await this.update({overlayEffect: effect});

    // Set the defeated status in the combat tracker
    // TODO - deprecate this and require that active effects be used instead
    if ( (texture === CONFIG.controlIcons.defeated) && game.combat ) {
        const combatants = game.combat.getCombatantByToken(this.id);
        await Promise.all(combatants.map(async combatant => {
            if (combatant) await game.combat.updateCombatant({_id: combatant._id, defeated: active})
        }));
    }
    return this;
}

// Token - Patch uses of Combat#getCombatantsByToken
function inCombat() {
    const combat = ui.combat.combat;
    if ( !combat ) return false;
    const combatants = combat.getCombatantByToken(this.id);
    return combatants.some(c => c !== undefined);
}
