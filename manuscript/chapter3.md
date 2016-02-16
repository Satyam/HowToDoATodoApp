# NPM Packages

So far we have written a very primitive web server and we could go on and make it really useful, but that would be a real waste of effort to repeat standard behavior and we don't want to re-invent the wheel.  Instead, we will use one of NPM's most popular packages, [Express](https://www.npmjs.com/package/express).

We also want to keep a record of what packages we install for our application so that anyone else can set it up in the same way.  NPM uses a file called `package.json` to do that.

To create our `package.json` file, we go to the root of our project and type `npm init` and answer a few questions.  It is not crucial that we answer them right the first time, the file is editable and we can change much of it later on.  NPM will offer defaults for each answer which we might accept by pressing <kbd>Enter</kbd> so, if you are not sure about something, simply accept what NPM offers.  

NPM knows about Git and GitHub so it will link to the repository created in chapter 1.  It also adds an entry for bug tracking:

```json
"bugs": {
  "url": "https://github.com/Satyam/HowToDoATodoApp/issues"
},
```

Bug tracking is one of many extras offered by GitHub beyond serving Git requests.  In the current version of GitHub, a series of tabs at the top of the page allow you to access several features of any project.  So far we have seen the `Code` tab but there are several others such as `Issues`, `Wiki` or `Graphs` that are very useful.  The `Settings` tab allows us to decide which of these features we want in our repositories.

The `package.json` file is in [JSON](http://www.json.org/) format, a data -interchange format first devised by Douglas Crockford and now an ECMA standard. The file is made of simple text so it is editable.  Open it up to have a look at it.  You will easily find out where most of the responses you provided to `npm init` have gone.

Now we may fix some of them.  NPM suggests version `1.0.0`.  Those numbers follow the [semver](http://semver.org/) *semantic versioning* standard. The first number is called the *major version*.  A major version of 1 at this point would be somewhat presumptuous from us since it would suggest it is a finished product in its first release.  We can change that to `0.1.0` or something like that.  A major version of 0 clearly states that it is still a prototype.

## Running the script

Something else we might want to change is the `"main" : "index.js"` entry.  That came from the prompt `entry point: (index.js)`.  Lets change it to `"main" : "server/index.js"`. Save the change and go to a terminal/ command prompt and type `node .`.  The server will now be started.  Originally, we had to do `node server` or `node server/index.js`.  When given a folder instead of a full file name, NodeJS actually looks first for a file called `package.json` for the `main` entry and if it doesn't find it, only then it goes searching for an `index.js` which is what we've been doing so far.  Now that we do have a `package.json` we can let NodeJS find it for us.  Note the dot at the end of `node .`, otherwise, NodeJS runs in interactive mode and prompts us for input.

The main entry point declared in `package.json` is mostly used for libraries, that is, when your code is meant to be depended upon, not when doing an application.  To start running an application, it is much better to use the [`scripts.start`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-3-1/package.json#L7) property.

```json
"scripts": {
  "start": "node server/index.js",
  "test": "echo \"Error: no test specified\" && exit 1"
},
```

The `npm init` command already created a `scripts.test` property which we will use later on.  We simply add the `start` entry whose value is the command to start the server.  Then we can do:

`npm start`

and the server will start.  Using the `npm start` command for running applications is  the recommended way. Most developers, when looking at your application, on seeing a `package.json` file will expect to find the command to start your application there.

Actually, `npm start` is a shortened form of `npm run start`. The `npm run xxxx` command will look for a `xxxx` property in the `scripts` object and execute the string it finds there. Doing `npm run` without any extra arguments will list all the available scripts. Only a few of them have shortened forms: `npm start`, `npm restart`, `npm stop` and `npm test`.

There are also a series of *pre* and *post* entries that, if found, will be executed automatically before and after some other commands are run.  You can check them out in the [NPM manual](https://docs.npmjs.com/misc/scripts).

There is an extra benefit of running commands from NPM.  All of the information in the `package.json` file will be available to the program being run with the `npm_package_` prefix with underscores instead of dots separating the properties.  For example, you can read `npm_package_version` or `npm_package_scripts_start`.  

You can freely add your own properties though, to avoid conflicts with existing options, it is better to use your own property object name. The `config` property already exists so avoid using that one.  Existing properties are all lowercase so mixing some uppercase characters is a good idea, [for example](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-3-1/package.json#L10-L12):

```json
"myServerApp": {
  "port": 8080
},
```

Our [server program](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-3-1/server/index.js#L3) can now have:

```js
const PORT = process.env.npm_package_myServerApp_port || 8080;
```

This will allow other team members to easily find configuration options without having to go looking into the source files.


## Installing dependencies: Express

As mentioned earlier, NodeJS comes with some packages pre-installed such as `http` which we have used earlier.  For extra packages, we have to use NPM to install them.  For [Express](https://www.npmjs.com/package/express), we do:

`npm install express --save`

The command `npm install` will look for the package name in the NPM registry and, if found, download and install it. The name given in the command should be exactly as in the heading of the entry in the [NPM registry](https://www.npmjs.com/package/express).  The `--save` option instructs the installer to save the reference to that package in our `package.json` file.  If we take a look at it, we may see that it now has the following added:

```json
"dependencies": {
  "express": "^4.13.3"
}
```

This is how NPM keeps track of the extra modules it loads, it means that our app needs the `express` package version `4.13.3` or higher up to, but not including, any `5.y.z`.  Changes in the major version usually mean there might be some incompatible changes with the previous one so, once you program for a particular major version, you want to keep within that one.

Once the `npm install` command finishes, it shows what it has done, listing the module it has downloaded plus all its dependencies.  Each entry contains the registered name of the package and the version it has actually installed.

Now you will find an extra folder in your project called `node_modules` and inside it, a folder called `express`.  That is where the downloaded package has gone.  That package will also has its own `package.json` file and its `node_modules` folder with its dependencies, each of which will have its `package.json` file and its `node_modules` and so on.

Let us add some other packages.  The following are optional sub-modules of Express itself which we will use later on.  Do:

```
npm install body-parser --save
npm install cookie-parser --save
```

The `package.json` file will now show more dependencies:

```json
"dependencies": {
  "body-parser": "^1.14.2",
  "cookie-parser": "^1.4.0",
  "express": "^4.13.3"
}
```

and the `node_modules` folder will contain a folder for each of those extra packages.

One of the benefits of the `package.json` files is that it records all the dependencies so that anyone can recall them.  Lets go and delete the `node_modules` folder. Now, we don't have any of the dependencies. However, we still have the `package.json` file.  If we now do:

```
node install
```

with no extra arguments, NPM looks into the `package.json` file and installs all the dependencies in it.

## Installing developer dependencies: ESLint

The [NPM registry](https://www.npmjs.com/) not only contains many packages we can use in our application, it also contains plenty of packages that can help us in the development process.  We will install one such utility: [ESLint](http://eslint.org/).   A *linter* is a sort of compiler that doesn't actually produce any code, instead, it checks the syntax of the code to warn us of any possible errors and may check style, such as whether the indentation is right.  ESLint is such a *linter* for **E**CMA**S**cript, thus ESLint.

ESLint is the third generation of linters for JavaScript.  The first one, [JSLint](http://www.jslint.com/) was written by the same Douglas Crockford that gave us JSON. However, it had always been a very opinionated product.  It has a limited number of options and many rules are fixed to follow Crockford's preferences, admitting no alternatives.  A more customizable [JSHint](http://jshint.com/) followed years later and ESLint, by Nicholas Zakas, is the newest and, by far, the most customizable and flexible of the lot.

Do:

`npm install eslint --save-dev`

We have used the `--save-dev` option instead of simply `--save`.  This means that this package dependency is meant to help us in development, not for the final product. Using the `--production` option when doing `npm install` will not install them (the default is to install all dependencies). In `package.json` [we now have](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-3-2/package.json#L35-L39):

```json
"devDependencies": {
  "eslint": "^1.10.3"
}
```

Let us go and add another script to [`package.json`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-3-2/package.json#L8):

```json
"scripts": {
  "start": "node server/index.js",
  "lint": "eslint . || exit 0",
  "test": "echo \"Error: no test specified\" && exit 1"
},
```

If we now do:

```
npm run lint
```

We will get one fatal error message on the first `const` because it is an ES6 keyword and ESLint cannot parse it with its default rules. To find  why there is that `|| exit 0` after the `eslint .` command simply delete it and run it again.

To tell ESLint what we want it to do we need to add a *rules* file.  We can write one of our own or pick one of several standard ones available in the NPM registry, for example:

`npm install eslint-config-standard --save-dev`

Though this rule set is named `standard` there is no actual standard backing it.  It is a reasonable compilation of many often-used rules but it is not endorsed by any standards body or group.  However, it wouldn't be bad if it were.

This downloads and installs the rules, but it does not tell ESLint that it should follow them.  There are various ways to do that.  In this book we will  add a configuration file [`.eslintrc.json`](https://github.com/Satyam/HowToDoATodoApp/blob/master/.eslintrc.json) containing:

```json
{
  "extends": "eslint-config-standard",
  "rules": {
    "semi": [1, "always"]
  }
}
```

This tells ESLint that our rules will be an extension of those in `eslint-config-standard` and that we will customize those same rules by requiring that [semicolons are always present](http://eslint.org/docs/rules/semi.html) at the end of statements.  There are very many [rules](http://eslint.org/docs/rules/) that really allow us to customize our code in any way we want.  Very many companies have their internal standards available in the NPM registry, just search for [eslint-config](https://www.npmjs.com/search?q=eslint-config) and, at the time or writing this, almost five hundred are listed.

Though I am using the `.json` extension on my ESLint configuration files, ESLint  can do without the extension, figuring out the internal format from reading the contents. It can actually accept files in YAML format instead of JSON and it is quite relaxed about what it accepts as JSON.

Now we can repeat the `npm run lint` command and it should show no errors.  Change the `server/index.js` file making some errors and lint it again to see the effect.  

Both Brackets and Atom have plugins to have ESLint integrated into the editor window.

JavaScript can manage without semicolons at the end of its statements, it is what is called ASI, *Automatic Semicolon Insertion*.  It has become fashionable to write code without semicolons and let JavaScript figure out when a statement ends.  It was originally designed to make it more forgiving to sloppy first time coders and it works quite well, but it implies some degree of guessing from the JavaScript interpreter but I am not a sloppy coder who needs a guiding hand. Anyway, I can't imagine what could I possibly do in a life already full of much reveling and frolicking with the half a minute or so a day I could shave off my coding time by skipping the semicolons.

## Global installs: ESLint

Usually, ESLint is installed *globally* to make it accessible directly as a command in your terminal/command prompt window.  We haven't done it this way to avoid polluting your global space.  *Global* in NPM parlance means it is installed in a way that can be shared in between all applications within your computer.  It also saves some disk space since only one copy of it is needed for all apps instead of one for each.

To install applications *globally* we use the `-g` option on `npm install` and we don't use the `--save` or `--save-dev` options because we don't actually want it listed on our `package.json` file.  Thus, we would do:

```
npm install -g eslint
npm install -g eslint-config-standard
```

These two commands will install both ESLint and the `standard` set of rules in a share folder (`/usr/lib/node_modules` for Linux users).  You can then have a `.eslintrc.json` file in your home folder (`~/.eslintrc.json`) with your preferences.  You can then use the `eslint .` command right from the terminal in any project.

You can still set pre-project rules by creating a local `eslintrc` file extending your own defaults plus adding your own, as we [already did](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-3-2/.eslintrc.json#L2). ESLint configuration files can go on forever extending one another with the later rules overriding the previous settings.

## Ignored files

If you look at your [GitHub repository](https://github.com/Satyam/HowToDoATodoApp/tree/chapter-3-2) once you commited and pushed all these changes, you might notice that there is no `node_modules` folder, which is a good thing since, at this point, it has about 17MB of data and it makes no sense to put a copy of all that in GitHub.  After all, the `npm install` command can easily reconstruct it from the dependencies listed in `package.json`.

That trick is thanks to the [`.gitignore`](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-3-2/.gitignore) file which is a list of file patterns of files and/or folders that Git should ignore, with comments preceded by sharp `#` signs.  `node_modules` is listed down at the end of the list.  This file was produced by GitHub when we originally created our repository and asked for a `.gitignore` file for `Node` which adds NodeJS-specific entries such as `node_modules`.   
