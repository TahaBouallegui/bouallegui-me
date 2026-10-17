# Running the model myself

Using a hosted model means sending what you type to someone else's server,
accepting their uptime, and accepting that the model can change without
telling you. Running one yourself removes those three things, and costs you
the hardware plus some patience. This is how mine is set up.

## An engine built for this hardware

Inference runs through
[ik_llama.cpp](https://github.com/ikawrakow/ik_llama.cpp), a
performance-focused fork of `llama.cpp`, built from source with the CPU
variant kernels compiled in rather than using a generic prebuilt binary:

```nix
services.llama-cpp.package =
  inputs.ik-llama.packages.${pkgs.stdenv.hostPlatform.system}.default.overrideAttrs (old: {
    cmakeFlags = old.cmakeFlags ++ [
      "-DGGML_CPU_ALL_VARIANTS=ON"
      "-DGGML_BACKEND_DL=ON"
    ];
  });
```

On a machine where the CPU is the bottleneck, that is the difference between
a model that runs and a model that runs as fast as this particular CPU
allows.

The reason it is cheap to experiment with is that the build is declarative.
Change the flags, rebuild, compare tokens per second, keep the faster
result. There is no manual compile step to remember and redo later.

Which engine to run, which quantization, and what each of my machines
delivers in tokens per second is a separate note: [Getting a 125B model
onto a 12 GB card](getting-a-125b-model-onto-a-12gb-card.html).

## An OpenAI-compatible API and a chat UI

The model serves an OpenAI-compatible API locally, so it plugs into a normal
chat interface instead of living inside a curl command or a bare prompt:
conversation history, more than one provider side by side, the same
interface you would use with a hosted model, pointed at a local machine.

If you set this up, keep the API OpenAI-compatible and let the chat UI be a
separate program. Then changing the engine and changing the interface stay
two different edits.

## Why bother when hosted models are better

Mine is not as capable as a large hosted model, and I am not trying to
replace that. What I get is something that works with no connection, that
answers to nobody else's rate limits, and that does not change because an
upstream decided to. It is the same reason as the rest of this config: I
would rather understand and keep a piece of my own workflow than depend on a
server I do not control, when a machine I already own can do the job.
