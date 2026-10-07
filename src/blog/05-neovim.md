# An editor built up from nothing, on purpose

A Neovim distribution would have been faster. LazyVim or NvChad would have
had highlighting and LSP working in an afternoon. I started from an empty
`init.lua` instead and wrote the plugins, colourscheme, keymaps and LSP
wiring myself. It took longer, and the payoff shows up when something
breaks: I know what every line in the config is for.

## Loading plugins on demand

Every plugin declares its own load trigger through
[`lz.n`](https://github.com/nvim-neorocks/lz.n): a keypress, a filetype, a
command, or eagerly if it genuinely has to be.

```lua
return {
  "nvim-treesitter",
  event = "DeferredUIEnter",
}

return {
  "fastaction.nvim",
  keys = { { "<leader>a", function() require("fastaction").code_action() end } },
}
```

Nothing pays a startup cost until something asks for it. Each entry in the
plugin list says when it loads, so the startup time is something you can
reason about instead of measure and shrug at.

If you are starting from scratch, set this up early. Retrofitting lazy
loading onto a config with thirty eagerly loaded plugins means working out,
one at a time, what each plugin actually needs to be loaded for.

## A colourscheme and a grammar

The colourscheme (`gxvjbox`) is a gruvbox-derived palette I wrote from
scratch: a set of hex values, applied to each highlight group by hand. The
same base16 table is used outside Neovim, for the terminal, the file manager
and the bar, so those tools agree on colours without anyone copying values
between five config formats.

The less common piece is tree-sitter support for a couple of personal file
formats I use for my own project files. I wrote the grammar: a compiled C
parser, syntax queries, and a [topiary](https://topiary.tweag.io/)
formatting query, all in `neovimConfig/` next to the rest of the editor
config. A distribution cannot ship that, because the formats only exist for
me.

## Pointing the language server at this flake

The Nix language server here is not only configured for Nix syntax. It is
pointed at this flake's own evaluated option set, so completion on a NixOS
option comes from this repository's module tree rather than from generic
nixpkgs documentation:

```lua
options.nixos.expr = '(builtins.getFlake (toString ./.)).nixosConfigurations.amal.options'
```

Swap `amal` for your own `nixosConfigurations` name. Once that line is
correct, writing Nix inside Neovim gives you completions for your own custom
modules, which is the main reason I keep the editor config in the same repo
as the system config.
