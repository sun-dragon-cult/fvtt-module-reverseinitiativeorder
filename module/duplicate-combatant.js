
// CombatTracker - Sync defeated status among combatants that belong to the same token
export async function wrappedOnToggleDefeatedStatus(wrapped, combatant) {
    let isDefeated = !combatant.data.defeated;
    const otherCombatantsSharingToken = _getCombatantsSharingToken(combatant);
    wrapped(combatant);
    for (const cb of otherCombatantsSharingToken) {
        await cb.update({defeated: isDefeated});
    }
}

// Token - Highlight connected combatants when hovered
export function wrappedOnHoverIn(wrapped, event, options) {
    wrapped(event, options);
    const combatant = this.combatant;
    if ( combatant ) {
        const tracker = document.getElementById("combat-tracker");
        _getCombatantsSharingToken(combatant)
            .forEach(cb => {
                const li = tracker.querySelector(`.combatant[data-combatant-id="${cb.id}"]`);
                if ( li ) li.classList.add("hover");
            })
    }
}

// Token - Remove highlight of connected combatants when not hovered anymore
export function wrappedOnHoverOut(wrapped, event) {
    wrapped(event);

    const combatant = this.combatant;
    if ( combatant ) {
        const tracker = document.getElementById("combat-tracker");
        _getCombatantsSharingToken(combatant)
            .forEach(cb => {
                const li = tracker.querySelector(`.combatant[data-combatant-id="${cb.id}"]`);
                if ( li ) li.classList.remove("hover");
            })
    }
}

export function _getCombatantsSharingToken(combatant) {
    const combatantTokenIds = combatant.actor.getActiveTokens(false, true).map(t => t.id);
    return combatant.parent.combatants
        .filter(cb => combatantTokenIds.includes(cb.data.tokenId));
}

// CombatTracker - Add a Duplicate Combatant option
export function wrappedGetEntryContextOptions() {
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
        },
        {
            name: "Remove All Duplicates",
            icon: '<i class="fas fa-skull"></i>',
            callback: li => {
                const combatant = this.viewed.combatants.get(li.data("combatant-id"));
                _getCombatantsSharingToken(combatant)
                    .forEach(c => c.delete());
                return true;
            }
        }
    ]
}
