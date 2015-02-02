/*
 * dbView.world.js
 * View of the DarwinBots world.
 */

/*jslint        browser : true, continue : true,
  devel  : true, indent : 2,      maxerr : 50,
  newcap : true, nomen  : true, plusplus : true,
  regexp : true, sloppy : true,     vars : false,
  white  : true
*/
/*global $, dbView, THREE, amplify */

// Modlue /dbView.world/
dbView.world = (function() {
  // ----------------- BEGIN MODULE SCOPE VARIABLES -----------------
  var
    stateMap = {
      scene    : new THREE.Scene(),
      camera   : new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ),
      renderer : new THREE.WebGLRenderer(),
      geometry : new THREE.BoxGeometry( 1, 1, 1 ),
      material : new THREE.MeshBasicMaterial( { color : 0x00ff00 } ),
      cube     : null
    },

    onResize,

    initModule, render;
  // ------------------ END MODULE SCOPE VARIABLES ------------------


  // -------------------- BEGIN UTILITY METHODS ---------------------
  // --------------------- END UTILITY METHODS ----------------------
  // ---------------------- BEGIN DOM METHODS -----------------------
  // ----------------------- END DOM METHODS ------------------------


  // -------------------- BEGIN EVENT HANDLERS ----------------------
  // Begin Event Handler /onResize/
  onResize = function( width, height ) {
    stateMap.renderer.setSize( width, height );

    stateMap.camera.aspect = width / height;
    stateMap.camera.updateProjectionMatrix();
  };
  // End Event Handler /onResize/
  // --------------------- END EVENT HANDLERS -----------------------

  // Begin Private method /render/
  render = function() {
    stateMap.renderer.render( stateMap.scene, stateMap.camera );
  };
  // End Private method /render/

  // -------------------- BEGIN PUBLIC METHODS ----------------------
  // Begin Public method /initModule/
  initModule = function () {
    stateMap.renderer.setSize( window.innerWidth, window.innerHeight );
    $('body').append( stateMap.renderer.domElement );

    stateMap.cube = new THREE.Mesh( stateMap.geometry, stateMap.material );
    stateMap.scene.add( stateMap.cube );

    stateMap.camera.position.z = 5;

    amplify.subscribe( 'dbView-tic', render );
    amplify.subscribe( 'dbView-resize', onResize );
  };
  // End Public method /initModule/
  // --------------------- END PUBLIC METHODS -----------------------

  return { initModule : initModule };
}());
