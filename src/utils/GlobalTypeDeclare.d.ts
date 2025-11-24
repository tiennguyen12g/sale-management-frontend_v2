    declare global {
      interface Window {
        myGlobalFunction: () => void;
      }
    }
    export {}; // To make it a module