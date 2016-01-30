#Visual Boy Advance

Visual Boy Advance is a a gameboy advanced and gameboy color emulator.

#Setup
* Get yourself Visual Boy Advance. 
* Get yourself the ROM of the game you wish to play
* Set the controls up to match your controls in the control editor:

  ![logo](https://raw.githubusercontent.com/rfox90/beam-segacollection/master/img/vba.png)


* Follow the usual setup instructions from the [readme](../README.md)
* Install the robotjs handler `npm install robotjs` if you haven't already
* Use the following as a sample config file for this script
```
{
    "beam": {
        "username": "Your channel",
        "password": "",
        "channel": "Your channel"
    },
    "handler": "robotjs",
    "remap":false
}
```
* Save the config in `config/vba.json` or `config/gamename.json`
* Launch the script in the usual way, specifiyng your VBA config `node index.js ./config/vba.json`
