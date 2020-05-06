import stateSchema from '../stateSchema.js';

const initialize = async (facebookCssSelectors) => {
  console.log('stateSchema is: ', stateSchema);
  stateSchema.facebookCssSelectors = facebookCssSelectors;

  let storedState = get();
  let state = storedState ? storedState : Object.assign({}, stateSchema);
  state.facebookCssSelectors = facebookCssSelectors;

  if (
    !hasSameProperties(state, stateSchema) ||
    !hasSameProperties(stateSchema, state) ||
    stateChangeCounterUpdated(state, stateSchema)
  ) {
    set(stateSchema);
  } else {
    set(state);
  }
};

const get = () => {
  if (!getEnabled()) return Object.assign({}, stateSchema);

  try {
    return JSON.parse(localStorage.getItem('state'));
  } catch (err) {
    console.error(err);
    console.error('error when trying to fetch state from storage');
    return null;
  }
};

const set = (state) => localStorage.setItem('state', JSON.stringify(state));

const toggleEnabled = () => localStorage.setItem('enabled', !getEnabled());

const getEnabled = () => !!localStorage.getItem('enabled');

function stateChangeCounterUpdated(firstState, secondState) {
  if (
    !firstState.stateBreakingChangeCounter ||
    !secondState.stateBreakingChangeCounter
  ) {
    return true;
  }
  return (
    firstState.stateBreakingChangeCounter !==
    secondState.stateBreakingChangeCounter
  );
}

function hasSameProperties(obj1, obj2) {
  try {
    // console.log("comparison called on: ", obj1, obj2);
    return Object.keys(obj1).every(function(property) {
      // if (property == "facebookCssSelectors") {
      //   console.log(
      //     "found object property named facebookCssSelectors. Ignoring comparison of that subtree."
      //   );
      //   return true;
      // } else
      if (typeof obj1[property] !== 'object') {
        return obj2.hasOwnProperty(property);
      } else {
        if (!obj2.hasOwnProperty(property)) {
          return false;
        }
        return hasSameProperties(obj1[property], obj2[property]);
      }
    });
  } catch (e) {
    //If bug. fallback to consider the comparison not equal.
    console.error('some bug in the hasSameProperties function');
    console.error(e);
    return false;
  }
}

export default {
  initialize,
  get,
  set,
  getEnabled,
  toggleEnabled,
};
