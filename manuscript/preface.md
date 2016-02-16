# Introduction

You have learned JavaScript and HTML, did all the exercises and are ready to write your first App but as you start digging on what is available to get you there you are overwhelmed by the very many alternatives and all the bits and pieces that *apparently* you need to put together.  *'Apparently'* because you can't quite understand why all that is required. The more articles you read, the more opinions you listen to, the worst off you are.

The purpose of this book is to provide a step-by-step guide on all those bits and pieces. What some call the *tooling*.  It is like setting up a workshop.  You know how to hit a nail, turn a screw or saw a piece of timber, but when you want to actually set up your workshop you start to find out that there are lots of ancillaries that are required, the more so if you are going to work with other people and for other people. The worst of all is that when you started, you didn't even know you needed or wanted any of them.

We won't cover all the alternatives -that would be impossible- but we will present a very good one. You might want to work with some other people, your classmate or a whole team of developers and you want to be sure everybody can read anybody else's code, that nobody messes up anyone else's files, that you can track progress and issues, and you want to test and document everything.

There is a lot to do so, lets start.   

## Base software

There is some software we need to make sure you have installed.  You might already have it or not.  We'll check that in the first chapter.  To begin with we will need NodeJS. That gives us the ability to leverage our knowledge of JavaScript at both ends.  It is fair to say that JavaScript is not the only alternative on the server side, you might have already used or heard about PHP or Java but unless you have any legacy system and/or experience, nowadays JavaScript is the way to go.

Then, we need to create a repository on [GitHub](http://github.com). A what?!? This is the kind of thing that you find out about once you are half through your project and, at that point, it turns out it is not so easy to fix. Besides, you have been stumbling along for some time now and are somehow used to the mess you are in, why change?

A repository is the place up in the cloud where all the team can store and share their work.  GitHub is one major provider of such shared space. Even if you work alone, GitHub will help you keep track of the progress of the project, report and respond to issues and keep a nice set of safe copies of your job up there in the cloud. It not only works with code, documentation can be stored there as well; after all both this book and the accompanying code are up there in GitHub.

To use GitHub we need to install a GIT client.

## Server side code

In the next few chapters we will work on the server-side. Our browser will show whatever information the server is able to provide. So it makes sense to start on that side. Most of what we do on the server side we will later do on the client side.

Moreover, the server is also a simpler environment.   When we are on the client side we need to take into account too many other issues. This would make it all very confusing.  In the simpler environment of the server, we can go a step at a time.

We will learn to install and create a web server using Express and how to serve data from it by using REST (Representational state transfer) architecture.

To avoid unintended errors, we will do a static check of our code using a *linter*, a sort of compiler that checks the syntax and formatting of our code and only produces a listing of errors, if any.  This will also help us keep a consistent style on the code we produce.  When developing in teams, it is better to have a consistent coding style everyone can easily recognize.

Before releasing this server-side software to the world, it is better to test it dynamically, not just a static syntax check, which we will do by setting an automated testing system.  This not only ensures that our code works as we meant it to, but also that during development, any changes we make do not break any functionality that was already there.
<!-- mocha, supertest, should -->

Once we are sure our code is good, we send the new version back to the GitHub repository.  In this way we share it with the rest of the team so that it can all rejoice and celebrate or, at least, get on with the rest of the project.
<!-- documentation: , valid-jsdoc , Docblockr-->

Up to this point, in our examples, we would have been storing our data in-memory within the web server.  This would have allowed us to concentrate on the topics described above, however, for any meaningful amount of data, memory storage is not a good idea. There are very many ways to store data server-side.  The first big decision to make is whether to go for an SQL server or a non-SQL or *NoSQL* one. Then, within each of those, which particular implementation.  

For the purpose of this book, we will use a simple SQL database, [SQLite](https://www.sqlite.org/). The SQL language is quite standard, in fact, it is both an ANSI (American) and ISO (international) standard. Admittedly, there are small inconsistencies in between actual implementations, but at least there is a solid base, which NoSQL databases lack.  Within all the SQL databases available, we will use SQLite because it is the simplest one to set up and install.  It is not apt for a serious web service, but for teaching purposes, it works fine.

Once we do the conversion to SQL, we will run the tests again, to make sure we didn't break anything in the migration.  Here, we can clearly see the benefit of having a set of tests made.  We have completely changed our back end software and we can still assure that our server still works as it did before.

As always, after testing, we save it in our GitHub repository.

## Client side

First of all we will learn how to retrieve the data from the server we have been building in the previous chapters.  Our first renderings will be rather crude, but we'll fix that in a moment.

For the browser, we have opted to use Facebook's [React](http://facebook.github.io/react/) as the rendering library.  This is just one of very many options out there and plenty of books could be devoted to praising one or the other.  Many articles certainly have.  It would be easy to say that it handles the V in the MVC model, but that would get us into equally endless discussions about MVC and the many abbreviations derived from it and which of them applies.

A web developer should be able to reach all users using any sort of browser.  It is not admissible to have an application that only works in the most recent release of a particular browser.  The great majority of browsers do not support ES6.  To deal with that, and the various incompatibilities amongst browsers we will use [Babel](http://babeljs.io/), what is now know as a *transpiler*, that is, a compiler that reads ES6 code and translates it to ES5 code that can run in any browser.

Browsers don't know about *modules* and *packages* as NodeJS does. ES6-style modules are not supported in most browsers, if any. To be able to use modules in the client side, we will use a packager called [WebPack](http://webpack.github.io/) which will produce a single bundle that any browser can easily load and simulate NodeJS-style modules for us.

Handling all these various tasks such as transpiling and bundling exceeds what we've done so far through `npm run xxx` commands such as we did for linting.  In order to automate all this, we will use [Gulp](http://gulpjs.com/), a build system that will allow us to automatically lint, document, transpile, pack, compress, test, start and stop our server and whatever else we need done.

We will use [React-Router](https://github.com/rackt/react-router) to be able to convert our separate pages into a Single-Page Application (SPA) by allowing the user to navigate across all of our application without resorting to the server.

We will then see how we can consolidate all our data into various models (the M in MVC), separate from the rendering components (the V in MVC) so we can avoid duplication of data and ensure proper synchronization of information across all of our application.

Now that we have the data properly managed, we can start changing it by responding to user interaction. We will do that by using [Alt](http://alt.js.org/) one of the various implementations of the [Flux](https://facebook.github.io/flux/) uni-directional data-flow architecture.   Flux, as originally defined, is a good concept but its implementation as a library is somewhat lacking.  We marginally favor Alt over [Reflux](https://github.com/reflux/refluxjs) which is also a very good alternative and quite similar in concept, partly due to its better documentation
which we assume would be best for new developers.

(at some point, which I haven't figured out the order yet, I'll deal with Unit Testing, Documentation and Isomorphism.  Isomorphism is likely to be the last item.  I might add using WebSockets to keep various clients in sync.)
