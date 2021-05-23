# Reverse Initiative Order
This Foundry VTT module sorts the order of combatants in the combat tracker from lowest initiative to highest.
This is useful for systems like RuneQuest that use numbered "strike ranks".

In addition to that it also replaces the initiative roll with an input field for quick entry. This feature 
can be toggled off by a module setting (on be default). Only the owner of the actor (and GM) can edit the initiative value.

It optionally also adds a right click context menu alternative "Duplicate Combatant" and "Remove All Duplicates" to make it possible to have the same actor 
token get multiple actions in the same round. In RuneQuest for example you can fire multiple arrows in the same 
round if you are fast enough. This setting is off by default. 

![Screenshot](screenshots/combatTracker.jpg?raw=true)

## Compatibility
This module is system agnostic, and requires Foundry VTT 0.8.x (there are older versions compatible with Foundry 0.7.x)

## Installation 
1. Inside Foundry's Configuration and Setup screen, go to Add-on Modules

2. Click "Install Module"

3. In the Manifest URL field paste: https://github.com/wakeand/fvtt-module-reverseinitiativeorder/releases/latest/download/module.json

4. Installing the module LibWrapper is highly recommended to avoid conflicts with other modules

## Usage
Once activated the order in the combat tracker will go from lowest to highest instead of the other way around. It will also add an input
field that allows you to directly set the initiative, this can be toggled of by a module setting. In the module settings you can set minimum and maximum initiative allowed in that input. 
This defaults to 1-12 (To match strike ranks in RuneQuest).

There is also a setting for adding a context menu item that allows combatants to be duplicated.

## Issues
If you have any issues, concerns or improvement ideas, please don't hesitate to open an issue: https://github.com/wakeand/fvtt-module-reverseinitiativeorder/issues

## License

Module development according to Foundry Virtual Tabletop [Limited License Agreement for Module Development](https://foundryvtt.com/article/license)

This module is licensed by [Åke Wivänge](https://github.com/wake42) under [AGPL-3.0](https://opensource.org/licenses/AGPL-3.0)

