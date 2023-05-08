/* eslint-disable no-var, no-console, no-prototype-builtins, prefer-const */
// These eslint rules are disabled because the original JS was not written with them in mind and we don't want to fix them all now
import { FillableControl, ElementWithOpId, FormElement } from "../types";

// Check if URL is not secure when the original saved one was
export function urlNotSecure(savedURLs: string[]) {
  var passwordInputs = null;
  if (!savedURLs) {
    return false;
  }

  let confirmResult: any; // Boolean but we want to allow weak comparisons for compatibility with existing code
  return savedURLs.some((url) => url?.indexOf("https://") === 0) &&
    "http:" === document.location.protocol &&
    ((passwordInputs = document.querySelectorAll("input[type=password]")),
    0 < passwordInputs.length &&
      ((confirmResult = confirm(
        "Warning: This is an unsecured HTTP page, and any information you submit can potentially be seen and changed by others. This Login was originally saved on a secure (HTTPS) page.\n\nDo you still wish to fill this login?"
      )),
      0 == confirmResult))
    ? true
    : false;
}

/**
 * Normalize the event based on API support
 * @param {HTMLElement} el
 * @param {string} eventName
 * @returns {Event} A normalized event
 */
function normalizeEvent(el: FillableControl, eventName: string) {
  var ev: any;
  if ("KeyboardEvent" in window) {
    ev = new window.KeyboardEvent(eventName, {
      bubbles: true,
      cancelable: false,
    });
  } else {
    ev = el.ownerDocument.createEvent("Events");
    ev.initEvent(eventName, true, false);
    ev.charCode = 0;
    ev.keyCode = 0;
    ev.which = 0;
    ev.srcElement = el;
    ev.target = el;
  }

  return ev;
}

/**
 * Click on an element `el`
 * @param {HTMLElement} el
 * @returns {boolean} Returns true if the element was clicked and false if it was not able to be clicked
 */
function clickElement(el: HTMLElement) {
  if (!el || (el && "function" !== typeof el.click)) {
    return false;
  }
  el.click();
  return true;
}

/**
 * Focus an element and optionally re-set its value after focusing
 * @param {HTMLElement} el
 * @param {boolean} setValue Re-set the value after focusing
 */
function doFocusElement(el: FillableControl, setValue: boolean): void {
  if (setValue) {
    var existingValue = el.value;
    el.focus();
    el.value !== existingValue && (el.value = existingValue);
  } else {
    el.focus();
  }
}

/**
 * Determine if we can apply styling to `el` to indicate that it was filled.
 * @param {HTMLElement} el
 * @returns {boolean} Returns true if we can see the element to apply styling.
 */
export function canSeeElementToStyle(el: HTMLElement, animateTheFilling: boolean) {
  var currentEl: any;
  if ((currentEl = animateTheFilling)) {
    a: {
      currentEl = el;
      for (
        var owner: any = el.ownerDocument, owner = owner ? owner.defaultView : {}, theStyle;
        currentEl && currentEl !== document;

      ) {
        theStyle = owner.getComputedStyle
          ? owner.getComputedStyle(currentEl, null)
          : currentEl.style;
        if (!theStyle) {
          currentEl = true;
          break a;
        }
        if ("none" === theStyle.display || "hidden" == theStyle.visibility) {
          currentEl = false;
          break a;
        }
        currentEl = currentEl.parentNode;
      }
      currentEl = currentEl === document;
    }
  }
  // START MODIFICATION
  if (el && !(el as FillableControl).type && el.tagName.toLowerCase() === "span") {
    return true;
  }
  // END MODIFICATION
  return currentEl
    ? -1 !==
        "email text password number tel url".split(" ").indexOf((el as HTMLInputElement).type || "")
    : false;
}

/**
 * Helper for doc.querySelectorAll
 * @param {string} theSelector
 * @returns
 */
export function selectAllFromDoc<T extends Element = Element>(theSelector: string): Array<T> {
  var d = document,
    elements: Array<T> = [];
  try {
    // Technically this returns a NodeListOf<Element> but it's ducktyped as an Array everywhere, so return it as an array here
    elements = d.querySelectorAll(theSelector) as unknown as Array<T>;
  } catch (e) {
    /* no-op */
  }
  return elements;
}

/**
 * Find the element for the given `opid`.
 * @param {number} theOpId
 * @returns {HTMLElement} The element for the given `opid`, or `null` if not found.
 */
