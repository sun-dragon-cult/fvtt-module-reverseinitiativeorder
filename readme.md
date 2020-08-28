# Reverse Initiative Order
This Foundry VTT module sorts the order of combatants in the combat tracker from lowest initiative to highest.
This is useful for systems like RuneQuest that use numbered "strike ranks".

## Compatibility
This module is system agnostic, but overrides Combat.prototype.setupTurns and modifies the combat tracker DOM element identified by token-initiative so other modules / systems might interfere.

## Installation 
1 Inside Foundry's Configuration and Setup screen, go to Add-on Modules

2 Click "Install Module"

3 In the Manifest URL field paste: https://github.com/wakeand/fvtt-module-reverseinitiativeorder/releases/latest/download/module.json

## Usage
Once activated the order in the combat tracker will go from lowest to highest instead of the other way around. It will also add an input
field that allows you to directly set the initiative. In the module settings you can set minimum and maximum initiative allowed in that input. 
This defaults to 1-12 (To match strike ranks in RuneQuest).

## Issues
If you have any issues, concerns or improvement ideas, please don't hesitate to open an issue: https://github.com/wakeand/fvtt-module-reverseinitiativeorder/issues

## License

Module development according to Foundry Virtual Tabletop [Limited License Agreement for Module Development](https://foundryvtt.com/article/license)

This module is licensed by [Åke Wivänge](https://github.com/wake42) under [AGPL-3.0](https://opensource.org/licenses/AGPL-3.0)

