# One flake, three machines that barely resemble each other

I have three NixOS machines: a ThinkPad laptop, an older laptop I no longer
use and keep for conservation, and a headless server I will call aleph,
which has no display and is never touched directly. They share almost no
hardware. All three are built from the same flake, and pointing a command at
a different one is a matter of changing a single name.

## What is shared

Everything except hardware. The desktop, the editor, the terminal, the
shell, the secrets plumbing and the Nix settings live in `modules/base/` and
`modules/features/`, written once and imported by whichever hosts want them:

```nix
# Amal/configuration.nix (laptop)
imports = [ self.nixosModules.desktop self.nixosModules.gaming ... ];

# myMachine/configuration.nix (retired, kept for conservation)
imports = [ self.nixosModules.desktop ... ];
```

Both laptops get the same niri setup, the same Neovim config and the same
terminal. Not two copies that started out identical and will drift, but one
module evaluated twice. Fix a bug in the desktop module and both machines
have the fix on their next rebuild, with no second copy to remember.

## What is not shared

Hardware first. Each host's `hardware.nix` is the untouched output of
`nixos-generate-config`, specific to that machine's disks and boot setup,
and I do not hand-edit it.

Then anything that is a fact about one box rather than a preference: how
many cores to use for parallel builds, which hostname a shared module should
treat as "this machine" when asking the language server for completions, and
where the flake happens to be checked out on disk.

Those facts come in through a small number of environment variables set once
per host (`$NIXD_HOST`, `$NH_FLAKE`) instead of being written into the
shared modules. The shared code stays shared, and the facts that cannot be
shared stay in the one file that knows them.

## Two rules that stop it drifting

If you plan to run one config across several machines, these are the two
rules I would hold to from the start.

1. A feature module never refers to a host by name. It does not know which
   hosts import it.
2. A host config never edits another host's file to get something done.

With those two in place, adding a capability to the laptop means writing one
module and importing it in one place. The server's config is not involved,
so a change meant for one machine cannot quietly land on another.
