/**
 * @param {*} dom virtualDOM
 * @param {*} eventName string
 * @returns {string} syntheticEventName
 */
export function syntheticName(dom, eventName) {
    let syntheticEventName = eventName.startsWith("on")
      ? eventName.substring(2).toLowerCase()
      : eventName.toLowerCase();
  
    if (dom.nodeName === "INPUT" && syntheticEventName === "change") {
      syntheticEventName = "input";
    }
  
    return syntheticEventName;
  }
