import {libWrapper} from './shim.js';

Hooks.on('init', setup);

Hooks.once('ready', () => {
    if (!game.modules.get('lib-wrapper')?.active && game.user.isGM)
        ui.notifications.error("Module Reverse Initiative Order requires the 'libWrapper' module. Please install and activate it.");
});


Hooks.on("renderCombatTracker", (app, html, data) => {
    // Opt out for replacing initiative roll with input field
    if (game.settings.get("reverse-initiative-order", "initiativeInputField")) {
        const currentCombat = data.combats[data.currentIndex - 1];
        if (currentCombat) {
            html.find(".combatant").each((i, el) => {
                const combId = el.dataset.combatantId;
                const combatant = currentCombat.data.combatants.find((c) => c.id === combId);
                const initDiv = el.getElementsByClassName("token-initiative")[0];
                const min = game.settings.get("reverse-initiative-order", "min");
                const max = game.settings.get("reverse-initiative-order", "max");
                const initiative = combatant.initiative || "";
                const readOnly = combatant.actor.isOwner ? "" : "readonly";
                initDiv.innerHTML = `<input type="number" min="${min}" max="${max}" ${readOnly} value="${initiative}">`;

                initDiv.addEventListener("change", async (e) => {
                    const inputElement = e.target;
                    const combatantId = inputElement.closest("[data-combatant-id]").dataset.combatantId;
                    await currentCombat.setInitiative(combatantId, inputElement.value);
                });
            });
        }
    }
});


async function setup() {
    console.log('reverse-initiative-order | Initializing Reverse Initiative Order module');
    await registerRIOSettings();
    libWrapper.register('reverse-initiative-order', 'Combat.prototype._sortCombatants', wrappedSortCombatants);

    // Opt out for replacing initiative roll with input field
    if (game.settings.get("reverse-initiative-order", "initiativeInputField")) {
        CONFIG.Combat.initiative = {
            formula: null,
            decimals: 0
        };
    }

    // Opt in for possibility to duplicate combatants.
    if (game.settings.get("reverse-initiative-order", "multipleCombatants")) {
        console.log('reverse-initiative-order | Opted in for multiple combatants / token');
        libWrapper.register('reverse-initiative-order', 'CombatTracker.prototype._onToggleDefeatedStatus', wrappedOnToggleDefeatedStatus);
        libWrapper.register('reverse-initiative-order', 'CombatTracker.prototype._getEntryContextOptions', wrappedGetEntryContextOptions);
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

    game.settings.register("reverse-initiative-order", "initiativeInputField", {
        name: "Initiative Input Field",
        hint: "Replace the normal initiative roll button with an input field",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
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
function wrappedSortCombatants(wrapped, a, b) {
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
async function wrappedOnToggleDefeatedStatus(wrapped, combatant) {
    let isDefeated = !combatant.data.defeated;
    const combatantsSharingToken = combatant.parent.combatants
        .filter(cb => {
            // const isLinked = combatant?.actor.data.token.actorLink;
            return cb.data.tokenId === combatant.data.tokenId && cb.id !== combatant.id
        });
    wrapped(combatant);
    for (const c of combatantsSharingToken) {
        await c.update({defeated: isDefeated});
    }
}

// CombatTracker - Add a Duplicate Combatant option
function wrappedGetEntryContextOptions() {
    return [
        {
            name: "Duplicate Combatant",
            icon: '<i class="far fa-copy fa-fw"></i>',
            callback: async (li) => {
                const combatant = this.viewed.combatants.get(li.data("combatant-id"))
                this.viewed.createEmbeddedDocuments("Combatant", [combatant.data]);
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
            callback: li => {
                const combatant = this.viewed.combatants.get(li.data("combatant-id"));
                return combatant.delete();
            }
        }
    ];
}
