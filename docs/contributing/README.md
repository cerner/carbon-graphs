# Contributing to Carbon

Thanks for contributing to Carbon. :1st_place_medal: :1st_place_medal:

This project uses NPM for dependency management, and provides NPM scripts to call on Grunt to run tasks on the project.
To get started, you will need to checkout this project.

## Submitting Issues

### Creating Issues

You can create an issue [here](https://github.cerner.com/Geneva/carbon-graphs/issues)

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

### Development

-   Follow the [UX Design Standards](https://wiki.ucern.com/display/UserExperience/Standard+Graphs).
-   Ensure no unit tests are broken.
-   Ensure there are no linting errors.
-   Ensure your code is thoroughly unit tested.
-   Write documentation in Markdown, following the existing documentation pattern.
-   Include screenshots and animated GIFs in your pull request whenever possible.
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

### Pull Request

Provide the PR with all the information necessary to ease the code review process.

### Release

Follow [Semantic Versioning](https://semver.org/) when preparing for a release.

```
npm run release:<patch, minor or major>
```

**Ensure released version is present in [cernerrepos](https://cernerrepos.net)**

### Deploying the site to GitHub

Once the PR is merged, you need to ensure that the site is up-to-date with your latest changes.
To deploy the site to the GitHub pages, run the deploy-site script:

```
npm run deploy:site
```

## Breaking changes

For any breaking changes, add information on how to migrate from previous version along with changes that was provided.
Create an issue and add any stakeholders to that issue.
This issue will be closed once you have :+1: from all of the stakeholders (or subsequent issues are created within their own git repo queues).
