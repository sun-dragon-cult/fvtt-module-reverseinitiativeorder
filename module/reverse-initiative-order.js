import { libWrapper } from './shim.js';
import { registerRIOSettings } from "./rio-settings.js";
import { wrappedGetEntryContextOptions, wrappedOnHoverIn, wrappedOnHoverOut, wrappedOnToggleDefeatedStatus } from "./duplicate-combatant.js";

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

Hooks.on('init', setup);

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
        libWrapper.register('reverse-initiative-order', 'Token.prototype._onHoverIn', wrappedOnHoverIn);
        libWrapper.register('reverse-initiative-order', 'Token.prototype._onHoverOut', wrappedOnHoverOut);
    }
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
