# muddleware
Simple middleware chaining function, supporting express.js like `(req, res, next) => { next() }` style middleware such as google cloud and firebase functions.

## Install
```
npm install muddleware
```

## Usage
```js
const muddleware = require('muddleware');
const handler = muddleware(handler1, handler2, handler3, ...);
```

## Example 

Combine error and request manipulation middleware with a page handler for usage in a firebase function...

```js
const muddleware = require('muddleware');
const functions = require('firebase-functions');

// Catch errors we can handle in request...
const errorHandler = (req, res, next) => {    
    try {
        next();
    } catch(err){
        res.status(500).send('There was an error');
    }
}

// Add a timestamp to request
const timeHandler = (req, res, next) => {
    req.requestTime = Date.now()
    next();
}

// Throw or return an error
const badHandler = (req, res, next) => {
    throw 'An Error';
    // Or use next style errors
    //next('An Error');
}

// A page template
const homeHandler = (req, res) => {
    res.send(`<div>Hello at ${req.requestTime}</div>`);
}

exports.home = functions.https.onRequest(muddleware(errorHandler, timeHandler, homeHandler));

// Custom error handling example
exports.bad = functions.https.onRequest(muddleware(errorHandler, timeHandler, badHandler, homeHandler));

// Errors not caught are returned to firebase
exports.badder = functions.https.onRequest(muddleware( timeHandler, badHandler, homeHandler));
```