export function getElementByOpId(theOpId: string): FormElement {
  var theElement;
  if (void 0 === theOpId || null === theOpId) {
    return null;
  }
  try {
    // START MODIFICATION
    var elements: Array<FillableControl | HTMLButtonElement> = Array.prototype.slice.call(
      selectAllFromDoc("input, select, button, " + "span[data-bwautofill]")
    );
    // END MODIFICATION
    var filteredElements = elements.filter(function (o) {
      return (o as ElementWithOpId<FillableControl | HTMLButtonElement>).opid == theOpId;
    });
    if (0 < filteredElements.length) {
      (theElement = filteredElements[0]),
        1 < filteredElements.length &&
          console.warn("More than one element found with opid " + theOpId);
    } else {
      var elIndex = parseInt(theOpId.split("__")[1], 10);
      isNaN(elIndex) || (theElement = elements[elIndex]);
    }
  } catch (e) {
    console.error("An unexpected error occurred: " + e);
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    return theElement;
  }
}

/**
 * Simulate the entry of a value into an element by using events.
 * Dispatches a keydown, keypress, and keyup event, then fires the `input` and `change` events before removing focus.
 * @param {HTMLElement} el
 */
export function setValueForElementByEvent(el: FillableControl) {
  var valueToSet = el.value,
    ev1 = el.ownerDocument.createEvent("HTMLEvents"),
    ev2 = el.ownerDocument.createEvent("HTMLEvents");

  el.dispatchEvent(normalizeEvent(el, "keydown"));
  el.dispatchEvent(normalizeEvent(el, "keypress"));
  el.dispatchEvent(normalizeEvent(el, "keyup"));
  ev2.initEvent("input", true, true);
  el.dispatchEvent(ev2);
  ev1.initEvent("change", true, true);
  el.dispatchEvent(ev1);
  el.blur();
  el.value !== valueToSet && (el.value = valueToSet);
}

/**
 * Get all the elements on the DOM that are likely to be a password field
 * @returns {Array} Array of elements
 */
function getAllFields(): HTMLInputElement[] {
  var r = RegExp(
    "((\\\\b|_|-)pin(\\\\b|_|-)|password|passwort|kennwort|passe|contraseña|senha|密码|adgangskode|hasło|wachtwoord)",
    "i"
  );
  return Array.prototype.slice
    .call(selectAllFromDoc("input[type='text']"))
    .filter(function (el: HTMLInputElement) {
      return el.value && r.test(el.value);
    }, this);
}

/**
 * Simulate the entry of a value into an element.
 * Clicks the element, focuses it, and then fires a keydown, keypress, and keyup event.
 * @param {HTMLElement} el
 */
export function setValueForElement(el: FillableControl) {
  var valueToSet = el.value;
  clickElement(el);
  doFocusElement(el, false);
  el.dispatchEvent(normalizeEvent(el, "keydown"));
  el.dispatchEvent(normalizeEvent(el, "keypress"));
  el.dispatchEvent(normalizeEvent(el, "keyup"));
  el.value !== valueToSet && (el.value = valueToSet);
}

/**
 * Do a click on the element with the given `opId`.
 * @param {number} opId
 * @returns
 */
export function doClickByOpId(opId: string) {
  var el = getElementByOpId(opId) as FillableControl;
  return el ? (clickElement(el) ? [el] : null) : null;
}

/**
 * Touch all the fields
 */
export function touchAllFields() {
  getAllFields().forEach(function (el) {
    setValueForElement(el);
    el.click && el.click();
    setValueForElementByEvent(el);
  });
}

/**
 * Do a `click` and `focus` on all elements that match the query.
 * @param {string} query
 * @returns
 */
export function doClickByQuery(query: string) {
  query = selectAllFromDoc(query) as any; // string parameter has been reassigned and is now a NodeList
  return Array.prototype.map.call(
    Array.prototype.slice.call(query),
    function (el: HTMLInputElement) {
      clickElement(el);
      "function" === typeof el.click && el.click();
      "function" === typeof el.focus && doFocusElement(el, true);
      return [el];
    },
    this
  );
}

/**
 * Do a a click and focus on the element with the given `opId`.
 * @param {number} opId
 * @returns
 */
export function doFocusByOpId(opId: string): null {
  var el = getElementByOpId(opId) as FillableControl;
  if (el) {
    "function" === typeof el.click && el.click(),
      "function" === typeof el.focus && doFocusElement(el, true);
  }

  return null;
}

/**
 * Assign `valueToSet` to all elements in the DOM that match `query`.
 * @param {string} query
 * @param {string} valueToSet
 * @returns {Array} Array of elements that were set.
 */
export function doSimpleSetByQuery(query: string, valueToSet: string): FillableControl[] {
  var elements = selectAllFromDoc(query),
    arr: FillableControl[] = [];
  Array.prototype.forEach.call(
    Array.prototype.slice.call(elements),
    function (el: FillableControl) {
      el.disabled ||
        (el as any).a ||
        (el as HTMLInputElement).readOnly ||
        void 0 === el.value ||
        ((el.value = valueToSet), arr.push(el));
    }
  );
  return arr;
}
