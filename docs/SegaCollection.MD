
# Beam Plays the Sega Collection

Sega released a ton of Mega Drive/Genesis games into packs onto steam that are wrapped up into a nice official emulator.

Owning at least one game from the collection is **REQUIRED**. I reccomend [Streets of Rage 2](http://store.steampowered.com/app/71165/)

There's also packs that include multiple games you can find the [packs on Steam](http://store.steampowered.com/search/?term=SEGA%20MEGA%20Drive%20Classics%20Pack) +
[Pack 5](http://store.steampowered.com/sub/14445/) (Not included in my search results for some reason).

There's also a [bundle](http://store.steampowered.com/sub/7827/) for a load of them which is what I purchased awhile ago. 

## Setup
* Follow the regular set from the [readme](../README.md)
* Write a config file in config/ called sega.json (`config/sega.json`)
```
{
  "beam": {
    "username": "Your username",
    "password": "",
    "channel": "Your channel"
  },
  "handler": "kbm-robot",
  "remap":true,
  "remapTable": {
    'W':'1',
    'S':'2',
    'A':'3',
    'D':'4',
    'J':'5',
    'K':'6',
    'L':'7',
    'I':'8'
  }
}
```
* Open up the Sega Collection via steam and click options.

I've set this up to use the top row of the keyboard 1 - =. This keeps things like WSAD free for YOU to use if you don't have a controller. I'm also limited by the choice of keys that the underlying nodejs module that pushes keyboard keys for you can use.

The end goal is to emulate a HID device and ouput button pushes so we don't have to use your keyboard but until then. Pause interactive mode if you need to type.

### For One player games (Beam Plays):
Setup the 1st player to be custom keyboard

![Custom Keyboard](http://i.ahref.co.uk/u/r/QlSx.png)

Click assign controller mapping and set it up like this:

![One player controls][controls]

### For Two Player Games (Play *With* Beam)

Setup Player one however you like.

Set player two to custom keyboard:

![Custom Keyboard](http://i.ahref.co.uk/u/r/QlSx.png)

Click assign controller mapping and set it up like this:

![Two player controls][controls]

### Notes
X,Y and Z don't really matter here only a small amount of Mega Drive games used them and to the best of my knowledge they aren't included in the packs on steam.

Please remember what start is too as I neglected to give viewers that particular control to prevent "Pause Spam" whilst I workout kinks in how I handle data from Beam. You may have to for some games push start for the viewers. Every other control works fine though.

## Use

1. Launch the sega collection and pick a game, Wait till you get to the games main menu.
2. Set Beam to Interactive mode and select the Sega Collection as your game
3. Run the script with `node index.js config\sega.json` or your Operating system's equivelant. 
4. If you see "Connected to beam" your all good and can start playing.

##Games Tested
Ive tested these with low numbers of viewers:
* Gunstar Heroes(The whole reason this project exists)
* Streets of Rage 2. There's a duel mode here where you can fight each other too!
* Streets of Rage.
* Ecco The Dolphin

##Games
A partial list of games in the collection:
* Alex Kidd™ in the Enchanted Castle
* Alien Soldier
* Alien Storm
* Altered Beast™
* Bio-Hazard Battle™
* Bonanza Bros.™
* Columns™
* Columns™ III
* Comix Zone™
* Crack Down™
* Decap Attack™
* Ecco the Dolphin™
* Ecco™ Jr.
* Ecco™: The Tides of Time
* ESWAT™: City Under Siege
* Eternal Champions™
* Fatal Labyrinth™
* Flicky™
* Gain Ground™
* Galaxy Force II™
* Golden Axe™
* Golden Axe™ II
* Gunstar Heroes
* Kid Chameleon™
* Landstalker: The Treasures of King Nole
* Light Crusader
* Ristar™
* Shadow Dancer™
* Shining Force
* Shining Force II
* Shining in the Darkness
* Shinobi™ III: Return of the Ninja Master
* Space Harrier™ II
* Streets of Rage
* Streets of Rage 2
* Super Thunder Blade™
* Sword of Vermilion™
* Vectorman™
* Virtua Fighter™ 2

[controls]: http://i.ahref.co.uk/u/r/LW5B.png
