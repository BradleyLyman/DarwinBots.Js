/*
 * dbView.js
 * Main view for the DarwinBots.js application.
 */

/*jslint        browser : true, continue : true,
  devel  : true, indent : 2,      maxerr : 50,
  newcap : true, nomen  : true, plusplus : true,
  regexp : true, sloppy : true,     vars : false,
  white  : true
*/
/*global $, amplify */

// Modlue /dbView/
var dbView = (function() {
  // ----------------- BEGIN MODULE SCOPE VARIABLES -----------------
  var
    onWindowResize,

    render,

    initModule;
  // ------------------ END MODULE SCOPE VARIABLES ------------------


  // -------------------- BEGIN UTILITY METHODS ---------------------
  // --------------------- END UTILITY METHODS ----------------------
  // ---------------------- BEGIN DOM METHODS -----------------------
  // ----------------------- END DOM METHODS ------------------------


  // -------------------- BEGIN EVENT HANDLERS ----------------------
  // Begin Event Handler /onWindowResize/
  onWindowResize = function() {
    amplify.publish(
      'dbView-resize', window.innerWidth, window.innerHeight
    );
  };
  // End Event Handler /onWindowResize/
  // --------------------- END EVENT HANDLERS -----------------------


  // -------------------- BEGIN PRIVATE METHODS ---------------------
  // Begin Private method /render/
  render = function() {
    amplify.publish( 'dbView-tic' );

    window.requestAnimationFrame( render );
  };
  // End Private method /render/
  // --------------------- END PRIVATE METHODS ----------------------


  // -------------------- BEGIN PUBLIC METHODS ----------------------
  // Begin Public method /initModule/
  initModule = function () {
    dbView.world.initModule();

    $(window).resize( onWindowResize );

    render();
  };
  // End Public method /initModule/
  // --------------------- END PUBLIC METHODS -----------------------

  return { initModule : initModule };
}());
