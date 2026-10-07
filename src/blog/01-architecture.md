# One file, one capability: how I stopped maintaining an import list

A NixOS config usually grows the same artifact: a long `imports = [ ... ]`
list near the top of the flake, kept current by hand, usually a little behind
the directory it points at. Add a module, forget the list, and you spend
twenty minutes wondering why the option you just wrote does nothing.

I got tired of that. My flake has no import list, and the whole output is one
line:

```nix
outputs = inputs: inputs.flake-parts.lib.mkFlake { inherit inputs; } (inputs.import-tree ./modules);
```

[`import-tree`](https://github.com/vic/import-tree) reads `modules/`
recursively and imports every `*.nix` file it finds as a
[flake-parts](https://flake.parts/) module. Put a file in the directory and
it is used. Take it out and it is not. The directory is the list.

## One convention, no framework

Auto-discovery only stays readable if the files it finds look alike. The rule
I keep is small: one file, one `flake.nixosModules.<name>`.

```nix
# modules/features/tailscale.nix
{ self, inputs, ... }:
{
  flake.nixosModules.tailscale = { config, ... }: {
    services.tailscale.enable = true;
    networking.firewall.trustedInterfaces = [ "tailscale0" ];
  };
}
```

A host does not need to know what is inside `tailscale.nix`. It asks for the
capability by name:

```nix
imports = [
  self.nixosModules.tailscale
  self.nixosModules.nvidia
  self.nixosModules.desktop
];
```

That rule pays for itself in two ordinary ways. "What is on this machine" is
answered by reading the imports block of one host file, instead of chasing
conditionals through the tree. And adding a capability to one host does not
touch the others, because the only thing they share is the module name.

## Three directories, three jobs

- **`base/`**: settings every machine needs anyway. Nix options, garbage
  collection, secrets wiring. Not optional, and not something a host chooses.
- **`features/`**: capabilities that do not care which machine they run on. A
  search engine, a game launcher, a text editor config, a Minecraft server.
- **`hosts/<Name>/`**: one directory per machine. It picks the features that
  machine wants and adds the hardware detail (`hardware.nix`) that cannot be
  shared, since no two machines have the same disks.

Three machines share almost all of `features/`: a laptop, an older laptop I
keep for conservation, and a headless server. They differ where the hardware
or the role forces it, and nowhere else.

If you are setting something like this up, the split I would fix early is
`base` / `features` / `hosts`. The rest of the tree gets reorganised a few
times anyway, and this part is annoying to change once six files depend on
how it is named.
