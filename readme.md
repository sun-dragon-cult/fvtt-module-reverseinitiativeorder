![Supported Foundry Versions](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https://github.com/wakeand/fvtt-module-reverseinitiativeorder/releases/latest/download/module.json)
[![GitHub Release](https://img.shields.io/github/release/wakeand/fvtt-module-reverseinitiativeorder)]()
[![Issues](https://img.shields.io/github/issues-raw/wakeand/fvtt-module-reverseinitiativeorder?maxAge=25000)](https://github.com/wakeand/fvtt-module-reverseinitiativeorder/issues)
![Latest Release Download Count](https://img.shields.io/github/downloads/wakeand/fvtt-module-reverseinitiativeorder/latest/reverse-initiative-order.zip)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://github.com/wakeand/fvtt-module-reverseinitiativeorder/blob/master/LICENSE)

# Reverse Initiative Order
This Foundry VTT module does 3 things, each can be disabled in the settings

* Reverse the combat order to go from low to high initiative
* Provide an input field for easy entry of initiative. Only the owner of the actor (and GM) can edit the initiative value.
* Add the possibility to duplicate combatants to allow a single actor/token to get multiple actions in one round


If the option to duplicate combatants is enabled it will add right click context menu alternatives "Duplicate Combatant" 
and "Remove All Duplicates" to make it possible to have the same actor/token get multiple actions in the same round. 
In RuneQuest for example you can fire multiple arrows in the same round if you are fast enough. This setting is off by default. 

![Screenshot](screenshots/combatTracker.jpg?raw=true)

## Compatibility
This module is system agnostic, and requires Foundry VTT 0.8.x (there are older versions compatible with Foundry 0.7.x)

## Installation
The easiest way is to use Foundry's built-in directory of modules. Simply search for "Reverse Order" and install!

In the same Foundry's built-in directory you can also specify a link to this module and install it that way: https://github.com/wakeand/fvtt-module-reverseinitiativeorder/releases/latest/download/module.json

Installing the module **LibWrapper** is highly recommended to avoid conflicts with other modules. If you do not already have
that module installed, you will be prompted to install it when you install this module.

## Issues
If you have any issues, concerns or improvement ideas, please don't hesitate to open an issue: https://github.com/wakeand/fvtt-module-reverseinitiativeorder/issues

## License

Module development according to Foundry Virtual Tabletop [Limited License Agreement for Module Development](https://foundryvtt.com/article/license)

This module is licensed by [Åke Wivänge](https://github.com/wake42) under [AGPL-3.0](https://opensource.org/licenses/AGPL-3.0)

