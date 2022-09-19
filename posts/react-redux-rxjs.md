---
tags:
  - post
title: React, Redux, RxJS
header: React, Redux, RxJS
date: 2021-06-27T21:54:44.000Z
updated: 2021-07-04T01:22:09.000Z
coverImage: null
---

There are a number of single page react apps in Antler, and most use React as a view, Redux as a model, and
redux-observable as (roughly) a controller. This explains roughly why this was chosen and how these interact. It is
designed to demystify the existing React/Redux apps, so you can identify what each part is for and have the context to
work out how it is working.

This doc assumes you’ve already setup installing react and setting up the build tools. You can find instructions for 
this
here: 

.

It is also not intended to teach React from scratch. 

and the rest of the official react docs already do this really well.

This is now free and if you have the time it is a much better deep-dive into Redux from its creator than I could ever do
myself. It was this series that I used to learn this ion the first place.
Redux

Managing state between components in React gets very complicated, very quickly. If two disparate components need access
to the same bit of data then that state has to be lifted to a shared ancestor component. Then both the current value,
and functions to modify the value passed down through each intermediate component’s props to the components that need to
read and write that piece of data. Repeat this for each individual piece of shared data, and it quickly becomes
unmanageable. It can also end up with all your components being really tightly coupled.

Redux solves this problem by providing:

- A store of application state at the top level, essentially your application’s model.

- A way to access that in components without passing it through the props of intermediate components (read state)

- A way for components to emit messages, and a standard way to update the application state in a modular way (update
state).

## Redux

First install redux: `npm install –-save redux react-redux`

Then there is some boilerplate to add to get it all started. Below is an example doing this all-in-one file, but usually
I split the store creation into its own file.

{% raw %}

```jsx
// index.jsx
import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "posts/react-redux-rxjs";
import {combineReducers, createStore} from "redux";
// Or whatever the root component of your app currently is/will be
import {CountingComponent} from "./count";

// Individual reducers should be imported from the file that handles the 
// components etc. for the relevant functionality to keep related things 
// together.
function countReducer(state = 0, action) {
    switch (action.type) {
        // this is overly simple, it starts with an initial state of 0 and
        // no actions change that - I'll expand on these later. Note: the
        // default should always be to return the exact same state unchanged.
        default:
            return state;
    }
}

// This both initialises the application state and handles updating it.
// When react starts up it calls each reducer with a no-op action and 
// populates each of the keys in the object with the value that reducer
// returns, setting the application state to be that whole object. Then 
// as each action is received it passes the relevant object property + the
// action, and builds the returned values into the new state, etc.
//
// It is called a reducer because conceptually a lot like a callback
// you could pass to Array.reduce if you had an array of actions.
const rootReducer = combineReducers({
    count: countReducer,
});

const store = createStore(rootReducer);

// normal react boilerplate
const mount = document.getElementById('react-container');

// If there is some data passed from the html you can dispatch actions here 
// with the data read from mount.dataset e.g.
// `store.dispatch(setSupplierLookup(JSON.parse(mount.dataset.supplierLookup)));`

// Wrap the root component in the Provider component imported from Redux. This is a
// key part of the mechanism that allows access to the state without intermediate props.
ReactDOM.render(
    <Provider store={store}>
        <CountingComponent/>
    </Provider>,
    mount
);
```
{% endraw %}

Redux is now setup, but it’s not doing anything noticeable.

### Connecting Components

To access that state in a component we need to wrap it with Redux’s connect boilerplate. Continuing from above, I’ll
write the CountingComponent used as the root component.

{% raw %}

```jsx
// count.jsx
import {connect} from "posts/react-redux-rxjs";
import React from "react";

// Usually the count reducer from above would go here

export const CountingComponent = connect(
    // a function that takes the current root state and returns an object that will be
    // merged with any props passed into the component. Note this uses object
    // destructuring/shorthand properties to get and set the required keys with minimal
    // characters 
    ({count}) => ({count}), // <--- read just the count key from the root state, and 
    //      pass it to the component as the count prop.
    // Will hold functions used to emit actions - I'll cover this later
    {}
)
    // connect returns a function that should be immediately called, passing the
    // component it is wrapping as the only argument
    (
        // Here I'll use a Function component: 
        // https://reactjs.org/docs/components-and-props.html
        ({count}) => <h1>The count is {count}</h1>
    )()
```
{% endraw %}

