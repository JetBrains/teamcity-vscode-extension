## [v0.0.1](https://github.com/JetBrains/teamcity-vscode-extension/tree/v0.0.1) (2017-08-28)
- Implement basic remote run functionality

## [v0.0.2](https://github.com/JetBrains/teamcity-vscode-extension/tree/v0.0.2) (2017-08-29)
[Full Changelog](https://github.com/JetBrains/teamcity-vscode-extension/compare/v0.0.1...v0.0.2)
- Some Icons were changed
- Fixed several minor bugs
- Add a TeamCity Status Bar Item

## [v0.0.3](https://github.com/JetBrains/teamcity-vscode-extension/tree/v0.0.3) (2017-12-31)
[Full Changelog](https://github.com/JetBrains/teamcity-vscode-extension/compare/v0.0.2...v0.0.3)
- Implement a secure credentials storage
- Add support of multi-roots workspaces
- Bugfixing

## [v1.0.0-beta.4](https://github.com/JetBrains/teamcity-vscode-extension/tree/v1.0.0-beta.4) (2018-01-30)
[Full Changelog](https://github.com/JetBrains/teamcity-vscode-extension/compare/v0.0.3...v1.0.0-beta.4)
- Add more logging to investigate user problems
- Add an authorization header for requests to uploadChanges.html to handle changes in new version of TeamCity
- Add a content-length header for requests to uploadChanges.html to avoid sending too big patches
- Add an user-agent header for all requests
- Fix different bugs

## [v1.0.0-beta.5](https://github.com/JetBrains/teamcity-vscode-extension/tree/v1.0.0-beta.5) (2018-03-20)
[Full Changelog](https://github.com/JetBrains/teamcity-vscode-extension/compare/v1.0.0-beta.4...v1.0.0-beta.5)
- Implement more user-friendly behaviour for persistence credentials storage
- Add the `Show my changes` command
- Improve the `Sign in` command
- Fix the log and UI messages
- Add unit tests for code
- Fix different bugs

## [v1.0.0-beta.6](https://github.com/JetBrains/teamcity-vscode-extension/tree/v1.0.0-beta.6) (2018-04-14)
[Full Changelog](https://github.com/JetBrains/teamcity-vscode-extension/compare/v1.0.0-beta.5...v1.0.0-beta.6)
- Update icons for change statuses
- Update icons for some actions
- Support "Open in IDE" functionality
- Fix different bugs

## [v1.0.0-beta.7](https://github.com/JetBrains/teamcity-vscode-extension/tree/v1.0.0-beta.7) (2018-06-15)
[Full Changelog](https://github.com/JetBrains/teamcity-vscode-extension/compare/v1.0.0-beta.6...v1.0.0-beta.7)
- Use working-tree as default data source for git
- Fix multiple vulnerabilities
- Move teamcity data providers under the TeamCity view container
- Add "Open In IDE" functionality
- Add "Pre-tested commit" functionality for tfvc
- Allow to customize builds
- Support secure protocol for xmlrpc protocol 
- Fix problems with building project hierarchy
- Fix problems with filtering build configurations
- Fix different other bugs