## Code coverage

In the previous chapter, we made a brief list of some of the things we had not checked in our test script.  Those are the *known unknowns* which is bad enough, but then, as expected, there are the *unknown unknowns*.  

As exhausting as writing all those tests might have been, they are not yet as exhaustive as they should be. That is because we have not covered all the alternatives.  There are two great subsets of errors, the application logic errors, most of which we have checked and others we haven't, such as those we listed towards the end of the last chapter.

Then, there are coding errors, most of which we have already checked, but several might lay hidden in code that rarely executes, which not even our tests have exercised.  In a compiled language, most of those are discovered at compilation time, but in an interpreted language, if one particular piece of code is never reached, it might never cause the application to fail.  A Linter certainly helps but, as compilers, they are only static checkers, they can't know what the value of the variables are going to be at the time of execution. So, the best alternative is to actually exercise each and every part of the code.

Plenty of times, we check conditions in our code to make sure we only proceed when things are fine.  We may or may not have an *else* for those conditions that are invalid.  We tend to think linearly, we rarely cover all the alternatives in our minds.  What happens when those *elses* run?   Quite often, we even forget to check them.  That is exactly what we've done here, most of those [*elses*](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/server/routes.js#L74-L77) returning `404` errors have not been checked.  

That is why we need a tool to check our code *coverage*. We need to make sure that our tests have gone through each end every line of code so that we are sure they all behave correctly.

[Istanbul](https://github.com/gotwarlost/istanbul#istanbul---a-js-code-coverage-tool-written-in-js) is such a tool. Coupled with Mocha, it makes sure there is not line of code that has not been checked at least once.

Istanbul produces an excellent report.  I don't want to waste space in GitHub uploading coverage report for it.  Instead we can see [Istanbul's own coverage report](http://gotwarlost.github.io/istanbul/public/coverage/lcov-report/index.html).  The filenames on the left are links which expand to more and more detail.
Beyond the statistics, the uncovered parts of the code are shown highlighted in color [for each file](http://gotwarlost.github.io/istanbul/public/coverage/lcov-report/istanbul/lib/reporter.js.html) individually.  When placing the cursor over each highlighted segment, Istanbul will show a brief description of the error.

The column to the right of the line numbers show the number of times each line has been executed.  This can also help us determine which lines are executed the most and thus can most affect our application performance.   

Coverage is such a standard operation that the `.gitignore` file that GitHub automatically generated for us [already lists](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/.gitignore#L13-L14) the standard folder for our coverage report.

To set up Istanbul we first need to load it.  Just as ESLint, it is better to load the package globally with `npm i -g istanbul` so we share the same copy for all our applications.  However, we can also load it locally.

```
npm i --save-dev istanbul
```

To execute it, we need to [add another command](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-7-1/package.json#L10) to the `scripts` section of our `package.json`:

```json
"scripts": {
  "start": "node server/index.js",
  "lint": "eslint . || exit 0",
  "test": "mocha",
  "coverage": "istanbul cover node_modules/.bin/_mocha"
}
```

That is it.  Now, we can simply run it.

```
npm run coverage
```

A `coverage` folder will be created in our project.  Look for `/coverage/lcov-report/index.html`. Doble-clicking on it will show the report for our application.  We haven't done that bad, the report shows mostly green indicating we have a reasonably good coverage.  Still, what is missing?

If we look at the coverage for `routes.js` we can see that we mostly missed the 404 error returns for non-existing projects or tasks.  We checked that for the GET method, but we haven't checked for wrong `pid`s or `tid`s for the other methods.

Once we get those covered, basically by copying and pasting [the code for the GET method](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/test/server.js#L118-L155) and changing the method on [each copy](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-7-1/test/server.js#L157-L246), we go from this:

```
=============================== Coverage summary ===============================
Statements   : 84.52% ( 71/84 )
Branches     : 58.82% ( 20/34 )
Functions    : 100% ( 0/0 )
Lines        : 86.42% ( 70/81 )
================================================================================
```

To this level of coverage:

```
=============================== Coverage summary ===============================
Statements   : 92.86% ( 78/84 )
Branches     : 79.41% ( 27/34 )
Functions    : 100% ( 0/0 )
Lines        : 95.06% ( 77/81 )
================================================================================
```

Since our source code is relatively small, any extra line of code we get covered really makes a whole lot of difference.  

Another remaining uncovered branch is the default for non-existing bodies, which is repeated in several places such as [here](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-6-2/server/routes.js#L59):

```js
 Object.assign(prj, req.body || {});
```

If `req.body` is `null` or `undefined`, we provide an empty object.  We haven't done any tests for PUT and POST with no data.  So, we add those tests and, surprisingly, our coverage results don't improve.  The `|| {}` alternative is never used.  What is going on?  As it turns out, the `body-parser` middleware kindly provides an empty object when none is received, thus our default is completely unnecessary.  When we [drop those](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-7-1/server/routes.js#L59), our coverage of the branches taken improve further as we got rid of a bunch of useless code.

```
=============================== Coverage summary ===============================
Statements   : 92.86% ( 78/84 )
Branches     : 88.46% ( 23/26 )
Functions    : 100% ( 0/0 )
Lines        : 95.06% ( 77/81 )
================================================================================
```

Hopefully, these few examples have shown how code coverage can help us improve the quality of our code.  Istanbul is very easy to set up once we have our tests in place
