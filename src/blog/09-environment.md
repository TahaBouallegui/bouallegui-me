# My shell is a package

Most shell setups are a `.bashrc` or a `config.fish` accumulated over years,
sourced at login, half remembered. Mine is a Nix derivation. Not a shell
with a Nix-managed config file: the shell itself, together with every tool I
expect on `PATH` the moment I log in, is one package.

```nix
packages.environment = inputs.wrappers.lib.wrapPackage {
  inherit pkgs;
  package = self'.packages.fish;
  runtimeInputs = [
    # nix tooling
    pkgs.nil pkgs.nixd pkgs.statix pkgs.alejandra pkgs.manix pkgs.nix-inspect pkgs.nh

    # the rest of the toolbelt
    pkgs.fzf pkgs.eza pkgs.fd pkgs.zoxide pkgs.ripgrep pkgs.lazygit
    pkgs.btop pkgs.imagemagick pkgs.ffmpeg-full pkgs.yt-dlp pkgs.wl-clipboard

    # wrapped packages, themed and configured in their own right
    self'.packages.neovim self'.packages.qalc self'.packages.git self'.packages.yazi
  ];
};
```

That is not a list of things I installed at some point. It is a list of
things that are present as soon as this package is built, on any machine,
because `wrapPackage` produces a fish binary with all of it in its own
`PATH` before any config file is read.

## One package, everywhere a shell appears

The benefit is not really tool availability, which plenty of setups handle
with a list in `environment.systemPackages`. The benefit is that one
derivation is used everywhere a shell is needed, instead of each entry point
having its own slightly different idea of what my shell is:

```nix
# the terminal's default shell
packages.terminal = (inputs.wrappers.wrapperModules.kitty.apply {
  imports = [ self.wrappersModules.kitty ];
  shell = lib.getExe self'.packages.environment;
}).wrapper;
```

```nix
# the actual login shell for the user account
users.users.<user>.shell = self.packages.${pkgs.system}.environment;
```

Open a terminal and you get this shell. Log in at a TTY and you get this
shell. SSH into the server on the account that has it set and you get this
shell. One definition, referenced from three places, so there is nothing to
keep in step.

## Git's identity is in here too

The same wrapping pattern applies to git. Authorship is set as environment
variables on the wrapped binary rather than in `~/.gitconfig`:

```nix
packages.git = inputs.wrappers.lib.wrapPackage {
  package = pkgs.git;
  env = {
    GIT_AUTHOR_NAME = "<name>";
    GIT_AUTHOR_EMAIL = "ahmedtbou@tutamail.com";
  };
};
```

The practical effect shows up when you set up a new machine. There is no
dotfile to copy, and no window where commits go out with the wrong address
because the config had not been written yet. The `git` on `PATH` already
knows who is using it.

One caveat. Environment variables baked into a wrapper do not appear in
`git config --list`, so if you ever debug a wrong commit author, look at the
wrapper before you look at your gitconfig.
