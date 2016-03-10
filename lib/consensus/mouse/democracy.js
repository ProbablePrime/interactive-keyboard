/**
 * Given a report, workout what should happen to the key.
 * @param  {Object} keyState the internal state
 * @return {Boolean} true to push AND HOLD the button, false to let go. null to do nothing.
 */
module.exports = function(keyState, quorum, config) {
    var decision = {
        action: false,
        progress:0
    };

    decision.progress = Math.min(keyState.percentHolding,1);

    if(keyState.percentHolding >= config.tactileThreshold) {
        decision.action = true;
    }
    //TODO: This kind of prevents holds, I want to do it correctly
    if (quorum === 0) {
        decision.action = false;
    }

    if(keyState.percentReleasing >= config.tactileThreshold) {
        decision.action = false;
    }

    return decision;
}
