# diff-build-output

Compare and inspect differences between build outputs.

This tool helps identify what changed between two build artifacts by generating readable and machine-consumable diffs.

---

## Features

- Generate and inspect diffs between two build output directories
- Compare `old-output` vs `new-output` builds
- Produce machine-readable diffs for CI or review workflows
- Useful for inspecting build regressions and output changes

---

## Getting started

### Requirements

- Node.js (LTS recommended)
- Yarn 4 (this project uses Yarn 4 via the `packageManager` field)

### Install

```shell
yarn install
```

---

## Common tasks

- **Build / run:** `yarn build`
  Runs the entry point (`node src/index.ts`)

- **Run tests:** `yarn test`

- **Lint:** `yarn lint`

- **Format:** `yarn format`

- **Clean generated diffs:** `yarn clean`

---

## Usage

Place the two build output directories at:

```text
outputs/old-output
outputs/new-output
```

Then run the build script to generate diffs.

Customization points and implementation details are located in the `src/` directory.

---

## Contributing & community

- Code of Conduct: [.github/CODE_OF_CONDUCT.md](.github/CODE_OF_CONDUCT.md)
- Contributing guide: [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md)
- Security reporting: [SECURITY.md](SECURITY.md)
- Support: [SUPPORT.md](SUPPORT.md)

---

## License

This project is licensed under the MIT License.
See [LICENSE](LICENSE) for details.