This will read the current count (currently 0) from the root stat, and display it. So we can now see it working, but it
doesn't do much yet.

![An image of a web browser displaying "The count is 0"](https://static.goblinoid.co.uk/jeff-horton.uk/6ba87f02-00af-4342-a1a6-9f047b3ccc0b.png)

### Updating state

To update state, actions are dispatched to the store. An action is just a javascript object that has a type key and then
any arbitrary data to give context the action. For each action type you should write a function that takes the context
and produces the desired action object. This is because redux needs to be able to wrap this function, giving you a
function that will take the resulting action and dispatch it to the store. 

{% raw %}
```jsx
// count.jsx - after the imports
const INCREMENT_COUNT = Symbol('increment-count'); // can be a string if preferred

const incrementCount = (delta = 1) => ({
    type: INCREMENT_COUNT,
    delta
});

// Then update the connect wrapper to pass in the action producing function
export const CountingComponent = connect(
    ({count}) => ({count}),
    // The keys of this object will be the keys added to the props array
    // The values should be functions that generate the action objects
    {incrementCount}
)(
    ({count, incrementCount /* This is now wrapped to dispatch to the store */}) =>
        <div>
            <h1>The count is {count}</h1>
            // You can just call it as a normal function.
            <button onClick={() => incrementCount()}>+1</button>
            <button onClick={() => incrementCount(2)}>+2</button>
            <button onClick={() => incrementCount(-1)}>-1</button>
        </div>
);

// so the instructions to update the state are now bening sent to the store. To have that 
// update the state, the reducer needs to be updated to make a change to its part of the 
// state when that action is received.
export function countReducer(state = 0, action) {
    switch (action.type) {
        case INCREMENT_COUNT:
            return state + action.delta

        default:
            return state;
    }
}
```
{% endraw %}

This now runs, and you can use the buttons to adjust the count.

![An image of a web browser displaying "The count is 5" Under which are three buttons labelled +1, +2, and
-1](https://static.goblinoid.co.uk/jeff-horton.uk/271724ea-7790-469d-b7c7-921be5f79361.png)

## RxJS and Redux Observable

There are still some things missing, however. Often we want to do other things as well as just update the state/view 
when responding to user interaction. Examples of this are posting requests to a web server, or displaying something for 
a short period of time, then removing it. Redux has a concept of middleware that receives all the actions emitted by the
components and can also dispatch its own actions to the store that allows for these types of responses.

The asynchronous nature of these lends itself very well to functional reactive programming, and
[RxJS](https://rxjs.dev/guide/overview) is one of the better libraries out there for doing this in Javascript. Based on
RxJava the concepts are also transferable to other languages where it is implemented. Redux Observable is a library
that has utilities for using RxJS as Redux middleware. RxJS in simple terms allows you to conceptualise streams of
events as arrays that also have a time dimension, and allows you to use methods like map, filter, etc. as you would on
an array.

First, install these extra dependencies `npm install --save rxjs redux-observable` 

Like Redux breaks up the state with a reducer for each key, Redux Observable divides its work into multiple ‘epics’ each
with their own responsibility. We’re going to add a short success message each time the user changes the count that will
display for 5 seconds then disappear. This will require two epics. One to respond to the INCREMENT_COUNT with another
action to add a success message with an auto-incrementing id, and another that responds to that ADD_MESSAGE action with
a REMOVE_MESSAGE action, delayed by 5 seconds.

First lets update the existing counter with a list of messages. There’s nothing new here, this part is more Redux.
```jsx
// count.jsx
// Actions and action producers:
const ADD_MESSAGE = Symbol('add-message');
const REMOVE_MESSAGE = Symbol('remove-message');

const addMessage = (id, message) => 
    ({
        type: ADD_MESSAGE,
        id,
        message
    });

const removeMessage = (id) => 
    ({
        type: REMOVE_MESSAGE,
        id
    });

// Add a reducer to respond to the above
export function messagesReducer(state = {}, action) {
    switch (action.type) {
        case ADD_MESSAGE:
            // Return a copy of the state object with just the relevant key changed
            return {...state, [action.id]: action.message}
        
        case REMOVE_MESSAGE:
            // Return a copy of the state object with the relevant key filtered out
            return Object.fromEntries(
                Object.entries(state)
                      .filter(([k]) => k !== action.id.toString())
            );
        
        default:
        return state;
    }
}

// And update the component to show the messages
export const CountingComponent = connect(
    ({count, messages}) => ({count, messages}),
    {incrementCount}
)(
    ({count, messages, incrementCount}) =>
        <div>
            <h1>The count is {count}</h1>
            <button onClick={() => incrementCount()}>+1</button>
            <button onClick={() => incrementCount(2)}>+2</button>
            <button onClick={() => incrementCount(-1)}>-1</button>
            <ul>
                {Object.entries(messages)
                       .map(([id, message]) => <li key={id}>{message}</li>)
                }
            </ul>
        </div>
);
```

The new reducer also needs registering in the root reducer. Note I’ve also moved the countReducer into to count.js for
consistency.

```jsx
// index.jsx
// ...
import {CountingComponent, countReducer, messagesReducer} from "./count";
//...

const rootReducer = combineReducers({
    count: countReducer,
    messages: messagesReducer,
});
// ...
```

That done, there now needs to be some epics to add and remove those messages before there is a noticeable change. An 
epic is a function that takes two observable streams; action$ and state$, and returns a new stream of additional 
actions. Most of the time you just need the actions, but occasionally you need access to the rest of the state and not 
just what is contained in the action. Search Antler for withLatestFrom(state$) for examples of doing this.

It can be easy to create unintentional infinite loops here. Each message output by the epic is added to the stream of
messages going through Redux, including being passed back in to all the epics. If you emit a message of the same type
that came in, that will just loop forever. Likewise, if a pair of epics each respond to a type that the other emits, in
combination they will keep responding to each other’s actions forever.

We need two epics, one that maps INCREMENT_COUNT actions to ADD_MESSAGE actions, and one that maps those ADD_MESSAGE
actions into REMOVE_MESSAGE actions, but with a delay.
```jsx
// count.jsx
// New imports for all the RxJS/redux-observable
import {map} from "rxjs/operators";
import {ofType} from "redux-observable";

// ...

// Store an id we can increment with each message. Having an external variable like 
// this is often useful when coordinating changes over multiple actions.
let id = 0;

export const addCountMessagesEpic = action$ =>
// `pipe` is just RxJS boiler plate for transforming a stream. Each value that
// comes into the stream gets passed to the first argument to pipe, the output
// of that to the second argument and so on, the final argument's output is
// published to the stream that pipe returns
action$.pipe(
    // ofType is a utility from redux-observable, it filters to only the
    // message type(s) provided
    ofType(INCREMENT_COUNT),
    // straight up map the increment into a message
    map(({delta}) => addMessage(
        id++,
        // template strings are awesome!
        `You ${delta >= 0 ? 'incremented' : 'decremented'}` +
        ` the count by ${Math.abs(delta)}.`
    ))
)

export const removeMessagesEpic = action$ =>
    action$.pipe(
        ofType(ADD_MESSAGE),
        map(({id}) => removeMessage(id)),
        // This adds the delay in ms. All of the timing/scheduling is handled #
        // inside RxJS and 'just works'
        delay(5000)
    )
```
Like with reducers, epics need to be registered with Redux to actually be used:
```jsx
// index.jsx
// ...
import {applyMiddleware, combineReducers, createStore} from "redux";
import {combineEpics, createEpicMiddleware} from "redux-observable";
import {
    addCountMessagesEpic,
    CountingComponent,
    countReducer,
    messagesReducer,
    removeMessagesEpic
} from "./count";

// If webpack is built using 'development' mode this will log all the
// messages passing through Redux. Note despite not emitting anything
// this still needs to return an observable stream to be valid, but
// RxJS has a built in EMPTY observable the never emits anything just
// for cases like this
const loggingEpic = action$ => {
    if(process.env.NODE_ENV === 'development') {
        action$.subscribe(msg => console.log('Action:', new Date(), msg));
    }

    return EMPTY;
};

// Set up a rootEpic similar to the rootReducer. The stream of actions will be pushed to 
// each of these, and the returned streams will all be merged together, ready to be 
// fed into Redux
const rootEpic = combineEpics(
    loggingEpic,
    addCountMessagesEpic,
    removeMessagesEpic
);

// The middleware is passed as a second argument to Redux.createStore, this is all just 
// boilerplate to make RxJS and Redux talk to each other. The store must be created
// before the epicMiddleware is run however.
const epicMiddleware = createEpicMiddleware();

const store = createStore(rootReducer, applyMiddleware(epicMiddleware));

epicMiddleware.run(rootEpic);
```

And that is everything. You should now see a message show each time you press a button, only to disappear after 5
seconds.

## Immutable.js
There is one final issue with the setup described above. A key feature of React is that it has its own internal
representation of the DOM, and it can calculate the diff between the new view and the old, and just update the bits of
the DOM tha have changed. 

There is an additional optimisation, a component can implement shouldComponentUpdate(nextProps, nextState) which should
return true or false if given the change (or not) in state/props whether the view will change or not. This allows React
to skip calling the render method for that component, and skip doing the diff of that part of its internal
representation of the DOM.

The simplest way to implement this is to loop over all the props and state keys and compare them to the current values
with `===`. This is so common in fact that there is React.PureComponent that your component classes can extend which
includes this, and Function components also use that implementation by default. Because state for the app is held at the
root level, any change requires React to check the whole tree for updates, liberal use of Pure/Function components makes
this much quicker.

You may have noticed the wierd extra steps I took to return a new object in the reducer for the messages array. This is
because the downside of this strategy is if you just update a property of an object, it is still the same object: The
=== check then passes and the component isn’t re-rendered. This copying of huge chunks of the application state is not
performant. The code needed to make sure you return a copy can also be quite verbose, and it’s easy to make a mistake
that then leads to subtle rendering bugs when you accidentally mutate an object rather than copy it.

This is where 

is useful. It provides a bunch of primitive objects that you can’t accidentally mutate, and that can be efficiently
copied. It can be installed with npm install --save immutable. To give an example, I’ll update the messagesReducer to
use it:
```jsx
// count.jsx
// ...
import {Map} from "immutable"

// ...
export function messagesReducer(state = Map(), action) {
    switch (action.type) {
            case ADD_MESSAGE:
            // All the methods on the immutable objects return a new copy with the
            // appropriate update applied
            return state.set(action.id, action.message);
        
        case REMOVE_MESSAGE:
            return state.remove(action.id)
        
        default:
            return state;
    }
}

// ... Inside the component. the `ul` of messages needs to be rendered slightly 
// differently now messages is an immutable map rather than a javascript object
<ul>
    {messages.entrySeq()
             .map(([id, message]) => <li key={id}>{message}</li>)
    }
</ul>
```
With those changes the apps behaviour is no different, but the code for updating the messages is cleaner and more
efficient.

## Miscellany

RxJs comes with a built-in websocket client, and it is this that is used to connect to the websocket server. This
includes automatic reconnection logic within the websocket epic.

Sometimes even the PureComponents and immutable state is not efficient enough. One example of this is the description
editor on the Third Party Approval page. The process of converting the whole editor state to the external
representation, sending the action to update the application state, reading that state in a props, and converting back
to DraftJS’s internal state caused noticeable lag to typing. This was fixed by letting DraftJS keep its internal state
independent of the application state. Changes to that state were pushed to an RxJS observable, which in turn used
debounceTime to limit how often the application state was updated with the new description. shouldComponentUpdate was
also manually implemented. The approval_id is added as a prop, and if it is present and the same as the existing
source_id then a new editorState from props is ignored.

Another more common performance gotcha is when functions are passed as props into child components. Because these
functions are created new each time render is called, it means PureComponents will see that the function for that prop
has changed, and also re-render. You’ll see all over the Third Party Approval app calls to this.cacheForApproval that is
just a helper method that returns the same function if the id and function match one that was already created. You can
also get around this in a class component by using a method of the class rather than an anonymous function in the
render() method. Finally, since React v16.8 there are Hooks. Since the offending function is usually one to update state
in some way 

can also help for some use cases.
Example

The full code for the example built through-out the above process should look something like these two files.

index.jsx
