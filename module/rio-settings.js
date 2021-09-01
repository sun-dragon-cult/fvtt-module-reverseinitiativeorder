export function registerRIOSettings() {
    game.settings.register("reverse-initiative-order", "reverseInitiative", {
        name: "Reverse Initiative",
        hint: "Reverse the sorting order for initiative so that lowest goes first.",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });

    game.settings.register("reverse-initiative-order", "multipleCombatants", {
        name: "Duplicate Combatant",
        hint: "Add a 'Duplicate Combatant' context menu item in the Combat Tracker that allows each token " +
              "to have multiple combatants to give the possibility to get multiple actions in the same round.",
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
