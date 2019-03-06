# Contributing to Carbon

Thanks for contributing to Carbon! :1st_place_medal: :1st_place_medal:

-   [Contributing to Carbon](#contributing-to-carbon)
    -   [Code of Conduct](#code-of-conduct)
    -   [Submitting Issues](#submitting-issues)
        -   [Creating Issues](#creating-issues)
        -   [Closing Issues](#closing-issues)
    -   [Development](#development)
        -   [Pulling in dependencies](#pulling-in-dependencies)
        -   [Building the project](#building-the-project)
        -   [Process checklist](#process-checklist)
        -   [Commit message format](#commit-message-format)
    -   [Code Review](#code-review)
        -   [Pull Request](#pull-request)
    -   [Release](#release)
    -   [Deploying the site to GitHub](#deploying-the-site-to-github)
-   [Breaking changes](#breaking-changes)

This project uses NPM for dependency management and provides NPM scripts to call on `Webpack` to run tasks on the project.
To get started, you will need to checkout this project.

## Code of Conduct

Carbon adheres to the [JS Foundation Code of Conduct](https://js.foundation/community/code-of-conduct).

## Submitting Issues

We use `Github` issues to track progress.
Any large project needs to be split into **releasable chunks** which can be _developed_, _tested_, _reviewed_ and _released_.

### Creating Issues

You can create an issue [here](https://github.cerner.com/Geneva/carbon-graphs/issues)

### Closing Issues

Close the issue when the PR is merged.

**Note:** This process is automatic when PR commit message has `(fixes #<issue number>)` and that PR gets merged.

## Development

### Pulling in dependencies

After checking out the project, you will want to run the following command to pull in dependencies needed by the project:

```
npm install
```

When contributing to Carbon, you would need to run the below command and load the test page. The test page auto reloads whenever you make any changes to the .CSS, .JS files or if you make any changes to the sample .html file

```
npm run dev
```

Open in browser:

```
http://localhost:9991/
```

### Building the project

To build the project, run the build script:

```
npm run build && npm run build:dist
```

This will generate `dist` and `lib` folders with `core + packaged dependencies` and `core` source codes respectively.

### Process checklist

-   Follow the [UX Design Standards](https://wiki.ucern.com/display/UserExperience/Standard+Graphs).
-   Setup a design meeting to discuss overall design of the project.
-   Add the code changes.
-   Add unit tests.
-   Ensure your code is thoroughly unit tested.
-   Ensure no unit tests are broken.
-   Ensure no linting errors are present.
-   Add examples in appropriate tab within `site`
-   Write documentation in `Markdown`, following the existing documentation pattern.
-   Include screenshots and animated GIFs in your **pull request** whenever possible.
-   Follow proper PR title and Commit message format.
-   End files with a newline.

### Commit message format

```
<Tag>: <Short description> (fixes #1234)
```

The first line of the commit message (the summary) must have a specific format. This format is checked by our build tools.

The `Tag` is one of the following:

-   `Fix` - for a bug fix.
-   `Update` - for a backwards-compatible enhancement.
-   `New` - implemented a new feature.
-   `Breaking` - for a backwards-incompatible enhancement or feature.
-   `Docs` - changes to documentation only.
-   `Build` - changes to build process only.
-   `Upgrade` - for a dependency upgrade.
-   `Chore` - for refactoring, adding tests, etc. (anything that isn't user-facing).

The message summary should be a one-sentence description of the change, and it must be 72 characters in length or shorter.
The issue number should be mentioned at the end.

## Code Review

### Pull Request

-   Provide the PR with all necessary information to ease code review process in the `Description`, for instance:
    -   Screenshots of the working prototype.
    -   Coverage for the files modified. (Check `carbon-graphs\.coverage\html\index.html`)
    -   Files you want the reviewer to focus on.
-   Respond to all comments.
-   Do **not** rebase with master and force push until you reach `ready to merge` status.

## Release

Follow [Semantic Versioning](https://semver.org/) when preparing for a release.

-   Ensure you have `write` privileges.
-   Ensure you have do not have any unstaged changes.
-   Check the commit log to figure out the version.
    -   `Breaking` implementation would constitute as a `Major` release.
    -   `Update` and `New` implementations would constitute as a `Minor` release.
    -   `Fix` and multiple `Chore` implementations would constitute as a `Patch` release.
-   Run `npm run release:<patch, minor or major>`.
-   Once the release is complete, [deploy](#deploying-the-site-to-github) the site

**Ensure released version is present in [cernerrepos](https://cernerrepos.net)**

## Deploying the site to GitHub

-   Ensure you have `write` privileges.
-   Ensure you have do not have any unstaged changes.
-   Get latest from repo `git pull`.
-   To deploy the site to the GitHub pages, run the deploy-site script `npm run deploy:site`.

# Breaking changes

For any breaking changes, add information on how to migrate from previous version along with changes that was provided.
Create an issue and add any stakeholders to that issue.
This issue will be closed once you have :+1: from all of the stakeholders (or subsequent issues are created within their own git repo queues).
