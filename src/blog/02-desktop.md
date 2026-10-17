# A desktop that scrolls instead of stacking

Most desktops ask you to manage windows: resize them, tile them, alt-tab
through a stack of them. [niri](https://github.com/YaLTeR/niri) does not have
a stack. Windows sit in columns on a strip that scrolls sideways, and you
move along the strip instead of arranging a grid. It took me about a week to
stop reaching for the old habits. After that, a stacking window manager felt
slower to me, mostly because I kept losing track of where the windows went.

## One derivation for the whole desktop

niri, the bar, the launcher and the colours are assembled through
[`nix-wrapper-modules`](https://github.com/BirdeeHub/nix-wrapper-modules)
into a single derivation:

```nix
packages.desktop = inputs.wrapper-modules.wrappers.niri.wrap {
  inherit pkgs;
  imports = [ self.wrappersModules.niri ];
  terminal = lib.getExe self'.packages.terminal;
  env.EDITOR = lib.getExe self'.packages.neovim;
};
```

The practical part is that installing my desktop is one package and updating
it is one rebuild. If the compositor config and the panel config disagree,
the build fails, and that is a better place to find out than the login
screen.

[noctalia-shell](https://github.com/noctalia-dev/noctalia-shell) is the bar,
launcher and control centre on top of it. It uses a gruvbox palette that is
defined once in the Nix config and passed to the terminal, the editor, the
file manager and the bar. One definition is the difference between a theme
and five themes that slowly stop matching.

## Keybinds you can look up

A keybind-driven setup only works if you can remember the keybinds, and I
could not. What fixed it for me was the `which-key.nvim` pattern: press the
leader, pause, and a menu lists the available continuations with their
descriptions, taken from the `desc` strings the real keybinds already carry.
There is no cheat sheet to maintain, because the menu is generated from the
bindings themselves.

On the niri side I do the same with a small launcher (`self.mkWhichKeyExe`)
bound to `Mod+G`: Bluetooth, Wi-Fi, a browser, Discord, a volume mixer. If
you are setting up niri, add that lookup early. It decides whether the setup
is usable by someone who has not read your config, or only by you.
