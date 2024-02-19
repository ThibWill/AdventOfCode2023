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

const flipFlopModule = (moduleName) => {
  const state = {
    moduleName,
    modulesDestination: [],
    on: false
  };

  const init = (allModules, modulesDestinationName) => {
    const modulesDestinationInstances = allModules
        .filter(m => modulesDestinationName.includes(m.instance.getName()))
        .map(m => m.instance);

    state.modulesDestination = [...modulesDestinationInstances];
  }

  const updateState = (pulseInput) => {
    if (pulseInput === PULSE_TYPE.LOW) {
      state.on = !state.on;
    }
  }

  const sendPulse = (_pulseInput) => {
    if (pulseInput) {
      return;
    } 

    const pulseOutput = state.on ? PULSE_TYPE.HIGH : PULSE_TYPE.LOW;
    for (const moduleDestination of state.modulesDestination) {
      moduleDestination.updateState(pulseOutput);
    }

    for (const moduleDestination of state.modulesDestination) {
      moduleDestination.sendPulse(pulseOutput);
    }
  }

  const getName = () => {
    return state.moduleName;
  }

  return {
    init,
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

const conjunctionModule = (moduleName) => {
  const state = {
    moduleName,
    modulesDestination: [],
    modulesConnected: {}
  };

  const init = (allModules, modulesDestinationName) => {
    const modulesDestinationInstances = allModules
        .filter(m => modulesDestinationName.includes(m.instance.getName()))
        .map(m => m.instance);

    state.modulesDestination = [...modulesDestinationInstances];

    const inputModulesConnected = allModules
      .filter(m => m.modulesDestination.includes(state.moduleName))
      .map(m => m.instance);
    
    for (const inputModuleConnected of inputModulesConnected) {
      state.modulesConnected[inputModuleConnected.getName()] = PULSE_TYPE.LOW;
    }
  }

  const updateState = (pulseInput, module) => {
    state.modulesConnected[module.getName()] = pulseInput;
  }

  const sendPulse = (_pulseInput) => {
    const pulseOutput = Object.values(state.modulesConnected).every(pulse => pulse === PULSE_TYPE.HIGH);
    for (const moduleDestination of state.modulesDestination) {
      moduleDestination.updateState(pulseOutput);
    }

    for (const moduleDestination of state.modulesDestination) {
      moduleDestination.sendPulse(pulseOutput);
    }
  }

  const getName = () => {
    return state.moduleName;
  }

  return {
    init,
    updateState,
    sendPulse,
    getName
  };
}

/*
There is a single broadcast module (named broadcaster). When it receives a pulse, it sends the same pulse to all of its destination modules.
*/

const broadcastModule = (moduleName) => {
  const state = {
    modulesDestination: [],
    moduleName  
  };

  const init = (allModules, modulesDestinationName) => {
    const modulesDestinationInstances = allModules
      .filter(m => modulesDestinationName.includes(m.instance.getName()))
      .map(m => m.instance);

    state.modulesDestination = [...modulesDestinationInstances];
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
    init,
    updateState,
    sendPulse,
    getName
  };
}



/*
Here at Desert Machine Headquarters, there is a module with a single button on it called, aptly, the button module.
 When you push the button, a single low pulse is sent directly to the broadcaster module.
*/

/*const buttonModule = (moduleName, moduleDestination) => {
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
}*/

const parser = (modulesConfiguration) => {
  const lines = modulesConfiguration.split('\n');

  const modulesConfigurationParsed = [];
  for (const line of lines) {
    const [_exp, moduleType, moduleName, modulesDestination] = line.match(/([^a-z])?([a-z]+) -> ([a-z ,]+)/);
    modulesConfigurationParsed.push({
      moduleType,
      moduleName,
      modulesDestination: modulesDestination.split(',').map(moduleName => moduleName.trim()),
      instance: null
    });
  }

  return modulesConfigurationParsed;
}

const initModules = (modulesConfigurationParsed) => {

  // Factory
  for (const moduleConfiguration of modulesConfigurationParsed) {
    if (moduleConfiguration.moduleType === "%") {
      moduleConfiguration.instance = flipFlopModule(moduleConfiguration.moduleName);
    } else if (moduleConfiguration.moduleType === "&") {
      moduleConfiguration.instance = conjunctionModule(moduleConfiguration.moduleName);
    } else {
      moduleConfiguration.instance = broadcastModule(moduleConfiguration.moduleName);
    }
  }

  // Init each module
  for (const moduleConfiguration of modulesConfigurationParsed) {
    moduleConfiguration.instance.init(modulesConfigurationParsed, moduleConfiguration.modulesDestination);
  }

  return modulesConfigurationParsed.map(m => m.instance.getName());
}

const test = `broadcaster -> a, b, c
%a -> b
%b -> c
%c -> inv
&inv -> a`;

const modulesConfigurationParsed = parser(test);
console.log(initModules(modulesConfigurationParsed))
