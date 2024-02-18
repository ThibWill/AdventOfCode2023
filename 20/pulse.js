const PULSE_TYPE = {
  LOW: false,
  HIGH: true
}

/*
Flip-flop modules (prefix %) are either on or off; they are initially off. 
If a flip-flop module receives a high pulse, it is ignored and nothing happens. 
However, if a flip-flop module receives a low pulse, it flips between on and off. 
If it was off, it turns on and sends a high pulse. 
If it was on, it turns off and sends a low pulse.
*/

const flipFlopModule = (moduleName, moduleDestination) => {
  const state = {
    moduleName,
    moduleDestination,
    on: false
  };

  const updateState = (pulseInput) => {
    if (pulseInput === PULSE_TYPE.LOW) {
      state.on = !state.on;
    }
  }

  const sendPulse = (pulseInput) => {
    if (pulseInput) {
      return;
    } 
      
    const pulseOutput = state.on ? PULSE_TYPE.HIGH : PULSE_TYPE.LOW;
    state.moduleDestination.updateState(pulseOutput);
    state.moduleDestination.sendPulse(pulseOutput);
  }

  const getName = () => {
    return state.moduleName;
  }

  return {
    updateState,
    sendPulse,
    getName
  };
}


/*
Conjunction modules (prefix &) remember the type of the most recent pulse received from each of their connected input modules; 
they initially default to remembering a low pulse for each input. When a pulse is received, 
the conjunction module first updates its memory for that input. 
Then, if it remembers high pulses for all inputs, it sends a low pulse; otherwise, it sends a high pulse.
*/

const conjunctionModule = (moduleName, moduleDestination, inputModulesConnected) => {
  const state = {
    moduleName,
    moduleDestination,
    modulesConnected: {}
  };

  // Init
  for (const inputModuleConnected of inputModulesConnected) {
    state.modulesConnected[inputModuleConnected.getName()] = PULSE_TYPE.LOW;
  }

  const updateState = (pulseInput, module) => {
    state.modulesConnected[module.getName()] = pulseInput;
  }

  const sendPulse = () => {
    const pulseOutput = Object.values(state.modulesConnected).every(pulse => pulse === PULSE_TYPE.HIGH);
    state.moduleDestination.updateState(pulseOutput);
    state.moduleDestination.sendPulse(pulseOutput);
  }

  const getName = () => {
    return state.moduleName;
  }

  return {
    updateState,
    sendPulse,
    getName
  };
}

/*
There is a single broadcast module (named broadcaster). When it receives a pulse, it sends the same pulse to all of its destination modules.
*/

const broadcastModule = (moduleName, modulesDestination) => {
  const state = {
    modulesDestination,
    moduleName  
  };

  // Init
  for (const inputModuleConnected of inputModulesConnected) {
    state.modulesConnected[inputModuleConnected.getName()] = PULSE_TYPE.LOW;
  }

  const updateState = (pulseInput, module) => {
    state.modulesConnected[module.getName()] = pulseInput;
  }

  const sendPulse = (pulseInput) => {
    for (const moduleDestination of state.modulesDestination) {
      moduleDestination.updateState(pulseInput);
    }

    for (const moduleDestination of state.modulesDestination) {
      moduleDestination.sendPulse(pulseInput);
    }
  }

  const getName = () => {
    return state.moduleName;
  }

  return {
    updateState,
    sendPulse,
    getName
  };
}



/*
Here at Desert Machine Headquarters, there is a module with a single button on it called, aptly, the button module.
 When you push the button, a single low pulse is sent directly to the broadcaster module.
*/

const buttonModule = (moduleName, moduleDestination) => {
  const state = {
    moduleDestination,
    moduleName
  };

  const sendPulse = () => {
    state.moduleDestination.processPulse(PULSE_TYPE.LOW);
  }

  const getName = () => {
    return state.moduleName;
  }

  return {
    sendPulse,
    getName
  }
}

const parser = (modulesConfiguration) => {
  const lines = modulesConfiguration.split('\n');
  for (const line of lines) {
    console.log(line)
    console.log(line.match(/([^a-z])([a-z]*) -> ([a-z]*)/));
  }

  /*broadcaster -> a, b, c
    %a -> b
    %b -> c
    %c -> inv
    &inv -> a
  */
}

const test = `broadcaster -> a, b, c
%a -> b
%b -> c
%c -> inv
&inv -> a`;

parser(test);
