# Secrets, kept with keys I already had

A public config still contains real secrets somewhere: API keys, service
passwords, things that cannot be public. The standard advice is to keep them
out of git, in a separate vault, behind a separate login. I put them in the
repo instead, encrypted, and used keys I already had.

## Encrypted in place

[sops-nix](https://github.com/Mic92/sops-nix) encrypts a YAML file with
[age](https://github.com/FiloSottile/age) and lets NixOS decrypt it
declaratively at activation time. The encrypted file sits in the repo:

```yaml
samba-share-password: ENC[AES256_GCM,data:Woc7Szy...,type:str]
sops:
  age:
    - recipient: age1u2wj…
      enc: |
        -----BEGIN AGE ENCRYPTED FILE-----
        ...
```

That file is safe to commit and useless without the matching private key.
The part worth copying is where the key comes from. I did not generate a new
keypair for this job. [`ssh-to-age`](https://github.com/Mic92/ssh-to-age)
derives an age identity from an SSH key that already exists, either my own
key or a machine's host key:

```sh
nix run nixpkgs#ssh-to-age < /etc/ssh/ssh_host_ed25519_key.pub
# age18gr7…
```

That public key goes into `.sops.yaml` as a recipient. The machine then
decrypts its own secrets at boot using the SSH host key it already had for
completely unrelated reasons. There is no second identity to generate,
rotate, or lose track of.

## Who is allowed to read them

Because the keys come from SSH identities, the recipient list for secrets
matches a list I was already keeping: which machines and which personal keys
I trust. Adding a machine is three steps. Convert its host key, add it as a
recipient, run `sops updatekeys`. Those are the same three steps for the
first secret and the fiftieth.

The rest of the config refers to placeholders:

```nix
sops.templates.credentials.content = ''
  password=${config.sops.placeholder."samba-share-password"}
'';
```

`nix eval` on that template prints the literal string
`<SOPS:...:PLACEHOLDER>`, never the value. The secret appears decrypted only
at activation, directly into `/run/secrets/`. It does not go into the Nix
store, it is not baked into a build artifact, and it does not show up in
`nix derivation show`.

Two things to settle before relying on any of this. Keep your own age
private key somewhere you can still read it after a machine is gone, because
losing that key means losing the secrets with it. And remember that
`.sops.yaml` is only as trustworthy as the public keys inside it, so
removing a retired machine's key is part of retiring the machine.
