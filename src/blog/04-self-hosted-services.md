# A private cloud, sized for the people who actually use it

There is a middle option between using a big cloud provider for everything
and self-hosting nothing: run the services yourself, but only make them
reachable by the handful of devices and people you would hand a key to. That
is what the home server, which I will call aleph, is for.

[Immich](https://immich.app/) backs up photos the way Google Photos would,
except the photos stay on a disk I own. [Jellyfin](https://jellyfin.org/) is
the media server, [Grocy](https://grocy.info/) tracks household inventory,
and [SearXNG](https://docs.searxng.org/) is a meta-search engine that keeps
no logs.

## Nothing is exposed to the internet, on purpose

None of these services open a port to the outside world. They sit behind
[Tailscale](https://tailscale.com/) and are reachable only from devices that
have been added to the tailnet:

```nix
networking.firewall.trustedInterfaces = [ "tailscale0" ];
```

```nix
services.jellyfin = {
  enable = true;
  openFirewall = false;  # no WAN exposure, reachable via tailnet only
};
```

If you are choosing between this and a reverse proxy with TLS and a domain,
they are different jobs. A public service has to defend against the entire
internet, permanently. A tailnet-only service only has to be correct for a
known, small, authenticated set of devices, and the unauthenticated part of
the attack surface never exists. No port scanner finds anything, there is no
certificate to renew, and there is no login page to brute-force because
there is no login page reachable from outside the tailnet at all.

## What it costs

Nobody outside the tailnet can use any of it without being added first. For
this setup that is the point. These are not products. They are
infrastructure for a small group of people who already trust each other,
running on hardware one of us owns and maintains. The way a new person gets
in is to ask to be added, which is about the right amount of friction for
something shared more like a house than like a service.

## What I would bring up first

If you are starting from a fresh NixOS install, three steps in this order
save some time.

1. Bring up Tailscale first and prove the tailnet works before configuring
   any service. `networking.firewall.trustedInterfaces = [ "tailscale0" ];`
   is what makes services listening on that interface reachable. Without it
   every service looks broken and the firewall is the reason.
2. Leave `openFirewall = false` on everything. If a service is unreachable
   from inside the tailnet too, then the service is the problem, and that is
   a much shorter debug than ruling out the firewall.
3. Only add a domain and ACME when you genuinely need a public hostname. One
   of my services runs with `enableSSL = false` because its configured
   hostname does not resolve publicly, and the certificate request fails in
   a way that is confusing until you read the error properly.
