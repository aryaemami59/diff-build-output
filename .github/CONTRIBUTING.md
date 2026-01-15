# Contributing

Thanks for your interest in contributing! Contributions of all kinds are welcome.

By participating in this project, you agree to follow the
[Code of Conduct](./CODE_OF_CONDUCT.md).

---

## How to contribute

### Issues

- Search existing issues before opening a new one
- Provide clear details and reproduction steps when reporting bugs

Issues can be opened at:
https://github.com/aryaemami59/diff-build-output/issues

---

## Quick start (CLI)

```shell
git clone https://github.com/<your-username>/diff-build-output.git
cd diff-build-output

git checkout -b my-change

git add .
git commit -m "feat: describe your change"

git push origin my-change
```

Open a pull request from your fork on GitHub.

---

## Pull requests

- Clearly describe what the change does and why it’s needed
- Keep changes focused and reasonably sized
- Link related issues when applicable
- Be open to feedback and requested changes

Pull requests are reviewed by the project maintainer(s).

---

## Guidelines

- Follow existing code style and conventions
- Prefer clarity over cleverness
- Add or update tests when fixing bugs or adding features
- Update documentation when behavior or APIs change

---

## Windows notes

- Use `\r?\n` in regular expressions to support Windows and Unix line endings
- Be mindful of path separator differences (`\` vs `/`)
- Prefer cross-platform scripts where possible
- Long path errors may be resolved with:

  ```shell
  git config --system core.longpaths true
  ```

Thank you for contributing!
